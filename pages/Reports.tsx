import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Claim, User } from '../types';
import { ClaimsVolumeChart } from '../components/reports/ClaimsVolumeChart';
import { StatusDistributionChart } from '../components/reports/StatusDistributionChart';
import { FileText, Download, RefreshCw } from 'lucide-react';

interface ReportsProps {
    user: User;
}

const Reports: React.FC<ReportsProps> = ({ user }) => {
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // In a real scenario with thousands of records, we would use a specific aggregation API
            // For now, we fetch all claims and aggregate client-side as per plan.
            const data = await api.claims.list();
            setClaims(data);
        } catch (error) {
            console.error('Failed to fetch report data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const metrics = {
        total: claims.length,
        pending: claims.filter(c => c.status === 'pending').length,
        approved: claims.filter(c => c.status === 'approved').length,
        approvalRate: claims.length > 0
            ? Math.round((claims.filter(c => c.status === 'approved').length / claims.length) * 100)
            : 0
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <FileText className="mr-3 text-red-600" />
                        Relatórios e Métricas
                    </h1>
                    <p className="text-gray-500 mt-1">Visão geral da operação de garantia.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchData}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Atualizar dados"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar CSV
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 uppercase">Total de Chamados</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.total}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 uppercase">Pendentes</p>
                    <p className="text-3xl font-bold text-amber-500 mt-2">{metrics.pending}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 uppercase">Aprovados</p>
                    <p className="text-3xl font-bold text-emerald-500 mt-2">{metrics.approved}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 uppercase">Taxa de Aprovação</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{metrics.approvalRate}%</p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ClaimsVolumeChart claims={claims} />
                <StatusDistributionChart claims={claims} />
            </div>
        </div>
    );
};

export default Reports;
