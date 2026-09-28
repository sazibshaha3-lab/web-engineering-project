import { createContext, useContext, useMemo, useState } from "react";
import { savedLocations as initialLocations } from "../data/locations";

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [locations, setLocations] = useState(initialLocations);
  const [selected, setSelected] = useState(initialLocations.find((l) => l.isDefault) || initialLocations[0]);

  function addLocation(label) {
    const loc = { id: `l${Date.now()}`, label, isDefault: false };
    setLocations((prev) => [...prev, loc]);
    return loc;
  }

  const value = useMemo(
    () => ({ locations, selected, setSelected, addLocation }),
    [locations, selected]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useDeliveryLocation() {
  return useContext(LocationContext);
}
