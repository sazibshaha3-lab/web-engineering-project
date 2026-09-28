import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Ban, RotateCcw } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import ErrorState from "../../components/common/ErrorState";
import Button from "../../components/common/Button";
import BlockActionDialog from "../../components/admin/BlockActionDialog";
import CustomerDetails from "../../components/admin/CustomerDetails";
import { useAdmin } from "../../context/AdminContext";
import useGuardedAction from "../../hooks/useGuardedAction";
import "./admin-shared.css";

export default function AdminCustomerDetails() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { customers, orders, blockCustomer, unblockCustomer } = useAdmin();
  const [confirmBlock, setConfirmBlock] = useState(false);
  const { busyKey, run } = useGuardedAction();

  const customer = customers.find((c) => c.id === customerId);

  if (!customer) {
    return (
      <ErrorState
        title="Customer not found"
        description="We couldn't find a customer with that ID."
        onRetry={() => navigate("/admin/customers")}
        actionLabel="Back to Customers"
      />
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        title={customer.name}
        description="Customer account details."
        actions={
          customer.status === "blocked" ? (
            <Button
              variant="secondary"
              icon={RotateCcw}
              loading={busyKey === "unblock"}
              onClick={() => run("unblock", () => unblockCustomer(customer.id))}
            >
              Unblock Customer
            </Button>
          ) : (
            <Button variant="secondary" icon={Ban} onClick={() => setConfirmBlock(true)}>
              Block Customer
            </Button>
          )
        }
      />

      <CustomerDetails customer={customer} orders={orders} />

      <BlockActionDialog
        open={confirmBlock}
        onClose={() => setConfirmBlock(false)}
        onConfirm={() => {
          setConfirmBlock(false);
          run("block", () => blockCustomer(customer.id));
        }}
        title={`Block ${customer.name}?`}
        description={`Blocking ${customer.name} will prevent them from logging in or placing new orders. Their account and order history will be preserved and can be unblocked later.`}
        confirmLabel="Block Customer"
      />

      <Link to="/admin/customers" className="admin-back-link">
        ← Back to customers
      </Link>
    </div>
  );
}
