import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { WarrantyClaim } from '../../types';

interface StatusDistributionChartProps {
    claims: WarrantyClaim[];
}

const COLORS = {
    pending: '#fbbf24', // Amber 400
    approved: '#34d399', // Emerald 400
    rejected: '#ef4444', // Red 500
    info_requested: '#60a5fa', // Blue 400
};

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    info_requested: 'Aguardando Info',
};

export const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ claims }) => {
    const data = useMemo(() => {
        const grouped = claims.reduce((acc, claim) => {
            const status = claim.status || 'pending';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped).map(([status, value]) => ({
            name: STATUS_LABELS[status] || status,
            value,
            color: COLORS[status as keyof typeof COLORS] || '#9ca3af',
        }));
    }, [claims]);

    if (claims.length === 0) {
        return <div className="h-64 flex items-center justify-center text-gray-400">Sem dados para exibir</div>;
    }

    return (
        <div className="bg-white p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Status dos Chamados</h3>
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
