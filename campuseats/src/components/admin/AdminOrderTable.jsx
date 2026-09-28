import { Link } from "react-router-dom";
import OrderStatusBadge from "../order/OrderStatusBadge";
import { currentCustomer } from "../../data/users";
import { useAdmin } from "../../context/AdminContext";

export default function AdminOrderTable({ orders }) {
  const { riders } = useAdmin();

  function riderName(riderId) {
    if (!riderId) return "Unassigned";
    return riders.find((r) => r.id === riderId)?.name || "Unassigned";
  }

  return (
    <div className="table-scroll">
      <table className="table admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Restaurant</th>
            <th>Rider</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Placed</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td data-label="Order">
                <Link className="admin-table__row-link" to={`/admin/orders/${o.id}`}>
                  {o.id}
                </Link>
              </td>
              <td data-label="Customer">{currentCustomer.name}</td>
              <td data-label="Restaurant">{o.restaurantName}</td>
              <td data-label="Rider">{riderName(o.riderId)}</td>
              <td data-label="Amount">৳{o.total}</td>
              <td data-label="Status">
                <OrderStatusBadge status={o.status} />
              </td>
              <td data-label="Placed">
                {new Date(o.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
