import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Calculator, Save, AlertTriangle, Calendar, Layers, Clock, FileText } from 'lucide-react';
import { WeeklyTask, TaskStatus, LanguageMode } from '../types/dashboard.ts';
import { getDepartmentName } from '../utils/formatters.ts';

interface LogExecutionModalProps {
  isOpen: boolean;
  task: WeeklyTask | null;
  onClose: () => void;
  onSave: (updatedTask: WeeklyTask) => void;
  langMode?: LanguageMode;
}

export const LogExecutionModal: React.FC<LogExecutionModalProps> = ({
  isOpen,
  task,
  onClose,
  onSave,
  langMode = 'en',
}) => {
  const [actualQty, setActualQty] = useState<number | ''>(0);
  const [status, setStatus] = useState<TaskStatus>('In Progress');
  const [completionDate, setCompletionDate] = useState('');
  const [varianceNotes, setVarianceNotes] = useState('');

  useEffect(() => {
    if (task) {
      setActualQty(task.actualQty || 0);
      setStatus(task.status || 'In Progress');
      setCompletionDate(task.completionDate || new Date().toISOString().split('T')[0]);
      setVarianceNotes(task.varianceNotes || '');
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const planned = task.plannedQty || 0;
  const actual = Number(actualQty) || 0;
  const variance = actual - planned;
  const performancePct = planned > 0 ? Number(((actual / planned) * 100).toFixed(1)) : 0;
  const isTargetMet = actual >= planned;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isDone = performancePct >= 100 || status === 'Completed';

    const updatedTask: WeeklyTask = {
      ...task,
      actualQty: actual,
      status: isDone ? 'Completed' : status,
      progressPercent: Math.min(100, Math.round(performancePct)),
      completionDate: isDone ? (completionDate || new Date().toISOString().split('T')[0]) : undefined,
      varianceNotes: varianceNotes.trim() ? varianceNotes.trim() : undefined,
    };

    onSave(updatedTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-blue-900/60 rounded-xl max-w-lg w-full text-xs shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-blue-950/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {langMode === 'am' ? 'የሳምንት ክንውን መዝግብ (Log Execution)' : 'Log Task Execution & Output'}
                </h3>
                <span className="font-mono text-[10px] bg-slate-800 text-blue-400 px-2 py-0.5 rounded border border-slate-700">
                  {task.id}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {langMode === 'am' ? 'የተጠናቀቀውን ትክክለኛ መጠን፣ ሁኔታ እና የልዩነት ማብራሪያ ያስገቡ' : 'Record verified actual output, delivery progress, and variance notes'}
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
          {/* Read-only Planned Target Card */}
          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center justify-between">
              <span>Task Scope &amp; Planned Baseline:</span>
              <span className="text-blue-400 font-sans font-semibold">
                {getDepartmentName(task.departmentId, langMode === 'bilingual' ? 'en' : langMode)}
              </span>
            </div>

            <div className="font-semibold text-white text-xs leading-snug">
              {langMode === 'am' ? task.titleAm : task.titleEn}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-slate-400">
                  {langMode === 'am' ? 'የታቀደ እቅድ (Fixed Plan):' : 'Fixed Target Plan:'}
                </span>{' '}
                <span className="font-mono font-bold text-white text-sm bg-slate-900 px-2.5 py-0.5 rounded border border-slate-700">
                  {task.plannedQty.toLocaleString()} {task.unit}
                </span>
              </div>

              <div className="text-[11px] font-mono text-slate-300">
                <span className="text-slate-400">Timeframe:</span> {task.startDate || task.dueDate} ➔ {task.endDate || task.dueDate}
                {task.actualStartDate && (
                  <span className="text-emerald-400 ml-1.5 font-semibold">(Started: {task.actualStartDate})</span>
                )}
              </div>
            </div>
          </div>

          {/* Actual Execution Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-white flex items-center justify-between">
              <span>{langMode === 'am' ? 'ትክክለኛ ክንውን (Actual Delivered Output) *' : 'Actual Delivered Output (ክንውን) *'}</span>
              <span className="text-[10px] text-slate-400 font-mono">Unit: {task.unit}</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
              required
              value={actualQty}
              onChange={(e) => setActualQty(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 450"
              className="w-full bg-slate-950 border border-blue-500/50 rounded-lg px-3 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Real-time Performance Indicator */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Calculator className="w-3.5 h-3.5 text-blue-400" />
                <span>{langMode === 'am' ? 'የአፈጻጸም ምጣኔ (Performance Rate):' : 'Performance Rate:'}</span>
              </span>
              <span className={`font-mono text-base font-bold tabular-nums ${
                isTargetMet ? 'text-emerald-400' : performancePct >= 75 ? 'text-blue-400' : 'text-amber-400'
              }`}>
                {performancePct}%
              </span>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  isTargetMet ? 'bg-emerald-500' : performancePct >= 75 ? 'bg-blue-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, performancePct))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
              <span>
                {langMode === 'am' ? 'ልዩነት:' : 'Variance:'}{' '}
                <strong className={variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {variance > 0 ? `+${variance}` : variance} {task.unit}
                </strong>
              </span>
              <span>
                {isTargetMet ? '🎯 Target Achieved' : `${planned - actual} ${task.unit} Remaining`}
              </span>
            </div>
          </div>

          {/* Status & Completion Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-300 block mb-1">
                {langMode === 'am' ? 'የስራ ሁኔታ (Status)' : 'Execution Status'}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="In Progress">In Progress (በሂደት ላይ)</option>
                <option value="Completed">Completed (ተጠናቋል)</option>
                <option value="Delayed">Delayed (የዘገየ)</option>
                <option value="Overdue">Overdue (ያለፈበት)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 block mb-1">
                {langMode === 'am' ? 'የተጠናቀቀበት ቀን' : 'Sign-Off Date'}
              </label>
              <input
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Variance Notes & Root Cause */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-300">
                {langMode === 'am' ? 'የክንውን ልዩነትና ችግር ማብራሪያ (Variance Notes / Root Cause)' : 'Variance Notes & Root Cause (Mandatory if Actual < Plan)'}
              </label>
              <span className="text-[10px] text-slate-400">
                {variance < 0 ? (
                  <span className="text-amber-400 font-semibold">⚠️ Deficit detected ({Math.abs(variance)} {task.unit})</span>
                ) : (
                  <span className="text-emerald-400">✓ Target met or exceeded</span>
                )}
              </span>
            </div>

            {/* Quick Root-Cause Blocker Tags */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2 p-2 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium">
                {langMode === 'am' ? 'ፈጣን መንስኤ ምረጥ:' : 'Quick Root Cause:'}
              </span>
              {[
                { label: '⚙️ Machine Breakdown', am: '⚙️ የማሽን ብልሽት' },
                { label: '📦 Raw Material Delay', am: '📦 የጥሬ እቃ እጥረት' },
                { label: '⚡ Power Outage', am: '⚡ የኃይል መቋረጥ' },
                { label: '🛠️ High Quality Scrap', am: '🛠️ ከፍተኛ ብክነት/ስክራፕ' },
                { label: '👥 Labor Shortage', am: '👥 የሰው ኃይል እጥረት' },
                { label: '⏱️ Shift Handover Gap', am: '⏱️ የፈረቃ መዘግየት' },
              ].map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => {
                    const tagText = langMode === 'am' ? tag.am : tag.label;
                    setVarianceNotes((prev) => (prev ? `${prev}; ${tagText}` : tagText));
                  }}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                >
                  {langMode === 'am' ? tag.am : tag.label}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={varianceNotes}
              onChange={(e) => setVarianceNotes(e.target.value)}
              placeholder="e.g. 2-hour power disruption on Thursday; overtime shift scheduled to recover..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Modal Actions */}
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
              <Save className="w-3.5 h-3.5" />
              <span>{langMode === 'am' ? 'ክንውን አስቀምጥ (Submit Execution)' : 'Submit Execution'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
