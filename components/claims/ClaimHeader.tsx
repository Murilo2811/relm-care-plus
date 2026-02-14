import React from 'react';
import { WarrantyClaim } from '../../types';
import { STATUS_COLORS } from '../../constants';
import { useStatusLabels } from '../../hooks/useStatusLabels';
import { useT } from '../../i18n/LanguageContext';

interface ClaimHeaderProps {
    claim: WarrantyClaim;
}

export const ClaimHeader: React.FC<ClaimHeaderProps> = ({ claim }) => {
    const statusLabels = useStatusLabels();
    const { t } = useT();

    return (
        <div className="bg-white border-l-4 border-black p-8 shadow-sm mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-9xl pointer-events-none select-none">
                #{claim.id.slice(0, 4)}
            </div>

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black text-black tracking-tighter uppercase mb-2">
                            {claim.protocolNumber}
                        </h1>
                        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
                            {t.claimDetail.createdAt}: {new Date(claim.createdAt).toLocaleDateString()} • {new Date(claim.createdAt).toLocaleTimeString()}
                        </p>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className={`px-4 py-2 text-sm font-bold uppercase tracking-widest ${STATUS_COLORS[claim.status]}`}>
                            {statusLabels[claim.status]}
                        </span>
                        <span className="text-xs text-gray-400 mt-2 font-mono uppercase">
                            {t.track.lastUpdate}: {new Date(claim.updatedAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
