import React from 'react';
import { RadarFilterState } from '@/lib/types';
import { Search, Compass, Clock, Tag, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  filters: RadarFilterState;
  onChange: (updated: Partial<RadarFilterState>) => void;
  onAreaJump?: (area: string) => void;
}

const AREAS = [
  'All Areas',
  'Kokapet',
  'Gachibowli',
  'HITECH City',
  'Madhapur',
  'Financial District',
  'Nanakramguda',
  'Jubilee Hills',
  'Banjara Hills',
  'Kondapur',
  'Narsingi',
  'Miyapur',
  'Secunderabad'
];

const CATEGORIES = [
  'All Categories',
  'Food & Beverage',
  'Clothing & Fashion',
  'Beauty & Wellness',
  'Fitness',
  'Retail',
  'Health',
  'Services'
];

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange, onAreaJump }) => {
  return (
    <div className="bg-clay-canvas border-b border-clay-border/80 px-4 py-3 space-y-2.5">
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search input with tactile inset shadow */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-clay-faint" />
          <input
            type="text"
            placeholder="Search business name, keywords, area..."
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full bg-white text-sm text-clay-text pl-10 pr-3.5 py-2 rounded-clay-sm border border-clay-border/90 shadow-clay-pressed focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue placeholder:text-clay-faint transition"
          />
        </div>

        {/* Area dropdown */}
        <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-clay-sm shadow-clay-btn border border-clay-border/80 text-xs font-medium">
          <Compass className="w-3.5 h-3.5 text-accent-blue" />
          <select
            value={filters.area === 'all' ? 'All Areas' : filters.area}
            onChange={(e) => {
              const val = e.target.value === 'All Areas' ? 'all' : e.target.value;
              onChange({ area: val });
              if (onAreaJump && val !== 'all') onAreaJump(val);
            }}
            className="bg-transparent text-clay-text outline-none cursor-pointer pr-1"
          >
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Category dropdown */}
        <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-clay-sm shadow-clay-btn border border-clay-border/80 text-xs font-medium">
          <Tag className="w-3.5 h-3.5 text-purple-600" />
          <select
            value={filters.category === 'all' ? 'All Categories' : filters.category}
            onChange={(e) => {
              const val = e.target.value === 'All Categories' ? 'all' : e.target.value;
              onChange({ category: val });
            }}
            className="bg-transparent text-clay-text outline-none cursor-pointer pr-1"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Recency dropdown */}
        <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-clay-sm shadow-clay-btn border border-clay-border/80 text-xs font-medium">
          <Clock className="w-3.5 h-3.5 text-accent-emerald" />
          <select
            value={filters.recency}
            onChange={(e) => onChange({ recency: e.target.value as RadarFilterState['recency'] })}
            className="bg-transparent text-clay-text outline-none cursor-pointer pr-1"
          >
            <option value="all">All Time</option>
            <option value="24h">⚡ Fresh (&lt;24h)</option>
            <option value="7d">📅 Last 7 Days</option>
            <option value="30d">🗓️ Last 30 Days</option>
            <option value="6m">⏳ Last 6 Months</option>
          </select>
        </div>

        {/* Outreach status */}
        <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-clay-sm shadow-clay-btn border border-clay-border/80 text-xs font-medium">
          <SlidersHorizontal className="w-3.5 h-3.5 text-accent-amber" />
          <select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value as RadarFilterState['status'] })}
            className="bg-transparent text-clay-text outline-none cursor-pointer pr-1"
          >
            <option value="all">All Statuses</option>
            <option value="new">🟢 New Lead</option>
            <option value="contacted">🔵 Contacted</option>
            <option value="interested">🟡 Interested</option>
            <option value="closed">🟣 Closed</option>
            <option value="skip">⚪ Skip</option>
          </select>
        </div>
      </div>

      {/* Quick grid jump pills */}
      <div className="flex items-center gap-2 text-xs pt-0.5 overflow-x-auto text-clay-muted">
        <span className="shrink-0 text-clay-faint text-[11px] font-semibold tracking-wide uppercase">Hot Grids:</span>
        {['Kokapet', 'Gachibowli', 'HITECH City', 'Financial District', 'Madhapur', 'Jubilee Hills'].map((area) => (
          <button
            key={area}
            onClick={() => {
              onChange({ area });
              if (onAreaJump) onAreaJump(area);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              filters.area === area
                ? 'bg-accent-blue text-white shadow-clay-btn'
                : 'bg-white text-clay-muted hover:text-clay-text shadow-clay-pill border border-clay-border/70 hover:bg-slate-50'
            }`}
          >
            📍 {area}
          </button>
        ))}
      </div>
    </div>
  );
};
