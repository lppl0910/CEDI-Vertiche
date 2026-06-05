import { createContext, useContext, useState, useRef, useCallback } from "react";
import { BELT_HOLD_MS } from "../utils/constants";

const SorterContext = createContext(null);

export function useSorterContext() {
  const ctx = useContext(SorterContext);
  if (!ctx) throw new Error("useSorterContext debe usarse dentro de <SorterProvider>");
  return ctx;
}

export function SorterProvider({ children }) {
  const [allPkgs, setAllPkgs] = useState([]);
  const [lastEntry, setLastEntry] = useState(null);
  const [animKeySorter, setAnimKeySorter] = useState(0);
  const [ppm, setPpm] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [startTime] = useState(Date.now());

  const entryTimer = useRef(null);

  const processEntry = useCallback((pkg) => {
    setAnimKeySorter(prev => prev + 1);

    setTotalCount(prev => {
      const newTotal = prev + 1;
      const elapsedMins = (Date.now() - startTime) / 60000;
      if (elapsedMins > 0.05) {
        setPpm(Math.round(newTotal / elapsedMins));
      }
      return newTotal;
    });

    setAllPkgs(prev => [pkg, ...prev].slice(0, 100));

    if (entryTimer.current) clearTimeout(entryTimer.current);
    setLastEntry(pkg);
    entryTimer.current = setTimeout(() => {
      setLastEntry(null);
    }, BELT_HOLD_MS);
  }, [startTime]);

  return (
    <SorterContext.Provider value={{ allPkgs, lastEntry, animKeySorter, ppm, processEntry }}>
      {children}
    </SorterContext.Provider>
  );
}
