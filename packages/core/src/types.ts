export const TagStatus = {
  Untagged: "untagged",
  Tagged: "tagged",
  Processing: "processing",
  Error: "error",
} as const;
export type TagStatus = (typeof TagStatus)[keyof typeof TagStatus];

export type ImageFormat = "jpeg" | "png" | "webp" | "heic";

export interface GeoLocation {
  lat: number;
  lng: number;
  /** meters above sea level */
  altitude?: number;
  /** GPSImgDirection, degrees 0-359 */
  heading?: number;
}

export interface ResolvedAddress {
  formatted: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  sublocation?: string;
}

export interface SeoMetadata {
  caption?: string;
  keywords: string[];
  businessName?: string;
  copyright?: string;
}

export interface PhotoTagInput {
  location: GeoLocation;
  address?: ResolvedAddress;
  seo?: SeoMetadata;
  /** EXIF DateTimeOriginal override (ISO 8601); omit to keep existing */
  dateTimeOriginal?: string;
  /** when true, do not modify existing timestamps */
  preserveTimestamps: boolean;
}

export interface PhotoFile {
  id: string;
  name: string;
  path: string;
  format: ImageFormat;
  status: TagStatus;
}

export function isValidLatLng(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
