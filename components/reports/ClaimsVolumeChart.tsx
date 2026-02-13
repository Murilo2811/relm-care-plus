import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Claim } from '../../types';

interface ClaimsVolumeChartProps {
    claims: Claim[];
}

export const ClaimsVolumeChart: React.FC<ClaimsVolumeChartProps> = ({ claims }) => {
    const data = useMemo(() => {
        // Aggregate claims by date (e.g., last 7 days or by month)
        // For simplicity, let's group by date created (YYYY-MM-DD)
        const grouped = claims.reduce((acc, claim) => {
            const date = new Date(claim.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
            });
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Convert to array and sort by date
        // Note: sorting DD/MM string is tricky, best to sort by timestamp first if needed.
        // For this V1, let's assume the API returns sorted or we just sort by key if simple.
        // To do it right: use actual date objects for sorting.

        return Object.entries(grouped)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => {
                const [dayA, monthA] = a.date.split('/');
                const [dayB, monthB] = b.date.split('/');
                // Simple comparison for current year
                return new Date(2024, parseInt(monthA) - 1, parseInt(dayA)).getTime() -
                    new Date(2024, parseInt(monthB) - 1, parseInt(dayB)).getTime();
            })
            .slice(-14); // Last 14 days with data
    }, [claims]);

    if (claims.length === 0) {
        return <div className="h-64 flex items-center justify-center text-gray-400">Sem dados para exibir</div>;
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Volume de Solicitações (Últimos dias)</h3>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            allowDecimals={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#fef2f2' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" name="Solicitações" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
