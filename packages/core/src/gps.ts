export type Axis = "lat" | "lng";
export interface Dms {
  degrees: number;
  minutes: number;
  seconds: number;
  ref: "N" | "S" | "E" | "W";
}

export function decimalToDms(value: number, axis: Axis): Dms {
  const positive = axis === "lat" ? "N" : "E";
  const negative = axis === "lat" ? "S" : "W";
  const ref = value >= 0 ? positive : negative;
  const abs = Math.abs(value);
  const degrees = Math.floor(abs);
  const minutesFloat = (abs - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = (minutesFloat - minutes) * 60;
  return { degrees, minutes, seconds, ref };
}

export function dmsToDecimal(dms: Dms): number {
  const magnitude = dms.degrees + dms.minutes / 60 + dms.seconds / 3600;
  return dms.ref === "S" || dms.ref === "W" ? -magnitude : magnitude;
}
