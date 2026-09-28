import { Link } from "react-router-dom";
import { Ban, RotateCcw } from "lucide-react";
import Avatar from "../common/Avatar";
import Button from "../common/Button";
import { StatusBadge } from "../common/Badge";
import BlockActionDialog from "./BlockActionDialog";
import useGuardedAction from "../../hooks/useGuardedAction";
import { useState } from "react";

export default function CustomerManagementTable({ customers, onBlock, onUnblock }) {
  const [blockTarget, setBlockTarget] = useState(null);
  const { busyKey, run } = useGuardedAction();

  return (
    <>
      <div className="table-scroll">
        <table className="table admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Orders</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td data-label="Customer">
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <Avatar name={c.name} size="sm" />
                    <Link className="admin-table__row-link" to={`/admin/customers/${c.id}`}>
                      {c.name}
                    </Link>
                  </div>
                </td>
                <td data-label="Email">{c.email}</td>
                <td data-label="Phone">{c.phone}</td>
                <td data-label="Orders">{c.orders}</td>
                <td data-label="Status">
                  <StatusBadge status={c.status} />
                </td>
                <td data-label="">
                  {c.status === "blocked" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={RotateCcw}
                      loading={busyKey === `unblock-${c.id}`}
                      onClick={() => run(`unblock-${c.id}`, () => onUnblock(c.id))}
                    >
                      Unblock
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" icon={Ban} onClick={() => setBlockTarget(c)}>
                      Block
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BlockActionDialog
        open={!!blockTarget}
        onClose={() => setBlockTarget(null)}
        onConfirm={() => {
          const id = blockTarget.id;
          setBlockTarget(null);
          run(`block-${id}`, () => onBlock(id));
        }}
        title={`Block ${blockTarget?.name}?`}
        description={`Blocking ${blockTarget?.name} will prevent them from logging in or placing new orders. Their account and order history will be preserved and can be unblocked later.`}
        confirmLabel="Block Customer"
      />
    </>
  );
}
