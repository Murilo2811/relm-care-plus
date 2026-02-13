import { ClaimStatus, Role } from './types';

// REPLACED BY i18n/pt-BR.ts -> status
// This object is now only for fallback or internal logic if needed,
// but UI should use t.status[status]
export const STATUS_LABELS: Record<ClaimStatus, string> = {
  [ClaimStatus.RECEBIDO]: 'Recebido',
  [ClaimStatus.EM_ANALISE]: 'Em Análise',
  [ClaimStatus.AGUARDANDO_CLIENTE]: 'Aguardando Cliente',
  [ClaimStatus.AGUARDANDO_LOJA]: 'Aguardando Loja',
  [ClaimStatus.APROVADO]: 'Aprovado',
  [ClaimStatus.REPROVADO]: 'Reprovado',
  [ClaimStatus.FINALIZADO]: 'Finalizado',
  [ClaimStatus.CANCELADO]: 'Cancelado',
};

export const STATUS_COLORS: Record<ClaimStatus, string> = {
  [ClaimStatus.RECEBIDO]: 'bg-blue-100 text-blue-800',
  [ClaimStatus.EM_ANALISE]: 'bg-yellow-100 text-yellow-800',
  [ClaimStatus.AGUARDANDO_CLIENTE]: 'bg-orange-100 text-orange-800',
  [ClaimStatus.AGUARDANDO_LOJA]: 'bg-teal-100 text-teal-800',
  [ClaimStatus.APROVADO]: 'bg-green-100 text-green-800',
  [ClaimStatus.REPROVADO]: 'bg-red-100 text-red-800',
  [ClaimStatus.FINALIZADO]: 'bg-gray-100 text-gray-800',
  [ClaimStatus.CANCELADO]: 'bg-gray-200 text-gray-500',
};

export const canEditStatus = (userRole: Role, currentStatus: ClaimStatus): boolean => {
  if (userRole === Role.ADMIN_RELM || userRole === Role.GERENTE_RELM) return true;
  if (userRole === Role.LOJA) {
    const allowed = [ClaimStatus.RECEBIDO, ClaimStatus.EM_ANALISE, ClaimStatus.AGUARDANDO_CLIENTE];
    return allowed.includes(currentStatus);
  }
  return false;
};
