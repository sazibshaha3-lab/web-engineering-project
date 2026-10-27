// Backend payment enum is cash/online; the UI uses cod/online as label keys.
const toUiPayment = (m) => (m === "cash" ? "cod" : m);
export const toApiPayment = (m) => (m === "online" ? "online" : "cash");

function normalizeOrderItem(i) {
  const unitPrice = Number(i.price) || 0;
  const extras = (i.selectedExtras ?? []).map((e) => ({ ...e, id: String(e.id), price: Number(e.price) || 0 }));
  const quantity = Number(i.quantity) || 1;
  return {
    id: String(i.id),
    foodId: i.foodId == null ? null : String(i.foodId),
    name: i.name,
    image: i.image ?? "",
    unitPrice,
    quantity,
    extras,
    customInstructions: i.customInstructions ?? "",
    itemTotal: (unitPrice + extras.reduce((s, e) => s + e.price, 0)) * quantity,
  };
}

function normalizeDeliveryAddress(a) {
  if (!a) return null;
  if (typeof a === "string") return { label: "Delivery", line: a, area: "", city: "", details: "" };
  return { ...a, area: a.area ?? "", city: a.city ?? "", details: a.details ?? "" };
}

// `order.id` is the human order number (ORD-XXXXX) because every page and route uses it;
// `dbId` is the numeric primary key the API endpoints need.
export function normalizeOrder(o) {
  const restaurant = o.restaurant ?? {};
  return {
    id: o.orderNumber,
    dbId: o.id,
    customerId: String(o.customerId),
    customer: o.customer ? { ...o.customer, id: String(o.customer.id) } : null,
    restaurantId: String(o.restaurantId),
    restaurantName: restaurant.name ?? "",
    restaurantLogo: restaurant.logo ?? "",
    restaurantImage: restaurant.image ?? "",
    items: (o.items ?? []).map(normalizeOrderItem),
    subtotal: Number(o.subtotal),
    deliveryFee: Number(o.deliveryFee),
    discount: Number(o.discount),
    total: Number(o.total),
    deliveryAddress: normalizeDeliveryAddress(o.deliveryAddress),
    deliveryInstructions: o.deliveryInstructions ?? "",
    paymentMethod: toUiPayment(o.paymentMethod),
    paymentStatus: o.paymentStatus,
    status: o.status,
    riderId: o.riderId == null ? null : String(o.riderId),
    rider: o.rider
      ? { ...o.rider, id: String(o.rider.id), name: o.rider.user?.name ?? "", phone: o.rider.user?.phone ?? "", avatar: o.rider.user?.avatar ?? "" }
      : null,
    createdAt: o.createdAt,
    estimatedDeliveryTime: restaurant.deliveryTime || "30-40 min",
    review: o.review
      ? { restaurantRating: o.review.rating, foodRating: 0, text: o.review.comment ?? "", submittedAt: o.review.createdAt }
      : null,
  };
}

export function normalizeAddress(a) {
  const { userId, ...rest } = a;
  return {
    ...rest,
    id: String(a.id),
    area: a.area ?? "",
    city: a.city ?? "",
    details: a.details ?? "",
    isDefault: Boolean(a.isDefault),
  };
}

export function toAddressPayload(data) {
  const payload = {
    label: data.label || "Address",
    line: data.line,
    area: data.area || null,
    city: data.city || null,
    details: data.details || null,
  };
  if (data.latitude != null && Number.isFinite(Number(data.latitude))) payload.latitude = Number(data.latitude);
  if (data.longitude != null && Number.isFinite(Number(data.longitude))) payload.longitude = Number(data.longitude);
  if (data.isDefault !== undefined) payload.isDefault = Boolean(data.isDefault);
  return payload;
}

export function toOrderPayload({ restaurant, items, deliveryAddress, deliveryInstructions, paymentMethod }) {
  return {
    restaurantId: restaurant.id,
    addressId: deliveryAddress.id,
    deliveryInstructions: deliveryInstructions || null,
    paymentMethod: toApiPayment(paymentMethod),
    items: items.map((it) => ({
      foodId: it.foodId,
      quantity: it.quantity,
      extras: (it.extras ?? []).map((e) => e.id),
      customInstructions: it.customInstructions || null,
    })),
  };
}
