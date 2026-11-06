import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Calculator, Edit3, Trash2, Save, Calendar, User, Layers, Lock } from 'lucide-react';
import { WeeklyTask, DepartmentId, TaskPriority, TaskStatus, LanguageMode } from '../types/dashboard.ts';
import { DEPARTMENTS } from '../data/mockData.ts';

interface EditTaskModalProps {
  isOpen: boolean;
  task: WeeklyTask | null;
  onClose: () => void;
  onSave: (updatedTask: WeeklyTask) => void;
  onDelete?: (taskId: string) => void;
  langMode?: LanguageMode;
  tasks?: WeeklyTask[];
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  task,
  onClose,
  onSave,
  onDelete,
  langMode = 'en',
  tasks = [],
}) => {
  const [taskNameEn, setTaskNameEn] = useState('');
  const [taskNameAm, setTaskNameAm] = useState('');
  const [measurement, setMeasurement] = useState('Pcs');
  const [planQty, setPlanQty] = useState<number | ''>(0);
  const [actualQty, setActualQty] = useState<number | ''>(0);
  const [departmentId, setDepartmentId] = useState<DepartmentId>('production');
  const [week, setWeek] = useState('W44');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [blockedBy, setBlockedBy] = useState<string>('');
  const [status, setStatus] = useState<TaskStatus>('In Progress');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [actualStartDate, setActualStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [varianceNotes, setVarianceNotes] = useState('');

  // Populate state when task changes
  useEffect(() => {
    if (task) {
      setTaskNameEn(task.titleEn || '');
      setTaskNameAm(task.titleAm || '');
      setMeasurement(task.unit || 'Pcs');
      setPlanQty(task.plannedQty);
      setActualQty(task.actualQty);
      setDepartmentId(task.departmentId);
      setWeek(task.week || 'W44');
      setAssignedTo(task.assignedTo || '');
      setPriority(task.priority);
      setBlockedBy(task.blockedBy || '');
      setStatus(task.status);
      setStartDate(task.startDate || task.dueDate || new Date().toISOString().split('T')[0]);
      setEndDate(task.endDate || task.dueDate || new Date().toISOString().split('T')[0]);
      setDueDate(task.dueDate || '');
      setActualStartDate(task.actualStartDate || '');
      setCompletionDate(task.completionDate || '');
      setVarianceNotes(task.varianceNotes || '');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  // Live calculation of performance in %
  const planVal = Number(planQty) || 0;
  const actualVal = Number(actualQty) || 0;
  const performanceInPct = planVal > 0 ? Number(((actualVal / planVal) * 100).toFixed(1)) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskNameEn.trim()) return;

    const finalEndDate = endDate || dueDate;
    const isCompleted = (performanceInPct >= 100 && status === 'In Progress') || status === 'Completed';

    const updatedTask: WeeklyTask = {
      ...task,
      departmentId,
      week: week.trim() || 'W44',
      titleEn: taskNameEn.trim(),
      titleAm: taskNameAm.trim() || taskNameEn.trim(),
      assignedTo: assignedTo.trim() || 'Floor Supervisor',
      priority,
      status: isCompleted ? 'Completed' : status,
      progressPercent: Math.min(100, Math.round(performanceInPct)),
      plannedQty: planVal,
      actualQty: actualVal,
      unit: measurement.trim() || 'Pcs',
      startDate: startDate || finalEndDate,
      endDate: finalEndDate,
      dueDate: finalEndDate,
      actualStartDate: status === 'In Progress' && !actualStartDate ? new Date().toISOString().split('T')[0] : (actualStartDate || undefined),
      completionDate: isCompleted ? (completionDate || new Date().toISOString().split('T')[0]) : undefined,
      varianceNotes: varianceNotes.trim() ? varianceNotes.trim() : undefined,
      blockedBy: blockedBy.trim() || undefined,
    };

    onSave(updatedTask);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && task) {
      onDelete(task.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full text-xs shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {langMode === 'am' ? 'የስራ መረጃን አስተካክል (Edit Task)' : 'Edit Task Record'}
                </h3>
                <span className="font-mono text-[10px] bg-slate-800 text-blue-400 px-2 py-0.5 rounded border border-slate-700">
                  {task.id}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {langMode === 'am' ? 'የተሳሳተ መረጃን ማረም፣ ማስተካከልና ማዘመን' : 'Correct and update operational metrics for this registered task'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Format Indicator Callout */}
          <div className="bg-blue-950/30 border border-blue-900/40 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-slate-300">
            <span className="text-blue-400 font-semibold uppercase flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              <span>Standard Format Formula:</span>
            </span>
            <span className="text-slate-400 text-[10px]">
              Task · Measurement · Plan · Actual · Performance % · Department
            </span>
          </div>

          {/* Field 1: Task Title (En & Am) */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-white block">
              1. Task Description (የስራው ዝርዝር) *
            </label>
            <input
              type="text"
              required
              value={taskNameEn}
              onChange={(e) => setTaskNameEn(e.target.value)}
              placeholder="e.g. CNC precision milling of 45# carbon steel drive shafts"
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

          {/* Fields 2, 3, 4: Measurement, Plan, Actual */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-white block mb-1">
                2. Measurement (መለኪያ) *
              </label>
              <input
                type="text"
                required
                value={measurement}
                onChange={(e) => setMeasurement(e.target.value)}
                placeholder="Pcs, Sets, Plates, Hrs"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-white block mb-1">
                3. Plan (ዕቅድ መጠን) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={planQty}
                onChange={(e) => setPlanQty(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs font-mono font-semibold"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-white block mb-1">
                4. Actual (ትክክለኛ ክንውን) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={actualQty}
                onChange={(e) => setActualQty(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs font-mono font-semibold"
              />
            </div>
          </div>

          {/* Field 5: Performance in % (Live Calculated Display) */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-blue-400" />
                <span>5. Performance in % (አፈጻጸም በ%):</span>
              </span>
              <span
                className={`font-mono text-sm font-bold tabular-nums ${
                  performanceInPct >= 100
                    ? 'text-emerald-400'
                    : performanceInPct >= 75
                    ? 'text-blue-400'
                    : 'text-amber-400'
                }`}
              >
                {performanceInPct}%
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  performanceInPct >= 100
                    ? 'bg-emerald-500'
                    : performanceInPct >= 75
                    ? 'bg-blue-500'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, performanceInPct))}%` }}
              />
            </div>
          </div>

          {/* Field 6: Department */}
          <div>
            <label className="text-[11px] font-semibold text-white block mb-1">
              6. Department (ክፍል) *
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value as DepartmentId)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.nameEn} ({dept.nameAm})
                </option>
              ))}
            </select>
          </div>

          {/* Secondary Operational Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Week</label>
              <input
                type="text"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                placeholder="e.g. W44"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Assigned Lead</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Engineer / Specialist name"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value="Low">Low (ዝቅተኛ)</option>
                <option value="Medium">Medium (መካከለኛ)</option>
                <option value="High">High (ከፍተኛ)</option>
                <option value="Urgent">Urgent (አስቸኳይ)</option>
                <option value="Critical">Critical (ወሳኝ)</option>
              </select>
            </div>
          </div>

          {/* Status & Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Status (ሁኔታ)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs font-medium"
              >
                <option value="Planned">Planned (የታቀደ)</option>
                <option value="In Progress">In Progress (በሂደት ላይ)</option>
                <option value="Delayed">Delayed (የዘገየ)</option>
                <option value="Overdue">Overdue (ጊዜው ያለፈበት)</option>
                <option value="Completed">Completed (ተጠናቋል)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Start Date (መጀመሪያ)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">End Date / Due Date (ማጠናቀቂያ)</label>
              <input
                type="date"
                value={endDate || dueDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDueDate(e.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs font-mono"
              />
            </div>
          </div>

          {/* Task Dependency: Blocked By */}
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
              {tasks
                .filter((t) => t.id !== task.id)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.id}: {t.titleEn.slice(0, 40)}... [{t.status}]
                  </option>
                ))}
            </select>
          </div>

          {/* Variance Notes */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Variance Notes &amp; Root Cause (ልዩነት ማብራሪያ)
            </label>
            <textarea
              rows={2}
              value={varianceNotes}
              onChange={(e) => setVarianceNotes(e.target.value)}
              placeholder="e.g. Raw material delayed by 2 days, resolved with overtime shift..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            {onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{langMode === 'am' ? 'ስራውን ሰርዝ (Delete)' : 'Delete Task'}</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {langMode === 'am' ? 'ይቅር (Cancel)' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-lg shadow-blue-900/40 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{langMode === 'am' ? 'አስቀምጥ (Save Changes)' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
