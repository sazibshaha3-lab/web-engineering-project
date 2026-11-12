import Switch from "../common/Switch";
import { useRestaurantData } from "../../context/RestaurantContext";
import { useToast } from "../feedback/ToastContext";
import "./RestaurantStatusToggle.css";

export default function RestaurantStatusToggle() {
  const { isOpen, toggleOpen } = useRestaurantData();
  const toast = useToast();

  function handleToggle() {
    toggleOpen();
    toast?.showToast(isOpen ? "Restaurant is now closed" : "Restaurant is now open", "success");
  }

  return (
    <div className={`rstatus-toggle ${isOpen ? "rstatus-toggle--open" : "rstatus-toggle--closed"}`}>
      <div>
        <p className="rstatus-toggle__title">
          <span className="rstatus-toggle__dot" />
          <span>Restaurant is {isOpen ? "Open" : "Closed"}</span>
          <span className="rstatus-toggle__badge">{isOpen ? "Accepting Orders" : "Paused"}</span>
        </p>
        <p className="rstatus-toggle__desc">
          {isOpen
            ? "Students and campus customers can place new orders right now."
            : "Your menu stays visible, but customer checkout is temporarily paused."}
        </p>
      </div>
      <Switch checked={isOpen} onChange={handleToggle} label="Toggle restaurant open status" />
    </div>
  );
}
