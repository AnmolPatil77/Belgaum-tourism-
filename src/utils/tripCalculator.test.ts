import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRouteMetrics,
  calculateTripEstimate,
  formatDriveTime,
  haversineDistanceKm,
  isSafeImageUrl,
  validateTripForm,
} from './tripCalculator';
import type { Destination, Stay, TripFormInput } from '../types/belagavi';

const sampleDestinations: Destination[] = [
  {
    id: 'gokak-falls',
    name: 'Gokak Falls',
    category: 'Waterfalls & Nature',
    tags: ['Waterfalls & Nature'],
    lat: 16.1916,
    lng: 74.7775,
    distanceKm: 60,
    bestSeason: 'Jul–Nov',
    rating: 4.8,
    image: '/src/assets/images/hero_gokak_falls_1795491751252.jpg',
    description: 'Niagara of Karnataka',
    highlights: 'Suspension bridge',
  },
  {
    id: 'belagavi-fort',
    name: 'Belagavi Fort & Kamal Basti',
    category: 'Forts & Heritage',
    tags: ['Forts & Heritage', 'Spiritual & Landmarks'],
    lat: 15.8594,
    lng: 74.5218,
    distanceKm: 4,
    bestSeason: 'Oct–Mar',
    rating: 4.6,
    image: '/src/assets/images/dest_belagavi_fort_1795491723430.jpg',
    description: '12th-century Ratta dynasty fort',
    highlights: 'Kamal Basti',
  },
];

const sampleStays: Stay[] = [
  {
    id: 'welcomhotel-kakati',
    name: 'Welcomhotel by ITC Hotels, Kakati',
    category: 'Luxury & Business Hotels',
    area: 'Kakati Hills',
    lat: 15.9321,
    lng: 74.5205,
    distanceKm: 11,
    rating: 4.8,
    starRating: 5,
    pricePerNight: 6500,
    roomTypes: ['Deluxe Room', 'Executive Suite'],
    defaultRoomType: 'Executive Suite',
    amenities: ['Free Wi-Fi', 'Pool'],
    image: '/src/assets/images/stay_luxury_suite_1795491721427.jpg',
    description: 'Upscale 5-star hotel',
  },
];

test('haversineDistanceKm calculates Belagavi Fort to Gokak Falls accurately', () => {
  const straight = haversineDistanceKm(
    { lat: 15.8594, lng: 74.5218 },
    { lat: 16.1916, lng: 74.7775 }
  );
  assert.ok(straight > 42 && straight < 52, `Expected ~46km, got ${straight}`);
});

test('calculateRouteMetrics computes road distance and formatted time across stops', () => {
  const metrics = calculateRouteMetrics([
    { lat: 15.8594, lng: 74.5218 },
    { lat: 16.1916, lng: 74.7775 },
  ]);
  assert.ok(metrics.totalKm >= 55 && metrics.totalKm <= 65);
  assert.ok(metrics.estimatedMinutes >= 60);
  assert.match(metrics.formattedTime, /hr/);
});

test('formatDriveTime formats minutes cleanly', () => {
  assert.equal(formatDriveTime(0), '0 min');
  assert.equal(formatDriveTime(45), '45 min');
  assert.equal(formatDriveTime(120), '2 hr');
  assert.equal(formatDriveTime(95), '1 hr 35 min');
});

test('calculateTripEstimate computes stay cost with room multiplier and day plans', () => {
  const estimate = calculateTripEstimate(
    {
      destinationIds: ['gokak-falls', 'belagavi-fort'],
      stayId: 'welcomhotel-kakati',
      roomType: 'Executive Suite',
      rooms: 2,
      duration: '3 Days / 2 Nights',
      adults: 2,
      children: 1,
      budgetTier: 'Standard',
      experiences: ['Local Food Trail'],
    },
    sampleDestinations,
    sampleStays,
    ['Belagavi Kunda']
  );

  // 6500 * 1.35 * 2 rooms * 2 nights = 35100
  assert.equal(estimate.nights, 2);
  assert.equal(estimate.stayCost, 35100);
  assert.ok(estimate.sightseeingCost > 0);
  assert.equal(estimate.totalCost, estimate.stayCost + estimate.sightseeingCost);
  assert.equal(estimate.dayPlans.length, 3);
  assert.ok(estimate.dayPlans[0].eveningNote.includes('Belagavi Kunda'));
});

test('calculateTripEstimate zeroes stay cost for Day Trip', () => {
  const estimate = calculateTripEstimate(
    {
      destinationIds: ['belagavi-fort'],
      stayId: 'welcomhotel-kakati',
      roomType: 'No Stay Needed - Day Trip',
      rooms: 1,
      duration: '1 Day',
      adults: 2,
      children: 0,
      budgetTier: 'Budget',
      experiences: [],
    },
    sampleDestinations,
    sampleStays
  );

  assert.equal(estimate.nights, 0);
  assert.equal(estimate.stayCost, 0);
  assert.equal(estimate.dayPlans.length, 1);
});

test('isSafeImageUrl blocks unsafe protocols and path traversal', () => {
  assert.equal(isSafeImageUrl('/src/assets/images/hero_gokak_falls.jpg'), true);
  assert.equal(isSafeImageUrl('/uploads/photo-123.jpg'), true);
  assert.equal(isSafeImageUrl('https://example.com/pic.jpg'), true);
  assert.equal(isSafeImageUrl('javascript:alert(1)'), false);
  assert.equal(isSafeImageUrl('data:text/html,<script>alert(1)</script>'), false);
  assert.equal(isSafeImageUrl('/uploads/../secret.json'), false);
});

test('validateTripForm returns errors for missing or invalid fields and passes valid payload', () => {
  const invalid: TripFormInput = {
    destinationIds: [],
    stayId: '',
    roomType: 'Standard / Deluxe Room',
    rooms: 1,
    experiences: [],
    bookmarkedCultureIds: [],
    fullName: 'A',
    email: 'not-an-email',
    phone: '123',
    travelDate: '',
    duration: '2 Days / 1 Night',
    adults: 0,
    children: 0,
    budgetTier: 'Standard',
    notes: '',
  };
  const errs = validateTripForm(invalid);
  assert.ok(errs.fullName);
  assert.ok(errs.email);
  assert.ok(errs.phone);
  assert.ok(errs.travelDate);
  assert.ok(errs.destinationIds);
  assert.ok(errs.adults);

  const valid: TripFormInput = {
    ...invalid,
    destinationIds: ['gokak-falls'],
    fullName: 'Aarav Kulkarni',
    email: 'aarav@example.com',
    phone: '+91 98450 12345',
    travelDate: '2026-12-15',
    adults: 2,
  };
  assert.deepEqual(validateTripForm(valid), {});
});
