import { HybridDispatchGantt } from "@/components/HybridDispatchGantt";

export default function DispatchCalendarPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Dispatch Gantt Calendar & Scheduling Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time conflict detection with PostgreSQL TSTZRANGE GiST exclusion on assets and certified operators.
          </p>
        </div>
      </div>

      <HybridDispatchGantt />
    </div>
  );
}
