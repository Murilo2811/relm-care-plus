import React, { useState } from 'react';
import { api } from '../services/api';
import { WarrantyClaim, WarrantyEvent, ClaimStatus } from '../types';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';
import { Search, ArrowLeft, Shield, Clock, FileText, CheckCircle, XCircle, Flag, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const TrackClaim = () => {
  const [protocol, setProtocol] = useState('');
  const [claim, setClaim] = useState<WarrantyClaim | null>(null);
  const [history, setHistory] = useState<WarrantyEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocol.trim()) return;

    setLoading(true);
    setError('');
    setClaim(null);
    setSearched(true);

    try {
      const result = await api.claims.getByProtocol(protocol.trim());
      if (result) {
        setClaim(result);
        const hist = await api.claims.getHistory(result.id);
        setHistory(hist);
      } else {
        setError('Protocolo não encontrado. Verifique o número e tente novamente.');
      }
    } catch (err) {
      setError('Erro ao buscar informações. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Logic to determine active step index
  const getStepIndex = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.RECEBIDO: return 0;
      case ClaimStatus.EM_ANALISE:
      case ClaimStatus.AGUARDANDO_LOJA:
      case ClaimStatus.AGUARDANDO_CLIENTE: return 1;
      case ClaimStatus.APROVADO:
      case ClaimStatus.REPROVADO:
      case ClaimStatus.CANCELADO: return 2;
      case ClaimStatus.FINALIZADO: return 3;
      default: return 0;
    }
  };

  // Logic to determine step color/state
  const getStepState = (stepIdx: number, currentStatus: ClaimStatus) => {
    const currentIdx = getStepIndex(currentStatus);
    const isNegative = [ClaimStatus.REPROVADO, ClaimStatus.CANCELADO].includes(currentStatus);

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) {
      if (isNegative && stepIdx === 2) return 'error'; // Special case for resolution step
      return 'active';
    }
    return 'pending';
  };

  const STEPS = [
    { label: 'Recebido', icon: FileText },
    { label: 'Em Análise', icon: Loader2 },
    { label: 'Resolução', icon: CheckCircle }, // Icon changes dynamically in render if error
    { label: 'Finalizado', icon: Flag },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-black text-white p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold italic tracking-tighter text-red-600 hover:opacity-90">
                RELM <span className="text-white not-italic font-normal">CARE+</span>
            </Link>
            <Link to="/" className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 -mt-8">
        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
            <h1 className="text-2xl font-bold italic uppercase text-gray-900 mb-2">Acompanhar Solicitação</h1>
            <p className="text-gray-500 mb-6">Digite o número do protocolo recebido (ex: HB-2023...)</p>
            
            <form onSubmit={handleSearch} className="flex gap-4">
                <input 
                    type="text"
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value)}
                    placeholder="Digite o protocolo..."
                    className="flex-1 border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 py-3 px-4 text-lg"
                />
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-red-600 text-white px-8 rounded-lg font-bold italic uppercase hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center justify-center disabled:opacity-70"
                >
                    {loading ? 'Buscando...' : <><Search className="w-5 h-5 mr-2" /> Consultar</>}
                </button>
            </form>
        </div>

        {/* Error State */}
        {searched && error && (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center border-l-4 border-red-500 animate-fade-in-up">
                <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Protocolo não encontrado</h3>
                <p className="text-gray-500">{error}</p>
            </div>
        )}

        {/* Result State */}
        {claim && (
            <div className="animate-fade-in-up space-y-6">
                
                {/* Status Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-gray-900 flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status Atual</p>
                        <span className={`px-3 py-1 text-lg font-bold rounded-full inline-block ${STATUS_COLORS[claim.status]}`}>
                            {STATUS_LABELS[claim.status]}
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Data da Solicitação</p>
                        <p className="text-lg font-medium text-gray-900">{new Date(claim.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Progress Stepper */}
                <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 overflow-hidden">
                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-0"></div>
                        <div 
                            className="absolute top-5 left-0 h-1 bg-red-600 transition-all duration-1000 -z-0"
                            style={{ width: `${(getStepIndex(claim.status) / (STEPS.length - 1)) * 100}%` }}
                        ></div>

                        {/* Steps */}
                        <div className="flex justify-between relative z-10">
                            {STEPS.map((step, idx) => {
                                const state = getStepState(idx, claim.status);
                                let StepIcon = step.icon;
                                let stepColor = 'bg-gray-100 text-gray-400 border-gray-200';
                                
                                // Adjust Icon for Error State
                                if (idx === 2 && state === 'error') {
                                    StepIcon = XCircle;
                                }

                                if (state === 'completed') {
                                    stepColor = 'bg-red-600 text-white border-red-600';
                                } else if (state === 'active') {
                                    stepColor = 'bg-white text-red-600 border-red-600 ring-4 ring-red-50';
                                } else if (state === 'error') {
                                    stepColor = 'bg-red-100 text-red-600 border-red-200';
                                }

                                return (
                                    <div key={idx} className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${stepColor}`}>
                                            <StepIcon className="w-5 h-5" />
                                        </div>
                                        <span className={`text-xs font-bold mt-3 uppercase tracking-wide ${state === 'pending' ? 'text-gray-400' : 'text-gray-900'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Product Info */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase italic mb-4 flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-red-600" /> Detalhes do Produto
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Produto</p>
                            <p className="font-medium text-gray-900">{claim.productDescription}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Serial Number</p>
                            <p className="font-medium text-gray-900 font-mono">{claim.serialNumber}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Loja de Compra</p>
                            <p className="font-medium text-gray-900">{claim.purchaseStoreName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Última Atualização</p>
                            <p className="font-medium text-gray-900">{new Date(claim.updatedAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase italic mb-6 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-red-600" /> Histórico de Eventos
                    </h3>
                    <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                        {history.map((event, idx) => (
                            <div key={event.id} className="relative pl-8">
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${idx === 0 ? 'bg-red-600' : 'bg-gray-300'}`}></div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">
                                        {event.eventType === 'STATUS_CHANGE' ? STATUS_LABELS[event.toStatus!] : 'Atualização'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {new Date(event.createdAt).toLocaleDateString()} às {new Date(event.createdAt).toLocaleTimeString()}
                                    </p>
                                    {event.comment && (
                                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                                            "{event.comment}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                         <div className="relative pl-8">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white bg-gray-300"></div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Solicitação Aberta</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {new Date(claim.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default TrackClaim;