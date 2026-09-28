// Tone/label mapping for the uppercase approval-status values used across
// the Admin panel (restaurants, riders). Distinct from the lowercase
// accountStatusMap in statusMaps.js, which the customer account registry
// (active/inactive/blocked) still uses.
export const approvalStatusMap = {
  PENDING: { label: "Pending review", tone: "warning" },
  APPROVED: { label: "Approved", tone: "success" },
  REJECTED: { label: "Rejected", tone: "error" },
  BLOCKED: { label: "Blocked", tone: "error" },
};

export function approvalTone(status) {
  return approvalStatusMap[status]?.tone || "neutral";
}

export function approvalLabel(status) {
  return approvalStatusMap[status]?.label || status;
}
