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

    fn read_lat_ref(path: &Path) -> Option<String> {
        let md = Metadata::new_from_path(path).ok()?;
        for tag in md.into_iter() {
            if let ExifTag::GPSLatitudeRef(r) = tag { return Some(r.clone()); }
        }
        None
    }

    #[test]
    fn writes_gps_into_jpeg() {
        let dir = tempfile::tempdir().unwrap();
        let dst = dir.path().join("t.jpg");
        std::fs::copy("tests/fixtures/sample.jpg", &dst).unwrap();
        write_geotag(&dst, 37.795391, -122.393624, Some(5.0)).unwrap();
        assert_eq!(read_lat_ref(&dst).as_deref(), Some("N"));
    }

    #[test]
    fn dms_rationals_are_correct() {
        let [d, m, s] = dms_rationals(37.795391);
        assert_eq!(d, (37, 1));
        assert_eq!(m, (47, 1));
        assert!((s.0 as i64 - 43408).abs() < 5);
        assert_eq!(s.1, 1000);
    }
}
