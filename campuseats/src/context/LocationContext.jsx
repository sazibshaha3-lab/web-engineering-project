import { createContext, useContext, useMemo } from "react";
import { useAddresses } from "./AddressContext";

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const { addresses, selectedAddress, selectAddress, isLoading, loadError } = useAddresses();

  const value = useMemo(
    () => ({
      locations: addresses,
      selected: selectedAddress,
      setSelected: (address) => selectAddress(address?.id),
      isLoading,
      loadError,
    }),
    [addresses, selectedAddress, selectAddress, isLoading, loadError]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useDeliveryLocation() {
  return useContext(LocationContext);
}
