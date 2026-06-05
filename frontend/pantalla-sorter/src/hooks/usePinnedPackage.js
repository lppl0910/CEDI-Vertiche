import { useState } from "react";

export function usePinnedPackage() {
  const [pinnedPkg, setPinnedPkg] = useState(null);
  const handlePkgClick = (pkg) =>
    setPinnedPkg(prev => prev?.pkgId === pkg.pkgId ? null : pkg);
  return { pinnedPkg, setPinnedPkg, handlePkgClick };
}
