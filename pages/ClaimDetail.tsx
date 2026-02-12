import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, WarrantyClaim, WarrantyEvent, ClaimStatus, Role } from '../types';
import { api } from '../services/api';
import { STATUS_COLORS, STATUS_LABELS, canEditStatus } from '../constants';
import { ArrowLeft, Clock, MessageSquare, Shield, Store, User as UserIcon } from 'lucide-react';

interface ClaimDetailProps {
  user: User;
}

const ClaimDetail: React.FC<ClaimDetailProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const [claim, setClaim] = useState<WarrantyClaim | null>(null);
  const [history, setHistory] = useState<WarrantyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Action State
  const [newStatus, setNewStatus] = useState<ClaimStatus | ''>('');
  const [comment, setComment] = useState('');

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
    // Reload
    const c = await api.claims.getById(claim.id);
    const h = await api.claims.getHistory(claim.id);
    setClaim(c);
    setHistory(h);
    setNewStatus('');
    setComment('');
  };

  if (loading) return <div>Carregando...</div>;
  if (!claim) return <div>Não encontrado ou acesso negado.</div>;

  return (
    <div>
      <Link to="/admin/dashboard" className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <div className="flex justify-between items-start">
                <div>
                   <h1 className="text-2xl font-bold text-gray-900">Protocolo {claim.protocolNumber}</h1>
                   <p className="text-gray-500 text-sm mt-1">Criado em {new Date(claim.createdAt).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${STATUS_COLORS[claim.status]}`}>
                    {STATUS_LABELS[claim.status]}
                </span>
             </div>
          </div>

          {/* Product & Store */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-red-500" /> Produto & Compra
            </h2>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <p className="text-xs text-gray-500 uppercase">Produto</p>
                  <p className="font-medium">{claim.productDescription}</p>
               </div>
               <div>
                  <p className="text-xs text-gray-500 uppercase">Serial</p>
                  <p className="font-medium font-mono bg-gray-50 px-2 py-1 inline-block rounded">{claim.serialNumber}</p>
               </div>
               <div>
                  <p className="text-xs text-gray-500 uppercase">Nota Fiscal</p>
                  <p className="font-medium">{claim.invoiceNumber}</p>
               </div>
               <div>
                  <p className="text-xs text-gray-500 uppercase">Data Compra</p>
                  <p className="font-medium">{claim.purchaseDate}</p>
               </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
               <div className="flex items-start">
                  <Store className="w-5 h-5 mr-2 text-gray-400" />
                  <div>
                     <p className="text-sm font-medium">Loja Informada: {claim.purchaseStoreName}</p>
                     <p className="text-xs text-gray-500">
                        Status do Vínculo: 
                        <span className={`ml-1 font-semibold ${claim.linkStatus === 'PENDING_REVIEW' ? 'text-red-500' : 'text-green-600'}`}>
                            {claim.linkStatus === 'PENDING_REVIEW' ? 'Revisão Pendente' : 'Vinculado'}
                        </span>
                     </p>
                  </div>
               </div>
            </div>
          </div>

           {/* Customer (Masked if LOJA) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-red-500" /> Cliente
            </h2>
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <p className="text-xs text-gray-500 uppercase">Nome</p>
                  <p className="font-medium">{claim.customerName}</p>
               </div>
               <div>
                  <p className="text-xs text-gray-500 uppercase">Telefone</p>
                  <p className="font-medium text-gray-700">{claim.customerPhone}</p>
                  {user.role === Role.LOJA && <span className="text-xs text-red-500">(Mascarado)</span>}
               </div>
               <div>
                  <p className="text-xs text-gray-500 uppercase">Email</p>
                  <p className="font-medium text-gray-700">{claim.customerEmail}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions & History */}
        <div className="space-y-6">
          
          {/* Action Box */}
          {canEditStatus(user.role, claim.status) && (
            <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Atualizar Status</h3>
                <div className="space-y-4">
                    <select 
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as ClaimStatus)}
                    >
                        <option value="">Selecione o novo status...</option>
                        {user.role !== Role.LOJA && <option value={ClaimStatus.EM_ANALISE}>Em Análise</option>}
                        <option value={ClaimStatus.AGUARDANDO_CLIENTE}>Aguardando Cliente</option>
                        {(user.role === Role.ADMIN_RELM || user.role === Role.GERENTE_RELM) && (
                            <>
                                <option value={ClaimStatus.APROVADO}>Aprovar</option>
                                <option value={ClaimStatus.REPROVADO}>Reprovar</option>
                                <option value={ClaimStatus.FINALIZADO}>Finalizar</option>
                            </>
                        )}
                    </select>
                    
                    <textarea 
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        rows={3}
                        placeholder="Observação obrigatória..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    ></textarea>

                    <button 
                        onClick={handleUpdateStatus}
                        disabled={!newStatus || !comment}
                        className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                    >
                        Confirmar Atualização
                    </button>
                </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                 <Clock className="w-4 h-4 mr-2" /> Histórico
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
                                    <div className="bg-gray-200 h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white">
                                        <MessageSquare className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                <span className="font-medium text-gray-900">{event.eventType === 'STATUS_CHANGE' ? `Alterado para ${STATUS_LABELS[event.toStatus!]}` : 'Comentário'}</span>
                                            </p>
                                            {event.comment && <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-2 rounded">{event.comment}</p>}
                                        </div>
                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
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
