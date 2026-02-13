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

    const getStepState = (stepIdx: number, currentStatus: ClaimStatus) => {
        const currentIdx = getStepIndex(currentStatus);
        const isNegative = [ClaimStatus.REPROVADO, ClaimStatus.CANCELADO].includes(currentStatus);

        if (stepIdx < currentIdx) return 'completed';
        if (stepIdx === currentIdx) {
            if (isNegative && stepIdx === 2) return 'error';
            return 'active';
        }
        return 'pending';
    };

    const STEPS = [
        { label: 'Recebido', icon: FileText },
        { label: 'Em Análise', icon: Loader2 },
        { label: 'Resolução', icon: CheckCircle },
        { label: 'Finalizado', icon: Flag },
    ];

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Header */}
            <header className="bg-black text-white p-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link to="/" className="text-2xl font-black italic tracking-tighter text-white hover:opacity-90 uppercase">
                        RELM <span className="not-italic font-normal text-gray-500">CARE+</span>
                    </Link>
                    <Link to="/" className="flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto p-6 -mt-8">
                {/* Search Box */}
                <div className="bg-white shadow-xl p-8 border border-gray-100 mb-8">
                    <h1 className="text-2xl font-black italic uppercase text-black mb-2">Acompanhar Solicitação</h1>
                    <p className="text-gray-400 mb-6 font-light">Digite o número do protocolo recebido (ex: HB-2023...)</p>

                    <form onSubmit={handleSearch} className="flex gap-4">
                        <input
                            type="text"
                            value={protocol}
                            onChange={(e) => setProtocol(e.target.value)}
                            placeholder="Digite o protocolo..."
                            className="flex-1 border-b border-gray-200 focus:border-black outline-none py-3 px-4 text-lg font-light rounded-none"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-black text-white px-8 font-bold uppercase tracking-widest text-sm hover:bg-zinc-800 transition-colors shadow-lg shadow-gray-200 flex items-center justify-center disabled:opacity-70 rounded-none"
                        >
                            {loading ? 'Buscando...' : <><Search className="w-5 h-5 mr-2" /> Consultar</>}
                        </button>
                    </form>
                </div>

                {/* Error State */}
                {searched && error && (
                    <div className="bg-white shadow-sm p-8 text-center border-l-4 border-black">
                        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-black mb-2">Protocolo não encontrado</h3>
                        <p className="text-gray-400 font-light">{error}</p>
                    </div>
                )}

                {/* Result State */}
                {claim && (
                    <div className="space-y-6">

                        {/* Status Card */}
                        <div className="bg-white shadow-sm p-6 border-l-4 border-black flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status Atual</p>
                                <span className={`px-3 py-1 text-lg font-bold inline-block ${STATUS_COLORS[claim.status]}`}>
                                    {STATUS_LABELS[claim.status]}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Data da Solicitação</p>
                                <p className="text-lg font-medium text-black">{new Date(claim.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Progress Stepper */}
                        <div className="bg-white shadow-sm p-8 border border-gray-100 overflow-hidden">
                            <div className="relative">
                                {/* Connecting Line */}
                                <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-0"></div>
                                <div
                                    className="absolute top-5 left-0 h-1 bg-black transition-all duration-1000 -z-0"
                                    style={{ width: `${(getStepIndex(claim.status) / (STEPS.length - 1)) * 100}%` }}
                                ></div>

                                {/* Steps */}
                                <div className="flex justify-between relative z-10">
                                    {STEPS.map((step, idx) => {
                                        const state = getStepState(idx, claim.status);
                                        let StepIcon = step.icon;
                                        let stepColor = 'bg-gray-100 text-gray-400 border-gray-200';

                                        if (idx === 2 && state === 'error') {
                                            StepIcon = XCircle;
                                        }

                                        if (state === 'completed') {
                                            stepColor = 'bg-black text-white border-black';
                                        } else if (state === 'active') {
                                            stepColor = 'bg-white text-black border-black ring-4 ring-gray-100';
                                        } else if (state === 'error') {
                                            stepColor = 'bg-red-100 text-red-600 border-red-200';
                                        }

                                        return (
                                            <div key={idx} className="flex flex-col items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${stepColor}`}>
                                                    <StepIcon className="w-5 h-5" />
                                                </div>
                                                <span className={`text-[10px] font-black mt-3 uppercase tracking-widest ${state === 'pending' ? 'text-gray-300' : 'text-black'}`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="bg-white shadow-sm p-6 border border-gray-100">
                            <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 flex items-center">
                                <Shield className="w-4 h-4 mr-2 text-black" /> Detalhes do Produto
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Produto</p>
                                    <p className="font-medium text-black">{claim.productDescription}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Serial Number</p>
                                    <p className="font-medium text-black font-mono">{claim.serialNumber}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Loja de Compra</p>
                                    <p className="font-medium text-black">{claim.purchaseStoreName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Última Atualização</p>
                                    <p className="font-medium text-black">{new Date(claim.updatedAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white shadow-sm p-6 border border-gray-100">
                            <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-6 flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-black" /> Histórico de Eventos
                            </h3>
                            <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                                {history.map((event, idx) => (
                                    <div key={event.id} className="relative pl-8">
                                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${idx === 0 ? 'bg-black' : 'bg-gray-300'}`}></div>
                                        <div>
                                            <p className="text-sm font-bold text-black">
                                                {event.eventType === 'STATUS_CHANGE' ? STATUS_LABELS[event.toStatus!] : 'Atualização'}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {new Date(event.createdAt).toLocaleDateString()} às {new Date(event.createdAt).toLocaleTimeString()}
                                            </p>
                                            {event.comment && (
                                                <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 border border-gray-100 italic">
                                                    "{event.comment}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div className="relative pl-8">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white bg-gray-300"></div>
                                    <div>
                                        <p className="text-sm font-bold text-black">Solicitação Aberta</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
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