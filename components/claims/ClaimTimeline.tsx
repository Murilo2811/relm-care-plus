import React from 'react';
import { WarrantyEvent } from '../../types';
import { useT } from '../../i18n/LanguageContext';
import { useStatusLabels } from '../../hooks/useStatusLabels';
import { Clock, MessageSquare, CheckCircle } from 'lucide-react';

interface ClaimTimelineProps {
    history: WarrantyEvent[];
}

export const ClaimTimeline: React.FC<ClaimTimelineProps> = ({ history }) => {
    const { t } = useT();
    const statusLabels = useStatusLabels();

    if (history.length === 0) return null;

    return (
        <div className="bg-white p-6 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-black mb-6 flex items-center">
                <Clock className="w-4 h-4 mr-2" /> {t.track.eventHistory}
            </h3>

            <div className="relative pl-4 border-l border-gray-200 space-y-8">
                {history.map((event, idx) => (
                    <div key={event.id} className="relative">
                        {/* Dot */}
                        <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white ${idx === 0 ? 'bg-black' : 'bg-gray-300'}`}></div>

                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">
                                {new Date(event.createdAt).toLocaleString()}
                            </span>

                            <div className="font-medium text-sm text-gray-900">
                                {event.eventType === 'STATUS_CHANGE'
                                    ? <span className="flex items-center gap-2"><CheckCircle className="w-3 h-3" /> {t.claimDetail.changedTo} <strong>{statusLabels[event.toStatus!] || event.toStatus}</strong></span>
                                    : <span className="flex items-center gap-2"><MessageSquare className="w-3 h-3" /> {t.claimDetail.comment}</span>
                                }
                            </div>

                            {event.comment && (
                                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 italic border-l-2 border-gray-200">
                                    "{event.comment}"
                                </div>
                            )}

                            <div className="text-xs text-gray-400 mt-1">
                                by {event.createdByUserName || 'System'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
