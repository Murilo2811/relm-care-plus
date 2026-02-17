import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Role, Store, LinkStatus } from '../types';
import { useT } from '../i18n/LanguageContext';
import { useClaimDetail } from '../hooks/useClaimDetail';
import { ClaimHeader } from '../components/claims/ClaimHeader';
import { ClaimInfoCard } from '../components/claims/ClaimInfoCard';
import { ClaimTimeline } from '../components/claims/ClaimTimeline';
import { ClaimActionPanel } from '../components/claims/ClaimActionPanel';
import { StoreSelectorModal } from '../components/claims/StoreSelectorModal';
import { ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

interface ClaimDetailProps {
    user: User;
}

const ClaimDetail: React.FC<ClaimDetailProps> = ({ user }) => {
    const { id } = useParams<{ id: string }>();
    const { claim, history, loading, error, refresh, updateStatus } = useClaimDetail(id);
    const { t } = useT();
    const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

    const handleSelectStore = async (store: Store) => {
        if (!claim) return;
        try {
            await api.claims.update(claim.id, {
                storeId: store.id,
                purchaseStoreName: store.tradeName,
                purchaseStoreCity: store.city,
                purchaseStoreState: store.state,
                linkStatus: LinkStatus.LINKED_MANUALLY
            });
            setIsStoreModalOpen(false);
            refresh();
        } catch (error) {
            console.error('Failed to update store', error);
            alert('Failed to link store. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-64 bg-gray-200 rounded"></div>
                        <div className="h-40 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-6">
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !claim) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-red-100 shadow-sm p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-black uppercase tracking-widest mb-2">{t.track.notFound}</h2>
                <p className="text-gray-500 mb-6 max-w-md">{error || "The claim could not be found or you don't have permission to view it."}</p>
                <button
                    onClick={() => refresh()}
                    className="flex items-center px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors uppercase font-bold tracking-widest text-sm"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t.common.back} {/* Using 'Back' as retry/refresh metaphor or replace with a Retry key if exists */}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <Link to="/admin/dashboard" className="inline-flex items-center text-gray-400 hover:text-black mb-6 text-xs font-black uppercase tracking-widest transition-colors group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> {t.common.back}
            </Link>

            <ClaimHeader claim={claim} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Info & Details */}
                <div className="lg:col-span-2 space-y-8">
                    <ClaimInfoCard
                        claim={claim}
                        user={user}
                        onLinkStore={() => setIsStoreModalOpen(true)}
                    />

                    {/* Mobile Action Panel (visible only on small screens if needed, strictly simpler layout here) */}
                    <div className="block lg:hidden">
                        <ClaimActionPanel claim={claim} user={user} onUpdateStatus={updateStatus} />
                    </div>

                    <ClaimTimeline history={history} />
                </div>

                {/* Right Column: Actions (Desktop) */}
                <div className="hidden lg:block space-y-8 sticky top-6 h-fit">
                    <ClaimActionPanel claim={claim} user={user} onUpdateStatus={updateStatus} />

                    {/* Helper / Contact Box */}
                    <div className="bg-white p-6 border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-2">Need Help?</h4>
                        <p className="text-sm text-gray-600">
                            Contact support at <a href="mailto:support@relm.com" className="text-black underline font-medium">support@relm.com</a> if you notice discrepancies in this claim.
                        </p>
                    </div>
                </div>
            </div>

            <StoreSelectorModal
                isOpen={isStoreModalOpen}
                onClose={() => setIsStoreModalOpen(false)}
                onSelect={handleSelectStore}
                currentStoreId={claim.storeId}
            />
        </div>
    );
};

export default ClaimDetail;
