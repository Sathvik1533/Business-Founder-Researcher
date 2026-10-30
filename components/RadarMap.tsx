'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Business } from '@/lib/types';
import { Layers, Crosshair } from 'lucide-react';

interface RadarMapProps {
  businesses: Business[];
  selectedBusiness?: Business | null;
  onSelectBusiness: (b: Business) => void;
  flyToCoords?: { lat: number; lng: number; zoom?: number } | null;
}

const MAP_STYLES = {
  positron: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  voyager: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
};

export const AREA_COORDINATES: Record<string, [number, number]> = {
  Kokapet: [78.3298, 17.4156],
  Gachibowli: [78.3489, 17.44],
  'HITECH City': [78.3908, 17.4486],
  Madhapur: [78.3908, 17.4484],
  'Financial District': [78.343, 17.417],
  Nanakramguda: [78.355, 17.418],
  'Jubilee Hills': [78.4072, 17.4312],
  'Banjara Hills': [78.435, 17.4156],
  Kondapur: [78.355, 17.46],
  Narsingi: [78.3588, 17.3883],
};

export const RadarMap: React.FC<RadarMapProps> = ({
  businesses,
  selectedBusiness,
  onSelectBusiness,
  flyToCoords,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const [currentStyle, setCurrentStyle] = useState<'positron' | 'voyager' | 'dark'>('positron');

  const toGeoJSON = (items: Business[]): GeoJSON.FeatureCollection<GeoJSON.Point> => ({
    type: 'FeatureCollection',
    features: items
      .filter((b) => b.lat && b.lng)
      .map((b) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [b.lng, b.lat],
        },
        properties: {
          id: b.id,
          name: b.name,
          category: b.category,
          area: b.area,
          lead_score: b.lead_score,
          status: b.outreach_status,
          phone: b.phone || '',
          whatsapp: b.whatsapp || '',
          instagram_handle: b.instagram_handle || '',
          first_seen_at: b.first_seen_at,
        },
      })),
  });

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[currentStyle],
      center: [78.35, 17.43],
      zoom: 12.4,
      pitch: 25,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', () => {
      map.addSource('businesses-source', {
        type: 'geojson',
        data: toGeoJSON(businesses),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 45,
      });

      // Cluster circle layer — Tactile clay bubbles
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'businesses-source',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#2563EB', // < 5: Sapphire
            5,
            '#059669', // 5-15: Emerald
            15,
            '#D97706', // 15-30: Amber
            30,
            '#E11D48', // 30+: Rose
          ],
          'circle-radius': ['step', ['get', 'point_count'], 16, 5, 22, 15, 28, 30, 34],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#FFFFFF',
          'circle-opacity': 0.92,
        },
      });

      // Cluster label
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'businesses-source',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 12,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        },
        paint: {
          'text-color': '#FFFFFF',
        },
      });

      // Individual unclustered pin
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'businesses-source',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'status'],
            'contacted',
            '#6366F1',
            'interested',
            '#F59E0B',
            'closed',
            '#10B981',
            'skip',
            '#94A3B8',
            '#2563EB',
          ],
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'lead_score'],
            0,
            7,
            100,
            11,
          ],
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#FFFFFF',
        },
      });

      map.on('click', 'clusters', async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = map.getSource('businesses-source') as maplibregl.GeoJSONSource;
        if (!source || clusterId === undefined) return;

        const zoom = await source.getClusterExpansionZoom(clusterId);
        const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
        map.flyTo({ center: coords, zoom: Math.min(zoom, 16), speed: 1.2 });
      });

      map.on('click', 'unclustered-point', (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const bizId = feature.properties?.id;
        const target = businesses.find((b) => b.id === bizId);
        if (target) {
          onSelectBusiness(target);
        }
      });

      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;
    if (!map.isStyleLoaded()) return;

    const source = map.getSource('businesses-source') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(toGeoJSON(businesses));
    }
  }, [businesses]);

  useEffect(() => {
    if (!mapInstance.current || !flyToCoords) return;
    mapInstance.current.flyTo({
      center: [flyToCoords.lng, flyToCoords.lat],
      zoom: flyToCoords.zoom || 14.5,
      speed: 1.4,
      essential: true,
    });
  }, [flyToCoords]);

  useEffect(() => {
    if (!mapInstance.current || !selectedBusiness?.lat || !selectedBusiness?.lng) return;
    mapInstance.current.flyTo({
      center: [selectedBusiness.lng, selectedBusiness.lat],
      zoom: 15.5,
      speed: 1.4,
    });
  }, [selectedBusiness]);

  const handleStyleChange = (styleKey: 'positron' | 'voyager' | 'dark') => {
    setCurrentStyle(styleKey);
    if (!mapInstance.current) return;
    mapInstance.current.setStyle(MAP_STYLES[styleKey]);
  };

  return (
    <div className="relative w-full h-full min-h-[420px] bg-clay-canvas overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Clay Floating Map Style Control */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 p-1 rounded-clay bg-white/90 backdrop-blur-md shadow-clay-card border border-clay-border/80 text-xs">
        <span className="text-clay-muted pl-2 text-[11px] font-medium flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-accent-blue" /> Basemap:
        </span>
        <button
          onClick={() => handleStyleChange('positron')}
          className={`px-2.5 py-1 rounded-clay-sm font-medium transition ${
            currentStyle === 'positron'
              ? 'bg-accent-blue text-white shadow-clay-btn'
              : 'text-clay-muted hover:text-clay-text'
          }`}
        >
          Porcelain
        </button>
        <button
          onClick={() => handleStyleChange('voyager')}
          className={`px-2.5 py-1 rounded-clay-sm font-medium transition ${
            currentStyle === 'voyager'
              ? 'bg-accent-blue text-white shadow-clay-btn'
              : 'text-clay-muted hover:text-clay-text'
          }`}
        >
          Street
        </button>
        <button
          onClick={() => handleStyleChange('dark')}
          className={`px-2.5 py-1 rounded-clay-sm font-medium transition ${
            currentStyle === 'dark'
              ? 'bg-accent-blue text-white shadow-clay-btn'
              : 'text-clay-muted hover:text-clay-text'
          }`}
        >
          Slate
        </button>
      </div>

      {/* Recenter Button */}
      <button
        onClick={() => {
          mapInstance.current?.flyTo({ center: [78.35, 17.43], zoom: 12.4, speed: 1.2 });
        }}
        className="absolute bottom-5 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 hover:bg-white text-clay-text rounded-clay shadow-clay-btn border border-clay-border/80 text-xs font-medium transition active:translate-y-0.5"
      >
        <Crosshair className="w-3.5 h-3.5 text-accent-blue" />
        Reset to Hyderabad West
      </button>

      {/* Clay Legend */}
      <div className="absolute bottom-5 right-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-clay shadow-clay-card border border-clay-border/80 text-[11px] text-clay-text hidden md:block space-y-1.5">
        <div className="font-semibold text-clay-muted text-[10px] uppercase tracking-wider pb-1 border-b border-clay-border/60">
          Status Pipeline
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-blue shadow-sm" />
          <span className="font-medium">New Lead</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm" />
          <span>Contacted</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
          <span>Interested</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
          <span>Closed Plan</span>
        </div>
      </div>
    </div>
  );
};
