export enum Role {
  ADMIN_RELM = 'admin_relm',
  GERENTE_RELM = 'gerente_relm',
  LOJA = 'loja',
}

export enum ClaimStatus {
  RECEBIDO = 'RECEBIDO',
  EM_ANALISE = 'EM_ANALISE',
  AGUARDANDO_CLIENTE = 'AGUARDANDO_CLIENTE',
  AGUARDANDO_LOJA = 'AGUARDANDO_LOJA',
  APROVADO = 'APROVADO',
  REPROVADO = 'REPROVADO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO',
}

export enum LinkStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  LINKED_AUTO = 'LINKED_AUTO',
  LINKED_MANUALLY = 'LINKED_MANUALLY',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  storeId?: string;
  active: boolean;
}

export interface Store {
  id: string;
  tradeName: string;
  legalName: string;
  cnpj: string;
  city: string;
  state: string;
  contactName: string;
  contactEmail: string;
  active: boolean;
  claimsCount: number;
}

export interface WarrantyClaim {
  id: string;
  protocolNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  itemType: string;
  productDescription: string;
  serialNumber: string;
  invoiceNumber: string;
  purchaseDate?: string;
  purchaseStoreName: string;
  purchaseStoreCity?: string;
  purchaseStoreState?: string;
  storeId?: string;
  linkStatus: LinkStatus;
  status: ClaimStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WarrantyEvent {
  id: string;
  claimId: string;
  eventType: string;
  fromStatus?: ClaimStatus;
  toStatus?: ClaimStatus;
  comment?: string;
  createdAt: string;
  createdByUserName: string;
}