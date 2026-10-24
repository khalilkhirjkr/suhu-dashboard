const EARTH_RADIUS_M = 6371008.8

// Luas poligon (m2) daripada senarai [lat, lng]. Guna unjuran equirectangular
// setempat (tepat untuk saiz bumbung) + formula shoelace.
// Poligon yang bersilang sendiri memberi luas yang salah — pengguna perlu lukis tanpa garis bersilang.
export function polygonAreaM2(points) {
  if (!points || points.length < 3) return 0
  const lat0 = (points.reduce((sum, p) => sum + p[0], 0) / points.length) * Math.PI / 180
  const xy = points.map(([lat, lng]) => [
    EARTH_RADIUS_M * (lng * Math.PI / 180) * Math.cos(lat0),
    EARTH_RADIUS_M * (lat * Math.PI / 180),
  ])
  let twiceArea = 0
  for (let i = 0; i < xy.length; i++) {
    const [x1, y1] = xy[i]
    const [x2, y2] = xy[(i + 1) % xy.length]
    twiceArea += x1 * y2 - x2 * y1
  }
  return Math.abs(twiceArea) / 2
}
