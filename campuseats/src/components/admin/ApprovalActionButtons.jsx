import { useState } from "react";
import { CheckCircle2, XCircle, Ban, RotateCcw } from "lucide-react";
import Button from "../common/Button";
import BlockActionDialog from "./BlockActionDialog";
import useGuardedAction from "../../hooks/useGuardedAction";

export default function ApprovalActionButtons({
  status,
  entityLabel = "this account",
  size = "sm",
  onApprove,
  onReject,
  onBlock,
  onUnblock,
}) {
  const [dialog, setDialog] = useState(null); // "reject" | "block" | null
  const { busyKey, run } = useGuardedAction();

  function guarded(key, fn) {
    run(key, fn);
  }

  return (
    <>
      <div className="approval-actions">
        {(status === "PENDING" || status === "REJECTED") && (
          <Button
            size={size}
            icon={CheckCircle2}
            loading={busyKey === "approve"}
            onClick={() => guarded("approve", onApprove)}
          >
            Approve
          </Button>
        )}
        {status === "PENDING" && (
          <Button size={size} variant="danger" icon={XCircle} onClick={() => setDialog("reject")}>
            Reject
          </Button>
        )}
        {(status === "APPROVED" || status === "REJECTED") && (
          <Button size={size} variant="secondary" icon={Ban} onClick={() => setDialog("block")}>
            Block
          </Button>
        )}
        {status === "BLOCKED" && (
          <Button
            size={size}
            variant="secondary"
            icon={RotateCcw}
            loading={busyKey === "unblock"}
            onClick={() => guarded("unblock", onUnblock)}
          >
            Unblock
          </Button>
        )}
      </div>

      <BlockActionDialog
        open={dialog === "reject"}
        onClose={() => setDialog(null)}
        onConfirm={() => {
          setDialog(null);
          guarded("reject", onReject);
        }}
        title={`Reject ${entityLabel}?`}
        description={`This will mark ${entityLabel} as rejected. They will not be able to operate on CampusEats unless approved later.`}
        confirmLabel="Reject"
      />
      <BlockActionDialog
        open={dialog === "block"}
        onClose={() => setDialog(null)}
        onConfirm={() => {
          setDialog(null);
          guarded("block", onBlock);
        }}
        title={`Block ${entityLabel}?`}
        description={`Blocking ${entityLabel} will stop them from operating on CampusEats. Their existing data will be preserved and can be unblocked later.`}
        confirmLabel="Block"
      />
    </>
  );
}
