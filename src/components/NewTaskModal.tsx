import React, { useState } from 'react';
import { X, CheckCircle2, Calculator, PlusCircle } from 'lucide-react';
import { WeeklyTask, DepartmentId, TaskPriority, TaskStatus, LanguageMode } from '../types/dashboard.ts';
import { DEPARTMENTS } from '../data/mockData.ts';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: WeeklyTask) => void;
  langMode?: LanguageMode;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  langMode = 'en',
}) => {
  // Required format fields: task, measurement, Plan, actual, performance in %, department
  const [taskNameEn, setTaskNameEn] = useState('');
  const [taskNameAm, setTaskNameAm] = useState('');
  const [measurement, setMeasurement] = useState('Pcs');
  const [planQty, setPlanQty] = useState<number | ''>(500);
  const [actualQty, setActualQty] = useState<number | ''>(425);
  const [departmentId, setDepartmentId] = useState<DepartmentId>('production');

  // Supporting metadata
  const [week, setWeek] = useState('W44');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [status, setStatus] = useState<TaskStatus>('In Progress');
  const [dueDate, setDueDate] = useState('2026-11-06');
  const [varianceNotes, setVarianceNotes] = useState('');

  if (!isOpen) return null;

  // Compute performance in % live
  const planVal = Number(planQty) || 0;
  const actualVal = Number(actualQty) || 0;
  const performanceInPct = planVal > 0 ? Number(((actualVal / planVal) * 100).toFixed(1)) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskNameEn.trim()) return;

    const newTask: WeeklyTask = {
      id: `TSK-${Math.floor(4420 + Math.random() * 80)}`,
      departmentId,
      week,
      titleEn: taskNameEn.trim(),
      titleAm: taskNameAm.trim() || taskNameEn.trim(),
      assignedTo: assignedTo.trim() || 'Floor Supervisor',
      priority,
      status: performanceInPct >= 100 ? 'Completed' : status,
      progressPercent: Math.min(100, Math.round(performanceInPct)),
      plannedQty: planVal,
      actualQty: actualVal,
      unit: measurement.trim() || 'Pcs',
      dueDate,
      completionDate: performanceInPct >= 100 ? new Date().toISOString().split('T')[0] : undefined,
      varianceNotes: varianceNotes.trim() ? varianceNotes : undefined,
    };

    onSave(newTask);
    onClose();
    // Reset form
    setTaskNameEn('');
    setTaskNameAm('');
    setPlanQty(500);
    setActualQty(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-xl w-full text-xs shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {langMode === 'am' ? 'ሳምንታዊ የስራ ምዝገባ (Weekly Task Registration)' : 'Weekly Task Registration'}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Format: [Task, Measurement, Plan, Actual, Performance in %, Department]
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Format Indicator Callout */}
          <div className="bg-blue-950/30 border border-blue-900/40 rounded p-2.5 flex items-center justify-between text-[11px] font-mono text-slate-300">
            <span className="text-blue-400 font-semibold uppercase">Standard Registration Format:</span>
            <span className="text-slate-400 text-[10px]">
              Task · Measurement · Plan · Actual · Performance in % · Department
            </span>
          </div>

          {/* 1. TASK */}
          <div>
            <label className="text-xs font-semibold text-white block mb-1">
              1. Task (ስራ / የስራ ዝርዝር) *
            </label>
            <input
              type="text"
              required
              value={taskNameEn}
              onChange={(e) => setTaskNameEn(e.target.value)}
              placeholder="e.g. CNC lathe machining of high-pressure flange adapters"
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          {/* Optional Amharic Task Name */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Task Deliverable in Amharic (አማርኛ ስራ ዝርዝር - አማራጭ)
            </label>
            <input
              type="text"
              value={taskNameAm}
              onChange={(e) => setTaskNameAm(e.target.value)}
              placeholder="e.g. የከፍተኛ ግፊት ፍላንጅ ሌዝ ቅርጽ ስራ"
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-white focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          {/* 2. MEASUREMENT, 3. PLAN, 4. ACTUAL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 2. MEASUREMENT */}
            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                2. Measurement (መለኪያ) *
              </label>
              <select
                value={measurement}
                onChange={(e) => setMeasurement(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs font-mono"
              >
                <option value="Pcs">Pcs (ቁራጭ)</option>
                <option value="Units">Units (አሃድ)</option>
                <option value="Batches">Batches (ባች/ቡድን)</option>
                <option value="Frames">Frames (ማዕቀፍ)</option>
                <option value="Shells">Shells (ሼል)</option>
                <option value="Hours">Hours (ሰዓት)</option>
                <option value="Meters">Meters (ሜትር)</option>
                <option value="Tons">Tons (ቶን)</option>
                <option value="Sets">Sets (ስብስብ)</option>
              </select>
            </div>

            {/* 3. PLAN */}
            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                3. Plan (ዕቅድ) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={planQty}
                onChange={(e) => setPlanQty(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="500"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono text-xs tabular-nums"
              />
            </div>

            {/* 4. ACTUAL */}
            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                4. Actual (ክንውን) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={actualQty}
                onChange={(e) => setActualQty(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="425"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono text-xs tabular-nums"
              />
            </div>
          </div>

          {/* 5. PERFORMANCE IN % (Live Computed) & 6. DEPARTMENT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 5. PERFORMANCE IN % */}
            <div className="bg-slate-950/80 border border-slate-800 rounded p-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-white flex items-center gap-1">
                  <Calculator className="w-3.5 h-3.5 text-blue-400" />
                  5. Performance in % (አፈጻጸም በ%)
                </span>
                <span className="font-mono text-xs text-slate-400">Actual / Plan</span>
              </div>

              <div className="flex items-baseline justify-between mt-1 mb-2">
                <span
                  className={`text-xl font-bold font-mono tabular-nums ${
                    performanceInPct >= 100
                      ? 'text-emerald-400'
                      : performanceInPct >= 75
                      ? 'text-blue-400'
                      : 'text-amber-400'
                  }`}
                >
                  {performanceInPct}%
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {actualVal} / {planVal} {measurement}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className={`h-2 rounded-full transition-all ${
                    performanceInPct >= 100
                      ? 'bg-emerald-500'
                      : performanceInPct >= 75
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, performanceInPct)}%` }}
                />
              </div>
            </div>

            {/* 6. DEPARTMENT */}
            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                6. Department (ክፍል) *
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {langMode === 'am' ? d.nameAm : `${d.nameEn} (${d.nameAm})`}
                  </option>
                ))}
              </select>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Tracking Week</label>
                  <select
                    value={week}
                    onChange={(e) => setWeek(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-[11px] font-mono"
                  >
                    <option value="W44">Week 44 (Current)</option>
                    <option value="W45">Week 45</option>
                    <option value="W46">Week 46</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Priority Tag</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-[11px]"
                  >
                    <option value="Urgent">Urgent (አስቸኳይ)</option>
                    <option value="Critical">Critical (ወሳኝ)</option>
                    <option value="High">High (ከፍተኛ)</option>
                    <option value="Medium">Medium (መካከለኛ)</option>
                    <option value="Low">Low (ዝቅተኛ)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Auxiliary Owner and Due Date */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Assigned Lead / Engineer</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="e.g. Eng. Dawit Alemayehu"
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
              />
            </div>
          </div>

          {/* Variance / Operational Note */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Variance / Remark Note</label>
            <input
              type="text"
              value={varianceNotes}
              onChange={(e) => setVarianceNotes(e.target.value)}
              placeholder="e.g. Batch delivered on schedule with zero defect"
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{langMode === 'am' ? 'ስራውን መዝግብ' : 'Register Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
