import { useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";
import CurrentLocationButton from "./CurrentLocationButton";
import ConfirmationDialog from "../feedback/ConfirmationDialog";
import Button from "../common/Button";
import { useAddresses } from "../../context/AddressContext";
import { useToast } from "../feedback/ToastContext";
import "./AddressSection.css";

export default function AddressSection() {
  const { addresses, selectedId, selectAddress, addAddress, updateAddress, deleteAddress } = useAddresses();
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deletingAddress, setDeletingAddress] = useState(null);

  function openAddForm() {
    setEditingAddress(null);
    setFormOpen(true);
  }

  function openEditForm(address) {
    setEditingAddress(address);
    setFormOpen(true);
  }

  function handleSave(data) {
    if (editingAddress) {
      updateAddress(editingAddress.id, data);
      toast?.showToast("Address updated", "success");
    } else {
      addAddress(data);
      toast?.showToast("Address added", "success");
    }
    setFormOpen(false);
  }

  function handleConfirmDelete() {
    deleteAddress(deletingAddress.id);
    toast?.showToast("Address deleted", "info");
    setDeletingAddress(null);
  }

  function handleCurrentLocationDetected(data) {
    const created = addAddress(data);
    selectAddress(created.id);
  }

  return (
    <div>
      {!selectedId && (
        <p className="address-section__error">
          <AlertCircle size={15} strokeWidth={2} /> Please select a delivery address
        </p>
      )}

      <CurrentLocationButton
        onDetected={handleCurrentLocationDetected}
        onUseSavedInstead={() => {}}
      />

      {addresses.map((address) => (
        <AddressCard
          key={address.id}
          address={address}
          selected={address.id === selectedId}
          onSelect={selectAddress}
          onEdit={openEditForm}
          onDelete={setDeletingAddress}
        />
      ))}

      <Button variant="ghost" icon={Plus} onClick={openAddForm} style={{ marginTop: "var(--space-2)" }}>
        Add a new address
      </Button>

      <AddressForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initialAddress={editingAddress}
      />

      <ConfirmationDialog
        open={!!deletingAddress}
        onClose={() => setDeletingAddress(null)}
        onConfirm={handleConfirmDelete}
        title="Delete this address?"
        description={deletingAddress ? `"${deletingAddress.line}" will be removed from your saved addresses.` : ""}
        confirmLabel="Delete Address"
        cancelLabel="Keep Address"
        tone="danger"
      />
    </div>
  );
}
