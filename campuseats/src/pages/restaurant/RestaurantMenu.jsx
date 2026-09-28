import { useState } from "react";
import { Plus, UtensilsCrossed } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import MenuManager from "../../components/restaurant/MenuManager";
import { useRestaurantData } from "../../context/RestaurantContext";
import "./RestaurantMenu.css";

export default function RestaurantMenu() {
  const { menuItems, categories } = useRestaurantData();
  const [formOpen, setFormOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  const available = menuItems.filter((f) => f.isAvailable).length;
  const unavailable = menuItems.length - available;

  function openAddForm() {
    setEditingFood(null);
    setFormOpen(true);
  }

  function openEditForm(food) {
    setEditingFood(food);
    setFormOpen(true);
  }

  return (
    <div className="fade-in">
      <PageHeader
        icon={UtensilsCrossed}
        title="Menu Management"
        description="Add, edit and manage the food items customers can order."
        actions={
          <Button icon={Plus} onClick={openAddForm}>
            Add Food
          </Button>
        }
      />

      <div className="rmenu__stats">
        <div className="rmenu__stat">
          <strong>{categories.length}</strong>
          <span>Categories</span>
        </div>
        <div className="rmenu__stat">
          <strong>{menuItems.length}</strong>
          <span>Total items</span>
        </div>
        <div className="rmenu__stat">
          <strong>{available}</strong>
          <span>Available</span>
        </div>
        <div className="rmenu__stat">
          <strong>{unavailable}</strong>
          <span>Unavailable</span>
        </div>
      </div>

      <MenuManager
        formOpen={formOpen}
        onCloseForm={() => setFormOpen(false)}
        editingFood={editingFood}
        onEditFood={openEditForm}
      />
    </div>
  );
}
