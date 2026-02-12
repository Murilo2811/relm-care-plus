import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Assumed existing
import { CreateClaimDto, UpdateStatusDto } from './dto/claims.dto'; // Assumed existing
import { ClaimStatus, Role } from '@prisma/client';

@Injectable()
export class ClaimsService {
  constructor(private prisma: PrismaService) {}

  // 1. Public Registration
  async createPublic(data: CreateClaimDto) {
    const protocol = `HB-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Store Matching Logic (Simplified V1)
    let storeId = null;
    let linkStatus = 'PENDING_REVIEW';
    
    // Normalize input
    const normalizedInput = data.purchaseStoreName.toLowerCase().trim();
    
    // Attempt exact match on Trade Name or Legal Name
    const match = await this.prisma.store.findFirst({
      where: {
        OR: [
          { tradeName: { equals: normalizedInput, mode: 'insensitive' } },
          { legalName: { equals: normalizedInput, mode: 'insensitive' } },
          { aliases: { has: normalizedInput } } // Requires Postgres array support
        ]
      }
    });

    if (match) {
      storeId = match.id;
      linkStatus = 'LINKED_AUTO';
    }

    return this.prisma.warrantyClaim.create({
      data: {
        ...data,
        protocolNumber: protocol,
        storeId,
        linkStatus: linkStatus as any,
        status: 'RECEBIDO',
      }
    });
  }

  // 2. Find All with RBAC Scoping
  async findAll(user: any, query: any) {
    const where: any = {};

    // RBAC: Store can only see their own claims or matched claims
    if (user.role === Role.LOJA) {
      if (!user.storeId) throw new ForbiddenException('User not linked to a store');
      where.OR = [
        { storeId: user.storeId },
        // Logic for "match" if needed, but usually storeId is the source of truth
      ];
    }

    // Apply filters from query (status, protocol, etc.)
    if (query.status) where.status = query.status;
    if (query.protocol) where.protocolNumber = query.protocol;

    const claims = await this.prisma.warrantyClaim.findMany({
      where,
      include: { store: true },
      orderBy: { createdAt: 'desc' }
    });

    // Data Masking for Stores
    if (user.role === Role.LOJA) {
      return claims.map(c => ({
        ...c,
        customerPhone: c.customerPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) *****-$3'), // Simple mask
        customerEmail: '***@***.com', // Masked
        // Hide internal notes if present
      }));
    }

    return claims;
  }

  // 3. Status Workflow (FSM)
  async updateStatus(id: String, dto: UpdateStatusDto, user: any) {
    const claim = await this.prisma.warrantyClaim.findUnique({ where: { id: id as string }});
    if (!claim) throw new NotFoundException('Claim not found');

    // Scope Check
    if (user.role === Role.LOJA && claim.storeId !== user.storeId) {
      throw new ForbiddenException('Access denied');
    }

    // Transition Logic
    this.validateTransition(claim.status, dto.toStatus, user.role);

    return this.prisma.$transaction(async (tx) => {
      // Update Claim
      const updated = await tx.warrantyClaim.update({
        where: { id: id as string },
        data: { status: dto.toStatus }
      });

      // Create Event
      await tx.warrantyEvent.create({
        data: {
          claimId: id as string,
          eventType: 'STATUS_CHANGE',
          fromStatus: claim.status,
          toStatus: dto.toStatus,
          comment: dto.comment,
          createdByUserId: user.id
        }
      });

      return updated;
    });
  }

  private validateTransition(from: ClaimStatus, to: ClaimStatus, role: Role) {
    // Admin/Manager can do almost anything
    if (role === Role.ADMIN_RELM || role === Role.GERENTE_RELM) return true;

    // Store Restrictions
    if (role === Role.LOJA) {
      const allowed = {
        [ClaimStatus.RECEBIDO]: [ClaimStatus.EM_ANALISE],
        [ClaimStatus.EM_ANALISE]: [ClaimStatus.AGUARDANDO_CLIENTE],
        [ClaimStatus.AGUARDANDO_CLIENTE]: [ClaimStatus.EM_ANALISE],
      };

      if (!allowed[from] || !allowed[from].includes(to)) {
        throw new BadRequestException(`Store cannot transition from ${from} to ${to}`);
      }
    }
  }
}
