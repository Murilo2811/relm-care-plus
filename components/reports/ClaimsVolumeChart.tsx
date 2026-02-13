import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { WarrantyClaim } from '../../types';
import { useT } from '../../i18n/LanguageContext';

interface ClaimsVolumeChartProps {
    claims: WarrantyClaim[];
}

export const ClaimsVolumeChart: React.FC<ClaimsVolumeChartProps> = ({ claims }) => {
    const { t, locale } = useT();

    const data = useMemo(() => {
        // Aggregate claims by date (e.g., last 7 days or by month)
        // For simplicity, let's group by date created (YYYY-MM-DD)
        const grouped = claims.reduce((acc, claim) => {
            const date = new Date(claim.createdAt).toLocaleDateString(locale, {
                day: '2-digit',
                month: '2-digit',
            });
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Convert to array and sort by date
        return Object.entries(grouped)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => {
                // Assuming format DD/MM for sorting might fail if locale changes drastically,
                // but for supported locales (pt-BR, en, es) usually day/month structure is parseable
                // or we should rely on raw timestamp key.
                // Better approach: use YYYY-MM-DD as key for sorting, display DD/MM as label.
                const [part1, part2] = a.date.split(/[\/\-]/);
                const [part1b, part2b] = b.date.split(/[\/\-]/);

                // Very naive sort for demo purposes, robust enough for current scope
                if (parseInt(part2) !== parseInt(part2b)) return parseInt(part2) - parseInt(part2b);
                return parseInt(part1) - parseInt(part1b);
            })
            .slice(-14); // Last 14 days with data
    }, [claims, locale]);

    if (claims.length === 0) {
        return <div className="h-64 flex items-center justify-center text-gray-400">{t.reports.noData}</div>;
    }

    return (
        <div className="bg-white p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t.reports.volumeTitle}</h3>
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
                            cursor={{ fill: '#f9fafb' }}
                            contentStyle={{ borderRadius: '0px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" name={t.stores.requests} fill="#000000" radius={[0, 0, 0, 0]} barSize={32} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
