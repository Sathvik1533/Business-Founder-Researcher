'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Business } from '@/lib/types';
import { Layers, Crosshair, ZoomIn, ZoomOut } from 'lucide-react';

interface RadarMapProps {
  businesses: Business[];
  selectedBusiness?: Business | null;
  onSelectBusiness: (b: Business) => void;
  flyToCoords?: { lat: number; lng: number; zoom?: number } | null;
}

const MAP_STYLES = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  positron: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  voyager: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
};

// Coordinates of key Hyderabad zones
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
  const [currentStyle, setCurrentStyle] = useState<'dark' | 'positron' | 'voyager'>('dark');

  // Convert businesses into GeoJSON
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

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[currentStyle],
      center: [78.35, 17.43], // Centered around West Hyderabad tech & commercial belt
      zoom: 12,
      pitch: 35,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', () => {
      // Add clustered GeoJSON source
      map.addSource('businesses-source', {
        type: 'geojson',
        data: toGeoJSON(businesses),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Cluster circle layer
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'businesses-source',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#3B82F6', // < 5: Blue
            5,
            '#10B981', // 5-15: Emerald
            15,
            '#F59E0B', // 15-30: Amber
            30,
            '#EF4444', // 30+: Rose
          ],
          'circle-radius': ['step', ['get', 'point_count'], 18, 5, 24, 15, 30, 30, 36],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.85,
        },
      });

      // Cluster count label layer
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'businesses-source',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 13,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      // Individual unclustered pin layer
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
            '#8B5CF6', // Purple
            'interested',
            '#F59E0B', // Amber
            'closed',
            '#10B981', // Green
            'skip',
            '#6B7280', // Grey
            '#3B82F6', // Default: Blue for New
          ],
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'lead_score'],
            0,
            7,
            100,
            12,
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Click on cluster to zoom in
      map.on('click', 'clusters', async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = map.getSource('businesses-source') as maplibregl.GeoJSONSource;
        if (!source || clusterId === undefined) return;

        const zoom = await source.getClusterExpansionZoom(clusterId);
        const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
        map.flyTo({ center: coords, zoom: Math.min(zoom, 16), speed: 1.2 });
      });

      // Click on single point
      map.on('click', 'unclustered-point', (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const bizId = feature.properties?.id;
        const target = businesses.find((b) => b.id === bizId);
        if (target) {
          onSelectBusiness(target);
        }
      });

      // Pointer cursors
      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('mouseenter', 'unclustered-point', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'unclustered-point', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update source data when businesses array changes
  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;
    if (!map.isStyleLoaded()) return;

    const source = map.getSource('businesses-source') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(toGeoJSON(businesses));
    }
  }, [businesses]);

  // Handle fly to coordinates
  useEffect(() => {
    if (!mapInstance.current || !flyToCoords) return;
    mapInstance.current.flyTo({
      center: [flyToCoords.lng, flyToCoords.lat],
      zoom: flyToCoords.zoom || 14,
      speed: 1.4,
      essential: true,
    });
  }, [flyToCoords]);

  // Handle selected business focus
  useEffect(() => {
    if (!mapInstance.current || !selectedBusiness?.lat || !selectedBusiness?.lng) return;
    mapInstance.current.flyTo({
      center: [selectedBusiness.lng, selectedBusiness.lat],
      zoom: 15,
      speed: 1.5,
    });
  }, [selectedBusiness]);

  // Style change handler
  const handleStyleChange = (styleKey: 'dark' | 'positron' | 'voyager') => {
    setCurrentStyle(styleKey);
    if (!mapInstance.current) return;
    mapInstance.current.setStyle(MAP_STYLES[styleKey]);
  };

  return (
    <div className="relative w-full h-full min-h-[450px] bg-gray-950 overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Map Control Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-gray-900/90 backdrop-blur p-1.5 rounded-lg border border-gray-800 text-xs shadow-lg">
        <span className="text-gray-400 pl-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-blue-400" /> Style:
        </span>
        <button
          onClick={() => handleStyleChange('dark')}
          className={`px-2 py-1 rounded transition ${
            currentStyle === 'dark' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          Dark
        </button>
        <button
          onClick={() => handleStyleChange('positron')}
          className={`px-2 py-1 rounded transition ${
            currentStyle === 'positron' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          Light
        </button>
        <button
          onClick={() => handleStyleChange('voyager')}
          className={`px-2 py-1 rounded transition ${
            currentStyle === 'voyager' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          Street
        </button>
      </div>

      {/* Quick center reset */}
      <button
        onClick={() => {
          mapInstance.current?.flyTo({ center: [78.35, 17.43], zoom: 12, speed: 1.2 });
        }}
        className="absolute bottom-6 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/90 hover:bg-gray-850 backdrop-blur border border-gray-800 rounded-lg text-xs text-gray-200 shadow-md transition"
      >
        <Crosshair className="w-3.5 h-3.5 text-blue-400" />
        Reset to Hyderabad West
      </button>

      {/* Map Legend */}
      <div className="absolute bottom-6 right-4 z-10 bg-gray-900/90 backdrop-blur p-2.5 rounded-lg border border-gray-800 text-[11px] text-gray-300 shadow-lg space-y-1 hidden md:block">
        <div className="font-semibold text-gray-400 pb-1 border-b border-gray-800 text-[10px] uppercase tracking-wider">
          Pin Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>New Lead</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span>Contacted</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Interested</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Closed Plan</span>
        </div>
      </div>
    </div>
  );
};
