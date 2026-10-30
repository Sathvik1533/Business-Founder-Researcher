import React, { useState } from 'react';
import { Business, OutreachStatus } from '@/lib/types';
import {
  Phone,
  MessageCircle,
  Instagram,
  Globe,
  Flame,
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
    if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-slate-600 bg-slate-100 border-slate-200';
  };

  const isNew = Date.now() - new Date(business.first_seen_at).getTime() < 24 * 60 * 60 * 1000;

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-clay border transition-all cursor-pointer ${
        isSelected
          ? 'bg-blue-50/70 border-accent-blue ring-2 ring-accent-blue/20 shadow-clay-card'
          : 'bg-white border-clay-border/70 hover:border-clay-border shadow-clay-card hover:-translate-y-0.5'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-clay-text text-base leading-snug">{business.name}</h3>
            {isNew && (
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1 shadow-sm">
                <Sparkles className="w-2.5 h-2.5" /> New
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-clay-muted mt-1.5 font-medium">
            <span className="flex items-center gap-1 text-clay-text">
              <MapPin className="w-3.5 h-3.5 text-rose-500" /> {business.area}
            </span>
            <span>•</span>
            <span className="text-clay-muted">{business.category}</span>
            <span>•</span>
            <span className="text-clay-faint flex items-center gap-1 font-mono text-[11px]">
              <Clock className="w-3 h-3" /> {formatRecency(business.first_seen_at)}
            </span>
          </div>
        </div>

        {/* Lead Score Badge */}
        <div
          className={`shrink-0 px-2.5 py-1 rounded-clay-sm border text-xs font-bold flex items-center gap-1 shadow-clay-pill ${getScoreColor(
            business.lead_score
          )}`}
          title="Lead Opportunity Score: 0-100 based on website absence, social activity & timing"
        >
          <Flame className="w-3.5 h-3.5" />
          {business.lead_score}
        </div>
      </div>

      {/* Description */}
      {business.description && (
        <p className="text-xs text-clay-text/80 mt-2.5 line-clamp-2 leading-relaxed">
          {business.description}
        </p>
      )}

      {/* Grok AI Brief Card */}
      {business.grok_summary && (
        <div className="mt-3 p-2.5 rounded-clay-sm bg-blue-50/80 border border-blue-100/90 text-[11px] text-blue-900 flex items-start gap-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-accent-blue shrink-0 mt-0.5" />
          <div className="line-clamp-2 leading-relaxed font-normal">{business.grok_summary}</div>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="mt-3.5 pt-3 border-t border-clay-border/60 flex items-center justify-between gap-2 flex-wrap">
        {/* Contact buttons */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              title={`Call ${business.phone}`}
              className="px-2.5 py-1 rounded-clay-sm bg-white hover:bg-blue-50 text-accent-blue border border-blue-200/80 shadow-clay-btn flex items-center gap-1 text-xs font-medium transition active:translate-y-0.5"
            >
              <Phone className="w-3 h-3" />
              <span>Call</span>
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
              className="px-2.5 py-1 rounded-clay-sm bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-clay-btn flex items-center gap-1 text-xs font-medium transition active:translate-y-0.5"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp</span>
            </a>
          )}

          {business.instagram_handle && (
            <a
              href={business.instagram_url || `https://instagram.com/${business.instagram_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`@${business.instagram_handle}`}
              className="px-2 py-1 rounded-clay-sm bg-white hover:bg-pink-50 text-pink-700 border border-pink-200/80 shadow-clay-btn flex items-center gap-1 text-xs font-medium transition active:translate-y-0.5"
            >
              <Instagram className="w-3 h-3" />
              <span>@{business.instagram_handle}</span>
            </a>
          )}

          {business.website ? (
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-clay-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-clay-btn transition active:translate-y-0.5"
            >
              <Globe className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              No Website
            </span>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <select
            value={business.outreach_status}
            onChange={(e) => onStatusChange(e.target.value as OutreachStatus)}
            className={`text-xs px-2.5 py-1 rounded-clay-sm border cursor-pointer outline-none font-semibold shadow-clay-btn ${
              business.outreach_status === 'new'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : business.outreach_status === 'contacted'
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : business.outreach_status === 'interested'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : business.outreach_status === 'closed'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
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

      {/* Outreach Notes Section */}
      <div className="mt-2.5 pt-2 border-t border-clay-border/40 text-xs" onClick={(e) => e.stopPropagation()}>
        {isEditingNotes ? (
          <div className="flex items-center gap-1.5 mt-1">
            <input
              type="text"
              placeholder="e.g. Call at 4 PM, spoke with manager..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1 bg-white text-clay-text text-xs px-2.5 py-1 rounded-clay-sm border border-clay-border shadow-clay-pressed outline-none focus:border-accent-blue"
            />
            <button
              onClick={() => {
                onStatusChange(business.outreach_status, notes);
                setIsEditingNotes(false);
              }}
              className="p-1.5 bg-accent-blue text-white rounded-clay-sm shadow-clay-btn hover:bg-blue-700 transition"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingNotes(true)}
            className="text-clay-muted hover:text-clay-text cursor-pointer flex items-center justify-between text-[11px]"
          >
            <span>{business.outreach_notes ? `📝 "${business.outreach_notes}"` : '+ Add outreach call note'}</span>
            <span className="text-[10px] text-accent-blue hover:underline font-medium">edit</span>
          </div>
        )}
      </div>
    </div>
  );
};
