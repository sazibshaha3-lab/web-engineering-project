import { Badge } from "../common/Badge";
import { approvalStatusMap } from "../../utils/adminStatus";

export default function AdminStatusBadge({ status }) {
  const entry = approvalStatusMap[status] || { label: status, tone: "neutral" };
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}
