import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDataStore } from '@/store/dataStore';
import { useUIStore } from '@/store/uiStore';
import type { Hospital, Ambulance, EmergencyCase } from '@/types';
import { Building2, Navigation, Siren, Eye, ArrowRightLeft, HeartPulse, MapPin } from 'lucide-react';
import { cn } from '@/utils';

// CSS classes are already imported in index.css.
// Overriding default leaflet marker icon to avoid import issues
const hospitalColors = {
  optimal: '#34d399',
  stable: '#33c9ff',
  strained: '#fbbf24',
  critical: '#fb7185',
};

const createPulseIcon = (color: string, iconHtml: string) => {
  return new L.DivIcon({
    html: `
      <div class="relative flex h-7 w-7 items-center justify-center rounded-full bg-base-950/80 border border-base-750 shadow-glow" style="color: ${color}; border-color: ${color}40">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style="background-color: ${color}20"></span>
        ${iconHtml}
      </div>
    `,
    className: 'custom-map-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const createAmbulanceIcon = (status: string) => {
  const color = status === 'available' ? '#34d399' : status === 'offline' ? '#6b7e98' : '#fbbf24';
  const html = `
    <div class="relative flex h-6 w-6 items-center justify-center rounded-lg bg-base-900 border border-base-700" style="color: ${color}; border-color: ${color}40">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="22" height="13" rx="2"/><path d="M12 11h.01"/><ellipse cx="7" cy="20" rx="3" ry="3"/><ellipse cx="17" cy="20" rx="3" ry="3"/></svg>
    </div>
  `;
  return new L.DivIcon({
    html,
    className: 'custom-ambulance-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const createIncidentIcon = (severity: string) => {
  const color = severity === 'level1' ? '#fb7185' : '#f59e0b';
  const html = `
    <div class="relative flex h-7 w-7 items-center justify-center rounded-full bg-critical-950/30 border border-critical-500/50 animate-bounce text-critical-400">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-critical-400/20"></span>
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/></svg>
    </div>
  `;
  return new L.DivIcon({
    html,
    className: 'custom-incident-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

interface NetworkMapProps {
  center?: [number, number];
  zoom?: number;
  routingFrom?: [number, number];
  routingTo?: [number, number];
  interactive?: boolean;
}

// Controller to auto pan/fit map bounds when routing updates
function MapBoundsController({ from, to }: { from?: [number, number]; to?: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (from && to) {
      map.fitBounds([from, to], { padding: [50, 50] });
    }
  }, [from, to, map]);
  return null;
}

export default function NetworkMap({
  center = [28.6139, 77.209],
  zoom = 11,
  routingFrom,
  routingTo,
  interactive = true,
}: NetworkMapProps) {
  const { hospitals, ambulances, emergencies } = useDataStore();
  const { setSelectedHospitalId, pushToast } = useUIStore();
  const [googleMapsEnabled, setGoogleMapsEnabled] = useState(false);
  const [googleMapsKey, setGoogleMapsKey] = useState<string | null>(null);
  const [loadingMap, setLoadingMap] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoadingMap(false), 1400);
    return () => clearTimeout(t);
  }, []);

  // Check if Google Maps is loaded
  useEffect(() => {
    const key = localStorage.getItem('medinova_gmaps_key');
    if (key && (window as any).google) {
      setGoogleMapsEnabled(true);
      setGoogleMapsKey(key);
    }
  }, []);

  // Generate traffic-aware polyline segments
  // Connects routingFrom and routingTo with realistic traffic-colored bends
  const getTrafficPolyline = () => {
    if (!routingFrom || !routingTo) return null;
    
    // Interpolate points to draw a simulated road path
    const [lat1, lng1] = routingFrom;
    const [lat2, lng2] = routingTo;
    
    // Add two midpoint offsets to simulate highway routing
    const mid1: [number, number] = [
      lat1 + (lat2 - lat1) * 0.35 + 0.015,
      lng1 + (lng2 - lng1) * 0.25 - 0.01,
    ];
    const mid2: [number, number] = [
      lat1 + (lat2 - lat1) * 0.7 + 0.005,
      lng1 + (lng2 - lng1) * 0.75 + 0.015,
    ];

    return (
      <>
        {/* Safe/Green segment (low traffic) */}
        <Polyline
          positions={[routingFrom, mid1]}
          color="#34d399"
          weight={4}
          opacity={0.8}
          dashArray="1, 8"
        />
        {/* Warning/Yellow segment (moderate traffic) */}
        <Polyline
          positions={[mid1, mid2]}
          color="#fbbf24"
          weight={4}
          opacity={0.9}
        />
        {/* Critical/Red segment (heavy traffic) */}
        <Polyline
          positions={[mid2, routingTo]}
          color="#fb7185"
          weight={4}
          opacity={0.95}
        />
      </>
    );
  };

  const handleRequestTransfer = (hospId: string) => {
    pushToast('Transfer Initiated', `Opening transfer coordinator for target facility.`, 'info');
    setSelectedHospitalId(hospId);
  };

  if (loadingMap) {
    return (
      <div className="w-full h-full rounded-xl border border-accent-500/20 bg-base-950/65 backdrop-blur-md flex flex-col items-center justify-center p-4 min-h-[280px] shadow-glow relative overflow-hidden">
        {/* Scanning Sweep */}
        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-brand-500/10 to-transparent animate-scanline w-full pointer-events-none" />
        <div className="text-center space-y-3 relative z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300 mx-auto border border-brand-500/25 animate-pulse">
            <Navigation className="h-6 w-6 text-brand-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-ink-200 uppercase tracking-widest">Awaiting GIS Telemetry Link...</h4>
            <p className="text-[10px] text-ink-500 mt-1">Acquiring coordinate locks on vehicle and facility beacons</p>
          </div>
          <div className="flex gap-2 justify-center mt-3">
            <div className="w-14 h-1.5 rounded bg-base-800 animate-pulse" />
            <div className="w-10 h-1.5 rounded bg-base-800 animate-pulse" />
            <div className="w-16 h-1.5 rounded bg-base-800 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (googleMapsEnabled && googleMapsKey) {
    return (
      <GoogleMapRenderer
        center={center}
        zoom={zoom}
        routingFrom={routingFrom}
        routingTo={routingTo}
        apiKey={googleMapsKey}
      />
    );
  }

  return (
    <div className="w-full h-full relative rounded-xl border border-accent-500/20 shadow-glow overflow-hidden" style={{ minHeight: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={interactive}
        zoomControl={interactive}
        attributionControl={interactive}
      >
        {/* Custom Dark-theme CartoDB Tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={20}
        />

        {/* Traffic Routing Polyline */}
        {getTrafficPolyline()}

        {/* Pan map to bounds */}
        <MapBoundsController from={routingFrom} to={routingTo} />

        {/* Hospital Markers */}
        {hospitals.map((h) => {
          const color = hospitalColors[h.health];
          const iconHtml = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M4 21V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v15"/><path d="M9 12h6"/><path d="M12 9v6"/></svg>
          `;
          const customIcon = createPulseIcon(color, iconHtml);

          return (
            <Marker key={h.id} position={[h.lat, h.lng]} icon={customIcon}>
              <Popup className="custom-leaflet-popup">
                <div className="p-3 w-64 space-y-3 font-sans">
                  {/* Title & Tier */}
                  <div className="border-b border-base-700/60 pb-2 flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-ink-100 leading-tight">{h.name}</h4>
                      <p className="text-[10px] text-brand-300 font-semibold mt-0.5">{h.tier} · {h.city}</p>
                    </div>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                      style={{ color, borderColor: `${color}30`, backgroundColor: `${color}15`, borderWidth: 1 }}
                    >
                      {h.healthScore}
                    </span>
                  </div>

                  {/* Vitals Beds Info */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div className="bg-base-850 p-1.5 rounded border border-base-750">
                      <span className="text-ink-400 font-medium uppercase block text-[8px]">General</span>
                      <strong className="text-ink-100 text-xs font-mono">{h.availableBeds}/{h.totalBeds}</strong>
                    </div>
                    <div className="bg-base-850 p-1.5 rounded border border-base-750">
                      <span className="text-ink-400 font-medium uppercase block text-[8px]">ICU</span>
                      <strong className="text-warning-400 text-xs font-mono">{h.icuAvailable}/{h.icuBeds}</strong>
                    </div>
                    <div className="bg-base-850 p-1.5 rounded border border-base-750">
                      <span className="text-ink-400 font-medium uppercase block text-[8px]">ER Beds</span>
                      <strong className="text-critical-400 text-xs font-mono">{h.emergencyAvailable}/{h.emergencyBeds}</strong>
                    </div>
                  </div>

                  {/* Medical Devices Statuses */}
                  <div className="space-y-1 text-xs border-t border-base-700/40 pt-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-ink-400 flex items-center gap-1"><HeartPulse className="h-3 w-3 text-brand-300" /> Ventilators</span>
                      <span className="font-semibold text-ink-200 tabular-nums">{h.ventilatorsAvailable} units</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-ink-400">MRI Scanner</span>
                      <span className={cn('font-semibold', h.mriAvailable ? 'text-success-400' : 'text-critical-400')}>
                        {h.mriAvailable ? 'Operational' : 'Offline'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-ink-400">CT Scanner</span>
                      <span className={cn('font-semibold', h.ctAvailable ? 'text-success-400' : 'text-critical-400')}>
                        {h.ctAvailable ? 'Operational' : 'Offline'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-ink-400">Avg Wait Time</span>
                      <span className="font-semibold text-ink-200">{h.avgWaitTime} minutes</span>
                    </div>
                  </div>

                  {/* Recommendation Rating */}
                  <div className="bg-brand-500/10 border border-brand-500/20 p-2 rounded-lg text-[10px] text-brand-300 flex items-center justify-between">
                    <span>AI Operations Readiness:</span>
                    <strong className="font-mono text-xs">{h.healthScore >= 80 ? 'EXCELLENT' : h.healthScore >= 60 ? 'OPTIMAL' : 'CRITICAL'}</strong>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 border-t border-base-700/60 pt-2">
                    <button
                      onClick={() => handleRequestTransfer(h.id)}
                      className="flex-1 rounded bg-brand-500 hover:bg-brand-400 px-2 py-1 text-[10px] text-base-950 font-bold transition-all text-center"
                    >
                      Request Transfer
                    </button>
                    <button
                      onClick={() => window.open(`tel:${h.avgWaitTime}`)} // simulated contact
                      className="rounded bg-base-850 hover:bg-base-800 border border-base-700/60 px-2 py-1 text-[10px] text-ink-200 font-medium transition-all"
                    >
                      Call Desk
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Ambulance Markers */}
        {ambulances.map((a) => {
          if (a.status === 'offline') return null;
          return (
            <Marker
              key={a.id}
              position={[a.lat, a.lng]}
              icon={createAmbulanceIcon(a.status)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-2 w-48 space-y-1.5 font-sans text-xs">
                  <div className="flex justify-between items-center border-b border-base-700/60 pb-1.5">
                    <h5 className="font-bold text-ink-100">Ambulance {a.code}</h5>
                    <span className="text-[10px] text-brand-300 font-semibold">{a.type}</span>
                  </div>
                  <p className="text-[10px] text-ink-400">Driver: <strong className="text-ink-200">{a.driver}</strong></p>
                  <p className="text-[10px] text-ink-400">Status: <span className="font-semibold text-warning-400">{a.status.replace('_', ' ').toUpperCase()}</span></p>
                  <p className="text-[10px] text-ink-400">Speed: <strong className="text-ink-200">{a.speed} km/h</strong></p>
                  <p className="text-[10px] text-ink-400">Fuel: <strong className="text-ink-200">{Math.round(a.fuel)}%</strong></p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Emergency Incident Markers */}
        {emergencies.map((e) => {
          if (e.status === 'resolved') return null;
          return (
            <Marker
              key={e.id}
              position={[e.lat, e.lng]}
              icon={createIncidentIcon(e.severity)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-2 w-52 space-y-2 font-sans text-xs">
                  <div className="flex justify-between items-center border-b border-base-700/60 pb-1.5">
                    <h5 className="font-bold text-critical-400">{e.code}</h5>
                    <span className="text-[10px] font-semibold text-ink-400">{e.priority.toUpperCase()}</span>
                  </div>
                  <p className="text-ink-200 text-[11px] leading-relaxed">{e.complaint}</p>
                  <p className="text-[10px] text-ink-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Traffic Map Legend */}
      {interactive && (
        <div className="absolute bottom-3 left-3 bg-base-950/90 border border-base-700/60 p-2.5 rounded-lg z-[1000] text-[9px] text-ink-400 space-y-1.5 backdrop-blur-md">
          <p className="font-bold text-ink-300 uppercase tracking-widest text-[8px] mb-1">Telemetry Legend</p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#34d399]" />
            <span>Optimal Facility</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#fbbf24]" />
            <span>Resource Strain</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#fb7185]" />
            <span>Critical Load / Incident</span>
          </div>
          <div className="border-t border-base-800 pt-1.5 mt-1 space-y-1">
            <p className="font-bold text-[8px] uppercase tracking-wider text-ink-300">Live Traffic Delay</p>
            <div className="flex items-center gap-1">
              <span className="h-1 w-5 bg-[#34d399] inline-block rounded" />
              <span>Low (ETA -0m)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-1 w-5 bg-[#fbbf24] inline-block rounded" />
              <span>Mod (ETA +3m)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-1 w-5 bg-[#fb7185] inline-block rounded" />
              <span>High (ETA +8m)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const googleMapDarkStyles = [
  { elementType: 'geometry', stylers: [{ color: '#0b1122' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1122' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b9bb4' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#38bdf8' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#06b6d4' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#050a14' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#17223b' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#131c33' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#253f69' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1a2d4b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#030712' }] }
];

function GoogleMapRenderer({
  center,
  zoom,
  routingFrom,
  routingTo,
  apiKey,
}: {
  center: [number, number];
  zoom: number;
  routingFrom?: [number, number];
  routingTo?: [number, number];
  apiKey: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const { hospitals, ambulances, emergencies } = useDataStore();
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const existingScript = document.getElementById('google-maps-api-script');
    if (existingScript) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-maps-api-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (isMounted) setScriptLoaded(true);
    };
    document.head.appendChild(script);
    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  useEffect(() => {
    if (!scriptLoaded || !mapRef.current) return;
    const google = (window as any).google;
    if (!google || !google.maps) return;

    const mapOptions = {
      center: { lat: center[0], lng: center[1] },
      zoom: zoom,
      styles: googleMapDarkStyles,
      disableDefaultUI: true,
      zoomControl: true,
    };

    const gMap = new google.maps.Map(mapRef.current, mapOptions);

    hospitals.forEach((h) => {
      const marker = new google.maps.Marker({
        position: { lat: h.lat, lng: h.lng },
        map: gMap,
        title: h.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 1.5,
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #0c1324; font-family: sans-serif; font-size: 11px; padding: 4px;">
            <strong style="font-size: 12px; color: #1e3a8a;">${h.name}</strong><br/>
            <div style="margin-top: 4px;">
              <strong>Beds Available:</strong> ${h.icuAvailable}/${h.icuBeds}<br/>
              <strong>Wait Time:</strong> ${h.avgWaitTime} mins
            </div>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(gMap, marker);
      });
    });

    ambulances.forEach((a) => {
      new google.maps.Marker({
        position: { lat: a.lat, lng: a.lng },
        map: gMap,
        title: `Ambulance ${a.code}`,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 4.5,
          fillColor: a.status === 'en_route' ? '#f59e0b' : '#22c55e',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 1,
        },
      });
    });

    emergencies.forEach((e) => {
      if (e.status === 'resolved') return;
      new google.maps.Marker({
        position: { lat: e.lat, lng: e.lng },
        map: gMap,
        title: e.code,
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 4.5,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 1,
        },
      });
    });

    if (routingFrom && routingTo) {
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map: gMap,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#06b6d4',
          strokeOpacity: 0.85,
          strokeWeight: 5,
        },
      });

      directionsService.route(
        {
          origin: { lat: routingFrom[0], lng: routingFrom[1] },
          destination: { lat: routingTo[0], lng: routingTo[1] },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result: any, status: any) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.setDirections(result);
          }
        }
      );
    }
  }, [scriptLoaded, center, zoom, hospitals, ambulances, emergencies, routingFrom, routingTo]);

  return (
    <div className="w-full h-full relative rounded-xl border border-accent-500/20 shadow-glow overflow-hidden animate-fade-in" style={{ minHeight: '100%' }}>
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '280px' }} />
      <div className="absolute bottom-2 left-2 bg-base-950/85 backdrop-blur-md border border-base-750/70 px-2 py-0.5 rounded text-[8px] text-ink-300 z-10 font-mono">
        Google Maps SDK Connected
      </div>
    </div>
  );
}
