import React, { useState } from 'react';
import { 
  DepartmentId, 
  LanguageMode, 
  DepartmentBudget, 
  CapacityAndScrap, 
  DepartmentEvaluation, 
  MachineOEE, 
  WeeklyTask 
} from '../types/dashboard.ts';
import { DEPARTMENTS } from '../data/mockData.ts';
import { formatETB, getDepartmentName } from '../utils/formatters.ts';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  Layers, 
  ExternalLink, 
  SlidersHorizontal,
  Flame,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

interface PerformanceHeatmapProps {
  budgets: DepartmentBudget[];
  capacityScrap: CapacityAndScrap[];
  evaluations: DepartmentEvaluation[];
  machines: MachineOEE[];
  tasks: WeeklyTask[];
  onSelectDepartment: (deptId: DepartmentId) => void;
  langMode: LanguageMode;
}

type IntensityTier = 'optimal' | 'good' | 'watch' | 'critical';

interface MetricCellData {
  rawValue: number | string;
  formattedValue: string;
  subText: string;
  tier: IntensityTier;
  benchmarkInfo: string;
  benchmarkInfoAm: string;
  tooltipTitle: string;
  tooltipTitleAm: string;
  note?: string;
  noteAm?: string;
}

interface DepartmentHeatmapRow {
  deptId: DepartmentId;
  nameEn: string;
  nameAm: string;
  headEn: string;
  headAm: string;
  grade: 'A' | 'B' | 'C' | 'D';
  overallScore: number;
  overallTier: IntensityTier;
  oee: MetricCellData;
  scrap: MetricCellData;
  budget: MetricCellData;
  taskRate: MetricCellData;
  qualityScore: MetricCellData;
}

export const PerformanceHeatmap: React.FC<PerformanceHeatmapProps> = ({
  budgets,
  capacityScrap,
  evaluations,
  machines,
  tasks,
  onSelectDepartment,
  langMode,
}) => {
  const [filterTier, setFilterTier] = useState<IntensityTier | 'all'>('all');
  const [activeHoverCell, setActiveHoverCell] = useState<string | null>(null);

  // 1. Calculate Monthly Plant Benchmarks for reference
  const totalScrap = capacityScrap.reduce((sum, c) => sum + c.scrapPieces, 0);
  const totalUnits = capacityScrap.reduce((sum, c) => sum + c.actualOutputUnits, 0);
  const factoryAvgScrapRate = totalUnits > 0 ? (totalScrap / totalUnits) * 100 : 0;

  const factoryAvgOee = machines.length > 0 
    ? machines.reduce((sum, m) => sum + m.oeePct, 0) / machines.length 
    : 0;

  // 2. Build rows for each of the departments
  const rows: DepartmentHeatmapRow[] = DEPARTMENTS.map((dept) => {
    const cs = capacityScrap.find((c) => c.departmentId === dept.id);
    const bg = budgets.find((b) => b.departmentId === dept.id);
    const ev = evaluations.find((e) => e.departmentId === dept.id);
    const deptMachines = machines.filter((m) => m.departmentId === dept.id);
    const deptTasks = tasks.filter((t) => t.departmentId === dept.id);

    // OEE metric calculation
    let deptOee = 0;
    let oeeTier: IntensityTier = 'good';
    let oeeSubText = '';
    let oeeFormatted = '';
    let oeeBenchmark = '';
    let oeeBenchmarkAm = '';

    if (deptMachines.length > 0) {
      deptOee = deptMachines.reduce((sum, m) => sum + m.oeePct, 0) / deptMachines.length;
      oeeFormatted = `${deptOee.toFixed(1)}%`;
      const diffFromAvg = deptOee - factoryAvgOee;
      oeeSubText = `${diffFromAvg >= 0 ? '+' : ''}${diffFromAvg.toFixed(1)}% vs avg`;

      if (deptOee >= 82) {
        oeeTier = 'optimal';
      } else if (deptOee >= 75) {
        oeeTier = 'good';
      } else if (deptOee >= 68) {
        oeeTier = 'watch';
      } else {
        oeeTier = 'critical';
      }
      oeeBenchmark = `Target: 80% · Plant Avg: ${factoryAvgOee.toFixed(1)}% (${deptMachines.length} units)`;
      oeeBenchmarkAm = `ዒላማ: 80% · የፋብሪካ አማካይ: ${factoryAvgOee.toFixed(1)}% (${deptMachines.length} ማሽኖች)`;
    } else {
      oeeFormatted = '0.0%';
      oeeSubText = 'Ready for Machine Log';
      oeeTier = 'good';
      oeeBenchmark = 'Standard Target: 80%';
      oeeBenchmarkAm = 'መደበኛ ዒላማ: 80%';
    }

    // Scrap Rate metric calculation
    let scrapTier: IntensityTier = 'good';
    let scrapFormatted = '0.0%';
    let scrapSub = '0 pieces';
    let scrapBench = 'Within 0% Defect Limit';
    let scrapBenchAm = 'ዜሮ ብክነት ወሰን ውስጥ';
    let scrapNote = '0 ETB';
    let scrapNoteAm = '0 ብር';

    if (cs && cs.actualOutputUnits > 0 && factoryAvgScrapRate > 0) {
      const defectRate = cs.defectRatePct;
      scrapFormatted = `${defectRate.toFixed(1)}%`;
      const diffPct = ((defectRate - factoryAvgScrapRate) / factoryAvgScrapRate) * 100;
      scrapSub = `${diffPct > 0 ? '+' : ''}${diffPct.toFixed(1)}% dev`;
      scrapBench = `Threshold: ≤3.0% · Plant Avg: ${factoryAvgScrapRate.toFixed(1)}%`;
      scrapBenchAm = `የመቻቻል ወሰን: ≤3.0% · የፋብሪካ አማካይ: ${factoryAvgScrapRate.toFixed(1)}%`;
      scrapNote = `${cs.scrapPieces.toLocaleString()} pieces (${formatETB(cs.scrapCostETB, true)})`;
      scrapNoteAm = `${cs.scrapPieces.toLocaleString()} የተበላሹ ክፍሎች (${formatETB(cs.scrapCostETB, true)})`;

      if (defectRate <= 2.0) {
        scrapTier = 'optimal';
      } else if (defectRate <= 3.5) {
        scrapTier = 'good';
      } else if (defectRate <= 4.5) {
        scrapTier = 'watch';
      } else {
        scrapTier = 'critical';
      }
    }

    // Budget Adherence metric calculation
    let budgetTier: IntensityTier = 'good';
    let budgetFormatted = '100.0%';
    let budgetSub = 'On Budget';
    let budgetBench = 'Within ±5% Tolerance';
    let budgetBenchAm = 'በ ±5% መቻቻል ውስጥ';
    let budgetNote = '';
    let budgetNoteAm = '';

    if (bg) {
      if (bg.plannedBudgetETB === 0 && bg.actualSpendETB === 0) {
        budgetFormatted = '0 ETB';
        budgetSub = '0 Spend';
        budgetBench = 'Planned: 0 ETB · Actual: 0 ETB';
        budgetBenchAm = 'የታቀደ: 0 ብር · የወጣ: 0 ብር';
        budgetNote = '0 ETB';
        budgetNoteAm = '0 ብር';
        budgetTier = 'good';
      } else {
        const variancePct = bg.variancePct; // positive means overspent
        budgetFormatted = `${variancePct > 0 ? '+' : ''}${variancePct.toFixed(1)}%`;
        budgetSub = variancePct > 0 ? 'Over budget' : 'Under budget';
        budgetBench = `Planned: ${formatETB(bg.plannedBudgetETB, true)} · Actual: ${formatETB(bg.actualSpendETB, true)}`;
        budgetBenchAm = `የታቀደ: ${formatETB(bg.plannedBudgetETB, true)} · የወጣ: ${formatETB(bg.actualSpendETB, true)}`;
        budgetNote = `Variance: ${formatETB(bg.varianceETB, true)}`;
        budgetNoteAm = `ልዩነት: ${formatETB(bg.varianceETB, true)}`;

        if (variancePct <= 0) {
          budgetTier = 'optimal';
        } else if (variancePct <= 5.0) {
          budgetTier = 'good';
        } else if (variancePct <= 10.0) {
          budgetTier = 'watch';
        } else {
          budgetTier = 'critical';
        }
      }
    }

    // Task Completion Rate calculation
    let taskTier: IntensityTier = 'good';
    const totalDeptTasks = deptTasks.length;
    const completedDeptTasks = deptTasks.filter((t) => t.status === 'Completed').length;
    const overdueDeptTasks = deptTasks.filter((t) => t.status === 'Overdue').length;
    const taskCompletionRate = totalDeptTasks > 0 
      ? (completedDeptTasks / totalDeptTasks) * 100 
      : 0;

    const taskFormatted = totalDeptTasks > 0 ? `${taskCompletionRate.toFixed(0)}%` : '0%';
    const taskSub = totalDeptTasks > 0 ? `${completedDeptTasks}/${totalDeptTasks} Tasks done` : '0 tasks logged';
    const taskBench = totalDeptTasks > 0 ? `${overdueDeptTasks > 0 ? `${overdueDeptTasks} Overdue Tasks` : 'All tasks on timeline'}` : 'Ready for tasks';
    const taskBenchAm = totalDeptTasks > 0 ? `${overdueDeptTasks > 0 ? `${overdueDeptTasks} ያለፈባቸው ስራዎች` : 'ሁሉም ስራዎች በሰዓት'}` : 'ስራ ለመመዝገብ ዝግጁ';

    if (totalDeptTasks > 0) {
      if (taskCompletionRate >= 85 && overdueDeptTasks === 0) {
        taskTier = 'optimal';
      } else if (taskCompletionRate >= 70 && overdueDeptTasks <= 1) {
        taskTier = 'good';
      } else if (taskCompletionRate >= 50 || overdueDeptTasks === 2) {
        taskTier = 'watch';
      } else {
        taskTier = 'critical';
      }
    } else {
      taskTier = 'good';
    }

    // Quality & Plan Score from Evaluation Card
    const totalScore = ev ? ev.totalScore : 0;
    const grade = ev ? ev.grade : 'C';
    let qualityTier: IntensityTier = 'good';

    if (totalScore > 0) {
      if (grade === 'A' || totalScore >= 44) {
        qualityTier = 'optimal';
      } else if (grade === 'B' || totalScore >= 38) {
        qualityTier = 'good';
      } else if (grade === 'C' || totalScore >= 32) {
        qualityTier = 'watch';
      } else {
        qualityTier = 'critical';
      }
    } else {
      qualityTier = 'good';
    }

    const qualityFormatted = totalScore > 0 ? `${totalScore.toFixed(1)}/50` : '0.0/50';
    const qualitySub = totalScore > 0 ? `Grade ${grade} · Kaizen ${ev ? ev.safetyKaizen : 0}/10` : 'Pending Score';
    const qualityBench = totalScore > 0
      ? `Plan vs Actual: ${ev ? ev.planVsActual : 0}/10 · Quality: ${ev ? ev.qualityScrap : 0}/10`
      : 'Evaluation pending (Scorecard ready)';
    const qualityBenchAm = totalScore > 0
      ? `ዕቅድ ከክንውን: ${ev ? ev.planVsActual : 0}/10 · ጥራት: ${ev ? ev.qualityScrap : 0}/10`
      : 'ምዘና በመጠባበቅ ላይ';

    // Overall Department Tier calculation
    const tiers = [oeeTier, scrapTier, budgetTier, taskTier, qualityTier];
    let overallTier: IntensityTier = 'good';
    if (tiers.includes('critical')) {
      overallTier = 'critical';
    } else if (tiers.filter((t) => t === 'watch').length >= 2) {
      overallTier = 'watch';
    } else if (tiers.filter((t) => t === 'optimal').length >= 3 && !tiers.includes('watch')) {
      overallTier = 'optimal';
    } else {
      overallTier = 'good';
    }

    return {
      deptId: dept.id,
      nameEn: dept.nameEn,
      nameAm: dept.nameAm,
      headEn: dept.headEn,
      headAm: dept.headAm,
      grade,
      overallScore: totalScore,
      overallTier,
      oee: {
        rawValue: deptOee,
        formattedValue: oeeFormatted,
        subText: oeeSubText,
        tier: oeeTier,
        benchmarkInfo: oeeBenchmark,
        benchmarkInfoAm: oeeBenchmarkAm,
        tooltipTitle: 'Overall Equipment Effectiveness (OEE)',
        tooltipTitleAm: 'አጠቃላይ የማሽን ቅልጥፍና (OEE)',
      },
      scrap: {
        rawValue: cs ? cs.defectRatePct : 0,
        formattedValue: scrapFormatted,
        subText: scrapSub,
        tier: scrapTier,
        benchmarkInfo: scrapBench,
        benchmarkInfoAm: scrapBenchAm,
        tooltipTitle: 'Scrap & Defect Rate (%)',
        tooltipTitleAm: 'የብክነትና ጉድለት ምጣኔ (%)',
        note: scrapNote,
        noteAm: scrapNoteAm,
      },
      budget: {
        rawValue: bg ? bg.variancePct : 0,
        formattedValue: budgetFormatted,
        subText: budgetSub,
        tier: budgetTier,
        benchmarkInfo: budgetBench,
        benchmarkInfoAm: budgetBenchAm,
        tooltipTitle: 'Budget Variance & Cost Adherence',
        tooltipTitleAm: 'የበጀት ልዩነት እና ወጪ ቁጥጥር',
        note: budgetNote,
        noteAm: budgetNoteAm,
      },
      taskRate: {
        rawValue: taskCompletionRate,
        formattedValue: taskFormatted,
        subText: taskSub,
        tier: taskTier,
        benchmarkInfo: taskBench,
        benchmarkInfoAm: taskBenchAm,
        tooltipTitle: 'Weekly Task Execution Rate',
        tooltipTitleAm: 'የሳምንታዊ ስራዎች ክንውን ምጣኔ',
      },
      qualityScore: {
        rawValue: totalScore,
        formattedValue: qualityFormatted,
        subText: qualitySub,
        tier: qualityTier,
        benchmarkInfo: qualityBench,
        benchmarkInfoAm: qualityBenchAm,
        tooltipTitle: 'Department Evaluation Score & Grade',
        tooltipTitleAm: 'የክፍል አጠቃላይ ግምገማ ውጤት',
      },
    };
  });

  // Filter rows if user clicks a filter pill
  const filteredRows = filterTier === 'all' 
    ? rows 
    : rows.filter((r) => r.overallTier === filterTier || [r.oee.tier, r.scrap.tier, r.budget.tier, r.taskRate.tier].includes(filterTier));

  // Counts for summary pills
  const criticalCount = rows.filter((r) => r.overallTier === 'critical').length;
  const watchCount = rows.filter((r) => r.overallTier === 'watch').length;
  const optimalCount = rows.filter((r) => r.overallTier === 'optimal').length;
  const goodCount = rows.filter((r) => r.overallTier === 'good').length;

  // Helper styling for Intensity Square Blocks
  const getIntensitySquareStyle = (tier: IntensityTier) => {
    switch (tier) {
      case 'optimal':
        return {
          container: 'bg-emerald-950/70 border-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-900/60 text-emerald-100 shadow-sm shadow-emerald-950/50',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          indicator: 'bg-emerald-400',
          dot: 'bg-emerald-400 ring-2 ring-emerald-950',
        };
      case 'good':
        return {
          container: 'bg-slate-900/90 border-slate-700/80 hover:border-emerald-700/60 hover:bg-slate-800 text-slate-200',
          badge: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/30',
          indicator: 'bg-emerald-500',
          dot: 'bg-emerald-500 ring-2 ring-slate-950',
        };
      case 'watch':
        return {
          container: 'bg-amber-950/40 border-amber-600/50 hover:border-amber-500 hover:bg-amber-900/40 text-amber-100 shadow-sm shadow-amber-950/30',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          indicator: 'bg-amber-400',
          dot: 'bg-amber-400 ring-2 ring-slate-950',
        };
      case 'critical':
        return {
          container: 'bg-rose-950/60 border-rose-500/70 hover:border-rose-400 hover:bg-rose-900/60 text-rose-100 shadow-sm shadow-rose-950/50 ring-1 ring-rose-500/20',
          badge: 'bg-rose-500/25 text-rose-200 border-rose-500/50 font-bold',
          indicator: 'bg-rose-400 animate-pulse',
          dot: 'bg-rose-500 ring-2 ring-slate-950 animate-ping',
        };
    }
  };

  const getTierLabel = (tier: IntensityTier) => {
    switch (tier) {
      case 'optimal':
        return langMode === 'am' ? 'ምርጥ (Optimal)' : 'Optimal';
      case 'good':
        return langMode === 'am' ? 'መደበኛ (Target)' : 'On Target';
      case 'watch':
        return langMode === 'am' ? 'ክትትል (Watch)' : 'Watch';
      case 'critical':
        return langMode === 'am' ? 'ወሳኝ (Critical)' : 'Critical';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header & Sub-Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {langMode === 'am' 
                    ? 'የፋብሪካ ክፍሎች የአፈጻጸም ካርታ (Performance Heatmap Grid)' 
                    : langMode === 'bilingual'
                    ? 'Department Performance Heatmap · የአፈጻጸም ካርታ'
                    : 'Department-Level Performance Heatmap Grid'}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                  {DEPARTMENTS.length} DEPARTMENTS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {langMode === 'am'
                  ? 'የ OEE፣ ብክነት ምጣኔ፣ በጀት እና የሳምንት ስራዎች የቀለም ደረጃ በየክፍሉ በጨረፍታ'
                  : `High-density color intensity matrix showing at-a-glance operational status across all ${DEPARTMENTS.length} plant departments`}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls & Status Counter Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider hidden sm:inline">
            {langMode === 'am' ? 'ማጣሪያ:' : 'Filter:'}
          </span>
          <button
            onClick={() => setFilterTier('all')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filterTier === 'all'
                ? 'bg-slate-700 text-white border border-slate-600'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {langMode === 'am' ? `ሁሉም (${rows.length})` : `All (${rows.length})`}
          </button>
          <button
            onClick={() => setFilterTier('critical')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filterTier === 'critical'
                ? 'bg-rose-900/60 text-rose-200 border border-rose-500'
                : 'bg-rose-950/30 text-rose-400 border border-rose-900/50 hover:bg-rose-900/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>{langMode === 'am' ? 'ወሳኝ' : 'Critical'} ({criticalCount})</span>
          </button>
          <button
            onClick={() => setFilterTier('watch')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filterTier === 'watch'
                ? 'bg-amber-900/60 text-amber-200 border border-amber-500'
                : 'bg-amber-950/30 text-amber-400 border border-amber-900/50 hover:bg-amber-900/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>{langMode === 'am' ? 'ክትትል' : 'Watch'} ({watchCount})</span>
          </button>
          <button
            onClick={() => setFilterTier('optimal')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filterTier === 'optimal'
                ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-500'
                : 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/50 hover:bg-emerald-900/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{langMode === 'am' ? 'ምርጥ' : 'Optimal'} ({optimalCount})</span>
          </button>
        </div>
      </div>

      {/* Main Heatmap Grid Table */}
      <div className="overflow-x-auto rounded border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
              <th className="py-2.5 px-3.5 w-52">
                {langMode === 'am' ? 'የክፍል ስም / ኃላፊ' : 'Department & Lead'}
              </th>
              <th className="py-2.5 px-2.5 text-center w-28">
                {langMode === 'am' ? 'አጠቃላይ ሁኔታ' : 'Health Status'}
              </th>
              <th className="py-2.5 px-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>{langMode === 'am' ? 'OEE ቅልጥፍና' : 'OEE (%)'}</span>
                  <span className="text-[9px] text-slate-500 font-normal">≥80% tgt</span>
                </div>
              </th>
              <th className="py-2.5 px-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>{langMode === 'am' ? 'የብክነት ምጣኔ' : 'Scrap Rate (%)'}</span>
                  <span className="text-[9px] text-slate-500 font-normal">≤3% tgt</span>
                </div>
              </th>
              <th className="py-2.5 px-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>{langMode === 'am' ? 'የበጀት ልዩነት' : 'Budget Variance'}</span>
                  <span className="text-[9px] text-slate-500 font-normal">±5% lim</span>
                </div>
              </th>
              <th className="py-2.5 px-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>{langMode === 'am' ? 'ስራዎች ክንውን' : 'Task Execution'}</span>
                  <span className="text-[9px] text-slate-500 font-normal">W44 rate</span>
                </div>
              </th>
              <th className="py-2.5 px-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>{langMode === 'am' ? 'የግምገማ ውጤት' : 'Evaluation'}</span>
                  <span className="text-[9px] text-slate-500 font-normal">out of 50</span>
                </div>
              </th>
              <th className="py-2.5 px-3 text-center w-16">
                {langMode === 'am' ? 'ዝርዝር' : 'Action'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850 text-xs">
            {filteredRows.map((row) => {
              const deptStyle = getIntensitySquareStyle(row.overallTier);
              return (
                <tr 
                  key={row.deptId}
                  className="hover:bg-slate-900/60 transition-colors group cursor-pointer"
                  onClick={() => onSelectDepartment(row.deptId)}
                >
                  {/* Department Column */}
                  <td className="py-3 px-3.5 border-r border-slate-800/60 bg-slate-900/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                          <span>
                            {langMode === 'am' 
                              ? row.nameAm 
                              : langMode === 'bilingual' 
                              ? `${row.nameEn} (${row.nameAm})` 
                              : row.nameEn}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span>{langMode === 'am' ? row.headAm : row.headEn}</span>
                        </div>
                        {(() => {
                          const deptInfo = DEPARTMENTS.find((d) => d.id === row.deptId);
                          if (deptInfo?.shops && deptInfo.shops.length > 0) {
                            return (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {deptInfo.shops.map((s) => (
                                  <span key={s.id} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-800/40 font-mono">
                                    {langMode === 'am' ? s.nameAm : s.nameEn}
                                  </span>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </td>

                  {/* Overall Health Status Column */}
                  <td className="py-2 px-2.5 text-center border-r border-slate-800/60">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${deptStyle.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${deptStyle.indicator}`} />
                        {getTierLabel(row.overallTier)}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {langMode === 'am' ? `ደረጃ ${row.grade}` : `Grade ${row.grade}`}
                      </span>
                    </div>
                  </td>

                  {/* 1. OEE Intensity Square Cell */}
                  <td className="py-2 px-2 text-center border-r border-slate-800/60">
                    <HeatmapIntensityCell 
                      cellId={`${row.deptId}-oee`}
                      data={row.oee}
                      langMode={langMode}
                      onHover={setActiveHoverCell}
                      isHovered={activeHoverCell === `${row.deptId}-oee`}
                    />
                  </td>

                  {/* 2. Scrap Rate Intensity Square Cell */}
                  <td className="py-2 px-2 text-center border-r border-slate-800/60">
                    <HeatmapIntensityCell 
                      cellId={`${row.deptId}-scrap`}
                      data={row.scrap}
                      langMode={langMode}
                      onHover={setActiveHoverCell}
                      isHovered={activeHoverCell === `${row.deptId}-scrap`}
                      isInverse={true}
                    />
                  </td>

                  {/* 3. Budget Variance Intensity Square Cell */}
                  <td className="py-2 px-2 text-center border-r border-slate-800/60">
                    <HeatmapIntensityCell 
                      cellId={`${row.deptId}-budget`}
                      data={row.budget}
                      langMode={langMode}
                      onHover={setActiveHoverCell}
                      isHovered={activeHoverCell === `${row.deptId}-budget`}
                    />
                  </td>

                  {/* 4. Task Execution Rate Intensity Square Cell */}
                  <td className="py-2 px-2 text-center border-r border-slate-800/60">
                    <HeatmapIntensityCell 
                      cellId={`${row.deptId}-task`}
                      data={row.taskRate}
                      langMode={langMode}
                      onHover={setActiveHoverCell}
                      isHovered={activeHoverCell === `${row.deptId}-task`}
                    />
                  </td>

                  {/* 5. Quality Evaluation Score Cell */}
                  <td className="py-2 px-2 text-center border-r border-slate-800/60">
                    <HeatmapIntensityCell 
                      cellId={`${row.deptId}-quality`}
                      data={row.qualityScore}
                      langMode={langMode}
                      onHover={setActiveHoverCell}
                      isHovered={activeHoverCell === `${row.deptId}-quality`}
                    />
                  </td>

                  {/* Drill Down CTA */}
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDepartment(row.deptId);
                      }}
                      className="inline-flex items-center justify-center p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title={langMode === 'am' ? 'የክፍሉን ሙሉ ካርድ ክፈት' : 'Open Department Scorecard'}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Industrial Scale Bar & Legend Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
            {langMode === 'am' ? 'የቀለም መጠን መመሪያ (Intensity Legend):' : 'Intensity Scale Legend:'}
          </span>
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            <span className="w-3.5 h-3.5 rounded bg-emerald-600/40 border border-emerald-500/70 inline-block" />
            <span className="text-[11px] text-emerald-300 font-medium">
              {langMode === 'am' ? 'ምርጥ (Optimal / Benchmark)' : 'Optimal (≥ Target)'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            <span className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-700 inline-block" />
            <span className="text-[11px] text-slate-300 font-medium">
              {langMode === 'am' ? 'መደበኛ (Within Spec)' : 'On Target (±5%)'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            <span className="w-3.5 h-3.5 rounded bg-amber-950/60 border border-amber-500/70 inline-block" />
            <span className="text-[11px] text-amber-300 font-medium">
              {langMode === 'am' ? 'ክትትል (Watch / 5-10% Dev)' : 'Watch (5-10% Dev)'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-rose-900/60">
            <span className="w-3.5 h-3.5 rounded bg-rose-950/70 border border-rose-500/80 inline-block" />
            <span className="text-[11px] text-rose-300 font-medium">
              {langMode === 'am' ? 'ወሳኝ (>10% Deviation)' : 'Critical Alert (>10% Dev)'}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 italic">
          {langMode === 'am' 
            ? '💡 የትኛውንም ክፍል በመጫን ዝርዝር የውጤት ካርድ ማየት ይችላሉ' 
            : '💡 Click any department or cell to jump into the full evaluation scorecard'}
        </div>
      </div>
    </div>
  );
};

interface HeatmapIntensityCellProps {
  cellId: string;
  data: MetricCellData;
  langMode: LanguageMode;
  onHover: (id: string | null) => void;
  isHovered: boolean;
  isInverse?: boolean;
}

const HeatmapIntensityCell: React.FC<HeatmapIntensityCellProps> = ({
  cellId,
  data,
  langMode,
  onHover,
  isHovered,
}) => {
  const getStyle = (tier: IntensityTier) => {
    switch (tier) {
      case 'optimal':
        return 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200 group-hover:border-emerald-400';
      case 'good':
        return 'bg-slate-900 border-slate-800 text-slate-200 group-hover:border-slate-700';
      case 'watch':
        return 'bg-amber-950/40 border-amber-600/50 text-amber-200 group-hover:border-amber-400';
      case 'critical':
        return 'bg-rose-950/60 border-rose-600/60 text-rose-200 group-hover:border-rose-400 ring-1 ring-rose-500/20';
    }
  };

  const getDotStyle = (tier: IntensityTier) => {
    switch (tier) {
      case 'optimal':
        return 'bg-emerald-400';
      case 'good':
        return 'bg-slate-400';
      case 'watch':
        return 'bg-amber-400';
      case 'critical':
        return 'bg-rose-500';
    }
  };

  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={() => onHover(cellId)}
      onMouseLeave={() => onHover(null)}
    >
      <div 
        className={`w-full max-w-[130px] mx-auto py-1.5 px-2 rounded-md border text-center transition-all ${getStyle(data.tier)}`}
      >
        <div className="flex items-center justify-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getDotStyle(data.tier)}`} />
          <span className="font-mono font-bold text-xs tracking-tight">
            {data.formattedValue}
          </span>
        </div>
        <div className="text-[10px] font-medium opacity-80 truncate mt-0.5">
          {data.subText}
        </div>
      </div>

      {/* Floating Detailed Tooltip on Hover */}
      {isHovered && (
        <div className="absolute z-30 bottom-full mb-1.5 w-60 p-2.5 rounded-lg bg-slate-900 text-slate-100 border border-slate-700 shadow-xl text-left pointer-events-none">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
            <span className="font-bold text-[11px] text-white">
              {langMode === 'am' ? data.tooltipTitleAm : data.tooltipTitle}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-mono font-semibold ${
              data.tier === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
              data.tier === 'watch' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
              data.tier === 'optimal' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
              'bg-slate-800 text-slate-300'
            }`}>
              {data.tier}
            </span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">{langMode === 'am' ? 'ወቅታዊ ውጤት:' : 'Current Value:'}</span>
              <span className="font-mono font-bold text-white">{data.formattedValue}</span>
            </div>
            <div className="text-slate-400 text-[10px] leading-snug">
              {langMode === 'am' ? data.benchmarkInfoAm : data.benchmarkInfo}
            </div>
            {(data.note || data.noteAm) && (
              <div className="pt-1 mt-1 border-t border-slate-800/80 text-[10px] text-slate-300 font-mono">
                {langMode === 'am' ? (data.noteAm || data.note) : data.note}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
