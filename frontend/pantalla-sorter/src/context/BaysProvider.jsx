import { createContext, useContext, useState, useRef, useCallback } from "react";
import { BELT_HOLD_MS } from "../utils/constants";

const BaysContext = createContext(null);

export function useBaysContext() {
  const ctx = useContext(BaysContext);
  if (!ctx) throw new Error("useBaysContext debe usarse dentro de <BaysProvider>");
  return ctx;
}

export function BaysProvider({ children }) {
  const [bayPkgs, setBayPkgs] = useState({ 1: [], 2: [], 3: [] });
  const [bayErrors, setBayErrors] = useState({ 1: [], 2: [], 3: [] });
  const [lastBelt, setLastBelt] = useState({ 1: null, 2: null, 3: null });
  const [lastOperation, setLastOperation] = useState({ 1: null, 2: null, 3: null });
  const [animKeys, setAnimKeys] = useState({ 1: 0, 2: 0, 3: 0 });

  const beltTimers = useRef({ 1: null, 2: null, 3: null });
  const opTimers = useRef({ 1: null, 2: null, 3: null });

  const processBay = useCallback((pkg) => {
    if (pkg.bayId) {
      setAnimKeys(prev => ({ ...prev, [pkg.bayId]: prev[pkg.bayId] + 1 }));
    }

    if (pkg.bayId && pkg.bayId > 0 && pkg.status === "LLEGADA_BAHIA") {
      setBayPkgs(prev => {
        const bayList = prev[pkg.bayId] || [];
        const filtered = bayList.filter(p => p.pkgId !== pkg.pkgId);
        return { ...prev, [pkg.bayId]: [pkg, ...filtered].slice(0, 100) };
      });
    }

    if (pkg.isError && pkg.status === "LLEGADA_BAHIA" && pkg.bayId) {
      setBayErrors(prev => {
        const list = prev[pkg.bayId] || [];
        if (list.some(p => p.pkgId === pkg.pkgId)) return prev;
        return { ...prev, [pkg.bayId]: [pkg, ...list].slice(0, 50) };
      });
    }

    if (pkg.status === "LLEGADA_BAHIA" && pkg.bayId) {
      if (beltTimers.current[pkg.bayId]) clearTimeout(beltTimers.current[pkg.bayId]);
      setLastBelt(prev => ({ ...prev, [pkg.bayId]: pkg }));
      beltTimers.current[pkg.bayId] = setTimeout(() => {
        setLastBelt(prev => ({ ...prev, [pkg.bayId]: null }));
      }, BELT_HOLD_MS);
    }

    if (pkg.bayId) {
      if (opTimers.current[pkg.bayId]) clearTimeout(opTimers.current[pkg.bayId]);
      setLastOperation(prev => ({ ...prev, [pkg.bayId]: pkg }));
      opTimers.current[pkg.bayId] = setTimeout(() => {
        setLastOperation(prev => ({ ...prev, [pkg.bayId]: null }));
      }, BELT_HOLD_MS);
    }
  }, []);

  return (
    <BaysContext.Provider value={{ bayPkgs, bayErrors, lastBelt, lastOperation, animKeys, processBay }}>
      {children}
    </BaysContext.Provider>
  );
}
