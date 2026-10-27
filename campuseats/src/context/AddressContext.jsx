import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { apiErrorMessage } from "../services/api";
import { useAuth } from "./AuthContext";
import { normalizeAddress, toAddressPayload } from "../services/orderApi";

const AddressContext = createContext(null);

const fail = (err, fallback) => ({ success: false, message: apiErrorMessage(err, fallback) });

export function AddressProvider({ children }) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const isCustomer = user?.role === "customer";

  // Prefer the newly created address, otherwise keep the current selection,
  // then fall back to the default address and finally the first address.
  const load = useCallback(async (preferId) => {
    setLoadError("");
    try {
      const { data } = await api.get("/addresses");
      const list = data.map(normalizeAddress);
      setAddresses(list);
      setSelectedId((current) => {
        const wanted = preferId ?? current;
        if (wanted && list.some((a) => a.id === wanted)) return wanted;
        return list.find((a) => a.isDefault)?.id ?? list[0]?.id ?? null;
      });
      return list;
    } catch (err) {
      setLoadError(apiErrorMessage(err, "Could not load your addresses."));
      throw err;
    }
  }, []);

  useEffect(() => {
    if (!isCustomer) {
      setAddresses([]);
      setSelectedId(null);
      setIsLoading(false);
      setLoadError("");
      return;
    }
    setIsLoading(true);
    load().catch(() => {}).finally(() => setIsLoading(false));
  }, [isCustomer, user?.id, load]);

  async function addAddress(data) {
    try {
      const { data: created } = await api.post("/addresses", toAddressPayload(data));
      const address = normalizeAddress(created);
      await load(address.id);
      return { success: true, address };
    } catch (err) {
      return fail(err, "Could not save the address.");
    }
  }

  async function updateAddress(id, data) {
    try {
      await api.put(`/addresses/${id}`, toAddressPayload(data));
      await load();
      return { success: true };
    } catch (err) {
      return fail(err, "Could not update the address.");
    }
  }

  async function deleteAddress(id) {
    try {
      await api.delete(`/addresses/${id}`);
      await load();
      return { success: true };
    } catch (err) {
      return fail(err, "Could not delete the address.");
    }
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
    isLoading,
    loadError,
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
