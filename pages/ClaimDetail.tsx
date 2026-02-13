import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, WarrantyClaim, WarrantyEvent, ClaimStatus, Role } from '../types';
import { api } from '../services/api';
import { STATUS_COLORS, canEditStatus } from '../constants';
import { ArrowLeft, Clock, MessageSquare, Shield, Store, User as UserIcon } from 'lucide-react';
import { useT } from '../i18n/LanguageContext';
import { useStatusLabels } from '../hooks/useStatusLabels';

interface ClaimDetailProps {
  user: User;
}

const ClaimDetail: React.FC<ClaimDetailProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const [claim, setClaim] = useState<WarrantyClaim | null>(null);
  const [history, setHistory] = useState<WarrantyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [newStatus, setNewStatus] = useState<ClaimStatus | ''>('');
  const [comment, setComment] = useState('');
  const { t } = useT();
  const statusLabels = useStatusLabels();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const c = await api.claims.getById(id);
      const h = await api.claims.getHistory(id);
      setClaim(c);
      setHistory(h);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!claim || !newStatus || !comment) return;
    await api.claims.updateStatus(claim.id, newStatus, comment);
    const c = await api.claims.getById(claim.id);
    const h = await api.claims.getHistory(claim.id);
    setClaim(c);
    setHistory(h);
    setNewStatus('');
    setComment('');
  };

  if (loading) return <div className="text-gray-400">{t.common.loading}</div>;
  if (!claim) return <div className="text-gray-400">{t.claim.notFoundAccess}</div>;

  return (
    <div>
      <Link to="/admin/dashboard" className="flex items-center text-gray-400 hover:text-black mb-6 text-sm font-bold uppercase tracking-widest transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> {t.common.back}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black text-black uppercase italic">{t.claim.protocol} {claim.protocolNumber}</h1>
                <p className="text-gray-400 text-sm mt-1 font-light">{t.claim.createdOn} {new Date(claim.createdAt).toLocaleString()}</p>
              </div>
              <span className={`px-3 py-1 text-sm font-semibold ${STATUS_COLORS[claim.status]}`}>
                {statusLabels[claim.status]}
              </span>
            </div>
          </div>

          {/* Product & Store */}
          <div className="bg-white shadow-sm border border-gray-100 p-6">
            <h2 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-black" /> {t.claim.productPurchase}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t.track.product}</p>
                <p className="font-medium">{claim.productDescription}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t.track.serialNumber}</p>
                <p className="font-medium font-mono bg-gray-50 px-2 py-1 inline-block">{claim.serialNumber}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t.form.invoice}</p>
                <p className="font-medium">{claim.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t.form.purchaseDate}</p>
                <p className="font-medium">{claim.purchaseDate}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-start">
                <Store className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{t.claim.storeInformed}: {claim.purchaseStoreName}</p>
                  <p className="text-xs text-gray-500">
                    {t.claim.linkStatus}:
                    <span className={`ml-1 font-semibold ${claim.linkStatus === 'PENDING_REVIEW' ? 'text-black' : 'text-green-600'}`}>
                      {claim.linkStatus === 'PENDING_REVIEW' ? t.claim.linkPending : t.claim.linked}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white shadow-sm border border-gray-100 p-6">
            <h2 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-black" /> {t.claim.customer}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t.claim.name}</p>
                <p className="font-medium">{claim.customerName}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t.claim.phone}</p>
                <p className="font-medium text-gray-700">{claim.customerPhone}</p>
                {user.role === Role.LOJA && <span className="text-[10px] text-gray-400 font-bold">{t.claim.masked}</span>}
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t.claim.email}</p>
                <p className="font-medium text-gray-700">{claim.customerEmail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions & History */}
        <div className="space-y-6">

          {/* Action Box */}
          {canEditStatus(user.role, claim.status) && (
            <div className="bg-white shadow-sm border border-gray-200 p-6">
              <h3 className="font-black text-black uppercase text-sm tracking-widest mb-4">{t.claim.updateStatus}</h3>
              <div className="space-y-4">
                <select
                  className="w-full border-b border-gray-200 focus:border-black outline-none py-2 bg-white rounded-none"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ClaimStatus)}
                >
                  <option value="">{t.claim.selectStatus}</option>
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

                <textarea
                  className="w-full border border-gray-200 focus:border-black outline-none p-3 bg-white rounded-none"
                  rows={3}
                  placeholder={t.claim.commentPlaceholder}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>

                <button
                  onClick={handleUpdateStatus}
                  disabled={!newStatus || !comment}
                  className="w-full py-3 px-4 bg-black text-white hover:bg-zinc-800 disabled:opacity-50 font-bold uppercase tracking-widest text-sm transition-colors"
                >
                  {t.claim.confirmUpdate}
                </button>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white shadow-sm border border-gray-100 p-6">
            <h3 className="font-black text-black uppercase text-sm tracking-widest mb-4 flex items-center">
              <Clock className="w-4 h-4 mr-2" /> {t.track.eventHistory}
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {history.map((event, eventIdx) => (
                  <li key={event.id}>
                    <div className="relative pb-8">
                      {eventIdx !== history.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div className="bg-gray-200 h-8 w-8 flex items-center justify-center ring-8 ring-white">
                          <MessageSquare className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium text-black">{event.eventType === 'STATUS_CHANGE' ? `${t.claim.changedTo} ${statusLabels[event.toStatus!]}` : t.claim.comment}</span>
                            </p>
                            {event.comment && <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-2 border border-gray-100">{event.comment}</p>}
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-400">
                            <div>{new Date(event.createdAt).toLocaleDateString()}</div>
                            <div className="text-xs">{event.createdByUserName}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetail;
