import { useState } from "react";
import "./index.css";
import "./App.css";
import { BAY_COLORS, BAYS } from "./utils/constants";

import { SorterScreen } from "./screens/SorterScreen";
import { OperationScreen } from "./screens/OperationScreen";
import { StoreConveyorScreen } from "./screens/StoreConveyorScreen";
import { BayConveyorScreen } from "./screens/BayConveyorScreen";

const mainTabs = [
  { key: "sorter", label: "SORTER GLOBAL" },
  ...BAYS.map(b => ({ key: `bay${b.id}`, label: b.label }))
];

const subTabs = [
  { key: "beltMain", label: "CINTA SORTER" },
  { key: "beltP1", label: "CINTA PERSONA 1" },
  { key: "beltP2", label: "CINTA PERSONA 2" },
  { key: "beltP3", label: "CINTA PERSONA 3" },
  { key: "dashboard", label: "DASHBOARD" }
];

export default function App() {
  const [view, setView] = useState("sorter");
  const [subView, setSubView] = useState("beltMain");

  const activeBay = view !== "sorter"
    ? BAYS.find(b => b.id === Number(view.replace("bay", "")))
    : null;

  return (
    <div className="app-container">
      <div className="main-tabs-container">
        {mainTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setView(tab.key); setSubView("beltMain"); }}
            className={`main-tab ${view === tab.key ? "active" : ""} ${tab.key}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeBay && (
        <div className="sub-tabs-container">
          {subTabs.map(sub => (
            <button
              key={sub.key}
              onClick={() => setSubView(sub.key)}
              className={`sub-tab ${subView === sub.key ? "active" : ""}`}
              style={subView === sub.key
                ? { background: BAY_COLORS[activeBay.id] + "11", color: BAY_COLORS[activeBay.id] }
                : {}}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}

      <div className="screens-container">
        {view === "sorter" && <SorterScreen />}
        {activeBay && subView === "beltMain" && <BayConveyorScreen bay={activeBay} />}
        {activeBay && subView === "beltP1" && <StoreConveyorScreen bay={activeBay} personIdx={0} />}
        {activeBay && subView === "beltP2" && <StoreConveyorScreen bay={activeBay} personIdx={1} />}
        {activeBay && subView === "beltP3" && <StoreConveyorScreen bay={activeBay} personIdx={2} />}
        {activeBay && subView === "dashboard" && <OperationScreen bay={activeBay} />}
      </div>
    </div>
  );
}
