import { BAY_STORES, GARMENTS, COLORS_DATA, SIZES } from "../utils/constants";

let pkgSeq = 1;
const pendingEvents = [];

function enqueuePackageLifecycle(bayId) {
  const storePool = BAY_STORES[bayId];
  const store = storePool[Math.floor(Math.random() * storePool.length)];
  const garment = GARMENTS[Math.floor(Math.random() * GARMENTS.length)];
  const rows = [];

  const numItems = Math.floor(Math.random() * 3) + 3;
  for (let s = 1; s <= numItems; s++) {
    const col = COLORS_DATA[Math.floor(Math.random() * COLORS_DATA.length)];
    const sz = SIZES[Math.floor(Math.random() * SIZES.length)];
    rows.push({
      id: `${garment.baseId}-${store}-${String(s).padStart(3, "0")}`,
      name: garment.name,
      color: col,
      size: sz,
      qty: Math.floor(Math.random() * 8) + 2
    });
  }

  const pkgId = `PKG-${String(pkgSeq++).padStart(5, "0")}`;
  const isError = Math.random() < 0.08; // 8% simulates misdirected packages for error UI testing
  const now = Date.now();

  let actualBay = bayId;
  let intendedBay = null;
  if (isError) {
    intendedBay = bayId;
    const otherBays = [1, 2, 3].filter(b => b !== bayId);
    actualBay = otherBays[Math.floor(Math.random() * otherBays.length)];
  }

  const basePkg = { pkgId, store, bayId: actualBay, intendedBay, garment, isError, rows };
  pendingEvents.push(
    { ...basePkg, status: "ENTRADA_SORTER", ts: now },
    { ...basePkg, status: "LLEGADA_BAHIA", ts: now + 2000 }
  );
}

export function generateMockPackage(bayId) {
  if (pendingEvents.length === 0) {
    enqueuePackageLifecycle(bayId);
  }
  return pendingEvents.shift();
}
