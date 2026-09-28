import { useEffect, useState } from "react";
import Modal from "../feedback/Modal";
import BottomSheet from "../common/BottomSheet";
import Input from "../forms/Input";
import Select from "../forms/Select";
import Textarea from "../forms/Textarea";
import Switch from "../common/Switch";
import Button from "../common/Button";
import ExtrasManager from "./ExtrasManager";
import useMediaQuery from "../../hooks/useMediaQuery";
import { categories } from "../../data/categories";
import "./FoodForm.css";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: categories[0]?.id || "",
  preparationTime: "",
  image: "",
  isAvailable: true,
  isPopular: false,
  extras: [],
};

export default function FoodForm({ open, onClose, onSave, initialFood }) {
  const isMobile = useMediaQuery("(max-width: 719px)");
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(
        initialFood
          ? {
              name: initialFood.name,
              description: initialFood.description,
              price: initialFood.price,
              category: initialFood.category,
              preparationTime: initialFood.preparationTime,
              image: initialFood.image,
              isAvailable: initialFood.isAvailable,
              isPopular: initialFood.isPopular,
              extras: initialFood.extras || [],
            }
          : emptyForm
      );
      setErrors({});
    }
  }, [open, initialFood]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Enter the food name.";
    if (!form.description.trim()) next.description = "Enter a short description.";
    const price = Number(form.price);
    if (form.price === "" || Number.isNaN(price) || price <= 0) next.price = "Enter a valid price.";
    if (!form.category) next.category = "Choose a category.";
    if (!form.preparationTime.trim()) next.preparationTime = "Enter a preparation time.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSave({ ...form, price: Number(form.price) });
  }

  const title = initialFood ? "Edit food item" : "Add food item";

  const body = (
    <form className="food-form" onSubmit={handleSubmit} noValidate>
      <Input
        label="Food name"
        placeholder="e.g. Smoky Beef Burger"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
        error={errors.name}
      />
      <Textarea
        label="Description"
        placeholder="Short description shown to customers"
        rows={3}
        value={form.description}
        onChange={(e) => update("description", e.target.value)}
        error={errors.description}
      />

      <div className="food-form__row">
        <Input
          label="Price (৳)"
          type="number"
          min="0"
          placeholder="250"
          value={form.price}
          onChange={(e) => update("price", e.target.value)}
          error={errors.price}
        />
        <Input
          label="Preparation time"
          placeholder="e.g. 12-15 min"
          value={form.preparationTime}
          onChange={(e) => update("preparationTime", e.target.value)}
          error={errors.preparationTime}
        />
      </div>

      <Select
        label="Category"
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
        value={form.category}
        onChange={(e) => update("category", e.target.value)}
      />

      <Input
        label="Image URL (optional)"
        placeholder="https://..."
        value={form.image}
        onChange={(e) => update("image", e.target.value)}
      />

      <div className="food-form__toggles">
        <Switch checked={form.isAvailable} onChange={(v) => update("isAvailable", v)} label="Available" />
        <Switch checked={form.isPopular} onChange={(v) => update("isPopular", v)} label="Popular" />
      </div>

      <div>
        <p className="food-form__section-title">Extras</p>
        <ExtrasManager extras={form.extras} onChange={(extras) => update("extras", extras)} />
      </div>

      <div className="food-form__actions">
        <Button type="submit" fullWidth>
          {initialFood ? "Save changes" : "Add food item"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <BottomSheet open={open} onClose={onClose} title={title}>
        {body}
      </BottomSheet>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      {body}
    </Modal>
  );
}
