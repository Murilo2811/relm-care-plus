import React, { useMemo } from 'react';
import { ClaimStatus } from '../types';
import { useT } from '../i18n/LanguageContext';

export const useStatusLabels = () => {
    const { t } = useT();

    const labels: Record<ClaimStatus, string> = useMemo(() => ({
        [ClaimStatus.RECEBIDO]: t.status.received,
        [ClaimStatus.EM_ANALISE]: t.status.inAnalysis,
        [ClaimStatus.AGUARDANDO_CLIENTE]: t.status.awaitingClient,
        [ClaimStatus.AGUARDANDO_LOJA]: t.status.awaitingStore,
        [ClaimStatus.APROVADO]: t.status.approved,
        [ClaimStatus.REPROVADO]: t.status.rejected,
        [ClaimStatus.FINALIZADO]: t.status.finished,
        [ClaimStatus.CANCELADO]: t.status.cancelled,
    }), [t]);

    return labels;
};
