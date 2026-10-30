import React from 'react';
import { RadarFilterState } from '@/lib/types';
import { Search, Filter, Compass, Clock, Tag } from 'lucide-react';

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
    <div className="bg-gray-900 border-b border-gray-800 p-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search business, keyword, or area..."
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full bg-gray-800/90 text-sm text-gray-100 pl-9 pr-3 py-1.5 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Area dropdown */}
        <div className="flex items-center gap-1.5 bg-gray-800 px-2.5 py-1.5 rounded-lg border border-gray-700 text-xs">
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <select
            value={filters.area === 'all' ? 'All Areas' : filters.area}
            onChange={(e) => {
              const val = e.target.value === 'All Areas' ? 'all' : e.target.value;
              onChange({ area: val });
              if (onAreaJump && val !== 'all') onAreaJump(val);
            }}
            className="bg-transparent text-gray-200 outline-none cursor-pointer"
          >
            {AREAS.map((a) => (
              <option key={a} value={a} className="bg-gray-800 text-gray-200">
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Category dropdown */}
        <div className="flex items-center gap-1.5 bg-gray-800 px-2.5 py-1.5 rounded-lg border border-gray-700 text-xs">
          <Tag className="w-3.5 h-3.5 text-purple-400" />
          <select
            value={filters.category === 'all' ? 'All Categories' : filters.category}
            onChange={(e) => {
              const val = e.target.value === 'All Categories' ? 'all' : e.target.value;
              onChange({ category: val });
            }}
            className="bg-transparent text-gray-200 outline-none cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-gray-800 text-gray-200">
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Recency dropdown */}
        <div className="flex items-center gap-1.5 bg-gray-800 px-2.5 py-1.5 rounded-lg border border-gray-700 text-xs">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <select
            value={filters.recency}
            onChange={(e) => onChange({ recency: e.target.value as RadarFilterState['recency'] })}
            className="bg-transparent text-gray-200 outline-none cursor-pointer"
          >
            <option value="all" className="bg-gray-800 text-gray-200">All Time</option>
            <option value="24h" className="bg-gray-800 text-gray-200">⚡ Discovered &lt;24h</option>
            <option value="7d" className="bg-gray-800 text-gray-200">📅 Last 7 Days</option>
            <option value="30d" className="bg-gray-800 text-gray-200">🗓️ Last 30 Days</option>
            <option value="6m" className="bg-gray-800 text-gray-200">⏳ Last 6 Months</option>
          </select>
        </div>

        {/* Outreach status */}
        <div className="flex items-center gap-1.5 bg-gray-800 px-2.5 py-1.5 rounded-lg border border-gray-700 text-xs">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value as RadarFilterState['status'] })}
            className="bg-transparent text-gray-200 outline-none cursor-pointer"
          >
            <option value="all" className="bg-gray-800 text-gray-200">All Statuses</option>
            <option value="new" className="bg-gray-800 text-gray-200">🟢 New / Uncontacted</option>
            <option value="contacted" className="bg-gray-800 text-gray-200">🔵 Contacted</option>
            <option value="interested" className="bg-gray-800 text-gray-200">🟡 Interested</option>
            <option value="closed" className="bg-gray-800 text-gray-200">🟣 Closed Plan</option>
            <option value="skip" className="bg-gray-800 text-gray-200">⚪ Skip</option>
          </select>
        </div>
      </div>

      {/* Quick hot-spot shortcuts */}
      <div className="flex items-center gap-2 text-xs pt-1 overflow-x-auto text-gray-400">
        <span className="shrink-0 text-gray-500 font-medium">Quick Grids:</span>
        {['Kokapet', 'Gachibowli', 'HITECH City', 'Financial District', 'Madhapur', 'Jubilee Hills'].map((area) => (
          <button
            key={area}
            onClick={() => {
              onChange({ area });
              if (onAreaJump) onAreaJump(area);
            }}
            className={`px-2 py-0.5 rounded-full border transition-colors ${
              filters.area === area
                ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                : 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 border-gray-700'
            }`}
          >
            📍 {area}
          </button>
        ))}
      </div>
    </div>
  );
};
