import React, { useState } from 'react';
import { ClaimStatus, Role, User, WarrantyClaim } from '../../types';
import { useT } from '../../i18n/LanguageContext';
import { canEditStatus } from '../../constants';
import { ArrowRight, Loader2 } from 'lucide-react';

interface ClaimActionPanelProps {
    claim: WarrantyClaim;
    user: User;
    onUpdateStatus: (status: ClaimStatus, comment: string) => Promise<void>;
}

export const ClaimActionPanel: React.FC<ClaimActionPanelProps> = ({ claim, user, onUpdateStatus }) => {
    const { t } = useT();
    const [newStatus, setNewStatus] = useState<ClaimStatus | ''>('');
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!canEditStatus(user.role, claim.status)) return null;

    const handleSubmit = async () => {
        if (!newStatus || !comment) return;
        setIsSubmitting(true);
        try {
            await onUpdateStatus(newStatus, comment);
            setNewStatus('');
            setComment('');
        } catch (e) {
            // Error handled by hook/parent usually, but we could show toast here
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-black text-white p-6 shadow-xl relative overflow-hidden group">
            {/* Decorative background element */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-zinc-800 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700"></div>

            <h3 className="font-black uppercase tracking-widest text-sm mb-6 flex items-center relative z-10">
                <span className="w-2 h-2 bg-red-500 mr-3"></span>
                {t.claimDetail.updateStatus}
            </h3>

            <div className="space-y-4 relative z-10">
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                        {t.claimDetail.selectNewStatus}
                    </label>
                    <select
                        className="w-full bg-zinc-900 border-none text-white py-3 px-4 focus:ring-1 focus:ring-white outline-none appearance-none cursor-pointer hover:bg-zinc-800 transition-colors"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as ClaimStatus)}
                        disabled={isSubmitting}
                    >
                        <option value="" className="text-gray-500">Select Action...</option>
                        {user.role !== Role.LOJA && <option value={ClaimStatus.EM_ANALISE}>{t.status.inAnalysis}</option>}
                        <option value={ClaimStatus.AGUARDANDO_CLIENTE}>{t.status.awaitingClient}</option>
                        {(user.role === Role.ADMIN_RELM || user.role === Role.GERENTE_RELM) && (
                            <>
                                <option value={ClaimStatus.APROVADO}>{t.status.approved}</option>
                                <option value={ClaimStatus.REPROVADO}>{t.status.rejected}</option>
                                <option value={ClaimStatus.FINALIZADO}>{t.status.finished}</option>
                            </>
                        )}
                    </select>
                </div>

                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                        {t.claimDetail.mandatoryNote}
                    </label>
                    <textarea
                        className="w-full bg-zinc-900 border-none text-white p-4 focus:ring-1 focus:ring-white outline-none resize-none h-32 hover:bg-zinc-800 transition-colors"
                        placeholder="Describe the reason for this status change..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        disabled={isSubmitting}
                    ></textarea>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!newStatus || !comment || isSubmitting}
                    className="w-full bg-white text-black font-black uppercase tracking-widest py-4 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-4"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            {t.claimDetail.confirmUpdate} <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
