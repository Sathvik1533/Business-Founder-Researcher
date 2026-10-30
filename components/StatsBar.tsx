import React from 'react';
import { Business } from '@/lib/types';
import { Building2, Sparkles, PhoneCall, MapPin } from 'lucide-react';

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
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 bg-gray-900/80 backdrop-blur border-b border-gray-800 text-sm text-gray-200">
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/50">
        <Building2 className="w-4 h-4 text-blue-400" />
        <div>
          <div className="text-xs text-gray-400">Total in View</div>
          <div className="font-semibold text-white">{total}</div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-800/60 border border-emerald-900/40">
        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
        <div>
          <div className="text-xs text-emerald-400">New &lt;24 Hours</div>
          <div className="font-semibold text-emerald-300">{last24h}</div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/50">
        <MapPin className="w-4 h-4 text-purple-400" />
        <div>
          <div className="text-xs text-gray-400">Opened This Week</div>
          <div className="font-semibold text-white">{thisWeek}</div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-800/60 border border-amber-900/40">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <div>
          <div className="text-xs text-amber-400">No Website (Hot)</div>
          <div className="font-semibold text-amber-300">{noWebsite}</div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/50 col-span-2 md:col-span-1">
        <PhoneCall className="w-4 h-4 text-cyan-400" />
        <div>
          <div className="text-xs text-gray-400">Leads Contacted</div>
          <div className="font-semibold text-white">{contacted}</div>
        </div>
      </div>
    </div>
  );
};
