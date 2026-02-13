import { useState, useEffect, useCallback } from 'react';
import { WarrantyClaim, WarrantyEvent, ClaimStatus } from '../types';
import { api } from '../services/api';

export function useClaimDetail(id: string | undefined) {
    const [claim, setClaim] = useState<WarrantyClaim | null>(null);
    const [history, setHistory] = useState<WarrantyEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!id) {
            setError('ID not provided');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Parallel fetch for speed, but handle failures independently if needed
            const [claimData, historyData] = await Promise.all([
                api.claims.getById(id),
                api.claims.getHistory(id)
            ]);

            if (!claimData) throw new Error('Claim not found');

            setClaim(claimData);
            setHistory(historyData || []);
        } catch (err: any) {
            console.error('Error fetching claim details:', err);
            setError(err.message || 'Failed to load claim details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateStatus = async (newStatus: ClaimStatus, comment: string) => {
        if (!claim) return;
        try {
            await api.claims.updateStatus(claim.id, newStatus, comment);
            await fetchData(); // Refresh data after update
        } catch (err: any) {
            console.error('Error updating status:', err);
            throw err; // Let component handle UI feedback for this action
        }
    };

    return { claim, history, loading, error, refresh: fetchData, updateStatus };
}
