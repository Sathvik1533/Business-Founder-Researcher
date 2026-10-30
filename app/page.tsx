'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Business, RadarFilterState, OutreachStatus } from '@/lib/types';
import { StatsBar } from '@/components/StatsBar';
import { FilterBar } from '@/components/FilterBar';
import { BusinessPanel } from '@/components/BusinessPanel';
import { AREA_COORDINATES } from '@/components/RadarMap';
import { Radar, Radio, Github, RefreshCw, ExternalLink } from 'lucide-react';

// Dynamically import RadarMap with SSR disabled (MapLibre uses browser WebGL)
const RadarMap = dynamic(
  () => import('@/components/RadarMap').then((mod) => mod.RadarMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-950 text-gray-400 gap-3">
        <Radar className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-sm">Initializing Hyderabad WebGL Radar...</span>
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

  // Fetch businesses from API
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

  // Handle outreach status changes
  const handleStatusChange = async (id: string, status: OutreachStatus, notes?: string) => {
    // Optimistic UI update
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

  // Jump to specific area coordinates
  const handleAreaJump = (areaName: string) => {
    const coords = AREA_COORDINATES[areaName];
    if (coords) {
      setFlyToCoords({ lng: coords[0], lat: coords[1], zoom: 14.5 });
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-950 overflow-hidden select-none">
      {/* Top Header */}
      <header className="h-14 border-b border-gray-800 bg-gray-900/90 backdrop-blur px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Radar className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-white text-sm sm:text-base tracking-tight">
                Business Founder Radar
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium hidden sm:inline">
                Hyderabad MSME Intelligence
              </span>
            </div>
            <div className="text-[11px] text-gray-400 flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-400">
                <Radio className="w-3 h-3 animate-ping" /> Agent active
              </span>
              <span>•</span>
              <span>Crawls Google Maps, Instagram & OSM every 8 hours</span>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 border border-gray-700 transition"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden md:inline">GitHub Actions Cron</span>
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </a>
        </div>
      </header>

      {/* Stats KPI Bar */}
      <StatsBar businesses={businesses} selectedArea={filters.area} />

      {/* Interactive Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
        onAreaJump={handleAreaJump}
      />

      {/* Main Split Layout: Map (Left/Center) + Business List Panel (Right) */}
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
        <div className="w-full md:w-[420px] lg:w-[460px] h-[50vh] md:h-full shrink-0 z-10 shadow-2xl">
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
