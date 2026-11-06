import React, { useState } from 'react';
import { X, Target, PlusCircle, Calendar, User, Layers, Lock } from 'lucide-react';
import { WeeklyTask, DepartmentId, TaskPriority, LanguageMode } from '../types/dashboard.ts';
import { DEPARTMENTS } from '../data/mockData.ts';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: WeeklyTask) => void;
  langMode?: LanguageMode;
  tasks?: WeeklyTask[];
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  langMode = 'en',
  tasks = [],
}) => {
  // Pure Planning inputs
  const [taskNameEn, setTaskNameEn] = useState('');
  const [taskNameAm, setTaskNameAm] = useState('');
  const [measurement, setMeasurement] = useState('Pcs');
  const [planQty, setPlanQty] = useState<number | ''>(500);
  const [departmentId, setDepartmentId] = useState<DepartmentId>('production');

  // Supporting planning metadata
  const [week, setWeek] = useState('W44');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [blockedBy, setBlockedBy] = useState<string>('');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  if (!isOpen) return null;

  const planVal = Number(planQty) || 1;

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
      status: 'Planned', // Standard baseline status: Execution starts with 'Start' action
      progressPercent: 0,
      plannedQty: planVal,
      actualQty: 0, // Execution output is logged separately later!
      unit: measurement.trim() || 'Pcs',
      startDate,
      endDate,
      dueDate: endDate,
      blockedBy: blockedBy.trim() || undefined,
    };

    onSave(newTask);
    onClose();
    // Reset form
    setTaskNameEn('');
    setTaskNameAm('');
    setPlanQty(500);
    setAssignedTo('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-blue-900/60 rounded-xl max-w-xl w-full text-xs shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-blue-950/30 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {langMode === 'am' ? 'አዲስ እቅድ መዝግብ (Register Plan Target)' : 'Register Plan Target (እቅድ)'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {langMode === 'am' 
                  ? 'የታቀደውን የስራ ግብ ብቻ ያስገቡ · ሳምንታዊ ክንውን (Execution) ስራው ከተከናወነ በኋላ በተናጠል ይመዘገባል' 
                  : 'Define target deliverables and baseline quantities. Floor execution is logged separately later.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Phase 1 Indicator Callout */}
          <div className="bg-blue-950/40 border border-blue-900/50 rounded-lg p-3 text-[11px] text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-blue-300 font-semibold uppercase">Phase 1: Planning Baseline</span>
            </div>
            <span className="text-slate-400 text-[10px]">
              Actual output (ክንውን) is intentionally separated for later logging
            </span>
          </div>

          {/* 1. Deliverable Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-white block">
              1. Task Deliverable Scope (የስራው ዝርዝር) *
            </label>
            <input
              type="text"
              required
              value={taskNameEn}
              onChange={(e) => setTaskNameEn(e.target.value)}
              placeholder="e.g. Precision CNC lathe turning of 45# carbon steel drive shafts"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
            />
            <input
              type="text"
              value={taskNameAm}
              onChange={(e) => setTaskNameAm(e.target.value)}
              placeholder="የስራው ዝርዝር በአማርኛ (አማራጭ)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          {/* 2. Department & Week */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-white block mb-1">
                2. Department (ክፍል) *
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value as DepartmentId)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-white block mb-1">
                Evaluation Week
              </label>
              <input
                type="text"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                placeholder="e.g. W44"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs font-mono"
              />
            </div>
          </div>

          {/* 3. Measurement Unit & Planned Target Qty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div>
              <label className="text-[11px] font-semibold text-white block mb-1">
                3. Unit of Measure (መለኪያ) *
              </label>
              <input
                type="text"
                required
                value={measurement}
                onChange={(e) => setMeasurement(e.target.value)}
                placeholder="Pcs, Sets, Hrs, Tons, ETB"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-blue-400 block mb-1">
                4. Target Planned Qty (እቅድ መጠን) *
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={planQty}
                onChange={(e) => setPlanQty(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="500"
                className="w-full bg-slate-900 border border-blue-500/60 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400 text-xs font-mono font-bold text-base"
              />
            </div>
          </div>

          {/* 4. Assigned Lead, Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-white block mb-1">
                Assigned Lead (ኃላፊ)
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Supervisor name"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-white block mb-1">
                Priority (ቅድሚያ)
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value="Critical">Critical (ወሳኝ)</option>
                <option value="Urgent">Urgent (አስቸኳይ)</option>
                <option value="High">High (ከፍተኛ)</option>
                <option value="Medium">Medium (መካከለኛ)</option>
                <option value="Low">Low (ዝቅተኛ)</option>
              </select>
            </div>
          </div>

          {/* Blocked By (Predecessor Task Dependency) */}
          <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg space-y-1">
            <label className="text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Blocked By / Predecessor Task (አስቀድሞ መጠናቀቅ ያለበት ስራ ጥገኝነት)</span>
            </label>
            <p className="text-[10px] text-slate-400">
              {langMode === 'am' 
                ? 'ይህ ስራ ከመጀመሩ በፊት መጠናቀቅ ያለበትን የቀደመ ስራ ይምረጡ' 
                : 'Select the predecessor deliverable that must be completed before this task can start execution.'}
            </p>
            <select
              value={blockedBy}
              onChange={(e) => setBlockedBy(e.target.value)}
              className="w-full bg-slate-950 border border-amber-700/60 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
            >
              <option value="">None - Independent Task (ገለልተኛ ስራ)</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id}: {t.titleEn.slice(0, 40)}... [{t.status}]
                </option>
              ))}
            </select>
          </div>

          {/* 5. Date Range: Start Date to End Date */}
          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-blue-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Execution Timeframe (የስራ ጊዜ ወሰን: ከመጀመሪያ እስከ ማጠናቀቂያ ቀን) *</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {startDate && endDate ? `${Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24)) + 1)} days duration` : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-medium text-slate-300 block mb-1">
                  Start Date (የሚጀመርበት ቀን) *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-medium text-slate-300 block mb-1">
                  End Date / Due Date (የማጠናቀቂያ ቀን) *
                </label>
                <input
                  type="date"
                  required
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {langMode === 'am' ? 'ይቅር (Cancel)' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-lg shadow-blue-900/40 cursor-pointer"
            >
              <Target className="w-3.5 h-3.5" />
              <span>{langMode === 'am' ? 'እቅዱን መዝግብ (Save Plan Target)' : 'Save Plan Target'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
