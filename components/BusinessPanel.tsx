import React, { useState } from 'react';
import { Business, OutreachStatus } from '@/lib/types';
import { BusinessCard } from './BusinessCard';
import { ArrowUpDown, RefreshCw } from 'lucide-react';

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
    <div className="flex flex-col h-full bg-clay-canvas border-l border-clay-border/80 shadow-clay-card">
      {/* Header */}
      <div className="p-3.5 border-b border-clay-border/70 flex items-center justify-between bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-clay-text text-sm">Discovered Leads</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-accent-blue shadow-clay-pill border border-blue-200">
            {businesses.length}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-clay-muted bg-white px-2.5 py-1 rounded-clay-sm shadow-clay-btn border border-clay-border/80">
            <ArrowUpDown className="w-3.5 h-3.5 text-accent-blue" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-clay-text outline-none cursor-pointer font-medium"
            >
              <option value="score">Top Lead Score</option>
              <option value="newest">Newest First</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh radar"
              disabled={isLoading}
              className="p-1.5 rounded-clay-sm bg-white hover:bg-slate-50 text-clay-text border border-clay-border/80 shadow-clay-btn transition active:translate-y-0.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-accent-blue' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {sorted.length === 0 ? (
          <div className="text-center py-16 px-4 text-clay-muted space-y-2.5">
            <div className="text-4xl">📡</div>
            <p className="font-semibold text-clay-text text-sm">No businesses match active filters</p>
            <p className="text-xs text-clay-muted max-w-[280px] mx-auto leading-relaxed">
              Try changing your area (e.g. Kokapet, Gachibowli), widening the time window, or clearing search.
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
