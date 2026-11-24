import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type {
  ContentPayload,
  GalleryCategory,
  GalleryPhoto,
  TripRequest,
  TripStatus,
  VisitorReview,
} from '../src/types/belagavi.ts';
import {
  SEED_CULTURE_ITEMS,
  SEED_DESTINATIONS,
  SEED_FOOD_SPOTS,
  SEED_GALLERY,
  SEED_REVIEWS,
  SEED_STAYS,
  SEED_TRIPS,
} from './seedData.ts';

interface DatabaseSchema {
  trips: TripRequest[];
  gallery: GalleryPhoto[];
  reviews: VisitorReview[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
export const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const DB_FILE = path.resolve(DATA_DIR, 'belagavi-db.json');

function ensureStorage(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial: DatabaseSchema = {
      trips: SEED_TRIPS,
      gallery: SEED_GALLERY,
      reviews: SEED_REVIEWS,
    };
    writeDbAtomic(initial);
  }
}

function writeDbAtomic(db: DatabaseSchema): void {
  const tempPath = `${DB_FILE}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_FILE);
}

function readDb(): DatabaseSchema {
  ensureStorage();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
    return {
      trips: Array.isArray(parsed.trips) ? parsed.trips : [...SEED_TRIPS],
      gallery: Array.isArray(parsed.gallery) ? parsed.gallery : [...SEED_GALLERY],
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [...SEED_REVIEWS],
    };
  } catch {
    const fallback: DatabaseSchema = {
      trips: [...SEED_TRIPS],
      gallery: [...SEED_GALLERY],
      reviews: [...SEED_REVIEWS],
    };
    writeDbAtomic(fallback);
    return fallback;
  }
}

export function getContentPayload(): ContentPayload {
  const db = readDb();
  return {
    destinations: SEED_DESTINATIONS,
    stays: SEED_STAYS,
    cultureItems: SEED_CULTURE_ITEMS,
    foodSpots: SEED_FOOD_SPOTS,
    gallery: db.gallery,
    reviews: db.reviews,
  };
}

export function getAllTrips(): TripRequest[] {
  const db = readDb();
  return db.trips;
}

export function createTrip(tripData: Omit<TripRequest, 'id' | 'bookingId' | 'createdAt' | 'status'>): TripRequest {
  const db = readDb();
  const existingIds = new Set(db.trips.map((t) => t.bookingId));
  let bookingId = '';
  for (let attempt = 0; attempt < 20; attempt++) {
    const num = crypto.randomInt(1000, 9999);
    const candidate = `BGM-2026-${num}`;
    if (!existingIds.has(candidate)) {
      bookingId = candidate;
      break;
    }
  }
  if (!bookingId) {
    bookingId = `BGM-2026-${Date.now().toString().slice(-4)}`;
  }

  const record: TripRequest = {
    ...tripData,
    id: `trip-${crypto.randomUUID()}`,
    bookingId,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  db.trips = [record, ...db.trips];
  writeDbAtomic(db);
  return record;
}

export function updateTripStatus(id: string, status: TripStatus): TripRequest | null {
  const db = readDb();
  const idx = db.trips.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  db.trips[idx] = { ...db.trips[idx], status };
  writeDbAtomic(db);
  return db.trips[idx];
}

export function deleteTripById(id: string): boolean {
  const db = readDb();
  const next = db.trips.filter((t) => t.id !== id);
  if (next.length === db.trips.length) return false;
  db.trips = next;
  writeDbAtomic(db);
  return true;
}

export function addGalleryPhoto(input: {
  title: string;
  category: GalleryCategory;
  location: string;
  image: string;
}): GalleryPhoto {
  const db = readDb();
  const record: GalleryPhoto = {
    id: `gal-${crypto.randomUUID()}`,
    title: input.title,
    category: input.category,
    location: input.location,
    image: input.image,
    createdAt: new Date().toISOString(),
  };
  db.gallery = [record, ...db.gallery];
  writeDbAtomic(db);
  return record;
}

export function addReview(input: {
  name: string;
  location: string;
  rating: number;
  visitedSeason: string;
  comment: string;
}): VisitorReview {
  const db = readDb();
  const record: VisitorReview = {
    id: `rev-${crypto.randomUUID()}`,
    name: input.name,
    location: input.location,
    rating: input.rating,
    visitedSeason: input.visitedSeason,
    comment: input.comment,
    createdAt: new Date().toISOString(),
  };
  db.reviews = [record, ...db.reviews];
  writeDbAtomic(db);
  return record;
}

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const MAX_UPLOAD_BYTES = 3 * 1024 * 1024; // 3MB

export function saveBase64ImageUpload(dataUrl: string): string {
  ensureStorage();
  const match = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/.exec(
    dataUrl.trim()
  );
  if (!match) {
    throw new Error('Only JPEG, PNG, or WebP image uploads are supported.');
  }

  const ext = MIME_TO_EXT[match[1]];
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length === 0 || buffer.length > MAX_UPLOAD_BYTES) {
    throw new Error('Uploaded image must be between 1 byte and 3 MB.');
  }

  const filename = `upload-${crypto.randomUUID()}.${ext}`;
  const resolvedPath = path.resolve(UPLOADS_DIR, filename);
  if (!resolvedPath.startsWith(UPLOADS_DIR + path.sep)) {
    throw new Error('Invalid upload destination path.');
  }

  fs.writeFileSync(resolvedPath, buffer);
  return `/uploads/${filename}`;
}
