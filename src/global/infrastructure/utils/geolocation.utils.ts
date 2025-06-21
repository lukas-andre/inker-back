interface PointCoords {
  lat: number;
  lon: number;
}

/**
 * Calculates the distance between two points on the Earth's surface using the Haversine formula.
 * @param point1 - The first point { lat: number, lon: number }.
 * @param point2 - The second point { lat: number, lon: number }.
 * @returns The distance in kilometers.
 */
export function calculateHaversineDistance(
  point1: PointCoords,
  point2: PointCoords,
): number {
  const R = 6371; // Earth radius in kilometers

  const dLat = deg2rad(point2.lat - point1.lat);
  const dLon = deg2rad(point2.lon - point1.lon);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(point1.lat)) *
      Math.cos(deg2rad(point2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
