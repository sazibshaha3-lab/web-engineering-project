// Deterministic mock delivery-distance helper — no real GPS/maps.
export function estimateDistanceKm(orderId) {
  let hash = 0;
  for (let i = 0; i < orderId.length; i++) hash = (hash * 31 + orderId.charCodeAt(i)) % 997;
  const km = 0.8 + (hash % 28) / 10; // ~0.8km to 3.5km
  return km.toFixed(1);
}
