import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ClaimStatus, WarrantyClaim } from '../../types';
import { useStatusLabels } from '../../hooks/useStatusLabels';
import { useT } from '../../i18n/LanguageContext';

interface StatusDistributionChartProps {
    claims: WarrantyClaim[];
}

const COLORS = {
    [ClaimStatus.RECEBIDO]: '#60a5fa', // Blue 400
    [ClaimStatus.EM_ANALISE]: '#fbbf24', // Amber 400
    [ClaimStatus.AGUARDANDO_CLIENTE]: '#f97316', // Orange 500
    [ClaimStatus.AGUARDANDO_LOJA]: '#a855f7', // Purple 500
    [ClaimStatus.APROVADO]: '#34d399', // Emerald 400
    [ClaimStatus.REPROVADO]: '#ef4444', // Red 500
    [ClaimStatus.FINALIZADO]: '#4b5563', // Gray 600
    [ClaimStatus.CANCELADO]: '#9ca3af', // Gray 400
};

export const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ claims }) => {
    const statusLabels = useStatusLabels();
    const { t } = useT();

    const data = useMemo(() => {
        const grouped = claims.reduce((acc, claim) => {
            const status = claim.status;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped).map(([status, value]) => ({
            name: statusLabels[status as ClaimStatus] || status,
            value,
            color: COLORS[status as ClaimStatus] || '#9ca3af',
        }));
    }, [claims, statusLabels]);

    if (claims.length === 0) {
        return <div className="h-64 flex items-center justify-center text-gray-400">{t.reports.noData}</div>;
    }

    return (
        <div className="bg-white p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t.reports.statusDistribution}</h3>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '0px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
