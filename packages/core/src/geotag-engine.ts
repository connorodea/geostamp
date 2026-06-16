import type { GeoLocation, PhotoTagInput, TagStatus } from "./types";

export interface ExistingMetadata {
  path: string;
  hasGps: boolean;
  location?: GeoLocation;
  dateTimeOriginal?: string;
}

export interface GeotagResult {
  path: string;
  status: TagStatus;
  location: GeoLocation;
  error?: string;
}

export interface WriteOptions {
  /** write a copy instead of overwriting in place */
  keepOriginal?: boolean;
  /** output dir when keepOriginal is true */
  outputDir?: string;
}

export interface GeotagEngine {
  readMetadata(path: string): Promise<ExistingMetadata>;
  writeGeotag(
    path: string,
    input: PhotoTagInput,
    options?: WriteOptions,
  ): Promise<GeotagResult>;
}
