use little_exif::metadata::Metadata;
use little_exif::exif_tag::ExifTag;
use little_exif::rational::uR64;
use std::path::Path;

/// One DMS component encoded as EXIF rationals: [(deg,1),(min,1),(sec*1000,1000)].
fn dms_rationals(value: f64) -> [(u32, u32); 3] {
    let abs = value.abs();
    let deg = abs.floor();
    let min_f = (abs - deg) * 60.0;
    let min = min_f.floor();
    let sec = (min_f - min) * 60.0;
    [(deg as u32, 1), (min as u32, 1), ((sec * 1000.0).round() as u32, 1000)]
}

fn lat_ref(v: f64) -> &'static str { if v >= 0.0 { "N" } else { "S" } }
fn lng_ref(v: f64) -> &'static str { if v >= 0.0 { "E" } else { "W" } }

fn to_rationals(arr: [(u32, u32); 3]) -> Vec<uR64> {
    arr.iter()
        .map(|(n, d)| uR64 { nominator: *n, denominator: *d })
        .collect()
}

/// Write GPS latitude/longitude (and optional altitude) into the image at `path`, in place.
pub fn write_geotag(path: &Path, lat: f64, lng: f64, altitude: Option<f64>) -> Result<(), String> {
    let mut md = Metadata::new_from_path(path).unwrap_or_else(|_| Metadata::new());

    md.set_tag(ExifTag::GPSLatitudeRef(lat_ref(lat).to_string()));
    md.set_tag(ExifTag::GPSLatitude(to_rationals(dms_rationals(lat))));
    md.set_tag(ExifTag::GPSLongitudeRef(lng_ref(lng).to_string()));
    md.set_tag(ExifTag::GPSLongitude(to_rationals(dms_rationals(lng))));

    if let Some(alt) = altitude {
        md.set_tag(ExifTag::GPSAltitudeRef(vec![if alt >= 0.0 { 0u8 } else { 1u8 }]));
        md.set_tag(ExifTag::GPSAltitude(vec![uR64 {
            nominator: (alt.abs() * 100.0).round() as u32,
            denominator: 100,
        }]));
    }

    md.write_to_file(path).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use little_exif::metadata::Metadata;
    use little_exif::exif_tag::ExifTag;

    // ── helpers ──────────────────────────────────────────────────────────────

    fn read_lat_ref(path: &Path) -> Option<String> {
        let md = Metadata::new_from_path(path).ok()?;
        for tag in md.into_iter() {
            if let ExifTag::GPSLatitudeRef(r) = tag { return Some(r.clone()); }
        }
        None
    }

    fn read_lng_ref(path: &Path) -> Option<String> {
        let md = Metadata::new_from_path(path).ok()?;
        for tag in md.into_iter() {
            if let ExifTag::GPSLongitudeRef(r) = tag { return Some(r.clone()); }
        }
        None
    }

    /// Decode a DMS rational vector (3 × uR64) to decimal degrees.
    fn rationals_to_decimal(v: &[uR64]) -> f64 {
        let r = |i: usize| v[i].nominator as f64 / v[i].denominator as f64;
        r(0) + r(1) / 60.0 + r(2) / 3600.0
    }

    /// Read back GPS latitude and longitude as signed decimal degrees.
    /// Sign is derived from the ref strings (N/S, E/W).
    fn read_coords(path: &Path) -> Option<(f64, f64)> {
        let md = Metadata::new_from_path(path).ok()?;
        let mut lat_val: Option<f64> = None;
        let mut lat_ref: Option<String> = None;
        let mut lng_val: Option<f64> = None;
        let mut lng_ref: Option<String> = None;

        for tag in md.into_iter() {
            match tag {
                ExifTag::GPSLatitude(v)     => { lat_val = Some(rationals_to_decimal(v)); }
                ExifTag::GPSLatitudeRef(r)  => { lat_ref = Some(r.clone()); }
                ExifTag::GPSLongitude(v)    => { lng_val = Some(rationals_to_decimal(v)); }
                ExifTag::GPSLongitudeRef(r) => { lng_ref = Some(r.clone()); }
                _ => {}
            }
        }

        let lat = lat_val? * if lat_ref.as_deref() == Some("S") { -1.0 } else { 1.0 };
        let lng = lng_val? * if lng_ref.as_deref() == Some("W") { -1.0 } else { 1.0 };
        Some((lat, lng))
    }

    // ── unit tests ───────────────────────────────────────────────────────────

    #[test]
    fn dms_rationals_are_correct() {
        let [d, m, s] = dms_rationals(37.795391);
        assert_eq!(d, (37, 1));
        assert_eq!(m, (47, 1));
        assert!((s.0 as i64 - 43408).abs() < 5);
        assert_eq!(s.1, 1000);
    }

    // ── JPEG round-trip ──────────────────────────────────────────────────────

    #[test]
    fn writes_gps_into_jpeg() {
        let dir = tempfile::tempdir().unwrap();
        let dst = dir.path().join("t.jpg");
        std::fs::copy("tests/fixtures/sample.jpg", &dst).unwrap();
        write_geotag(&dst, 37.795391, -122.393624, Some(5.0)).unwrap();

        // Existing assertion: ref strings are correct
        assert_eq!(read_lat_ref(&dst).as_deref(), Some("N"));
        assert_eq!(read_lng_ref(&dst).as_deref(), Some("W"));

        // Strengthened: decoded decimal degrees must match written values
        let (lat, lng) = read_coords(&dst)
            .expect("should be able to read back GPS coords from JPEG");
        assert!(
            (lat - 37.795391).abs() < 0.0005,
            "JPEG latitude round-trip failed: got {lat}, expected ~37.795391"
        );
        assert!(
            (lng - (-122.393624)).abs() < 0.0005,
            "JPEG longitude round-trip failed: got {lng}, expected ~-122.393624"
        );
    }

    // ── PNG round-trip ───────────────────────────────────────────────────────

    #[test]
    fn writes_gps_into_png() {
        let dir = tempfile::tempdir().unwrap();
        let dst = dir.path().join("t.png");
        std::fs::copy("tests/fixtures/sample.png", &dst).unwrap();
        write_geotag(&dst, 37.795391, -122.393624, Some(5.0)).unwrap();

        assert_eq!(read_lat_ref(&dst).as_deref(), Some("N"),
            "PNG: GPSLatitudeRef should be N");
        assert_eq!(read_lng_ref(&dst).as_deref(), Some("W"),
            "PNG: GPSLongitudeRef should be W");

        let (lat, lng) = read_coords(&dst)
            .expect("should be able to read back GPS coords from PNG");
        assert!(
            (lat - 37.795391).abs() < 0.0005,
            "PNG latitude round-trip failed: got {lat}, expected ~37.795391"
        );
        assert!(
            (lng - (-122.393624)).abs() < 0.0005,
            "PNG longitude round-trip failed: got {lng}, expected ~-122.393624"
        );
    }

    // ── WebP round-trip ──────────────────────────────────────────────────────

    #[test]
    fn writes_gps_into_webp() {
        let dir = tempfile::tempdir().unwrap();
        let dst = dir.path().join("t.webp");
        std::fs::copy("tests/fixtures/sample.webp", &dst).unwrap();
        write_geotag(&dst, 37.795391, -122.393624, Some(5.0)).unwrap();

        assert_eq!(read_lat_ref(&dst).as_deref(), Some("N"),
            "WebP: GPSLatitudeRef should be N");
        assert_eq!(read_lng_ref(&dst).as_deref(), Some("W"),
            "WebP: GPSLongitudeRef should be W");

        let (lat, lng) = read_coords(&dst)
            .expect("should be able to read back GPS coords from WebP");
        assert!(
            (lat - 37.795391).abs() < 0.0005,
            "WebP latitude round-trip failed: got {lat}, expected ~37.795391"
        );
        assert!(
            (lng - (-122.393624)).abs() < 0.0005,
            "WebP longitude round-trip failed: got {lng}, expected ~-122.393624"
        );
    }

    // ── negative-coordinate round-trip ───────────────────────────────────────

    #[test]
    fn writes_southern_western_coords_into_jpeg() {
        // Validates that negative lat/lng (S/W hemisphere) encode and decode correctly.
        let dir = tempfile::tempdir().unwrap();
        let dst = dir.path().join("s.jpg");
        std::fs::copy("tests/fixtures/sample.jpg", &dst).unwrap();
        // Sydney Opera House: -33.8568, 151.2153
        write_geotag(&dst, -33.8568, 151.2153, None).unwrap();

        assert_eq!(read_lat_ref(&dst).as_deref(), Some("S"));
        assert_eq!(read_lng_ref(&dst).as_deref(), Some("E"));

        let (lat, lng) = read_coords(&dst)
            .expect("should read back coords for southern/eastern hemisphere");
        assert!(
            (lat - (-33.8568)).abs() < 0.0005,
            "Southern hemisphere latitude failed: got {lat}, expected ~-33.8568"
        );
        assert!(
            (lng - 151.2153).abs() < 0.0005,
            "Eastern hemisphere longitude failed: got {lng}, expected ~151.2153"
        );
    }
}
