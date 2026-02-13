import React, { useEffect, useState } from 'react';
import { WarrantyClaim, User, ClaimStatus } from '../types';
import { api } from '../services/api';
import { ClaimsVolumeChart } from '../components/reports/ClaimsVolumeChart';
import { StatusDistributionChart } from '../components/reports/StatusDistributionChart';
import { BarChart3, Download, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useT } from '../i18n/LanguageContext';

interface ReportsProps {
    user: User;
}

const Reports: React.FC<ReportsProps> = ({ user }) => {
    const [claims, setClaims] = useState<WarrantyClaim[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useT();

    useEffect(() => {
        const load = async () => {
            try {
                const data = await api.claims.list();
                setClaims(data);
            } catch (e) { console.error(e); }
            setLoading(false);
        };
        load();
    }, []);

    const total = claims.length;
    const approved = claims.filter(c => c.status === ClaimStatus.APROVADO).length;
    const rejected = claims.filter(c => c.status === ClaimStatus.REPROVADO).length;
    // const pending = claims.filter(c => c.status === ClaimStatus.EM_ANALISE || c.status === ClaimStatus.RECEBIDO).length;
    const rate = total > 0 ? Math.round((approved / total) * 100) : 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-black uppercase italic flex items-center">
                        <BarChart3 className="w-6 h-6 mr-3 text-black" />
                        {t.layout.reports}
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 font-light">{t.reports.metricsDesc}</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-bold uppercase tracking-widest">
                    <Download className="w-4 h-4 mr-2" /> {t.dashboard.exportCsv}
                </button>
            </div>

            {loading ? (
                <div className="text-gray-400">{t.common.loading}</div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-6 shadow-sm border border-gray-100">
                            <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{t.dashboard.totalRequests}</h3>
                            <div className="flex items-end justify-between mt-2">
                                <p className="text-3xl font-black text-black">{total}</p>
                                <Minus className="w-5 h-5 text-gray-300" />
                            </div>
                        </div>
                        <div className="bg-white p-6 shadow-sm border border-gray-100">
                            <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{t.reports.approved}</h3>
                            <div className="flex items-end justify-between mt-2">
                                <p className="text-3xl font-black text-green-600">{approved}</p>
                                <ArrowUpRight className="w-5 h-5 text-green-500" />
                            </div>
                        </div>
                        <div className="bg-white p-6 shadow-sm border border-gray-100">
                            <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{t.reports.rejected}</h3>
                            <div className="flex items-end justify-between mt-2">
                                <p className="text-3xl font-black text-red-600">{rejected}</p>
                                <ArrowDownRight className="w-5 h-5 text-red-500" />
                            </div>
                        </div>
                        <div className="bg-white p-6 shadow-sm border border-gray-100">
                            <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{t.reports.approvalRate}</h3>
                            <div className="flex items-end justify-between mt-2">
                                <p className="text-3xl font-black text-black">{rate}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ClaimsVolumeChart claims={claims} />
                        <StatusDistributionChart claims={claims} />
                    </div>
                </>
            )}
        </div>
    );
};

export default Reports;
