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
  const { addresses, selectedId, selectAddress, addAddress, updateAddress, deleteAddress, isLoading, loadError } = useAddresses();
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

  async function handleSave(data) {
    const result = editingAddress ? await updateAddress(editingAddress.id, data) : await addAddress(data);
    if (!result.success) {
      toast?.showToast(result.message, "error");
      return;
    }
    toast?.showToast(editingAddress ? "Address updated" : "Address added", "success");
    setFormOpen(false);
  }

  async function handleConfirmDelete() {
    const result = await deleteAddress(deletingAddress.id);
    if (!result.success) {
      toast?.showToast(result.message, "error");
      return;
    }
    toast?.showToast("Address deleted", "info");
    setDeletingAddress(null);
  }

  async function handleCurrentLocationDetected(data) {
    const result = await addAddress(data);
    if (result.success) {
      selectAddress(result.address.id);
    } else {
      toast?.showToast(result.message, "error");
    }
    return result;
  }

  async function handleSetDefault(address) {
    const result = await updateAddress(address.id, { ...address, isDefault: true });
    if (result.success) toast?.showToast("Default address updated", "success");
    else toast?.showToast(result.message, "error");
  }

  return (
    <div>
      {!selectedId && (
        <p className="address-section__error">
          <AlertCircle size={15} strokeWidth={2} /> Please select a delivery address
        </p>
      )}

      {isLoading && <p role="status">Loading addresses...</p>}
      {loadError && <p role="alert">{loadError}</p>}
      {!isLoading && !loadError && addresses.length === 0 && (
        <p className="address-section__error">You have no saved addresses yet. Add an address to continue.</p>
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
          onSetDefault={handleSetDefault}
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
