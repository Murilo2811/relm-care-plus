import React from 'react';
import { WarrantyClaim, User, Role } from '../../types';
import { useT } from '../../i18n/LanguageContext';
import { Shield, User as UserIcon, Store as StoreIcon, AlertCircle } from 'lucide-react';

interface ClaimInfoCardProps {
    claim: WarrantyClaim;
    user: User;
}

const InfoSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className = '' }) => (
    <div className={`p-6 bg-white border border-gray-100 shadow-sm ${className}`}>
        <h3 className="text-xs font-black uppercase tracking-widest text-black mb-6 flex items-center border-b border-gray-100 pb-2">
            <span className="mr-2">{icon}</span> {title}
        </h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const InfoItem: React.FC<{ label: string; value: string | React.ReactNode; highlight?: boolean }> = ({ label, value, highlight }) => (
    <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">{label}</p>
        <div className={`font-medium text-sm ${highlight ? 'bg-black text-white px-2 py-1 inline-block' : 'text-gray-900'}`}>
            {value || '-'}
        </div>
    </div>
);

export const ClaimInfoCard: React.FC<ClaimInfoCardProps> = ({ claim, user }) => {
    const { t } = useT();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Product Info - Takes 2 columns on large screens */}
            <InfoSection title={t.claimDetail.productPurchase} icon={<Shield className="w-4 h-4" />} className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem label={t.track.product} value={claim.productDescription} />
                    <InfoItem label={t.track.serialNumber} value={claim.serialNumber} highlight />
                    <InfoItem label={t.form.invoice} value={claim.invoiceNumber} />
                    <InfoItem label={t.form.purchaseDate} value={new Date(claim.purchaseDate).toLocaleDateString()} />
                    <div className="md:col-span-2 pt-4 border-t border-gray-50 flex items-start gap-4">
                        <StoreIcon className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                            <p className="text-sm font-bold">{claim.purchaseStoreName}</p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                                {claim.purchaseStoreCity && `${claim.purchaseStoreCity} - `} {claim.purchaseStoreState}
                            </p>
                            <div className={`text-xs mt-2 inline-flex items-center px-2 py-1 ${claim.linkStatus === 'PENDING_REVIEW' ? 'bg-yellow-50 text-yellow-800' : 'bg-green-50 text-green-800'}`}>
                                {claim.linkStatus === 'PENDING_REVIEW' ? <AlertCircle className="w-3 h-3 mr-1" /> : null}
                                {claim.linkStatus === 'PENDING_REVIEW' ? t.claimDetail.pendingReview : t.claimDetail.linked}
                            </div>
                        </div>
                    </div>
                </div>
            </InfoSection>

            {/* Customer Info */}
            <InfoSection title={t.claimDetail.customer} icon={<UserIcon className="w-4 h-4" />}>
                <InfoItem label={t.claimDetail.name} value={claim.customerName} />
                <InfoItem
                    label={t.users.email}
                    value={user.role === Role.LOJA && !claim.storeId ? t.claimDetail.masked : claim.customerEmail}
                />
                <InfoItem
                    label={t.claimDetail.phone}
                    value={user.role === Role.LOJA && !claim.storeId ? t.claimDetail.masked : claim.customerPhone}
                />
            </InfoSection>
        </div>
    );
};
