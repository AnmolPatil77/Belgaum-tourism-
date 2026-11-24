import { useState } from 'react';
import { Check, Navigation, Plus } from 'lucide-react';
import type { Destination, DestinationCategory } from '../types/belagavi';
import type { Translations } from '../utils/i18n';
import { SafeImage } from './SafeImage';

interface DestinationsSectionProps {
  destinations: Destination[];
  selectedDestinationIds: string[];
  onToggleDestination: (id: string) => void;
  t: Translations;
}

const FILTER_TABS: ('All' | DestinationCategory)[] = [
  'All',
  'Forts & Heritage',
  'Waterfalls & Nature',
  'Spiritual & Landmarks',
];

export function DestinationsSection({
  destinations,
  selectedDestinationIds,
  onToggleDestination,
  t,
}: DestinationsSectionProps) {
  const [activeFilter, setActiveFilter] = useState<'All' | DestinationCategory>('All');

  const filtered =
    activeFilter === 'All'
      ? destinations
      : destinations.filter(
          (dest) =>
            dest.category === activeFilter || dest.tags.includes(activeFilter)
        );

  return (
    <section
      id="destinations"
      className="py-20 lg:py-24 border-b border-[#1B4332]/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header + Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.14em] uppercase text-[#1B4332]/75 mb-2">
              01. Curated Circuit
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1B4332] leading-tight">
              {t.sections.destinationsTitle}
            </h2>
            <p className="mt-3 text-[15px] text-[#1F2937]/75 leading-relaxed">
              {t.sections.destinationsSub}
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter Belagavi destinations by category"
            className="flex flex-wrap items-center gap-1.5 p-1 bg-[#1B4332]/6 rounded-xl self-start lg:self-auto"
          >
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3.5 py-2 text-xs sm:text-[13px] font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#1B4332] text-[#FAF9F6] shadow-xs'
                      : 'text-[#1F2937]/75 hover:text-[#1B4332]'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Destinations Grid */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-[#1B4332]/20 rounded-[14px]">
            <p className="text-sm text-[#1F2937]/70">
              No destinations matched this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filtered.map((dest) => {
              const isSelected = selectedDestinationIds.includes(dest.id);
              const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}`;

              return (
                <article
                  key={dest.id}
                  className="group bg-white rounded-[14px] overflow-hidden shadow-[0_8px_28px_-10px_rgba(27,67,50,0.12)] flex flex-col transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#E9E5DC]">
                    <SafeImage
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    {/* Unboxed editorial metadata */}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#1B4332]/75 mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
                      <span>{dest.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{dest.distanceKm} km</span>
                      <span aria-hidden="true">·</span>
                      <span>{dest.bestSeason}</span>
                    </div>

                    <h3 className="font-serif text-xl font-semibold text-[#1F2937] group-hover:text-[#1B4332] transition-colors">
                      {dest.name}
                    </h3>

                    <p className="mt-2.5 text-sm text-[#1F2937]/75 leading-relaxed flex-1">
                      {dest.description}
                    </p>

                    <p className="mt-3 pt-3 border-t border-[#1B4332]/10 text-xs text-[#1F2937]/60 tabular-nums">
                      GPS: {dest.lat.toFixed(4)}° N, {dest.lng.toFixed(4)}° E · Rated {dest.rating.toFixed(1)}/5
                    </p>

                    <div className="mt-5 flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => onToggleDestination(dest.id)}
                        aria-pressed={isSelected}
                        aria-label={
                          isSelected
                            ? `Remove ${dest.name} from trip`
                            : `Add ${dest.name} to trip`
                        }
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-[13px] font-semibold rounded-[10px] transition-colors whitespace-nowrap cursor-pointer ${
                          isSelected
                            ? 'bg-[#1B4332] text-[#FAF9F6] hover:bg-[#133124]'
                            : 'bg-[#D97706] text-white hover:bg-[#B45309]'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-4 h-4" aria-hidden="true" />
                            <span>Added to Trip</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" aria-hidden="true" />
                            <span>Add to Trip</span>
                          </>
                        )}
                      </button>

                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Get Google Maps directions to ${dest.name}`}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-[#1B4332] bg-[#FAF9F6] hover:bg-[#1B4332]/8 border border-[#1B4332]/20 rounded-[10px] transition-colors whitespace-nowrap shrink-0"
                      >
                        <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Get Directions</span>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
