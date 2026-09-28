import { useState } from "react";
import Input from "../forms/Input";
import Textarea from "../forms/Textarea";
import Button from "../common/Button";
import { useRestaurantData } from "../../context/RestaurantContext";
import { useToast } from "../feedback/ToastContext";
import "./ProfileForm.css";

export default function ProfileForm({ onDone }) {
  const { restaurant, updateRestaurant } = useRestaurantData();
  const toast = useToast();
  const [form, setForm] = useState({
    name: restaurant.name,
    description: restaurant.description,
    category: restaurant.category,
    address: restaurant.address,
    deliveryFee: restaurant.deliveryFee,
    minimumOrder: restaurant.minimumOrder,
    deliveryTime: restaurant.deliveryTime,
    openingTime: restaurant.openingTime,
    closingTime: restaurant.closingTime,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Enter the restaurant name.";
    if (!form.category.trim()) next.category = "Enter a category.";
    if (!form.address.trim()) next.address = "Enter the restaurant address.";
    const fee = Number(form.deliveryFee);
    if (form.deliveryFee === "" || Number.isNaN(fee) || fee < 0) next.deliveryFee = "Enter a valid delivery fee.";
    const min = Number(form.minimumOrder);
    if (form.minimumOrder === "" || Number.isNaN(min) || min < 0) next.minimumOrder = "Enter a valid minimum order.";
    if (!form.deliveryTime.trim()) next.deliveryTime = "Enter a delivery time range.";
    if (!form.openingTime.trim()) next.openingTime = "Enter an opening time.";
    if (!form.closingTime.trim()) next.closingTime = "Enter a closing time.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setTimeout(() => {
      updateRestaurant({
        ...form,
        deliveryFee: Number(form.deliveryFee),
        minimumOrder: Number(form.minimumOrder),
      });
      setSaving(false);
      toast?.showToast("Restaurant profile updated", "success");
      onDone?.();
    }, 500);
  }

  return (
    <form className="profile-form-grid" onSubmit={handleSubmit} noValidate>
      <Input label="Restaurant name" value={form.name} onChange={(e) => update("name", e.target.value)} error={errors.name} />
      <Textarea label="Description" rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} />

      <div className="profile-form-grid__row">
        <Input label="Category" value={form.category} onChange={(e) => update("category", e.target.value)} error={errors.category} />
        <Input label="Delivery time" placeholder="e.g. 20-30 min" value={form.deliveryTime} onChange={(e) => update("deliveryTime", e.target.value)} error={errors.deliveryTime} />
      </div>

      <Input label="Address" value={form.address} onChange={(e) => update("address", e.target.value)} error={errors.address} />

      <div className="profile-form-grid__row">
        <Input label="Delivery fee (৳)" type="number" min="0" value={form.deliveryFee} onChange={(e) => update("deliveryFee", e.target.value)} error={errors.deliveryFee} />
        <Input label="Minimum order (৳)" type="number" min="0" value={form.minimumOrder} onChange={(e) => update("minimumOrder", e.target.value)} error={errors.minimumOrder} />
      </div>

      <div className="profile-form-grid__row">
        <Input label="Opening time" placeholder="e.g. 10:00 AM" value={form.openingTime} onChange={(e) => update("openingTime", e.target.value)} error={errors.openingTime} />
        <Input label="Closing time" placeholder="e.g. 11:00 PM" value={form.closingTime} onChange={(e) => update("closingTime", e.target.value)} error={errors.closingTime} />
      </div>

      <div className="profile-form-grid__actions">
        <Button type="submit" loading={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
