import React from 'react';
import { Business } from '@/lib/types';
import { Building2, Sparkles, PhoneCall, MapPin, Globe2 } from 'lucide-react';

interface StatsBarProps {
  businesses: Business[];
  selectedArea: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({ businesses, selectedArea }) => {
  const total = businesses.length;

  const now = Date.now();
  const last24h = businesses.filter((b) => {
    return now - new Date(b.first_seen_at).getTime() <= 24 * 60 * 60 * 1000;
  }).length;

  const thisWeek = businesses.filter((b) => {
    return now - new Date(b.first_seen_at).getTime() <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  const contacted = businesses.filter((b) => b.outreach_status === 'contacted').length;
  const noWebsite = businesses.filter((b) => !b.website).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3.5 bg-clay-canvas border-b border-clay-border/80">
      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-clay bg-white shadow-clay-card border border-clay-border/60">
        <div className="p-2 rounded-clay-sm bg-blue-50 text-accent-blue shadow-clay-btn">
          <Building2 className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-medium text-clay-muted">Total Discovered</div>
          <div className="text-base font-bold text-clay-text leading-tight">{total}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-clay bg-white shadow-clay-card border border-emerald-100">
        <div className="p-2 rounded-clay-sm bg-emerald-50 text-accent-emerald shadow-clay-btn">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-medium text-emerald-700">Fresh (&lt;24 Hours)</div>
          <div className="text-base font-bold text-emerald-900 leading-tight">{last24h}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-clay bg-white shadow-clay-card border border-clay-border/60">
        <div className="p-2 rounded-clay-sm bg-purple-50 text-purple-600 shadow-clay-btn">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-medium text-clay-muted">This Week</div>
          <div className="text-base font-bold text-clay-text leading-tight">{thisWeek}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-clay bg-white shadow-clay-card border border-amber-100">
        <div className="p-2 rounded-clay-sm bg-amber-50 text-accent-amber shadow-clay-btn">
          <Globe2 className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-medium text-amber-700">No Website (Hot)</div>
          <div className="text-base font-bold text-amber-900 leading-tight">{noWebsite}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-clay bg-white shadow-clay-card border border-clay-border/60 col-span-2 md:col-span-1">
        <div className="p-2 rounded-clay-sm bg-cyan-50 text-cyan-600 shadow-clay-btn">
          <PhoneCall className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-medium text-clay-muted">Outreach Made</div>
          <div className="text-base font-bold text-clay-text leading-tight">{contacted}</div>
        </div>
      </div>
    </div>
  );
};
