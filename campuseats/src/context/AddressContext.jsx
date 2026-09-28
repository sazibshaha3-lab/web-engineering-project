import { createContext, useContext, useMemo, useState } from "react";
import { initialAddresses } from "../data/addresses";

const AddressContext = createContext(null);

export function AddressProvider({ children }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [selectedId, setSelectedId] = useState(
    initialAddresses.find((a) => a.isDefault)?.id || initialAddresses[0]?.id || null
  );

  function addAddress(data) {
    const id = `addr${Date.now()}`;
    const isFirst = addresses.length === 0;
    const newAddress = { id, isDefault: isFirst, ...data };
    setAddresses((prev) => [...prev, newAddress]);
    setSelectedId(id);
    return newAddress;
  }

  function updateAddress(id, data) {
    setAddresses((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
  }

  function deleteAddress(id) {
    setAddresses((prev) => {
      const deleted = prev.find((a) => a.id === id);
      let next = prev.filter((a) => a.id !== id);
      // If the deleted address was the default, promote the next one so
      // there's always exactly one default address (when any remain).
      if (deleted?.isDefault && next.length > 0 && !next.some((a) => a.isDefault)) {
        next = next.map((a, i) => (i === 0 ? { ...a, isDefault: true } : a));
      }
      if (selectedId === id) {
        setSelectedId(next[0]?.id || null);
      }
      return next;
    });
  }

  function selectAddress(id) {
    setSelectedId(id);
  }

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedId) || null,
    [addresses, selectedId]
  );

  const value = {
    addresses,
    selectedId,
    selectedAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    selectAddress,
  };

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
}

export function useAddresses() {
  return useContext(AddressContext);
}
