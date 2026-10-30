import React, { useState } from 'react';
import { Business, OutreachStatus } from '@/lib/types';
import {
  Phone,
  MessageCircle,
  Instagram,
  Globe,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Send
} from 'lucide-react';

interface BusinessCardProps {
  business: Business;
  isSelected?: boolean;
  onSelect?: () => void;
  onStatusChange: (status: OutreachStatus, notes?: string) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  isSelected,
  onSelect,
  onStatusChange,
}) => {
  const [notes, setNotes] = useState(business.outreach_notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const formatRecency = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return `${Math.round(diffDays / 30)}mo ago`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
    if (score >= 60) return 'text-amber-400 bg-amber-950/60 border-amber-800';
    return 'text-gray-400 bg-gray-800 border-gray-700';
  };

  const isNew = Date.now() - new Date(business.first_seen_at).getTime() < 24 * 60 * 60 * 1000;

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-blue-950/30 border-blue-500 ring-1 ring-blue-500/50 shadow-lg'
          : 'bg-gray-900/90 border-gray-800 hover:border-gray-700 hover:bg-gray-850'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-white text-base leading-snug">{business.name}</h3>
            {isNew && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> New
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            <span className="flex items-center gap-1 text-gray-300">
              <MapPin className="w-3 h-3 text-red-400" /> {business.area}
            </span>
            <span>•</span>
            <span className="text-gray-400">{business.category}</span>
            <span>•</span>
            <span className="text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatRecency(business.first_seen_at)}
            </span>
          </div>
        </div>

        {/* Lead Score */}
        <div
          className={`shrink-0 px-2 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 ${getScoreColor(
            business.lead_score
          )}`}
          title="Lead Opportunity Score: Higher means hotter prospect without website or established marketing"
        >
          <Flame className="w-3 h-3" />
          {business.lead_score}
        </div>
      </div>

      {/* Description / Summary */}
      {business.description && (
        <p className="text-xs text-gray-300 mt-2 line-clamp-2 leading-relaxed">
          {business.description}
        </p>
      )}

      {/* Grok AI Insight Pill */}
      {business.grok_summary && (
        <div className="mt-2.5 p-2 rounded-lg bg-gray-800/80 border border-blue-900/40 text-[11px] text-blue-200/90 flex items-start gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
          <div className="line-clamp-2 italic">{business.grok_summary}</div>
        </div>
      )}

      {/* Outreach Action Toolbar */}
      <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between gap-2 flex-wrap">
        {/* Quick Contact Buttons */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              title={`Call ${business.phone}`}
              className="p-1.5 rounded-md bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center gap-1 text-xs transition"
            >
              <Phone className="w-3 h-3" />
              <span className="hidden sm:inline">Call</span>
            </a>
          )}

          {business.whatsapp && (
            <a
              href={`https://wa.me/${business.whatsapp}?text=Hi%20${encodeURIComponent(
                business.name
              )},%20saw%20your%20new%20launch%20in%20${encodeURIComponent(business.area)}!`}
              target="_blank"
              rel="noopener noreferrer"
              title="Open WhatsApp"
              className="p-1.5 rounded-md bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 text-xs transition"
            >
              <MessageCircle className="w-3 h-3" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}

          {business.instagram_handle && (
            <a
              href={business.instagram_url || `https://instagram.com/${business.instagram_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`@${business.instagram_handle}`}
              className="p-1.5 rounded-md bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 border border-pink-500/30 flex items-center gap-1 text-xs transition"
            >
              <Instagram className="w-3 h-3" />
              <span className="hidden sm:inline">@{business.instagram_handle}</span>
            </a>
          )}

          {business.website ? (
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 flex items-center gap-1 text-xs transition"
            >
              <Globe className="w-3 h-3" />
            </a>
          ) : (
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-500/10 text-amber-300/80 border border-amber-500/20">
              No Website
            </span>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <select
            value={business.outreach_status}
            onChange={(e) => onStatusChange(e.target.value as OutreachStatus)}
            className={`text-xs px-2 py-1 rounded-md border cursor-pointer outline-none font-medium ${
              business.outreach_status === 'new'
                ? 'bg-blue-900/30 text-blue-300 border-blue-800'
                : business.outreach_status === 'contacted'
                ? 'bg-purple-900/30 text-purple-300 border-purple-800'
                : business.outreach_status === 'interested'
                ? 'bg-amber-900/30 text-amber-300 border-amber-800'
                : business.outreach_status === 'closed'
                ? 'bg-emerald-900/30 text-emerald-300 border-emerald-800'
                : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}
          >
            <option value="new">🟢 New Lead</option>
            <option value="contacted">🔵 Contacted</option>
            <option value="interested">🟡 Interested</option>
            <option value="closed">🟣 Closed</option>
            <option value="skip">⚪ Skip</option>
          </select>
        </div>
      </div>

      {/* Outreach Notes Expandable */}
      <div className="mt-2.5 pt-2 border-t border-gray-800/40 text-xs" onClick={(e) => e.stopPropagation()}>
        {isEditingNotes ? (
          <div className="flex items-center gap-1.5 mt-1">
            <input
              type="text"
              placeholder="e.g. Call at 4 PM, spoke with manager..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1 bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded border border-gray-700 outline-none focus:border-blue-500"
            />
            <button
              onClick={() => {
                onStatusChange(business.outreach_status, notes);
                setIsEditingNotes(false);
              }}
              className="p-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingNotes(true)}
            className="text-gray-400 hover:text-gray-300 cursor-pointer flex items-center justify-between text-[11px]"
          >
            <span>{business.outreach_notes ? `📝 "${business.outreach_notes}"` : '+ Add outreach call note'}</span>
            <span className="text-[10px] text-gray-500 hover:underline">edit</span>
          </div>
        )}
      </div>
    </div>
  );
};
