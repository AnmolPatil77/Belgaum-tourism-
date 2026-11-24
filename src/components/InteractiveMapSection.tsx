import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { Clock, Compass, Route, Trash2 } from 'lucide-react';
import type { Destination, FoodSpot, Stay } from '../types/belagavi';
import type { Translations } from '../utils/i18n';
import { calculateRouteMetrics, formatINR } from '../utils/tripCalculator';

interface InteractiveMapSectionProps {
  destinations: Destination[];
  stays: Stay[];
  foodSpots: FoodSpot[];
  selectedDestinationIds: string[];
  selectedStayId: string;
  onToggleDestination: (id: string) => void;
  onSelectStay: (stayId: string) => void;
  onClearRoute: () => void;
  t: Translations;
}

const BELAGAVI_CENTER: [number, number] = [15.8497, 74.4977];

function createPinIcon(color: string, active: boolean): L.DivIcon {
  const size = active ? 32 : 26;
  const ring = active ? `box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.32);` : '';
  return L.divIcon({
    className: 'belagavi-map-pin',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:2.5px solid #FAF9F6;display:flex;align-items:center;justify-content:center;color:#FAF9F6;font-weight:700;font-size:11px;${ring}transition:transform 150ms ease;">
      <span style="width:7px;height:7px;border-radius:9999px;background:#FAF9F6;display:block;"></span>
    </div>`,
  });
}

function buildSafePopupElement(options: {
  title: string;
  meta: string;
  subtitle: string;
  image: string;
  actionLabel?: string;
  isActive?: boolean;
  onAction?: () => void;
}): HTMLElement {
  const root = document.createElement('div');
  root.style.background = '#FFFFFF';
  root.style.color = '#1F2937';

  const imgWrap = document.createElement('div');
  imgWrap.style.height = '120px';
  imgWrap.style.overflow = 'hidden';
  imgWrap.style.background = '#1B4332';

  const img = document.createElement('img');
  img.src = options.image;
  img.alt = options.title;
  img.referrerPolicy = 'no-referrer';
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'cover';
  imgWrap.appendChild(img);
  root.appendChild(imgWrap);

  const body = document.createElement('div');
  body.style.padding = '12px 14px';

  const metaEl = document.createElement('p');
  metaEl.textContent = options.meta;
  metaEl.style.fontSize = '11px';
  metaEl.style.fontWeight = '600';
  metaEl.style.color = '#1B4332';
  metaEl.style.margin = '0 0 4px 0';
  body.appendChild(metaEl);

  const titleEl = document.createElement('h4');
  titleEl.textContent = options.title;
  titleEl.style.fontFamily = '"Playfair Display", Georgia, serif';
  titleEl.style.fontSize = '15px';
  titleEl.style.fontWeight = '600';
  titleEl.style.margin = '0 0 4px 0';
  titleEl.style.color = '#1F2937';
  body.appendChild(titleEl);

  const subEl = document.createElement('p');
  subEl.textContent = options.subtitle;
  subEl.style.fontSize = '12px';
  subEl.style.color = '#4B5563';
  subEl.style.margin = '0 0 10px 0';
  subEl.style.lineHeight = '1.4';
  body.appendChild(subEl);

  if (options.actionLabel && options.onAction) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = options.actionLabel;
    btn.style.width = '100%';
    btn.style.padding = '8px 12px';
    btn.style.borderRadius = '8px';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.style.fontSize = '12px';
    btn.style.fontWeight = '600';
    btn.style.background = options.isActive ? '#1B4332' : '#D97706';
    btn.style.color = '#FFFFFF';
    btn.addEventListener('click', options.onAction);
    body.appendChild(btn);
  }

  root.appendChild(body);
  return root;
}

export function InteractiveMapSection({
  destinations,
  stays,
  foodSpots,
  selectedDestinationIds,
  selectedStayId,
  onToggleDestination,
  onSelectStay,
  onClearRoute,
  t,
}: InteractiveMapSectionProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const [showDestinations, setShowDestinations] = useState(true);
  const [showStays, setShowStays] = useState(true);
  const [showFoodSpots, setShowFoodSpots] = useState(true);

  // Keep latest callbacks in refs so map markers don't go stale
  const callbacksRef = useRef({ onToggleDestination, onSelectStay });
  callbacksRef.current = { onToggleDestination, onSelectStay };

  const routeStops = useMemo(() => {
    const stops: { id: string; name: string; kind: 'Stay' | 'Destination'; lat: number; lng: number }[] = [];
    const stay = stays.find((s) => s.id === selectedStayId);
    if (stay) {
      stops.push({ id: stay.id, name: stay.name, kind: 'Stay', lat: stay.lat, lng: stay.lng });
    }
    for (const id of selectedDestinationIds) {
      const dest = destinations.find((d) => d.id === id);
      if (dest) {
        stops.push({ id: dest.id, name: dest.name, kind: 'Destination', lat: dest.lat, lng: dest.lng });
      }
    }
    return stops;
  }, [destinations, stays, selectedDestinationIds, selectedStayId]);

  const routeMetrics = useMemo(() => calculateRouteMetrics(routeStops), [routeStops]);

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: BELAGAVI_CENTER,
      zoom: 10,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      routeLayerRef.current = null;
    };
  }, []);

  // Sync markers and live route polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !markersLayer || !routeLayer) return;

    markersLayer.clearLayers();
    routeLayer.clearLayers();

    if (showDestinations) {
      destinations.forEach((dest) => {
        const isAdded = selectedDestinationIds.includes(dest.id);
        const marker = L.marker([dest.lat, dest.lng], {
          icon: createPinIcon('#1B4332', isAdded),
          title: dest.name,
        });

        marker.bindPopup(() =>
          buildSafePopupElement({
            title: dest.name,
            meta: `${dest.category} · ${dest.rating.toFixed(1)}★ · ${dest.distanceKm} km`,
            subtitle: dest.highlights,
            image: dest.image,
            actionLabel: isAdded ? 'Remove from Route' : 'Add to Route',
            isActive: isAdded,
            onAction: () => {
              callbacksRef.current.onToggleDestination(dest.id);
              marker.closePopup();
            },
          })
        );
        marker.addTo(markersLayer);
      });
    }

    if (showStays) {
      stays.forEach((stay) => {
        const isSelected = selectedStayId === stay.id;
        const marker = L.marker([stay.lat, stay.lng], {
          icon: createPinIcon('#D97706', isSelected),
          title: stay.name,
        });

        marker.bindPopup(() =>
          buildSafePopupElement({
            title: stay.name,
            meta: `${stay.starRating}★ Stay · ${formatINR(stay.pricePerNight)}/night · ${stay.distanceKm} km`,
            subtitle: `${stay.area} · ${stay.amenities.slice(0, 3).join(' · ')}`,
            image: stay.image,
            actionLabel: isSelected ? 'Selected as Base Stay' : 'Add to Route as Stay',
            isActive: isSelected,
            onAction: () => {
              callbacksRef.current.onSelectStay(stay.id);
              marker.closePopup();
            },
          })
        );
        marker.addTo(markersLayer);
      });
    }

    if (showFoodSpots) {
      foodSpots.forEach((spot) => {
        const marker = L.marker([spot.lat, spot.lng], {
          icon: createPinIcon('#854D0E', false),
          title: spot.name,
        });

        marker.bindPopup(() =>
          buildSafePopupElement({
            title: spot.name,
            meta: `Local Food Spot · ${spot.rating.toFixed(1)}★ · ${spot.distanceKm} km`,
            subtitle: `${spot.specialty} (${spot.area})`,
            image: spot.image,
          })
        );
        marker.addTo(markersLayer);
      });
    }

    // Draw connecting route polyline whenever >= 2 stops are selected
    if (routeStops.length >= 2) {
      const latLngs: [number, number][] = routeStops.map((s) => [s.lat, s.lng]);
      L.polyline(latLngs, {
        color: '#D97706',
        weight: 4,
        opacity: 0.9,
        dashArray: '8 8',
      }).addTo(routeLayer);

      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
    } else if (routeStops.length === 1) {
      L.polyline([BELAGAVI_CENTER, [routeStops[0].lat, routeStops[0].lng]], {
        color: '#1B4332',
        weight: 3,
        opacity: 0.7,
        dashArray: '6 6',
      }).addTo(routeLayer);
    }
  }, [
    destinations,
    stays,
    foodSpots,
    showDestinations,
    showStays,
    showFoodSpots,
    selectedDestinationIds,
    selectedStayId,
    routeStops,
  ]);

  return (
    <section
      id="interactive-map"
      className="py-20 lg:py-24 bg-[#F3EFE6]/65 border-b border-[#1B4332]/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.14em] uppercase text-[#1B4332]/75 mb-2">
              02. Spatial Explorer
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1B4332] leading-tight">
              {t.sections.mapTitle}
            </h2>
            <p className="mt-3 text-[15px] text-[#1F2937]/75 leading-relaxed">
              {t.sections.mapSub}
            </p>
          </div>

          {/* Category Layer Toggles */}
          <div
            role="group"
            aria-label="Toggle map marker layers"
            className="flex flex-wrap items-center gap-2 self-start lg:self-auto"
          >
            <button
              type="button"
              onClick={() => setShowDestinations((v) => !v)}
              aria-pressed={showDestinations}
              className={`px-3.5 py-2 text-xs sm:text-[13px] font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                showDestinations
                  ? 'bg-[#1B4332] text-[#FAF9F6] border-[#1B4332]'
                  : 'bg-white text-[#1F2937]/70 border-[#1B4332]/20 hover:border-[#1B4332]'
              }`}
            >
              Destinations ({destinations.length})
            </button>
            <button
              type="button"
              onClick={() => setShowStays((v) => !v)}
              aria-pressed={showStays}
              className={`px-3.5 py-2 text-xs sm:text-[13px] font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                showStays
                  ? 'bg-[#D97706] text-white border-[#D97706]'
                  : 'bg-white text-[#1F2937]/70 border-[#1B4332]/20 hover:border-[#D97706]'
              }`}
            >
              Stays &amp; Hotels ({stays.length})
            </button>
            <button
              type="button"
              onClick={() => setShowFoodSpots((v) => !v)}
              aria-pressed={showFoodSpots}
              className={`px-3.5 py-2 text-xs sm:text-[13px] font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                showFoodSpots
                  ? 'bg-[#854D0E] text-white border-[#854D0E]'
                  : 'bg-white text-[#1F2937]/70 border-[#1B4332]/20 hover:border-[#854D0E]'
              }`}
            >
              Food Spots ({foodSpots.length})
            </button>
          </div>
        </div>

        {/* Map Canvas + Live Route Summary Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 bg-white rounded-[14px] overflow-hidden shadow-[0_8px_28px_-10px_rgba(27,67,50,0.12)] border border-[#1B4332]/10">
            <div
              ref={mapContainerRef}
              data-testid="belagavi-leaflet-map"
              aria-label="Interactive OpenStreetMap of Belagavi tourist destinations, stays, and food spots"
              className="w-full h-[420px] lg:h-[520px]"
            />
          </div>

          <aside className="lg:col-span-4 bg-white rounded-[14px] p-6 shadow-[0_8px_28px_-10px_rgba(27,67,50,0.12)] border border-[#1B4332]/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#1B4332]/10">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#1B4332]">
                    Live Route Visualizer
                  </h3>
                  <p className="text-xs text-[#1F2937]/65 mt-0.5">
                    Synced with Destinations, Stays &amp; Trip Planner
                  </p>
                </div>
                {routeStops.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearRoute}
                    aria-label="Clear all stops from route"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#1F2937]/70 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Distance & Travel Time Summary */}
              <div className="grid grid-cols-2 gap-4 py-5 border-b border-[#1B4332]/10">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-[#1F2937]/65 mb-1">
                    <Route className="w-3.5 h-3.5 text-[#1B4332]" aria-hidden="true" />
                    <span>Driving Distance</span>
                  </div>
                  <p
                    data-testid="route-distance-km"
                    className="font-serif text-2xl font-semibold text-[#1B4332] tabular-nums"
                  >
                    {routeMetrics.totalKm} km
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-[#1F2937]/65 mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#D97706]" aria-hidden="true" />
                    <span>Est. Travel Time</span>
                  </div>
                  <p
                    data-testid="route-travel-time"
                    className="font-serif text-2xl font-semibold text-[#1F2937] tabular-nums"
                  >
                    {routeMetrics.formattedTime}
                  </p>
                </div>
              </div>

              {/* Ordered Stops List */}
              <div className="py-5">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#1F2937]/60 mb-3">
                  Active Route Stops ({routeStops.length})
                </p>

                {routeStops.length === 0 ? (
                  <div className="py-8 text-center">
                    <Compass className="w-7 h-7 text-[#1B4332]/35 mx-auto mb-2" aria-hidden="true" />
                    <p className="text-sm text-[#1F2937]/70 leading-relaxed">
                      Click any map marker or select destinations above to chart a connecting driving route across Belagavi.
                    </p>
                  </div>
                ) : (
                  <ol className="space-y-3 max-h-[210px] overflow-y-auto pr-1">
                    {routeStops.map((stop, idx) => (
                      <li
                        key={`${stop.kind}-${stop.id}`}
                        className="flex items-start justify-between gap-2 text-sm pb-2.5 border-b border-[#1B4332]/8 last:border-b-0"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#1B4332]/10 text-[#1B4332] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-medium text-[#1F2937] leading-snug">
                              {stop.name}
                            </p>
                            <p className="text-xs text-[#1F2937]/60 tabular-nums">
                              {stop.kind} · {stop.lat.toFixed(3)}° N, {stop.lng.toFixed(3)}° E
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#1B4332]/10">
              <div className="flex items-center justify-between text-xs text-[#1F2937]/65 mb-3">
                <span>Legend: Forest = Sight · Saffron = Stay · Ochre = Food</span>
              </div>
              <a
                href="#plan-trip"
                className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-[#D97706] hover:bg-[#B45309] rounded-[10px] transition-colors"
              >
                Continue to Trip Planner
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
