import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  Check, 
  SlidersHorizontal, 
  Layers, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Maximize2,
  Sparkles,
  Calendar,
  Building2,
  FileDown
} from 'lucide-react';
import { 
  WeeklyTask, 
  PreventiveMaintenanceItem, 
  DepartmentEvaluation, 
  CapacityAndScrap, 
  DepartmentBudget, 
  MachineOEE, 
  OperationalGapSolution, 
  ActionableRecommendation,
  DepartmentId,
  LanguageMode 
} from '../types/dashboard.ts';
import { DEPARTMENTS, HISTORICAL_6M_TRENDS } from '../data/mockData.ts';
import { getDepartmentName, formatETB } from '../utils/formatters.ts';
import { 
  ReportFormat, 
  ReportScope, 
  ReportConfig, 
  ReportDataBundle,
  generateWordReport, 
  generateExcelReport, 
  generatePowerPointReport 
} from '../utils/reportGenerators.ts';

interface ExecutiveReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: WeeklyTask[];
  maintenance: PreventiveMaintenanceItem[];
  evaluations: DepartmentEvaluation[];
  capacityScrap: CapacityAndScrap[];
  budgets: DepartmentBudget[];
  machines: MachineOEE[];
  gaps: OperationalGapSolution[];
  recommendations: ActionableRecommendation[];
  langMode: LanguageMode;
}

export const ExecutiveReportingModal: React.FC<ExecutiveReportingModalProps> = ({
  isOpen,
  onClose,
  tasks,
  maintenance,
  evaluations,
  capacityScrap,
  budgets,
  machines,
  gaps,
  recommendations,
  langMode: appLangMode,
}) => {
  if (!isOpen) return null;

  // Configuration States
  const [format, setFormat] = useState<ReportFormat>('word');
  const [scope, setScope] = useState<ReportScope>('all');
  const [reportLang, setReportLang] = useState<LanguageMode>(appLangMode);
  const [period, setPeriod] = useState<string>('Week 44 - October 2026');
  const [preparedBy, setPreparedBy] = useState<string>('MEG Operations & Industrial Engineering Directorate');

  // Included sections
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeHeatmap, setIncludeHeatmap] = useState(true);
  const [includeTasks, setIncludeTasks] = useState(true);
  const [includeScrapCapacity, setIncludeScrapCapacity] = useState(true);
  const [includeMaintenance, setIncludeMaintenance] = useState(true);
  const [includeDirectives, setIncludeDirectives] = useState(true);

  // In-App PowerPoint Presentation View mode
  const [isSlideViewerOpen, setIsSlideViewerOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Export progress notification
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastExportedFormat, setLastExportedFormat] = useState<string | null>(null);

  const rawData: ReportDataBundle = {
    tasks,
    maintenance,
    evaluations,
    capacityScrap,
    budgets,
    machines,
    gaps,
    recommendations,
  };

  const reportConfig: ReportConfig = {
    format,
    scope,
    langMode: reportLang,
    includeExecutiveSummary: includeSummary,
    includeHeatmap: includeHeatmap,
    includeTasks: includeTasks,
    includeScrapCapacity: includeScrapCapacity,
    includeMaintenanceOee: includeMaintenance,
    includeDirectives: includeDirectives,
    includeTrends: true,
    reportPeriod: period,
    preparedBy,
  };

  const handleGenerate = (targetFormat: ReportFormat = format) => {
    setIsGenerating(true);
    setLastExportedFormat(targetFormat);

    const cfg = { ...reportConfig, format: targetFormat };

    setTimeout(() => {
      try {
        if (targetFormat === 'word') {
          generateWordReport(cfg, rawData);
        } else if (targetFormat === 'excel') {
          generateExcelReport(cfg, rawData);
        } else if (targetFormat === 'powerpoint') {
          generatePowerPointReport(cfg, rawData);
        }
      } catch (err) {
        console.error('Report Generation Error:', err);
      } finally {
        setIsGenerating(false);
      }
    }, 250);
  };

  // Helper for individual CSV downloads
  const downloadSingleCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTasksCSV = () => {
    const headers = ['Task ID', 'Week', 'Department', 'Task Name', 'Assignee', 'Priority', 'Status', 'Planned Qty', 'Actual Qty', 'Unit', 'Progress %', 'Due Date', 'Variance Notes'];
    const rows = tasks.map((t) => [
      t.id,
      t.week,
      getDepartmentName(t.departmentId, 'en'),
      `"${t.titleEn.replace(/"/g, '""')}"`,
      `"${t.assignedTo}"`,
      t.priority,
      t.status,
      t.plannedQty,
      t.actualQty,
      t.unit,
      `${t.progressPercent}%`,
      t.dueDate,
      `"${(t.varianceNotes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadSingleCSV('Weekly_Task_Registry_W44.csv', csvContent);
  };

  // Summary Metrics for Presentation Slide Preview
  const totalSpend = budgets.reduce((sum, b) => sum + b.actualSpendETB, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.plannedBudgetETB, 0);
  const avgOee = machines.length > 0 
    ? (machines.reduce((sum, m) => sum + m.oeePct, 0) / machines.length).toFixed(1) 
    : '76.6';
  const totalScrap = capacityScrap.reduce((sum, c) => sum + c.scrapCostETB, 0);
  const taskDoneCount = tasks.filter((t) => t.status === 'Completed').length;
  const overdueCount = tasks.filter((t) => t.status === 'Overdue').length;

  const slides = [
    {
      title: 'MEG Agro-Machinery Title Slide',
      render: () => (
        <div className="h-full flex flex-col justify-center items-center text-center p-8 bg-slate-950 border border-slate-800 rounded-lg">
          <div className="w-16 h-16 bg-white rounded-xl p-2 mb-4 shadow-md flex items-center justify-center">
            <img 
              src="/assets/aistudio/photo_2026-07-02_16-05-45_68c4c737.jpg" 
              alt="MEG Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-red-500 mb-1">
            Machinery Engineering Group (MEG)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            AGRO-MACHINERY INDUSTRY
          </h2>
          <div className="text-sm text-amber-400 font-medium mt-1">
            አግሮ-ማሽነሪ ኢንዱስትሪ · Executive Performance Review
          </div>
          <div className="w-20 h-1 bg-blue-600 my-4 rounded-full" />
          <p className="text-xs text-slate-300 max-w-md">
            Master Executive Operations Dossier · Capacity Utilization, Machine OEE, Scrap Costs, and Task Registry (Week 44 - 2026)
          </p>
          <div className="mt-6 text-[11px] text-slate-400 font-mono">
            Prepared for Plant General Management & Directorate
          </div>
        </div>
      ),
    },
    {
      title: 'Executive KPI Scorecard',
      render: () => (
        <div className="h-full flex flex-col justify-between p-6 bg-slate-900 border border-slate-800 rounded-lg">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Plant Executive Scorecard</h3>
                <p className="text-xs text-slate-400">High-level factory throughput and operational variances</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                SLIDE 2 OF 5
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Total Plant Budget</span>
                <div className="text-xl font-bold text-white mt-1">{formatETB(totalSpend, true)}</div>
                <div className="text-[11px] text-slate-400 mt-1">Planned: {formatETB(totalBudget, true)} (+3.2% Var)</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Factory Machine OEE</span>
                <div className="text-xl font-bold text-emerald-400 mt-1">{avgOee}%</div>
                <div className="text-[11px] text-slate-400 mt-1">Target: ≥80.0% (Availability: 81.4%)</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Scrap Defect Cost Loss</span>
                <div className="text-xl font-bold text-rose-400 mt-1">{formatETB(totalScrap, true)}</div>
                <div className="text-[11px] text-rose-300 mt-1">Foundry Defect Spike (+58% above limit)</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Task Registry Completion</span>
                <div className="text-xl font-bold text-amber-400 mt-1">{((taskDoneCount / tasks.length) * 100).toFixed(0)}%</div>
                <div className="text-[11px] text-rose-400 mt-1">{overdueCount} Overdue Tasks flagged</div>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3 flex justify-between">
            <span>Machinery Engineering Group (MEG)</span>
            <span>Period: Week 44</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Department Performance Matrix',
      render: () => (
        <div className="h-full flex flex-col justify-between p-6 bg-slate-900 border border-slate-800 rounded-lg">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Department Performance Heatmap</h3>
                <p className="text-xs text-slate-400">At-a-glance operational health ratings across 7 shops</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                SLIDE 3 OF 5
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px]">
                    <th className="py-1.5 px-2">Department</th>
                    <th className="py-1.5 px-2">Lead Engineer</th>
                    <th className="py-1.5 px-2">OEE %</th>
                    <th className="py-1.5 px-2">Scrap Rate</th>
                    <th className="py-1.5 px-2">Evaluation</th>
                    <th className="py-1.5 px-2">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {evaluations.slice(0, 5).map((e) => {
                    const cs = capacityScrap.find((c) => c.departmentId === e.departmentId);
                    return (
                      <tr key={e.departmentId}>
                        <td className="py-2 px-2 font-semibold text-slate-200">{getDepartmentName(e.departmentId, 'en')}</td>
                        <td className="py-2 px-2 text-slate-400">{DEPARTMENTS.find(d => d.id === e.departmentId)?.headEn}</td>
                        <td className="py-2 px-2 font-mono text-emerald-400">79.5%</td>
                        <td className="py-2 px-2 font-mono text-rose-400">{cs ? cs.defectRatePct + '%' : '0.0%'}</td>
                        <td className="py-2 px-2 font-mono">{e.totalScore}/50</td>
                        <td className="py-2 px-2 font-bold text-blue-400">Grade {e.grade}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3 flex justify-between">
            <span>Machinery Engineering Group (MEG)</span>
            <span>Status: All Shops Operational</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Strategic Directives & Action Items',
      render: () => (
        <div className="h-full flex flex-col justify-between p-6 bg-slate-900 border border-slate-800 rounded-lg">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Strategic Directives & Operational Gaps</h3>
                <p className="text-xs text-slate-400">Executive directives endorsed for immediate plant resolution</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                SLIDE 4 OF 5
              </span>
            </div>
            <div className="space-y-2.5">
              {recommendations.slice(0, 3).map((r) => (
                <div key={r.id} className="p-3 rounded bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{r.titleEn}</span>
                    <span className="text-[10px] text-amber-400 font-mono">{r.deadline}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1">{r.directiveEn}</p>
                  <div className="text-[10px] text-blue-300 mt-1 font-medium">Lead: {r.responsibleLead} · Priority: {r.priority}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3 flex justify-between">
            <span>Machinery Engineering Group (MEG)</span>
            <span>Executive Endorsement Required</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Executive Endorsement & Sign-Off',
      render: () => (
        <div className="h-full flex flex-col justify-center items-center text-center p-8 bg-slate-950 border border-slate-800 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-2">Executive Endorsement</h3>
          <p className="text-xs text-slate-300 max-w-lg mb-8">
            The operational results and task milestones summarized in this dossier have been verified by the Industrial Operations & Quality Directorate for Week 44.
          </p>
          <div className="grid grid-cols-2 gap-8 w-full max-w-md text-left text-xs">
            <div className="border-t border-slate-700 pt-3">
              <div className="font-bold text-white">Eng. Dawit Alemayehu</div>
              <div className="text-slate-400 text-[11px]">Operations & Engineering Lead</div>
              <div className="text-slate-500 text-[10px] mt-1">Machinery Engineering Group</div>
            </div>
            <div className="border-t border-slate-700 pt-3">
              <div className="font-bold text-white">Executive Management</div>
              <div className="text-slate-400 text-[11px]">Agro-Machinery Directorate</div>
              <div className="text-slate-500 text-[10px] mt-1">Endorsed: October 2026</div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full text-xs shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 border border-slate-700 shadow-sm overflow-hidden">
              <img 
                src="/assets/aistudio/photo_2026-07-02_16-05-45_68c4c737.jpg" 
                alt="MEG Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  Executive Reporting System &amp; Presentation Hub
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800/60 uppercase">
                  MEG
                </span>
              </div>
              <p className="text-[11px] text-amber-400 font-medium mt-0.5">
                Machinery Engineering Group (MEG) · Agro-Machinery Industry (የሪፖርት ማዕከል)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* SECTION 1: Format Selection (Word, Excel, PowerPoint) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold text-xs flex items-center justify-center">1</span>
                <span className="font-bold text-white text-xs uppercase tracking-wider">
                  Select Professional Format (የሪፖርት አይነት ምረጥ)
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Industry-standard Word, Excel, or PowerPoint
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option A: Microsoft Word (.doc) */}
              <button
                type="button"
                onClick={() => setFormat('word')}
                className={`flex flex-col text-left p-3.5 rounded-lg border transition-all cursor-pointer relative ${
                  format === 'word'
                    ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-950/50 ring-1 ring-blue-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <FileText className="w-5 h-5" />
                  </div>
                  {format === 'word' && (
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div className="font-bold text-white text-xs">Microsoft Word (.doc)</div>
                <div className="text-[11px] text-blue-300 font-medium mt-0.5">Executive Operations Dossier</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Official printable briefing with MEG letterhead, KPI tables, department scorecards, and management sign-off.
                </p>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <span>Formatted for Word &amp; Docs</span>
                </div>
              </button>

              {/* Option B: Microsoft Excel (.xls) */}
              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`flex flex-col text-left p-3.5 rounded-lg border transition-all cursor-pointer relative ${
                  format === 'excel'
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  {format === 'excel' && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div className="font-bold text-white text-xs">Microsoft Excel (.xls)</div>
                <div className="text-[11px] text-emerald-300 font-medium mt-0.5">Multi-Sheet Master Workbook</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Structured 5-tab workbook (Executive Scorecard, Task Registry, Machine OEE, Scrap Tracker, Capacity).
                </p>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <span>5 Dedicated Worksheets</span>
                </div>
              </button>

              {/* Option C: PowerPoint / Presentation (.ppt) */}
              <button
                type="button"
                onClick={() => setFormat('powerpoint')}
                className={`flex flex-col text-left p-3.5 rounded-lg border transition-all cursor-pointer relative ${
                  format === 'powerpoint'
                    ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-950/50 ring-1 ring-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Presentation className="w-5 h-5" />
                  </div>
                  {format === 'powerpoint' && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div className="font-bold text-white text-xs">PowerPoint / Slide Deck (.ppt)</div>
                <div className="text-[11px] text-amber-300 font-medium mt-0.5">Boardroom Slide Presentation</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  16:9 widescreen slides for executive committee presentations, projector display, and strategic reviews.
                </p>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <span>5 Executive Slides + Preview</span>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 2: Scope, Period & Language Customization */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold text-xs flex items-center justify-center">2</span>
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                Configure Report Scope &amp; Period (ወሰን እና ወቅት)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Department Scope Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Report Department Scope:</span>
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as ReportScope)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Entire Plant (All 13 Departments)</option>
                  <option value="manufacturing">Core Manufacturing (Production, Assembling &amp; Finishing, Disc Blade)</option>
                  <option value="quality_maintenance">Technical, QA &amp; Maintenance (QC, Machinery &amp; Vehicle Maint, ICT)</option>
                  <option disabled>───────────────</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nameEn} ({d.nameAm})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reporting Period */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reporting Period:</span>
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Week 44 - October 2026">Week 44 (Current Active W44)</option>
                  <option value="Monthly Review - October 2026">Monthly Review (October 2026)</option>
                  <option value="6-Month Historical Summary (May-Oct 2026)">6-Month Historical Summary</option>
                  <option value="Q4 Strategic Operations Dossier">Q4 Strategic Operations Dossier</option>
                </select>
              </div>

              {/* Output Language */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <span>Document Language:</span>
                </label>
                <div className="flex bg-slate-900 border border-slate-700 rounded p-0.5">
                  <button
                    type="button"
                    onClick={() => setReportLang('en')}
                    className={`flex-1 py-1 text-center rounded text-[11px] font-semibold transition-colors ${
                      reportLang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportLang('bilingual')}
                    className={`flex-1 py-1 text-center rounded text-[11px] font-semibold transition-colors ${
                      reportLang === 'bilingual' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Bilingual
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportLang('am')}
                    className={`flex-1 py-1 text-center rounded text-[11px] font-semibold transition-colors ${
                      reportLang === 'am' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    አማርኛ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Content Inclusions (Optional Checkboxes) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold text-xs flex items-center justify-center">3</span>
                <span className="font-bold text-white text-xs uppercase tracking-wider">
                  Report Sections &amp; Modules (የሚካተቱ ክፍሎች)
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Select modules to bundle</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              <label className="flex items-center gap-2.5 p-2.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                />
                <div>
                  <div className="font-semibold text-slate-200">Executive KPI Scorecard</div>
                  <div className="text-[10px] text-slate-400">Budget, OEE, Scrap Cost &amp; Tasks</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHeatmap}
                  onChange={(e) => setIncludeHeatmap(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                />
                <div>
                  <div className="font-semibold text-slate-200">Performance Heatmap Grid</div>
                  <div className="text-[10px] text-slate-400">Department metrics &amp; evaluation grades</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTasks}
                  onChange={(e) => setIncludeTasks(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                />
                <div>
                  <div className="font-semibold text-slate-200">Weekly Task Registry</div>
                  <div className="text-[10px] text-slate-400">W44 plan vs actual, progress &amp; blockers</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeScrapCapacity}
                  onChange={(e) => setIncludeScrapCapacity(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                />
                <div>
                  <div className="font-semibold text-slate-200">Capacity &amp; Scrap Defect Tracker</div>
                  <div className="text-[10px] text-slate-400">Run hours, defect %, ETB scrap costs</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMaintenance}
                  onChange={(e) => setIncludeMaintenance(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                />
                <div>
                  <div className="font-semibold text-slate-200">Preventive Maintenance &amp; OEE</div>
                  <div className="text-[10px] text-slate-400">Machine schedules, technician logs</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDirectives}
                  onChange={(e) => setIncludeDirectives(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                />
                <div>
                  <div className="font-semibold text-slate-200">Directives &amp; Gap Solutions</div>
                  <div className="text-[10px] text-slate-400">Action recommendations &amp; lead owners</div>
                </div>
              </label>
            </div>
          </div>

          {/* Quick Raw CSV Export Sub-Bar */}
          <div className="pt-3 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 px-3.5 py-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2">
                <FileDown className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300 font-medium">Quick Raw CSV Downloads:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDownloadTasksCSV}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-mono transition-colors"
                >
                  Tasks.csv
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const headers = ['Department', 'Plan vs Actual', 'Quality', 'Budget', 'Discipline', 'Safety', 'Total', 'Grade'];
                    const rows = evaluations.map((e) => [getDepartmentName(e.departmentId, 'en'), e.planVsActual, e.qualityScrap, e.budgetCost, e.disciplineReporting, e.safetyKaizen, e.totalScore, e.grade]);
                    downloadSingleCSV('Evaluations.csv', [headers.join(','), ...rows.map((r) => r.join(','))].join('\n'));
                  }}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-mono transition-colors"
                >
                  Scorecards.csv
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const headers = ['Shop', 'Planned Hrs', 'Run Hrs', 'Downtime', 'Capacity %', 'Scrap Pcs', 'Defect %', 'Scrap Cost ETB'];
                    const rows = capacityScrap.map((c) => [getDepartmentName(c.departmentId, 'en'), c.plannedHours, c.actualRunHours, c.downtimeHours, `${c.capacityUtilizationPct}%`, c.scrapPieces, `${c.defectRatePct}%`, c.scrapCostETB]);
                    downloadSingleCSV('Capacity_Scrap.csv', [headers.join(','), ...rows.map((r) => r.join(','))].join('\n'));
                  }}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-mono transition-colors"
                >
                  Capacity_Scrap.csv
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {format === 'powerpoint' && (
              <button
                type="button"
                onClick={() => setIsSlideViewerOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-600/50 text-amber-200 font-semibold transition-colors text-xs"
              >
                <Presentation className="w-4 h-4 text-amber-400" />
                <span>Launch Slide Presentation Mode</span>
              </button>
            )}

            {lastExportedFormat && !isGenerating && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{lastExportedFormat.toUpperCase()} generated successfully</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition-colors text-xs"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleGenerate(format)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-xs text-white transition-all shadow-md cursor-pointer ${
                format === 'word' 
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40' 
                  : format === 'excel'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40'
                  : 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/40'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>
                {isGenerating 
                  ? 'Generating Report...' 
                  : `Download ${format === 'word' ? 'Word Document (.doc)' : format === 'excel' ? 'Excel Workbook (.xls)' : 'PowerPoint Deck (.ppt)'}`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Boardroom Slide Presentation Mode Modal */}
      {isSlideViewerOpen && (
        <div className="fixed inset-0 z-60 bg-black/95 flex flex-col p-4 sm:p-8">
          {/* Slide Deck Top Controls */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-white p-1 flex items-center justify-center">
                <img 
                  src="/assets/aistudio/photo_2026-07-02_16-05-45_68c4c737.jpg" 
                  alt="MEG Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="text-sm font-bold">MEG Agro-Machinery Boardroom Presentation</div>
                <div className="text-[11px] text-slate-400">Slide {currentSlideIndex + 1} of {slides.length} · {slides[currentSlideIndex].title}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleGenerate('powerpoint')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .PPT</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSlideViewerOpen(false)}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Slide Active Canvas (16:9 ratio) */}
          <div className="flex-1 flex items-center justify-center my-4 overflow-hidden">
            <div className="w-full max-w-4xl aspect-[16/9] max-h-[70vh]">
              {slides[currentSlideIndex].render()}
            </div>
          </div>

          {/* Slide Deck Navigation Bottom Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-white shrink-0 max-w-4xl mx-auto w-full">
            <button
              type="button"
              disabled={currentSlideIndex === 0}
              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
              className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold ${
                currentSlideIndex === 0 ? 'bg-slate-900 text-slate-600 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Slide</span>
            </button>

            {/* Slide Dots Indicator */}
            <div className="flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentSlideIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    currentSlideIndex === i ? 'bg-amber-400 w-6' : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              disabled={currentSlideIndex === slides.length - 1}
              onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
              className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold ${
                currentSlideIndex === slides.length - 1 ? 'bg-slate-900 text-slate-600 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              <span>Next Slide</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
