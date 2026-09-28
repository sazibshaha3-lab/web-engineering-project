import Button from "../common/Button";

export default function PlaceOrderButton({ onClick, disabled, loading, total }) {
  return (
    <Button fullWidth size="lg" onClick={onClick} disabled={disabled} loading={loading}>
      {loading ? "Placing your order..." : `Place Order · ৳${total}`}
    </Button>
  );
}
