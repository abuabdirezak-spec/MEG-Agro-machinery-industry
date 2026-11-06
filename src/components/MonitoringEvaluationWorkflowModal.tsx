import React, { useState } from 'react';
import { 
  X, 
  Workflow, 
  Target, 
  CheckCircle2, 
  TrendingUp, 
  Calculator, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  ArrowRight, 
  Layers, 
  Building2, 
  Sliders, 
  FileSpreadsheet, 
  ExternalLink,
  Plus,
  Edit3
} from 'lucide-react';
import { WeeklyTask, LanguageMode } from '../types/dashboard.ts';
import { DEPARTMENTS } from '../data/mockData.ts';
import { getDepartmentName } from '../utils/formatters.ts';

interface MonitoringEvaluationWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: WeeklyTask[];
  onOpenNewTask: () => void;
  onOpenReportModal: () => void;
  onOpenGoogleSheets: () => void;
  langMode?: LanguageMode;
}

export const MonitoringEvaluationWorkflowModal: React.FC<MonitoringEvaluationWorkflowModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onOpenNewTask,
  onOpenReportModal,
  onOpenGoogleSheets,
  langMode = 'en',
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Interactive Live Sandbox State for Step 3 demonstration
  const [demoPlan, setDemoPlan] = useState<number>(500);
  const [demoActual, setDemoActual] = useState<number>(430);
  const [demoUnit, setDemoUnit] = useState<string>('Pcs');

  if (!isOpen) return null;

  const demoPerformancePct = demoPlan > 0 ? Number(((demoActual / demoPlan) * 100).toFixed(1)) : 0;
  const demoVariance = demoActual - demoPlan;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full text-xs shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {langMode === 'am' ? 'የክትትልና ግምገማ (M&E) የስራ ፍሰት ማዕቀፍ' : 'Monitoring & Evaluation (M&E) Tracking Framework'}
                </h3>
                <span className="font-mono text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-semibold">
                  Plan → Execution → Performance → Report
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {langMode === 'am' 
                  ? 'እቅድ መመዝገብ (Plan) ➔ ሳምንታዊ ክንውን ማዘመን (Execution) ➔ አፈፃፀም ማስላት (Performance Rate) ➔ ሪፖርት ማውጣት' 
                  : 'A 3-step structured lifecycle for factory KPIs, weekly deliverables, and executive directorate reporting'}
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

        {/* Stepper Tabs Bar */}
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-3 shrink-0">
          <div className="grid grid-cols-3 gap-2">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                activeStep === 1
                  ? 'bg-blue-950/70 border-blue-500 text-white shadow-xs'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold font-mono text-xs ${
                activeStep === 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                1
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-xs truncate">
                  {langMode === 'am' ? 'ደረጃ 1፡ እቅድ መመዝገብ' : 'Step 1: Record Plan'}
                </div>
                <div className="text-[10px] text-slate-400 truncate font-mono">
                  እቅድ (Plan Targets)
                </div>
              </div>
            </button>

            {/* Step 2 */}
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                activeStep === 2
                  ? 'bg-blue-950/70 border-blue-500 text-white shadow-xs'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold font-mono text-xs ${
                activeStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                2
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-xs truncate">
                  {langMode === 'am' ? 'ደረጃ 2፡ ክንውን ማዘመን' : 'Step 2: Update Execution'}
                </div>
                <div className="text-[10px] text-slate-400 truncate font-mono">
                  ክንውን (Weekly Cadence)
                </div>
              </div>
            </button>

            {/* Step 3 */}
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                activeStep === 3
                  ? 'bg-blue-950/70 border-blue-500 text-white shadow-xs'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold font-mono text-xs ${
                activeStep === 3 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                3
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-xs truncate">
                  {langMode === 'am' ? 'ደረጃ 3፡ አፈፃፀም እና ሪፖርት' : 'Step 3: Performance & Report'}
                </div>
                <div className="text-[10px] text-slate-400 truncate font-mono">
                  አፈፃፀም (Rate % & Report)
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-200">
          {/* STEP 1: RECORDING THE PLAN (እቅድ) */}
          {activeStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-blue-950/30 border border-blue-900/50 rounded-xl">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span>Phase 1: Recording Operational Targets (የዕቅድ ምዝገባ)</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    At the start of each production week or quarter, every department directorate enters quantifiable targets before floor operations begin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenNewTask();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs transition-colors shrink-0 cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{langMode === 'am' ? 'አዲስ እቅድ መዝግብ' : 'Record New Plan Task'}</span>
                </button>
              </div>

              {/* Data Table Architecture Design */}
              <div className="space-y-3">
                <h5 className="font-semibold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  <span>Recommended Table Architecture for Plan Recording (እቅድ ሰንጠረዥ ቅርጽ):</span>
                </h5>

                <div className="overflow-x-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 font-mono text-[11px] text-slate-400">
                        <th className="py-2.5 px-3">Column Name</th>
                        <th className="py-2.5 px-3">Amharic Label (የአማርኛ ስያሜ)</th>
                        <th className="py-2.5 px-3">Data Type</th>
                        <th className="py-2.5 px-3">Required &amp; Rules</th>
                        <th className="py-2.5 px-3">Factory Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 font-sans">
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-mono text-blue-400 font-semibold">task_id</td>
                        <td className="py-2 px-3 font-medium">የስራ መለያ ቁጥር</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-400">String (Unique)</td>
                        <td className="py-2 px-3 text-slate-300">Mandatory (e.g. TSK-4401)</td>
                        <td className="py-2 px-3 font-mono text-slate-400">TSK-4412</td>
                      </tr>
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-mono text-blue-400 font-semibold">task_name</td>
                        <td className="py-2 px-3 font-medium">የስራ ዝርዝር / ተግባር</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-400">String (Text)</td>
                        <td className="py-2 px-3 text-slate-300">Clear deliverable scope</td>
                        <td className="py-2 px-3 text-slate-300">Shaft turning on CNC lathe</td>
                      </tr>
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-mono text-blue-400 font-semibold">department_id</td>
                        <td className="py-2 px-3 font-medium">ክፍል</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-400">Enum (13 Depts)</td>
                        <td className="py-2 px-3 text-slate-300">Must belong to 13 official depts</td>
                        <td className="py-2 px-3 text-slate-300">Machinery & Vehicle Maint.</td>
                      </tr>
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-mono text-blue-400 font-semibold">unit_of_measure</td>
                        <td className="py-2 px-3 font-medium">መለኪያ</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-400">String</td>
                        <td className="py-2 px-3 text-slate-300">Pcs, Sets, Hours, Tons, ETB</td>
                        <td className="py-2 px-3 font-mono text-amber-400">Pcs</td>
                      </tr>
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-mono text-emerald-400 font-bold">planned_qty</td>
                        <td className="py-2 px-3 font-bold text-white">እቅድ (Plan)</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-400">Number (Decimal)</td>
                        <td className="py-2 px-3 text-slate-300">Must be &gt; 0 to calculate rate</td>
                        <td className="py-2 px-3 font-mono font-bold text-white">500</td>
                      </tr>
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-mono text-blue-400 font-semibold">assigned_lead</td>
                        <td className="py-2 px-3 font-medium">የተመደበለት ባለሙያ</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-400">String</td>
                        <td className="py-2 px-3 text-slate-300">Specific engineer / supervisor</td>
                        <td className="py-2 px-3 text-slate-300">Eng. Tadesse Bekele</td>
                      </tr>
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-mono text-blue-400 font-semibold">due_date</td>
                        <td className="py-2 px-3 font-medium">ማጠናቀቂያ ቀን</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-400">Date (YYYY-MM-DD)</td>
                        <td className="py-2 px-3 text-slate-300">Target milestone deadline</td>
                        <td className="py-2 px-3 font-mono text-slate-300">2026-11-15</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3 Golden Rules for Plan Phase */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>1. Baseline Principle</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Once the production week begins, the <strong>Planned Quantity (እቅድ)</strong> becomes the fixed baseline against which all variance is evaluated.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>2. Measurement Uniformity</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Always record the exact physical unit (Pcs, Sets, Hours, ETB) so the subsequent execution progress compares like-for-like figures.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>3. Ownership Assignment</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Every planned target must be mapped to an explicit Department Lead who takes accountability for weekly execution reporting.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: UPDATING EXECUTION / PROGRESS (ክንውን) */}
          {activeStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 bg-amber-950/25 border border-amber-800/40 rounded-xl">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Phase 2: Updating Execution &amp; Progress (የክንውን ክትትልና ምዝገባ)</span>
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  At regular intervals (weekly floor reviews or Friday wrap-ups), leads input the verified <strong>Actual Quantity (ክንውን)</strong>, date completed, and document blockers.
                </p>
              </div>

              {/* Execution Cadence Table */}
              <div className="space-y-3">
                <h5 className="font-semibold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Weekly Execution Data Capture Schema (የክንውን መረጃዎች):</span>
                </h5>

                <div className="overflow-x-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 font-mono text-[11px] text-slate-400">
                        <th className="py-2.5 px-3">Field Name</th>
                        <th className="py-2.5 px-3">Amharic Term</th>
                        <th className="py-2.5 px-3">Purpose</th>
                        <th className="py-2.5 px-3">Standard Operating Procedure (SOP)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 font-sans">
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-mono text-emerald-400 font-bold">actual_qty</td>
                        <td className="py-2 px-3 font-bold text-white">ትክክለኛ ክንውን</td>
                        <td className="py-2 px-3 text-slate-300">Actual units delivered or hours logged</td>
                        <td className="py-2 px-3 text-slate-300">Verified by QC inspection batch logs</td>
                      </tr>
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-mono text-amber-400 font-semibold">variance_qty</td>
                        <td className="py-2 px-3 font-medium">የመጠን ልዩነት</td>
                        <td className="py-2 px-3 text-slate-300">Difference: Actual - Plan</td>
                        <td className="py-2 px-3 text-slate-300">Auto-calculated: Negative = deficit, Positive = surplus</td>
                      </tr>
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-mono text-blue-400 font-semibold">status</td>
                        <td className="py-2 px-3 font-medium">የስራ ሁኔታ</td>
                        <td className="py-2 px-3 text-slate-300">Completed, In Progress, Delayed, Overdue</td>
                        <td className="py-2 px-3 text-slate-300">Auto-transitions to Completed when performance &ge; 100%</td>
                      </tr>
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-mono text-rose-400 font-semibold">variance_notes</td>
                        <td className="py-2 px-3 font-medium">ልዩነትና ችግር ማብራሪያ</td>
                        <td className="py-2 px-3 text-slate-300">Mandatory when actual &lt; plan</td>
                        <td className="py-2 px-3 text-slate-300">State root cause (power cut, spare part, scrap, illness)</td>
                      </tr>
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-mono text-slate-300 font-semibold">completion_date</td>
                        <td className="py-2 px-3 font-medium">የተጠናቀቀበት ቀን</td>
                        <td className="py-2 px-3 text-slate-300">Actual date of sign-off</td>
                        <td className="py-2 px-3 text-slate-300">Used to evaluate on-time delivery metric</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Weekly Routine Box */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="font-semibold text-white text-xs block">
                  Recommended Weekly Review Cadence (ሳምንታዊ የክትትል ቅደም-ተከተል):
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-xs">
                  <li><strong>Monday Morning:</strong> Review open tasks from previous week; confirm new weekly plan targets.</li>
                  <li><strong>Wednesday Mid-Week Check:</strong> Mid-point milestone check; flag any task lagging behind 50% pace as <em>Delayed</em>.</li>
                  <li><strong>Friday 4:00 PM:</strong> Floor supervisors enter finalized <em>Actual (ክንውን)</em> numbers and document any root-cause variances.</li>
                  <li><strong>Saturday Morning:</strong> General Manager &amp; Directors inspect the calculated Performance Rates across all 13 departments.</li>
                </ol>
              </div>
            </div>
          )}

          {/* STEP 3: PERFORMANCE RATE & FINAL REPORTING (አፈፃፀም እና ሪፖርት) */}
          {activeStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 bg-emerald-950/25 border border-emerald-800/40 rounded-xl">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  <span>Phase 3: Performance Rate Calculation &amp; Executive Reporting (አፈፃፀም እና ሪፖርት)</span>
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  The system automatically calculates the <strong>Performance Rate % (አፈፃፀም)</strong> using standardized factory formulas, grades performance against RAG thresholds, and generates multi-format executive reports.
                </p>
              </div>

              {/* Mathematical Formula Callout */}
              <div className="p-4 bg-slate-950 rounded-xl border border-blue-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-400 uppercase tracking-wider">
                    Core Performance Calculation Formula (የአፈፃፀም ቀመር):
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Standard Industrial Engineering Benchmark</span>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg text-center font-mono text-sm sm:text-base font-bold text-white border border-slate-800">
                  Performance Rate (%) = <span className="text-emerald-400">( Actual Quantity / Planned Quantity )</span> &times; 100
                </div>

                <div className="text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <span>በአማርኛ፡ <strong>አፈፃፀም (%) = (ክንውን &divide; እቅድ) &times; 100</strong></span>
                  <span className="text-amber-400">Note: If Planned = 0, rate is capped at baseline 0% to prevent division-by-zero.</span>
                </div>
              </div>

              {/* Interactive Performance Sandbox */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Workflow className="w-4 h-4 text-emerald-400" />
                    <span>Interactive Performance Calculator (የአፈፃፀም ማስያ ሙከራ):</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Try modifying values:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">1. Planned (እቅድ)</label>
                    <input
                      type="number"
                      min="1"
                      value={demoPlan}
                      onChange={(e) => setDemoPlan(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white font-mono font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">2. Actual (ክንውን)</label>
                    <input
                      type="number"
                      min="0"
                      value={demoActual}
                      onChange={(e) => setDemoActual(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white font-mono font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">3. Calculated Performance (አፈፃፀም)</label>
                    <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded px-3 py-1.5">
                      <span className={`font-mono text-sm font-extrabold ${
                        demoPerformancePct >= 100
                          ? 'text-emerald-400'
                          : demoPerformancePct >= 75
                          ? 'text-blue-400'
                          : 'text-rose-400'
                      }`}>
                        {demoPerformancePct}%
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono uppercase ${
                        demoPerformancePct >= 100
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : demoPerformancePct >= 75
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {demoPerformancePct >= 100 ? 'Target Met' : demoPerformancePct >= 75 ? 'Acceptable' : 'Deficit'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      demoPerformancePct >= 100 ? 'bg-emerald-500' : demoPerformancePct >= 75 ? 'bg-blue-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, demoPerformancePct))}%` }}
                  />
                </div>
              </div>

              {/* RAG Threshold Grading Matrix */}
              <div className="space-y-2">
                <span className="font-semibold text-white text-xs block font-mono">
                  RAG Performance Rating Matrix (የአፈፃፀም ደረጃዎች መለያ):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg">
                    <div className="flex items-center justify-between text-emerald-400 font-bold mb-1">
                      <span>🟢 Green (ምርጥ አፈፃፀም)</span>
                      <span className="font-mono">&ge; 90%</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight">
                      Target achieved or exceeded. On-schedule manufacturing delivery. Recognized in directorate reviews.
                    </p>
                  </div>

                  <div className="p-3 bg-blue-950/20 border border-blue-800/40 rounded-lg">
                    <div className="flex items-center justify-between text-blue-400 font-bold mb-1">
                      <span>🟡 Amber (መካከለኛ)</span>
                      <span className="font-mono">75% - 89.9%</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight">
                      Minor lag or material delay. Recoverable with overtime shift or weekend equipment maintenance.
                    </p>
                  </div>

                  <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded-lg">
                    <div className="flex items-center justify-between text-rose-400 font-bold mb-1">
                      <span>🔴 Red (አስጊ ክፍተት)</span>
                      <span className="font-mono">&lt; 75%</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight">
                      Critical delivery shortfall. Triggers immediate root-cause investigation and C-suite directive.
                    </p>
                  </div>
                </div>
              </div>

              {/* Generate Final Report Actions */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="font-semibold text-white text-xs block">Generate Final M&amp;E Executive Reports:</span>
                  <span className="text-[11px] text-slate-400">Export the compiled Plan vs Actual performance data to executive formats</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenGoogleSheets();
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sync Google Sheets</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenReportModal();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-md"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-200" />
                    <span>Generate Word / Excel / PPT</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            {langMode === 'am' ? 'ዝጋ (Close)' : 'Close'}
          </button>

          <div className="flex items-center gap-2">
            {activeStep > 1 && (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => (prev - 1) as any)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                &larr; Back
              </button>
            )}

            {activeStep < 3 ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => (prev + 1) as any)}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-md cursor-pointer"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReportModal();
                }}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-md cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export Final M&amp;E Report</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
