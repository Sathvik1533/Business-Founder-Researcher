'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Business, RadarFilterState, OutreachStatus } from '@/lib/types';
import { StatsBar } from '@/components/StatsBar';
import { FilterBar } from '@/components/FilterBar';
import { BusinessPanel } from '@/components/BusinessPanel';
import { AREA_COORDINATES } from '@/components/RadarMap';
import { Radar, Radio, Github, ExternalLink } from 'lucide-react';

// Dynamic import with SSR disabled for WebGL canvas
const RadarMap = dynamic(
  () => import('@/components/RadarMap').then((mod) => mod.RadarMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-clay-canvas text-clay-muted gap-3">
        <Radar className="w-8 h-8 text-accent-blue animate-spin" />
        <span className="text-xs font-medium tracking-wide">Loading Hyderabad MapLibre Vector Radar...</span>
      </div>
    ),
  }
);

export default function RadarPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [flyToCoords, setFlyToCoords] = useState<{ lat: number; lng: number; zoom?: number } | null>(
    null
  );

  const [filters, setFilters] = useState<RadarFilterState>({
    area: 'all',
    category: 'all',
    recency: 'all',
    search: '',
    status: 'all',
    source: 'all',
  });

  const loadBusinesses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.area && filters.area !== 'all') params.set('area', filters.area);
      if (filters.category && filters.category !== 'all') params.set('category', filters.category);
      if (filters.recency && filters.recency !== 'all') params.set('recency', filters.recency);
      if (filters.status && filters.status !== 'all') params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);

      const res = await fetch(`/api/businesses?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.businesses)) {
        setBusinesses(data.businesses);
      }
    } catch (err) {
      console.error('Error loading businesses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const handleStatusChange = async (id: string, status: OutreachStatus, notes?: string) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, outreach_status: status, outreach_notes: notes || b.outreach_notes } : b))
    );
    if (selectedBusiness?.id === id) {
      setSelectedBusiness((prev) => (prev ? { ...prev, outreach_status: status, outreach_notes: notes || prev.outreach_notes } : null));
    }

    try {
      await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, notes }),
      });
    } catch (err) {
      console.error('Failed to save status update:', err);
    }
  };

  const handleAreaJump = (areaName: string) => {
    const coords = AREA_COORDINATES[areaName];
    if (coords) {
      setFlyToCoords({ lng: coords[0], lat: coords[1], zoom: 14.5 });
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-clay-canvas overflow-hidden select-none">
      {/* Top Porcelain Header */}
      <header className="h-16 border-b border-clay-border/80 bg-white/95 backdrop-blur-md px-5 flex items-center justify-between z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-clay-sm bg-blue-50 text-accent-blue shadow-clay-btn border border-blue-100">
            <Radar className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-clay-text text-base tracking-tight">
                Business Founder Radar
              </h1>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-accent-blue border border-blue-200/80 font-semibold shadow-clay-pill hidden sm:inline">
                Hyderabad MSME Pipeline
              </span>
            </div>
            <div className="text-[11px] text-clay-muted flex items-center gap-2 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Radio className="w-2.5 h-2.5 text-accent-emerald animate-ping" /> Scans Every 8h
              </span>
              <span>•</span>
              <span>Google Maps · Instagram · OpenStreetMap</span>
            </div>
          </div>
        </div>

        {/* GitHub & Info Pill */}
        <div className="flex items-center gap-2.5">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-clay-sm bg-white hover:bg-slate-50 text-xs font-semibold text-clay-text border border-clay-border shadow-clay-btn transition active:translate-y-0.5"
          >
            <Github className="w-3.5 h-3.5 text-slate-700" />
            <span className="hidden md:inline">GitHub Actions Cron</span>
            <ExternalLink className="w-3 h-3 text-clay-faint" />
          </a>
        </div>
      </header>

      {/* KPI Stats Bar */}
      <StatsBar businesses={businesses} selectedArea={filters.area} />

      {/* Filter Bar with Inset Search & Clay Selectors */}
      <FilterBar
        filters={filters}
        onChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
        onAreaJump={handleAreaJump}
      />

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left: Map */}
        <div className="flex-1 h-[50vh] md:h-full relative">
          <RadarMap
            businesses={businesses}
            selectedBusiness={selectedBusiness}
            onSelectBusiness={(b) => setSelectedBusiness(b)}
            flyToCoords={flyToCoords}
          />
        </div>

        {/* Right: Business CRM Discovery Panel */}
        <div className="w-full md:w-[420px] lg:w-[460px] h-[50vh] md:h-full shrink-0 z-10">
          <BusinessPanel
            businesses={businesses}
            selectedId={selectedBusiness?.id}
            onSelectBusiness={(b) => {
              setSelectedBusiness(b);
              if (b.lat && b.lng) {
                setFlyToCoords({ lat: b.lat, lng: b.lng, zoom: 15.5 });
              }
            }}
            onStatusChange={handleStatusChange}
            onRefresh={loadBusinesses}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
