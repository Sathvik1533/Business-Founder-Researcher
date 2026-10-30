import React, { useState } from 'react';
import { Business, OutreachStatus } from '@/lib/types';
import { BusinessCard } from './BusinessCard';
import { ArrowUpDown, SlidersHorizontal, RefreshCw } from 'lucide-react';

interface BusinessPanelProps {
  businesses: Business[];
  selectedId?: string | null;
  onSelectBusiness: (b: Business) => void;
  onStatusChange: (id: string, status: OutreachStatus, notes?: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const BusinessPanel: React.FC<BusinessPanelProps> = ({
  businesses,
  selectedId,
  onSelectBusiness,
  onStatusChange,
  onRefresh,
  isLoading,
}) => {
  const [sortBy, setSortBy] = useState<'score' | 'newest' | 'name'>('score');

  const sorted = [...businesses].sort((a, b) => {
    if (sortBy === 'score') return b.lead_score - a.lead_score;
    if (sortBy === 'newest')
      return new Date(b.first_seen_at).getTime() - new Date(a.first_seen_at).getTime();
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex flex-col h-full bg-gray-950 border-l border-gray-800">
      {/* Panel Header */}
      <div className="p-3 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white text-sm">Discovered Leads</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {businesses.length}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-gray-400 bg-gray-800 px-2 py-1 rounded border border-gray-700">
            <ArrowUpDown className="w-3 h-3 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-gray-200 outline-none cursor-pointer"
            >
              <option value="score" className="bg-gray-800">Top Lead Score</option>
              <option value="newest" className="bg-gray-800">Newest Discovered</option>
              <option value="name" className="bg-gray-800">Name (A-Z)</option>
            </select>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh radar"
              disabled={isLoading}
              className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {sorted.length === 0 ? (
          <div className="text-center py-12 px-4 text-gray-400 space-y-2">
            <div className="text-3xl">📡</div>
            <p className="font-medium text-gray-300">No businesses match active filters</p>
            <p className="text-xs text-gray-500">
              Try changing your area (e.g. Kokapet, Gachibowli), widening the time range, or clearing search.
            </p>
          </div>
        ) : (
          sorted.map((b) => (
            <BusinessCard
              key={b.id}
              business={b}
              isSelected={b.id === selectedId}
              onSelect={() => onSelectBusiness(b)}
              onStatusChange={(status, notes) => onStatusChange(b.id, status, notes)}
            />
          ))
        )}
      </div>
    </div>
  );
};
