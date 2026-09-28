import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import CustomerSearch from "../customer/CustomerSearch";
import FoodManagerCard from "./FoodManagerCard";
import FoodForm from "./FoodForm";
import DeleteFoodDialog from "./DeleteFoodDialog";
import RestaurantEmptyState from "./RestaurantEmptyState";
import { useRestaurantData } from "../../context/RestaurantContext";
import { useToast } from "../feedback/ToastContext";
import "./MenuManager.css";

const filterTabs = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
  { value: "popular", label: "Popular" },
];

export default function MenuManager({ formOpen, onCloseForm, editingFood, onEditFood }) {
  const { menuItems, addFood, updateFood, deleteFood, toggleFoodAvailability, toggleFoodPopular } = useRestaurantData();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [deletingFood, setDeletingFood] = useState(null);

  const filtered = useMemo(() => {
    return menuItems.filter((f) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q);
      const matchesFilter =
        filter === "all" ||
        (filter === "available" && f.isAvailable) ||
        (filter === "unavailable" && !f.isAvailable) ||
        (filter === "popular" && f.isPopular);
      return matchesQuery && matchesFilter;
    });
  }, [menuItems, query, filter]);

  function handleSaveFood(data) {
    if (editingFood) {
      updateFood(editingFood.id, data);
      toast?.showToast("Food item updated", "success");
    } else {
      addFood(data);
      toast?.showToast("Food item added", "success");
    }
    onCloseForm();
  }

  function handleConfirmDelete() {
    deleteFood(deletingFood.id);
    toast?.showToast("Food item deleted", "info");
    setDeletingFood(null);
  }

  function handleToggleAvailable(id) {
    toggleFoodAvailability(id);
    toast?.showToast("Food availability updated", "success");
  }

  function handleTogglePopular(id) {
    toggleFoodPopular(id);
  }

  return (
    <div>
      <div className="menu-manager__toolbar">
        <div className="menu-manager__search">
          <CustomerSearch value={query} onChange={setQuery} placeholder="Search your menu" size="sm" />
        </div>
        <div className="menu-manager__filters">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              className={`menu-manager__filter ${filter === tab.value ? "is-active" : ""}`}
              onClick={() => setFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <RestaurantEmptyState
          icon={SearchX}
          title="No food items found"
          description="Try another search term or clear the filters."
        />
      ) : (
        <div className="menu-manager__list" key={`${filter}-${query}`}>
          {filtered.map((food) => (
            <FoodManagerCard
              key={food.id}
              food={food}
              onEdit={onEditFood}
              onDelete={setDeletingFood}
              onToggleAvailable={handleToggleAvailable}
              onTogglePopular={handleTogglePopular}
            />
          ))}
        </div>
      )}

      <FoodForm open={formOpen} onClose={onCloseForm} onSave={handleSaveFood} initialFood={editingFood} />
      <DeleteFoodDialog
        open={!!deletingFood}
        onClose={() => setDeletingFood(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
