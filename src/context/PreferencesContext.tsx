import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "@/lib/profile";
import type { TempUnit, WindUnit } from "@/lib/units";

interface PreferencesValue {
  unit: TempUnit;
  windUnit: WindUnit;
  setUnit: (next: TempUnit) => Promise<void>;
  setWindUnit: (next: WindUnit) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesValue | null>(null);

// Unit choices start from the signed-in profile and are saved back to it on change.
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [unit, setUnitState] = useState<TempUnit>("C");
  const [windUnit, setWindUnitState] = useState<WindUnit>("kmh");

  useEffect(() => {
    if (!profile) return;
    setUnitState(profile.temperature_unit);
    setWindUnitState(profile.wind_unit);
  }, [profile]);

  const setUnit = useCallback(
    async (next: TempUnit) => {
      setUnitState(next);
      if (user) await updateProfile(user.id, { temperature_unit: next });
    },
    [user]
  );

  const setWindUnit = useCallback(
    async (next: WindUnit) => {
      setWindUnitState(next);
      if (user) await updateProfile(user.id, { wind_unit: next });
    },
    [user]
  );

  const value = useMemo(
    () => ({ unit, windUnit, setUnit, setWindUnit }),
    [unit, windUnit, setUnit, setWindUnit]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesValue {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("usePreferences must be used inside PreferencesProvider");
  return context;
}
