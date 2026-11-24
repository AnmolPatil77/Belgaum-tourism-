import { useState } from 'react';
import { BedDouble, Check, Star } from 'lucide-react';
import type { Stay, StayCategory } from '../types/belagavi';
import type { Translations } from '../utils/i18n';
import { formatINR } from '../utils/tripCalculator';
import { SafeImage } from './SafeImage';

interface StaysSectionProps {
  stays: Stay[];
  selectedStayId: string;
  onSelectStay: (stay: Stay) => void;
  t: Translations;
}

const STAY_FILTERS: ('All Stays' | StayCategory)[] = [
  'All Stays',
  'Luxury & Business Hotels',
  'Heritage & Boutique Stays',
  'Nature & Forest Resorts',
];

export function StaysSection({
  stays,
  selectedStayId,
  onSelectStay,
  t,
}: StaysSectionProps) {
  const [activeFilter, setActiveFilter] = useState<'All Stays' | StayCategory>(
    'All Stays'
  );

  const filtered =
    activeFilter === 'All Stays'
      ? stays
      : stays.filter((s) => s.category === activeFilter);

  return (
    <section
      id="stays"
      className="py-20 lg:py-24 border-b border-[#1B4332]/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.14em] uppercase text-[#1B4332]/75 mb-2">
              03. Hospitality &amp; Retreats
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1B4332] leading-tight">
              {t.sections.staysTitle}
            </h2>
            <p className="mt-3 text-[15px] text-[#1F2937]/75 leading-relaxed">
              {t.sections.staysSub}
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter Belagavi stays by category"
            className="flex flex-wrap items-center gap-1.5 p-1 bg-[#1B4332]/6 rounded-xl self-start lg:self-auto"
          >
            {STAY_FILTERS.map((tab) => {
              const active = activeFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3.5 py-2 text-xs sm:text-[13px] font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map((stay) => {
            const isSelected = selectedStayId === stay.id;

            return (
              <article
                key={stay.id}
                className={`group bg-white rounded-[14px] overflow-hidden shadow-[0_8px_28px_-10px_rgba(27,67,50,0.12)] flex flex-col transition-all duration-200 hover:-translate-y-0.5 ${
                  isSelected ? 'ring-2 ring-[#1B4332]' : ''
                }`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#E9E5DC]">
                  <SafeImage
                    src={stay.image}
                    alt={`${stay.name} room and property view`}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>

                <div className="p-6 flex flex-col flex-1">
                  {/* Unboxed editorial metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-[#1B4332]/75 mb-2">
                    <span>{stay.category}</span>
                    <span className="inline-flex items-center gap-1 text-[#1F2937] tabular-nums">
                      <Star
                        className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]"
                        aria-hidden="true"
                      />
                      <span>
                        {stay.rating.toFixed(1)} · {stay.starRating}-Star
                      </span>
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-semibold text-[#1F2937] group-hover:text-[#1B4332] transition-colors">
                    {stay.name}
                  </h3>

                  <p className="text-xs text-[#1F2937]/60 mt-1">
                    {stay.area} · {stay.distanceKm} km from Belagavi Station
                  </p>

                  <p className="mt-3 text-sm text-[#1F2937]/75 leading-relaxed flex-1">
                    {stay.description}
                  </p>

                  {/* Rooms & Amenities cleanly separated by hairline divider */}
                  <div className="mt-4 pt-3.5 border-t border-[#1B4332]/10 space-y-2 text-xs text-[#1F2937]/70">
                    <p className="flex items-start gap-1.5">
                      <BedDouble
                        className="w-3.5 h-3.5 text-[#1B4332] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>Rooms: {stay.roomTypes.join(' · ')}</span>
                    </p>
                    <p className="text-[#1F2937]/65">
                      {stay.amenities.join(' · ')}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#1B4332]/10 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-serif text-xl font-semibold text-[#1B4332] tabular-nums">
                        {formatINR(stay.pricePerNight)}
                      </p>
                      <p className="text-[11px] text-[#1F2937]/60">per night</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectStay(stay)}
                      aria-pressed={isSelected}
                      aria-label={
                        isSelected
                          ? `${stay.name} selected for trip`
                          : `Select ${stay.name} for your Belagavi trip`
                      }
                      className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-[13px] font-semibold rounded-[10px] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-[#1B4332] text-[#FAF9F6] hover:bg-[#133124]'
                          : 'bg-[#D97706] text-white hover:bg-[#B45309]'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4" aria-hidden="true" />
                          <span>Stay Selected</span>
                        </>
                      ) : (
                        <span>Select Stay</span>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
