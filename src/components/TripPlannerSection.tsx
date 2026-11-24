import { useMemo, useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  Clock,
  Download,
  Printer,
  Route,
  X,
} from 'lucide-react';
import type {
  BudgetTier,
  CultureItem,
  Destination,
  Stay,
  TripDuration,
  TripEstimate,
  TripFormInput,
  TripRequest,
} from '../types/belagavi';
import type { Translations } from '../utils/i18n';
import {
  calculateTripEstimate,
  formatINR,
  validateTripForm,
} from '../utils/tripCalculator';

interface TripPlannerSectionProps {
  destinations: Destination[];
  stays: Stay[];
  cultureItems: CultureItem[];
  form: TripFormInput;
  onChangeForm: (updater: (prev: TripFormInput) => TripFormInput) => void;
  onTripCreated: (trip: TripRequest) => void;
  t: Translations;
}

const EXPERIENCE_OPTIONS = [
  'Local Food Trail',
  'Heritage & Fort Walk',
  'Art & Handicraft Shopping',
  'Nature & Waterfall Trek',
];

const ROOM_TYPES = [
  'Standard / Deluxe Room',
  'Executive Suite',
  'Family Cottage',
  'No Stay Needed - Day Trip',
];

const DURATIONS: TripDuration[] = [
  '1 Day',
  '2 Days / 1 Night',
  '3 Days / 2 Nights',
];

const BUDGET_TIERS: BudgetTier[] = ['Budget', 'Standard', 'Premium'];

export function TripPlannerSection({
  destinations,
  stays,
  cultureItems,
  form,
  onChangeForm,
  onTripCreated,
  t,
}: TripPlannerSectionProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    trip: TripRequest;
    estimate: TripEstimate;
  } | null>(null);

  const bookmarkedCultureItems = useMemo(
    () => cultureItems.filter((c) => form.bookmarkedCultureIds.includes(c.id)),
    [cultureItems, form.bookmarkedCultureIds]
  );

  const estimate = useMemo(
    () =>
      calculateTripEstimate(
        form,
        destinations,
        stays,
        bookmarkedCultureItems.map((c) => c.title)
      ),
    [form, destinations, stays, bookmarkedCultureItems]
  );

  const toggleDestination = (id: string) => {
    onChangeForm((prev) => ({
      ...prev,
      destinationIds: prev.destinationIds.includes(id)
        ? prev.destinationIds.filter((x) => x !== id)
        : [...prev.destinationIds, id],
    }));
  };

  const toggleExperience = (exp: string) => {
    onChangeForm((prev) => ({
      ...prev,
      experiences: prev.experiences.includes(exp)
        ? prev.experiences.filter((x) => x !== exp)
        : [...prev.experiences, exp],
    }));
  };

  const removeBookmark = (id: string) => {
    onChangeForm((prev) => ({
      ...prev,
      bookmarkedCultureIds: prev.bookmarkedCultureIds.filter((x) => x !== id),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const validation = validateTripForm(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        setSubmitError(data.error || 'Could not submit your trip request.');
        return;
      }

      onTripCreated(data.trip);
      setConfirmedBooking({ trip: data.trip, estimate: data.estimate });
      setErrors({});
    } catch {
      setSubmitError('Unable to reach server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPass = () => {
    if (!confirmedBooking) return;
    const { trip, estimate: est } = confirmedBooking;
    const lines = [
      'BELAGAVI HERITAGE & STAYS — OFFICIAL TRIP PASS',
      '==================================================',
      `Booking Reference : ${trip.bookingId}`,
      `Status            : ${trip.status}`,
      `Traveler          : ${trip.fullName} (${trip.email} | ${trip.phone})`,
      `Check-in Date     : ${trip.travelDate}`,
      `Duration          : ${trip.duration}`,
      `Party             : ${trip.adults} Adults, ${trip.children} Children`,
      `Budget Tier       : ${trip.budgetTier}`,
      '',
      'SELECTED STAY & ROOMS',
      `Property          : ${trip.stayName}`,
      `Room Type         : ${trip.roomType} (${trip.rooms} room${trip.rooms > 1 ? 's' : ''})`,
      '',
      'DESTINATIONS',
      ...trip.destinationNames.map((n, i) => `  ${i + 1}. ${n}`),
      '',
      'ROUTE & ESTIMATE',
      `Driving Distance  : ${trip.routeDistanceKm} km (${trip.estimatedDriveTime})`,
      `Estimated Budget  : ${formatINR(trip.estimatedBudget)}`,
      '',
      'DAY-BY-DAY SUGGESTED ITINERARY',
      ...est.dayPlans.map(
        (d) => `  Day ${d.day} (${d.title}): ${d.stops.join(', ')} | ${d.eveningNote}`
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trip.bookingId}-Belagavi-Trip-Pass.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="plan-trip"
      className="py-20 lg:py-24 bg-[#F3EFE6]/65"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-medium tracking-[0.14em] uppercase text-[#1B4332]/75 mb-2">
            07. Custom Dossier &amp; Reservation
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1B4332] leading-tight">
            {t.sections.plannerTitle}
          </h2>
          <p className="mt-3 text-[15px] text-[#1F2937]/75 leading-relaxed">
            {t.sections.plannerSub}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 4-Step Planning Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="lg:col-span-8 bg-white rounded-[14px] p-6 sm:p-8 shadow-[0_8px_28px_-10px_rgba(27,67,50,0.12)] border border-[#1B4332]/10 space-y-10"
          >
            {submitError && (
              <div
                role="alert"
                className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 font-medium"
              >
                {submitError}
              </div>
            )}

            {/* Step 1: Select Destinations */}
            <fieldset>
              <legend className="font-serif text-xl font-semibold text-[#1B4332] mb-1">
                Step 1. Select Belagavi Destinations
              </legend>
              <p className="text-xs text-[#1F2937]/65 mb-4">
                Synced automatically with the Destinations grid and Interactive Map.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {destinations.map((dest) => {
                  const checked = form.destinationIds.includes(dest.id);
                  return (
                    <label
                      key={dest.id}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors cursor-pointer ${
                        checked
                          ? 'bg-[#1B4332]/6 border-[#1B4332]'
                          : 'bg-[#FAF9F6]/60 border-[#1B4332]/15 hover:border-[#1B4332]/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDestination(dest.id)}
                        className="mt-1 accent-[#1B4332] w-4 h-4 shrink-0"
                      />
                      <span className="text-sm">
                        <span className="font-semibold text-[#1F2937] block">
                          {dest.name}
                        </span>
                        <span className="text-xs text-[#1F2937]/65">
                          {dest.category} · {dest.distanceKm} km
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.destinationIds && (
                <p className="mt-2 text-xs font-medium text-red-700">
                  {errors.destinationIds}
                </p>
              )}
            </fieldset>

            {/* Step 2: Choose Stay & Room Type */}
            <fieldset className="pt-8 border-t border-[#1B4332]/10">
              <legend className="font-serif text-xl font-semibold text-[#1B4332] mb-1">
                Step 2. Choose Stay &amp; Room Type
              </legend>
              <p className="text-xs text-[#1F2937]/65 mb-4">
                Select one of Belagavi’s curated hotels or homestays, or opt for a Day Trip.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="trip-stay"
                    className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                  >
                    Belagavi Hotel / Homestay
                  </label>
                  <select
                    id="trip-stay"
                    value={form.stayId}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      const found = stays.find((s) => s.id === nextId);
                      onChangeForm((prev) => ({
                        ...prev,
                        stayId: nextId,
                        roomType: found
                          ? found.defaultRoomType
                          : 'No Stay Needed - Day Trip',
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#1B4332]/20 rounded-lg focus:outline-2 focus:outline-[#1B4332]"
                  >
                    <option value="">No Stay Needed — Day Trip Only</option>
                    {stays.map((stay) => (
                      <option key={stay.id} value={stay.id}>
                        {stay.name} ({formatINR(stay.pricePerNight)}/night)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="trip-room-type"
                    className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                  >
                    Room Type
                  </label>
                  <select
                    id="trip-room-type"
                    value={form.roomType}
                    onChange={(e) =>
                      onChangeForm((prev) => ({
                        ...prev,
                        roomType: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#1B4332]/20 rounded-lg focus:outline-2 focus:outline-[#1B4332]"
                  >
                    {ROOM_TYPES.map((rt) => (
                      <option key={rt} value={rt}>
                        {rt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="trip-rooms"
                    className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                  >
                    Number of Rooms
                  </label>
                  <input
                    id="trip-rooms"
                    type="number"
                    min={1}
                    max={10}
                    value={form.rooms}
                    disabled={
                      !form.stayId ||
                      form.roomType === 'No Stay Needed - Day Trip'
                    }
                    onChange={(e) =>
                      onChangeForm((prev) => ({
                        ...prev,
                        rooms: Math.max(1, Math.min(10, Number(e.target.value) || 1)),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#1B4332]/20 rounded-lg disabled:opacity-50 tabular-nums focus:outline-2 focus:outline-[#1B4332]"
                  />
                </div>
              </div>
            </fieldset>

            {/* Step 3: Cultural & Food Experiences */}
            <fieldset className="pt-8 border-t border-[#1B4332]/10">
              <legend className="font-serif text-xl font-semibold text-[#1B4332] mb-1">
                Step 3. Cultural &amp; Food Experiences
              </legend>
              <p className="text-xs text-[#1F2937]/65 mb-4">
                Add curated local trails alongside items bookmarked from Food &amp; Culture.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXPERIENCE_OPTIONS.map((exp) => {
                  const checked = form.experiences.includes(exp);
                  return (
                    <label
                      key={exp}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors cursor-pointer ${
                        checked
                          ? 'bg-[#1B4332]/6 border-[#1B4332]'
                          : 'bg-[#FAF9F6]/60 border-[#1B4332]/15 hover:border-[#1B4332]/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleExperience(exp)}
                        className="accent-[#1B4332] w-4 h-4 shrink-0"
                      />
                      <span className="text-sm font-medium text-[#1F2937]">
                        {exp}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Auto-populated Bookmarks */}
              <div className="mt-5 pt-4 border-t border-[#1B4332]/8">
                <p className="text-xs font-semibold text-[#1B4332] mb-2">
                  Bookmarked from Food, Art &amp; Culture ({bookmarkedCultureItems.length})
                </p>
                {bookmarkedCultureItems.length === 0 ? (
                  <p className="text-xs text-[#1F2937]/60">
                    No cultural items bookmarked yet. Click “Save to Trip” in the Food &amp; Culture section to include Kunda, Karadant, crafts, or festivals.
                  </p>
                ) : (
                  <ul className="divide-y divide-[#1B4332]/10 border border-[#1B4332]/12 rounded-xl px-4 bg-[#FAF9F6]/70">
                    {bookmarkedCultureItems.map((item) => (
                      <li
                        key={item.id}
                        className="py-2.5 flex items-center justify-between gap-3 text-sm"
                      >
                        <span>
                          <span className="font-medium text-[#1F2937]">
                            {item.title}
                          </span>{' '}
                          <span className="text-xs text-[#1F2937]/60">
                            · {item.metaSecondary}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeBookmark(item.id)}
                          aria-label={`Remove ${item.title} from trip bookmarks`}
                          className="text-xs text-[#1F2937]/60 hover:text-red-700 cursor-pointer"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </fieldset>

            {/* Step 4: Visitor & Travel Details */}
            <fieldset className="pt-8 border-t border-[#1B4332]/10">
              <legend className="font-serif text-xl font-semibold text-[#1B4332] mb-4">
                Step 4. Visitor &amp; Travel Details
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="trip-fullname"
                    className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                  >
                    Full Name *
                  </label>
                  <input
                    id="trip-fullname"
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) =>
                      onChangeForm((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    placeholder="e.g. Vikram Deshmukh"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#1B4332]/20 rounded-lg focus:outline-2 focus:outline-[#1B4332]"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-700">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="trip-email"
                    className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                  >
                    Email Address *
                  </label>
                  <input
                    id="trip-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      onChangeForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="vikram@example.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#1B4332]/20 rounded-lg focus:outline-2 focus:outline-[#1B4332]"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-700">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="trip-phone"
                    className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                  >
                    Phone Number *
                  </label>
                  <input
                    id="trip-phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) =>
                      onChangeForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="+91 98450 12345"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#1B4332]/20 rounded-lg focus:outline-2 focus:outline-[#1B4332]"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-700">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="trip-date"
                    className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                  >
                    Check-in / Travel Date *
                  </label>
                  <input
                    id="trip-date"
                    type="date"
                    required
                    value={form.travelDate}
                    onChange={(e) =>
                      onChangeForm((prev) => ({ ...prev, travelDate: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#1B4332]/20 rounded-lg focus:outline-2 focus:outline-[#1B4332]"
                  />
                  {errors.travelDate && (
                    <p className="mt-1 text-xs text-red-700">{errors.travelDate}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="trip-duration"
                    className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                  >
                    Duration
                  </label>
                  <select
                    id="trip-duration"
                    value={form.duration}
                    onChange={(e) =>
                      onChangeForm((prev) => ({
                        ...prev,
                        duration: e.target.value as TripDuration,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#1B4332]/20 rounded-lg focus:outline-2 focus:outline-[#1B4332]"
                  >
                    {DURATIONS.map((dur) => (
                      <option key={dur} value={dur}>
                        {dur}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="trip-budget"
                    className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                  >
                    Budget Tier
                  </label>
                  <select
                    id="trip-budget"
                    value={form.budgetTier}
                    onChange={(e) =>
                      onChangeForm((prev) => ({
                        ...prev,
                        budgetTier: e.target.value as BudgetTier,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#1B4332]/20 rounded-lg focus:outline-2 focus:outline-[#1B4332]"
                  >
                    {BUDGET_TIERS.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="trip-adults"
                    className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                  >
                    Adults
                  </label>
                  <input
                    id="trip-adults"
                    type="number"
                    min={1}
                    max={20}
                    value={form.adults}
                    onChange={(e) =>
                      onChangeForm((prev) => ({
                        ...prev,
                        adults: Math.max(1, Math.min(20, Number(e.target.value) || 1)),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#1B4332]/20 rounded-lg tabular-nums focus:outline-2 focus:outline-[#1B4332]"
                  />
                  {errors.adults && (
                    <p className="mt-1 text-xs text-red-700">{errors.adults}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="trip-children"
                    className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                  >
                    Children
                  </label>
                  <input
                    id="trip-children"
                    type="number"
                    min={0}
                    max={15}
                    value={form.children}
                    onChange={(e) =>
                      onChangeForm((prev) => ({
                        ...prev,
                        children: Math.max(0, Math.min(15, Number(e.target.value) || 0)),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#1B4332]/20 rounded-lg tabular-nums focus:outline-2 focus:outline-[#1B4332]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="trip-notes"
                    className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                  >
                    Special Requests or Notes
                  </label>
                  <textarea
                    id="trip-notes"
                    rows={3}
                    value={form.notes}
                    onChange={(e) =>
                      onChangeForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="Dietary preferences, airport/railway pickup, guided photography requests..."
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#1B4332]/20 rounded-lg focus:outline-2 focus:outline-[#1B4332]"
                  />
                </div>
              </div>
            </fieldset>

            <div className="pt-4 border-t border-[#1B4332]/10 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-[#1F2937]/65">
                Instant Booking Reference (BGM-2026-XXXX) &amp; Printable Trip Pass generated upon submission.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="px-7 py-3.5 text-sm font-semibold text-white bg-[#D97706] hover:bg-[#B45309] disabled:opacity-60 rounded-[10px] shadow-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                {submitting ? 'Generating Trip Pass...' : 'Confirm & Generate Trip Pass'}
              </button>
            </div>
          </form>

          {/* Live Cost & Itinerary Estimator Sidebar */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 bg-[#1B4332] text-[#FAF9F6] rounded-[14px] p-6 sm:p-7 shadow-[0_12px_32px_-10px_rgba(27,67,50,0.28)]">
            <p className="text-xs font-medium tracking-[0.14em] uppercase text-[#FAF9F6]/70 mb-1">
              Live Estimator
            </p>
            <h3 className="font-serif text-2xl font-semibold text-[#FAF9F6]">
              Budget &amp; Day Plan
            </h3>

            {/* Cost Breakdown */}
            <dl className="mt-6 space-y-3 text-sm border-b border-[#FAF9F6]/15 pb-5">
              <div className="flex items-center justify-between">
                <dt className="text-[#FAF9F6]/80">
                  Stay ({estimate.nights} night{estimate.nights === 1 ? '' : 's'}, {form.rooms} rm)
                </dt>
                <dd className="font-semibold tabular-nums">
                  {formatINR(estimate.stayCost)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[#FAF9F6]/80">
                  Sightseeing, Dining &amp; Cab ({form.budgetTier})
                </dt>
                <dd className="font-semibold tabular-nums">
                  {formatINR(estimate.sightseeingCost)}
                </dd>
              </div>
              <div className="pt-3 border-t border-[#FAF9F6]/15 flex items-baseline justify-between">
                <dt className="font-serif text-base font-medium">
                  Estimated Total
                </dt>
                <dd
                  data-testid="live-total-budget"
                  className="font-serif text-3xl font-semibold text-[#FBBF24] tabular-nums"
                >
                  {formatINR(estimate.totalCost)}
                </dd>
              </div>
            </dl>

            {/* Route Summary */}
            <div className="py-4 border-b border-[#FAF9F6]/15 flex items-center justify-between text-xs text-[#FAF9F6]/85 tabular-nums">
              <span className="inline-flex items-center gap-1.5">
                <Route className="w-4 h-4 text-[#FBBF24]" aria-hidden="true" />
                <span>Route: {estimate.totalRouteKm} km</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#FBBF24]" aria-hidden="true" />
                <span>{estimate.formattedDriveTime}</span>
              </span>
            </div>

            {/* Day-by-Day Suggested Itinerary */}
            <div className="mt-5">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#FAF9F6]/70 mb-3">
                Suggested Day-by-Day Plan
              </p>
              <ol className="space-y-4">
                {estimate.dayPlans.map((day) => (
                  <li
                    key={day.day}
                    className="pb-3.5 border-b border-[#FAF9F6]/12 last:border-b-0 last:pb-0"
                  >
                    <p className="text-xs font-semibold text-[#FBBF24]">
                      Day {day.day} — {day.title}
                    </p>
                    <p className="text-sm text-[#FAF9F6] font-medium mt-1">
                      {day.stops.join(' → ')}
                    </p>
                    <p className="text-xs text-[#FAF9F6]/75 mt-1 leading-relaxed">
                      {day.eveningNote}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </div>

      {/* Confirmation Modal & Printable Trip Pass */}
      {confirmedBooking && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Belagavi Trip Pass Confirmation"
          className="fixed inset-0 z-50 bg-[#0D2118]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setConfirmedBooking(null)}
        >
          <div
            id="printable-trip-pass"
            className="w-full max-w-2xl bg-[#FAF9F6] rounded-[14px] p-6 sm:p-8 shadow-2xl border border-[#1B4332]/20 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#1B4332]/15">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className="w-7 h-7 text-[#1B4332] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#1B4332]/75">
                    Belagavi Heritage &amp; Stays · Official Trip Pass
                  </p>
                  <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1B4332] mt-1">
                    Booking Confirmed
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmedBooking(null)}
                aria-label="Close trip pass confirmation"
                className="no-print w-9 h-9 rounded-lg hover:bg-[#1B4332]/10 flex items-center justify-center text-[#1F2937] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 p-4 rounded-xl bg-[#1B4332] text-[#FAF9F6] flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[#FAF9F6]/75">Booking Reference ID</p>
                <p
                  data-testid="confirmed-booking-id"
                  className="font-mono text-2xl font-bold tracking-wider text-[#FBBF24] tabular-nums"
                >
                  {confirmedBooking.trip.bookingId}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#FAF9F6]/75">Estimated Total</p>
                <p className="font-serif text-2xl font-semibold tabular-nums">
                  {formatINR(confirmedBooking.trip.estimatedBudget)}
                </p>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-b border-[#1B4332]/12 pb-5">
              <div>
                <dt className="text-xs text-[#1F2937]/60">Traveler</dt>
                <dd className="font-semibold text-[#1F2937] mt-0.5">
                  {confirmedBooking.trip.fullName}
                </dd>
                <dd className="text-xs text-[#1F2937]/70">
                  {confirmedBooking.trip.email} · {confirmedBooking.trip.phone}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#1F2937]/60">Schedule &amp; Party</dt>
                <dd className="font-semibold text-[#1F2937] mt-0.5">
                  {confirmedBooking.trip.travelDate} · {confirmedBooking.trip.duration}
                </dd>
                <dd className="text-xs text-[#1F2937]/70">
                  {confirmedBooking.trip.adults} Adults, {confirmedBooking.trip.children} Children · {confirmedBooking.trip.budgetTier} Tier
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#1F2937]/60">Stay &amp; Rooms</dt>
                <dd className="font-semibold text-[#1F2937] mt-0.5">
                  {confirmedBooking.trip.stayName}
                </dd>
                <dd className="text-xs text-[#1F2937]/70">
                  {confirmedBooking.trip.roomType} ({confirmedBooking.trip.rooms} room{confirmedBooking.trip.rooms > 1 ? 's' : ''})
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#1F2937]/60">Planned Route</dt>
                <dd className="font-semibold text-[#1F2937] mt-0.5 tabular-nums">
                  {confirmedBooking.trip.routeDistanceKm} km · {confirmedBooking.trip.estimatedDriveTime}
                </dd>
                <dd className="text-xs text-[#1F2937]/70">
                  {confirmedBooking.trip.destinationNames.join(', ')}
                </dd>
              </div>
            </dl>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1B4332] mb-2.5">
                Day-by-Day Itinerary Summary
              </p>
              <ol className="space-y-2 text-xs sm:text-sm text-[#1F2937]/85">
                {confirmedBooking.estimate.dayPlans.map((d) => (
                  <li key={d.day}>
                    <span className="font-semibold text-[#1B4332]">Day {d.day}:</span>{' '}
                    {d.stops.join(' → ')} — <span className="text-[#1F2937]/70">{d.eveningNote}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="no-print mt-7 pt-5 border-t border-[#1B4332]/12 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleDownloadPass}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#1B4332] bg-white hover:bg-[#1B4332]/6 border border-[#1B4332]/25 rounded-[10px] transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>Download Trip Pass</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#D97706] hover:bg-[#B45309] rounded-[10px] transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" aria-hidden="true" />
                <span>Print Trip Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
