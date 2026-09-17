/**
 * High-accuracy SVY21 (Singapore Transverse Mercator) to WGS84 (Lat/Lng) converter.
 * Standard datum definition used by SLA (Singapore Land Authority), OneMap, and data.gov.sg.
 */

// WGS84 & SVY21 Datum Constants
const A = 6378137.0; // Semi-major axis
const F = 1 / 298.257223563; // Flattening
const E2 = 2 * F - F * F; // First eccentricity squared (~0.00669438)
const E_PRIME_SQ = E2 / (1 - E2); // Second eccentricity squared (~0.00673950)

// Projection Origin
const LAT_ORIGIN_RAD = (1.366666666666667 * Math.PI) / 180; // 1°22'00" N
const LON_ORIGIN_RAD = (103.8333333333333 * Math.PI) / 180; // 103°50'00" E
const FALSE_NORTHING = 38744.572; // N0 (meters)
const FALSE_EASTING = 28001.642; // E0 (meters)
const K0 = 1.0; // Scale factor

// Calculate Meridian Arc Distance from equator to given latitude
function calcMeridianDistance(latRad: number): number {
  const a0 = 1 - E2 / 4 - (3 * E2 * E2) / 64 - (5 * Math.pow(E2, 3)) / 256;
  const a2 = (3 / 8) * (E2 + (E2 * E2) / 4 + (15 * Math.pow(E2, 3)) / 128);
  const a4 = (15 / 256) * (E2 * E2 + (3 * Math.pow(E2, 3)) / 4);
  const a6 = (35 * Math.pow(E2, 3)) / 3072;

  return (
    A *
    (a0 * latRad -
      a2 * Math.sin(2 * latRad) +
      a4 * Math.sin(4 * latRad) -
      a6 * Math.sin(6 * latRad))
  );
}

const M0 = calcMeridianDistance(LAT_ORIGIN_RAD);

/**
 * Converts Singapore SVY21 Projected Coordinates (x = Easting, y = Northing)
 * to WGS84 Geographic Coordinates (Latitude, Longitude in degrees).
 *
 * @param easting - SVY21 Easting (x_coord, typically ~10,000 to ~50,000)
 * @param northing - SVY21 Northing (y_coord, typically ~20,000 to ~55,000)
 */
export function svy21ToWgs84(
  easting: number,
  northing: number
): { lat: number; lng: number } {
  // If coordinates look like they are already Lat/Lng (e.g. 1.34 and 103.85)
  if (northing >= 1.15 && northing <= 1.5 && easting >= 103.5 && easting <= 104.1) {
    return { lat: Number(northing.toFixed(6)), lng: Number(easting.toFixed(6)) };
  }
  if (easting >= 1.15 && easting <= 1.5 && northing >= 103.5 && northing <= 104.1) {
    return { lat: Number(easting.toFixed(6)), lng: Number(northing.toFixed(6)) };
  }

  const nPrime = northing - FALSE_NORTHING;
  const ePrime = easting - FALSE_EASTING;

  // Meridian distance at footpoint latitude
  const m = M0 + nPrime / K0;

  // Footpoint latitude calculation
  const mu =
    m /
    (A * (1 - E2 / 4 - (3 * E2 * E2) / 64 - (5 * Math.pow(E2, 3)) / 256));

  const e1 = (1 - Math.sqrt(1 - E2)) / (1 + Math.sqrt(1 - E2));

  const j1 = (3 * e1) / 2 - (27 * Math.pow(e1, 3)) / 32;
  const j2 = (21 * e1 * e1) / 16 - (55 * Math.pow(e1, 4)) / 32;
  const j3 = (151 * Math.pow(e1, 3)) / 96;
  const j4 = (1097 * Math.pow(e1, 4)) / 512;

  const fpLat =
    mu +
    j1 * Math.sin(2 * mu) +
    j2 * Math.sin(4 * mu) +
    j3 * Math.sin(6 * mu) +
    j4 * Math.sin(8 * mu);

  // Geometric parameters at footpoint latitude
  const sinFp = Math.sin(fpLat);
  const cosFp = Math.cos(fpLat);
  const tanFp = Math.tan(fpLat);

  const c1 = E_PRIME_SQ * cosFp * cosFp;
  const t1 = tanFp * tanFp;
  const n1 = A / Math.sqrt(1 - E2 * sinFp * sinFp);
  const r1 = (A * (1 - E2)) / Math.pow(1 - E2 * sinFp * sinFp, 1.5);
  const d = ePrime / (n1 * K0);

  // Latitude
  const latFactor1 = (n1 * tanFp) / r1;
  const latTerm1 = (d * d) / 2;
  const latTerm2 =
    ((5 + 3 * t1 + 10 * c1 - 4 * c1 * c1 - 9 * E_PRIME_SQ) * Math.pow(d, 4)) /
    24;
  const latTerm3 =
    ((61 + 90 * t1 + 298 * c1 + 45 * t1 * t1 - 252 * E_PRIME_SQ - 3 * c1 * c1) *
      Math.pow(d, 6)) /
    720;

  const latRad = fpLat - latFactor1 * (latTerm1 - latTerm2 + latTerm3);

  // Longitude
  const lonTerm1 = d;
  const lonTerm2 = ((1 + 2 * t1 + c1) * Math.pow(d, 3)) / 6;
  const lonTerm3 =
    ((5 - 2 * c1 + 28 * t1 - 3 * c1 * c1 + 8 * E_PRIME_SQ + 24 * t1 * t1) *
      Math.pow(d, 5)) /
    120;

  const lonRad = LON_ORIGIN_RAD + (lonTerm1 - lonTerm2 + lonTerm3) / cosFp;

  const lat = (latRad * 180) / Math.PI;
  const lng = (lonRad * 180) / Math.PI;

  return {
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
  };
}
