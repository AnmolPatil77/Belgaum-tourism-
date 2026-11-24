import type {
  BudgetTier,
  DayPlan,
  Destination,
  Stay,
  TripDuration,
  TripEstimate,
  TripFormInput,
} from '../types/belagavi';

export interface LatLngPoint {
  lat: number;
  lng: number;
  name?: string;
}

const EARTH_RADIUS_KM = 6371;
const ROAD_WINDING_FACTOR = 1.28; // Western Ghats / Belagavi road curvature adjustment
const AVERAGE_SPEED_KMPH = 46;

export const BELAGAVI_STATION_COORDS: LatLngPoint = {
  lat: 15.8497,
  lng: 74.4977,
  name: 'Belagavi City Center',
};

export function haversineDistanceKm(a: LatLngPoint, b: LatLngPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDriveTime(minutes: number): string {
  if (minutes <= 0) return '0 min';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs === 0) return `${mins} min`;
  if (mins === 0) return `${hrs} hr`;
  return `${hrs} hr ${mins} min`;
}

export function calculateRouteMetrics(points: LatLngPoint[]): {
  totalKm: number;
  estimatedMinutes: number;
  formattedTime: string;
} {
  if (points.length === 0) {
    return { totalKm: 0, estimatedMinutes: 0, formattedTime: '0 min' };
  }

  // If only 1 point is selected, calculate drive from Belagavi City Center to that point
  const sequence =
    points.length === 1 ? [BELAGAVI_STATION_COORDS, points[0]] : points;

  let straightKm = 0;
  for (let i = 0; i < sequence.length - 1; i++) {
    straightKm += haversineDistanceKm(sequence[i], sequence[i + 1]);
  }

  const roadKm = Math.round(straightKm * ROAD_WINDING_FACTOR * 10) / 10;
  const minutes = Math.max(10, Math.round((roadKm / AVERAGE_SPEED_KMPH) * 60));

  return {
    totalKm: roadKm,
    estimatedMinutes: minutes,
    formattedTime: formatDriveTime(minutes),
  };
}

export function getNightsForDuration(duration: TripDuration): number {
  switch (duration) {
    case '1 Day':
      return 0;
    case '2 Days / 1 Night':
      return 1;
    case '3 Days / 2 Nights':
      return 2;
  }
}

export function getRoomTypeMultiplier(roomType: string): number {
  if (roomType === 'No Stay Needed - Day Trip') return 0;
  if (roomType === 'Executive Suite') return 1.35;
  if (roomType === 'Family Cottage') return 1.25;
  return 1.0;
}

const DAILY_PER_ADULT_BUDGET: Record<BudgetTier, number> = {
  Budget: 1100,
  Standard: 1950,
  Premium: 3400,
};

export function buildDayByDayItinerary(
  duration: TripDuration,
  selectedDestinations: Destination[],
  selectedStay: Stay | undefined,
  bookmarkedCultureTitles: string[]
): DayPlan[] {
  const daysCount = duration === '1 Day' ? 1 : duration === '2 Days / 1 Night' ? 2 : 3;
  const destNames =
    selectedDestinations.length > 0
      ? selectedDestinations.map((d) => d.name)
      : ['Belagavi Fort & Kamal Basti', 'Gokak Falls'];

  const plans: DayPlan[] = [];
  const perDay = Math.max(1, Math.ceil(destNames.length / daysCount));

  for (let i = 0; i < daysCount; i++) {
    const slice = destNames.slice(i * perDay, (i + 1) * perDay);
    const stops =
      slice.length > 0
        ? slice
        : i === daysCount - 1
          ? ['Shahapur Handloom Market & Kunda Tasting']
          : ['Scenic Western Ghats Drive & Local Bazaar'];

    const cultureHighlight =
      bookmarkedCultureTitles[i] ||
      (i === 0
        ? 'Evening Belagavi Kunda tasting & heritage walk'
        : i === 1
          ? 'Jolada Roti & Enne Gai dinner experience'
          : 'Gokak wooden toys & Khanapur terracotta souvenir trail');

    const stayLine =
      selectedStay && i < daysCount - 1
        ? `Overnight at ${selectedStay.name}`
        : i === daysCount - 1
          ? 'Departure from Belagavi with local sweet boxes'
          : 'Flexible day-trip return to Belagavi city';

    plans.push({
      day: i + 1,
      title:
        i === 0
          ? 'Arrival & Heritage Circuit'
          : i === 1
            ? 'Waterfalls, Ghats & Local Culture'
            : 'Craft Trails & Scenic Departure',
      stops,
      eveningNote: `${cultureHighlight} · ${stayLine}`,
    });
  }

  return plans;
}

export function calculateTripEstimate(
  input: Pick<
    TripFormInput,
    | 'destinationIds'
    | 'stayId'
    | 'roomType'
    | 'rooms'
    | 'duration'
    | 'adults'
    | 'children'
    | 'budgetTier'
    | 'experiences'
  >,
  destinations: Destination[],
  stays: Stay[],
  bookmarkedCultureTitles: string[] = []
): TripEstimate {
  const selectedDestinations = destinations.filter((d) =>
    input.destinationIds.includes(d.id)
  );
  const selectedStay = stays.find((s) => s.id === input.stayId);

  const nights = getNightsForDuration(input.duration);
  const days = nights + 1;
  const roomMultiplier = getRoomTypeMultiplier(input.roomType);
  const effectiveRooms = Math.max(1, Math.min(10, Number(input.rooms) || 1));

  const stayCost =
    selectedStay && nights > 0 && roomMultiplier > 0
      ? Math.round(selectedStay.pricePerNight * roomMultiplier * effectiveRooms * nights)
      : 0;

  const adults = Math.max(1, Math.min(20, Number(input.adults) || 1));
  const children = Math.max(0, Math.min(15, Number(input.children) || 0));
  const perAdultDay = DAILY_PER_ADULT_BUDGET[input.budgetTier] ?? 1950;
  const experienceBonus = (input.experiences?.length || 0) * 350;

  const routePoints: LatLngPoint[] = [];
  if (selectedStay) {
    routePoints.push({
      lat: selectedStay.lat,
      lng: selectedStay.lng,
      name: selectedStay.name,
    });
  }
  for (const dest of selectedDestinations) {
    routePoints.push({ lat: dest.lat, lng: dest.lng, name: dest.name });
  }

  const routeMetrics = calculateRouteMetrics(routePoints);
  const transportEstimate = Math.round(routeMetrics.totalKm * 18);

  const sightseeingCost = Math.round(
    days * (adults * perAdultDay + children * perAdultDay * 0.5) +
      experienceBonus +
      transportEstimate
  );

  const totalCost = stayCost + sightseeingCost;
  const dayPlans = buildDayByDayItinerary(
    input.duration,
    selectedDestinations,
    selectedStay,
    bookmarkedCultureTitles
  );

  return {
    nights,
    stayCost,
    sightseeingCost,
    totalCost,
    totalRouteKm: routeMetrics.totalKm,
    estimatedDriveMinutes: routeMetrics.estimatedMinutes,
    formattedDriveTime: routeMetrics.formattedTime,
    dayPlans,
  };
}

export function isSafeImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (
    trimmed.startsWith('/src/assets/images/') ||
    trimmed.startsWith('/uploads/')
  ) {
    return !trimmed.includes('..');
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function validateTripForm(input: TripFormInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name (at least 2 characters).';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email || !emailRegex.test(input.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  const digits = (input.phone || '').replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) {
    errors.phone = 'Please enter a valid 10–15 digit phone number.';
  }

  if (!input.travelDate) {
    errors.travelDate = 'Please select your check-in or travel date.';
  }

  if (input.destinationIds.length === 0) {
    errors.destinationIds = 'Please select at least one Belagavi destination.';
  }

  if (input.adults < 1 || input.adults > 20) {
    errors.adults = 'Number of adults must be between 1 and 20.';
  }

  if (input.children < 0 || input.children > 15) {
    errors.children = 'Number of children must be between 0 and 15.';
  }

  return errors;
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
