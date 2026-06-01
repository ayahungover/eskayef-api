import { useState } from "react";
import AppNav, { type AppTab } from "./components/AppNav";
import ItemsDashboard from "./pages/ItemsDashboard";
import RequisitionsDashboard from "./pages/RequisitionsDashboard";

export default function App() {
  const [tab, setTab] = useState<AppTab>("requisitions");

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav active={tab} onChange={setTab} />
      {tab === "requisitions" ? (
        <RequisitionsDashboard />
      ) : (
        <ItemsDashboard />
      )}
    </div>
  );
}
