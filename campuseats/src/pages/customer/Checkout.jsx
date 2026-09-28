import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, MapPin, MessageSquare, Wallet2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import { ShoppingBag, ClipboardCheck } from "lucide-react";

import AddressSection from "../../components/checkout/AddressSection";
import DeliveryInstructions from "../../components/checkout/DeliveryInstructions";
import PaymentMethodSelector from "../../components/checkout/PaymentMethodSelector";
import MockPaymentForm from "../../components/checkout/MockPaymentForm";
import CheckoutSummary from "../../components/checkout/CheckoutSummary";
import PlaceOrderButton from "../../components/checkout/PlaceOrderButton";

import { useCart } from "../../context/CartContext";
import { useAddresses } from "../../context/AddressContext";
import { useOrders } from "../../context/OrderContext";
import { useRestaurantData } from "../../context/RestaurantContext";
import { useToast } from "../../components/feedback/ToastContext";
import { validateRestaurantFoodRelation } from "../../utils/dataValidation";
import { validateMockPaymentForm, simulateMockPayment } from "../../utils/paymentMock";
import "./Checkout.css";

const emptyPaymentForm = { name: "", number: "", expiry: "", cvv: "" };

export default function Checkout() {
  const navigate = useNavigate();
  const toast = useToast();
  const { items, subtotal, cartRestaurantId, clearCart } = useCart();
  const { selectedAddress } = useAddresses();
  const { createOrder } = useOrders();
  const { restaurants, foods } = useRestaurantData();

  const [instructions, setInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);
  const [paymentErrors, setPaymentErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const addressSectionRef = useRef(null);

  const restaurant = useMemo(
    () => restaurants.find((r) => r.id === cartRestaurantId) || null,
    [cartRestaurantId, restaurants]
  );

  const invalidItems = useMemo(() => {
    if (!restaurant) return [];
    return items.filter((item) => {
      const result = validateRestaurantFoodRelation(restaurants, foods, item.restaurantId, item.foodId);
      return !result.valid || !result.food.isAvailable;
    });
  }, [items, restaurant, restaurants, foods]);

  const deliveryFee = items.length ? restaurant?.deliveryFee || 0 : 0;
  const discount = 0;
  const total = subtotal + deliveryFee - discount;
  const meetsMinimum = !restaurant || subtotal >= (restaurant.minimumOrder || 0);
  const hasInvalidCart = invalidItems.length > 0 || (restaurant && !restaurant.isOpen);

  const canPlaceOrder =
    items.length > 0 &&
    !!restaurant &&
    !!selectedAddress &&
    meetsMinimum &&
    !hasInvalidCart &&
    !placing;

  function handlePaymentFormChange(next) {
    setPaymentForm(next);
    setPaymentErrors({});
    setPaymentFailed(false);
  }

  function handlePlaceOrder() {
    if (!canPlaceOrder) return;
    if (paymentMethod === "online") {
      const { valid, errors } = validateMockPaymentForm(paymentForm);
      if (!valid) {
        setPaymentErrors(errors);
        return;
      }
    }

    setPlacing(true);
    setPaymentFailed(false);

    setTimeout(() => {
      if (paymentMethod === "online") {
        const result = simulateMockPayment(paymentForm);
        if (!result.success) {
          setPlacing(false);
          setPaymentFailed(true);
          toast?.showToast("Payment was not completed", "error");
          return;
        }
      }

      const order = createOrder({
        restaurant,
        items,
        subtotal,
        deliveryFee,
        discount,
        deliveryAddress: selectedAddress,
        deliveryInstructions: instructions,
        paymentMethod,
      });

      clearCart();
      toast?.showToast("Order placed successfully", "success");
      navigate("/customer/order-success", { state: { orderId: order.id } });
    }, 1100);
  }

  if (items.length === 0) {
    return (
      <div className="fade-in">
        <PageHeader icon={ClipboardCheck} title="Checkout" description="Confirm your delivery details and place your order." />
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add something delicious from a nearby restaurant to get started."
          action={
            <Button as={Link} to="/customer/restaurants">
              Browse Restaurants
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <PageHeader icon={ClipboardCheck} title="Checkout" description="Confirm your delivery details and place your order." />

      {hasInvalidCart && (
        <div className="checkout-page__payment-failed">
          <AlertTriangle size={20} strokeWidth={2} style={{ flexShrink: 0 }} />
          <div>
            <strong>Some items need your attention</strong>
            <p>One or more items are no longer available. Please review your cart before continuing.</p>
          </div>
        </div>
      )}

      <div className="checkout-page">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <div className="checkout-section" ref={addressSectionRef}>
            <h3 className="checkout-section__title">
              <span className="checkout-section__number">1</span>
              <MapPin size={17} strokeWidth={2} /> Delivery address
            </h3>
            <AddressSection showValidation={!selectedAddress} />
          </div>

          <div className="checkout-section">
            <h3 className="checkout-section__title">
              <span className="checkout-section__number">2</span>
              <MessageSquare size={17} strokeWidth={2} /> Delivery instructions
            </h3>
            <DeliveryInstructions value={instructions} onChange={setInstructions} />
          </div>

          <div className="checkout-section">
            <h3 className="checkout-section__title">
              <span className="checkout-section__number">3</span>
              <Wallet2 size={17} strokeWidth={2} /> Payment method
            </h3>
            <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
            {paymentMethod === "online" && (
              <MockPaymentForm form={paymentForm} onChange={handlePaymentFormChange} errors={paymentErrors} />
            )}
          </div>
        </div>

        <div className="checkout-page__summary-col">
          <div className="checkout-section" style={{ padding: 0, border: "none", background: "transparent" }}>
            <h3 className="checkout-section__title">
              <span className="checkout-section__number">4</span> Order summary
            </h3>
          </div>

          {paymentFailed && (
            <div className="checkout-page__payment-failed">
              <AlertTriangle size={20} strokeWidth={2} style={{ flexShrink: 0 }} />
              <div>
                <strong>Payment was not completed</strong>
                <p>Please check the payment details and try again.</p>
              </div>
            </div>
          )}

          <CheckoutSummary
            restaurant={restaurant}
            items={items}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            discount={discount}
            address={selectedAddress}
            instructions={instructions}
            paymentMethod={paymentMethod}
          />

          <div className="checkout-page__place-order">
            <PlaceOrderButton
              onClick={handlePlaceOrder}
              disabled={!canPlaceOrder}
              loading={placing}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
