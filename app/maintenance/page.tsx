"use client";

import React, { useState, useEffect } from "react";
import {
  Wrench,
  ShieldAlert,
  CheckCircle,
  Clock,
  MapPin,
  Truck,
  Plus,
  ArrowRight,
  User,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { MaintenanceSchedule } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function MaintenanceKanbanPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/maintenance");
      const json = await res.json();
      if (json.success) {
        setTasks(json.data);
      }
    } catch (err) {
      console.error("Maintenance fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const moveTaskStatus = async (taskId: string, newStatus: "open" | "in_progress" | "completed") => {
    try {
      const res = await fetch("/api/v1/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taskId,
          status: newStatus,
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchTasks();
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const columns = [
    { id: "open", title: "Open / Interlock Engaged", color: "border-[#df2531]/60 text-[#df2531]" },
    { id: "in_progress", title: "In Progress / Mechanic Dispatched", color: "border-neutral-700 text-neutral-300" },
    { id: "completed", title: "Completed / Lock Cleared", color: "border-emerald-500/40 text-emerald-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#df2531]/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 font-display">
            <Wrench className="text-[#df2531]" size={24} />
            Preventative Workshop & Field Service Kanban
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-sans">
            Tracking 5,000 KM (Passenger Cars) & 250 Engine Hours (Heavy Machinery). Central Garage & Mobile Field Dispatches.
          </p>
        </div>

        <button
          onClick={fetchTasks}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0a0a0a] border border-[#df2531]/30 text-white hover:border-[#df2531] text-xs font-semibold font-display transition-colors"
        >
          <RotateCcw size={14} className="text-[#df2531]" />
          Refresh Service Board
        </button>
      </div>

      {/* 3-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-sans">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className="rounded-2xl border border-[#df2531]/20 bg-[#0a0a0a] p-4 flex flex-col space-y-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                <span className={cn("text-xs font-bold uppercase tracking-wider font-display", col.color)}>
                  {col.title}
                </span>
                <span className="text-[10px] bg-neutral-900 text-neutral-300 border border-neutral-700 px-2 py-0.5 rounded-full font-mono">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {colTasks.map((task) => {
                  const isLock = task.isSafetyCriticalLock;
                  const asset = task.asset;

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={cn(
                        "p-4 rounded-xl border bg-neutral-950/80 hover:bg-neutral-900 transition-all cursor-pointer space-y-2.5 relative group",
                        isLock
                          ? "border-[#df2531]/80 ring-1 ring-[#df2531]/40"
                          : "border-neutral-800 hover:border-[#df2531]/30"
                      )}
                    >
                      {/* Safety Lock Badge */}
                      {isLock && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded-md w-fit font-display">
                          <ShieldAlert size={12} />
                          SAFETY-CRITICAL ENGINE LOCK ENGAGED
                        </div>
                      )}

                      <div>
                        <div className="font-bold text-white text-xs flex items-center justify-between">
                          <span className="font-display">{asset?.make} {asset?.model}</span>
                          <span className="font-mono text-neutral-400 text-[10px]">{asset?.plateNumber}</span>
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          Service Type: <span className="text-[#df2531] font-semibold capitalize">{task.serviceType.replace("_", " ")}</span>
                        </div>
                      </div>

                      {/* Meter Progress */}
                      <div className="bg-black/60 p-2.5 rounded-lg border border-neutral-800 text-[10px] space-y-1">
                        <div className="flex justify-between text-neutral-400">
                          <span>Current Meter: <span className="text-white font-bold">{asset?.currentMeterReading}</span></span>
                          <span>Next Service: <span className="text-[#df2531] font-bold">{task.nextServiceMeter}</span></span>
                        </div>
                        <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              isLock ? "bg-[#df2531] w-full" : "bg-[#df2531] w-3/4"
                            )}
                          />
                        </div>
                      </div>

                      <p className="text-[11px] text-neutral-300 leading-relaxed italic">
                        "{task.mechanicNotes || "Routine 250hr / 5,000km preventative service."}"
                      </p>

                      <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px]">
                        <span className="text-neutral-400 flex items-center gap-1">
                          <User size={12} className="text-[#df2531]" />
                          {task.mechanicName || "Fitsum Tadesse"}
                        </span>

                        {/* State Transition Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          {col.id === "open" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveTaskStatus(task.id, "in_progress");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#df2531]/20 text-[#df2531] hover:bg-[#df2531]/30 font-semibold font-display"
                            >
                              Dispatch Mechanic →
                            </button>
                          )}
                          {col.id === "in_progress" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveTaskStatus(task.id, "completed");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold font-display"
                            >
                              Sign & Clear Lock ✓
                            </button>
                          )}
                          {col.id === "completed" && (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1 font-display">
                              <CheckCircle size={12} /> Closed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
