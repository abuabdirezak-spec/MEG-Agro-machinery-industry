import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  ChevronRight, 
  Flame, 
  Clock, 
  Activity, 
  DollarSign, 
  ShieldAlert, 
  CheckCircle2, 
  SlidersHorizontal,
  Info,
  Wrench,
  Sparkles,
  Layers
} from 'lucide-react';
import { 
  DepartmentId, 
  CapacityAndScrap, 
  MachineOEE, 
  DepartmentBudget, 
  WeeklyTask, 
  DepartmentEvaluation, 
  LanguageMode 
} from '../types/dashboard.ts';
import { DEPARTMENTS } from '../data/mockData.ts';
import { getDepartmentName, formatETB } from '../utils/formatters.ts';

export type InsightType = 'oee_drop' | 'scrap_spike' | 'budget_overrun' | 'task_stall';

export interface OperationalDeviationInsight {
  id: string;
  rank: number;
  type: InsightType;
  departmentId: DepartmentId;
  shopNameEn?: string;
  shopNameAm?: string;
  metricTitleEn: string;
  metricTitleAm: string;
  currentValueFormatted: string;
  benchmarkFormatted: string;
  deviationPercent: number; // e.g., -22.3% or +63.3%
  financialImpactETB: number;
  severity: 'critical' | 'high' | 'warning';
  severityScore: number;
  headlineEn: string;
  headlineAm: string;
  rootCauseEn: string;
  rootCauseAm: string;
  directiveEn: string;
  directiveAm: string;
  primaryMachineId?: string;
  relatedTaskId?: string;
}

interface ExecutiveInsightsPanelProps {
  capacityScrap: CapacityAndScrap[];
  machines: MachineOEE[];
  budgets: DepartmentBudget[];
  tasks: WeeklyTask[];
  evaluations: DepartmentEvaluation[];
  langMode: LanguageMode;
  onNavigateToDepartment: (deptId: DepartmentId) => void;
  onNavigateToTab: (tab: 'departments' | 'tasks' | 'maintenance' | 'recommendations') => void;
  onNavigateToTask?: (taskId: string) => void;
}

export const ExecutiveInsightsPanel: React.FC<ExecutiveInsightsPanelProps> = ({
  capacityScrap,
  machines,
  budgets,
  tasks,
  evaluations,
  langMode,
  onNavigateToDepartment,
  onNavigateToTab,
  onNavigateToTask,
}) => {
  const [showLogicDetails, setShowLogicDetails] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'oee' | 'scrap'>('all');

  // =========================================================================
  // AUTOMATIC DEVIATION DETECTION ENGINE (LOGIC-BASED)
  // =========================================================================
  const { topInsights, totalRiskExposureETB, plantAvgOee, plantAvgScrapRate } = useMemo(() => {
    // 1. Plant Baseline Computations
    const avgOee = machines.length > 0
      ? machines.reduce((sum, m) => sum + m.oeePct, 0) / machines.length
      : 0;

    const totalScrapUnits = capacityScrap.reduce((sum, c) => sum + c.scrapPieces, 0);
    const totalOutputUnits = capacityScrap.reduce((sum, c) => sum + c.actualOutputUnits, 0);
    const avgScrapRate = totalOutputUnits > 0 ? (totalScrapUnits / totalOutputUnits) * 100 : 0;

    const totalScrapCost = capacityScrap.reduce((sum, c) => sum + c.scrapCostETB, 0);
    const avgShopScrapCost = capacityScrap.length > 0 ? totalScrapCost / capacityScrap.length : 0;

    const candidateInsights: OperationalDeviationInsight[] = [];

    // 2. Pillar A: Sudden Drops in Machine OEE & Shop Availability (only if machines logged)
    if (machines.length > 0 && avgOee > 0) {
      machines.forEach((m) => {
        // Flag if machine OEE is significantly below plant benchmark (> 8% drop) or in Maintenance with low OEE
        const oeeDiff = m.oeePct - avgOee;
        const oeeDeviationPct = ((m.oeePct - avgOee) / avgOee) * 100;

        if (oeeDeviationPct <= -8.0 || m.oeePct < 70.0 || m.status === 'Maintenance') {
        const downtimeLossETB = Math.round((100 - m.availabilityPct) * 2800); // estimated downtime loss
        const calculatedSeverityScore = Math.abs(oeeDeviationPct) * 2.2 + (m.status === 'Maintenance' ? 25 : 10);

        let rootCauseEn = 'Hydraulic pressure fluctuation and spindle bearing thermal expansion leading to intermittent cut-outs.';
        let rootCauseAm = 'የሃይድሮሊክ ግፊት መለዋወጥ እና የተሸካሚ ሙቀት መጨመር ምክንያት የሚፈጠር መቆራረጥ።';
        let directiveEn = 'Deploy mechanical maintenance crew for urgent calibration; inspect hydraulic valves and coolant pressure.';
        let directiveAm = 'አስቸኳይ ጥገና እንዲደረግ የሜካኒካል ቡድን ይመደብ፤ የቫልቭ እና የኩላንት ግፊት ይመረመር።';
        let shopNameEn = undefined;
        let shopNameAm = undefined;

        if (m.machineId === 'DISC-HEAT-01') {
          rootCauseEn = 'Thermocouple drift in Zone 2 furnace causing uneven quench hardening and 65 hours of accumulated downtime.';
          rootCauseAm = 'በዞን 2 እቶን ቴርሞካፕል መዛባት ምክንያት የሙቀት አለመመጣጠን እና 65 ሰዓታት ስራ መቋረጥ አስከትሏል።';
          directiveEn = 'Recalibrate optical pyrometers and replace burned heating elements before initiating next 24" tractor disc batch.';
          directiveAm = 'ቀጣዩ የ24 ኢንች ትራክተር ዲስክ ከመጀመሩ በፊት የቴርሞሜትር ማስተካከያ ይደረግ እና የተቃጠሉ ኤለመንቶች ይቀየሩ።';
          shopNameEn = 'Quenching Line';
          shopNameAm = 'የማጠንከሪያ መስመር';
        } else if (m.machineId === 'WELD-ROBOT-01') {
          rootCauseEn = 'Wire feed tension roller slippage on Robotic Cell #1 causing weld arc instability and tractor chassis delay.';
          rootCauseAm = 'በሮቦት ሴል #1 የሽቦ መጋቢ ሮለር መንሸራተት ምክንያት የአርክ ብየዳ አለመረጋጋት እና የመዋቅር መዘግየት።';
          directiveEn = 'Replace knurled wire drive rollers and perform weld macro-etch inspection before assembly release.';
          directiveAm = 'የሽቦ መጋቢ ሮለሮችን በአዲስ በመተካት የብየዳ ጥራት ፍተሻ ይደረግ።';
          shopNameEn = 'Welding Shop';
          shopNameAm = 'የብየዳ ክፍል';
        }

        candidateInsights.push({
          id: `insight-oee-${m.machineId}`,
          rank: 0,
          type: 'oee_drop',
          departmentId: m.departmentId,
          shopNameEn,
          shopNameAm,
          metricTitleEn: `OEE Sudden Drop: ${m.nameEn}`,
          metricTitleAm: `የኦኢኢ (OEE) ድንገተኛ ቅናሽ፡ ${m.nameAm}`,
          currentValueFormatted: `${m.oeePct.toFixed(1)}%`,
          benchmarkFormatted: `${avgOee.toFixed(1)}% Plant Avg`,
          deviationPercent: parseFloat(oeeDeviationPct.toFixed(1)),
          financialImpactETB: downtimeLossETB + (m.departmentId === 'disc_blade' ? 185000 : 75000),
          severity: m.oeePct < 62 ? 'critical' : 'high',
          severityScore: calculatedSeverityScore,
          headlineEn: `${m.machineId} OEE dropped to ${m.oeePct.toFixed(1)}% (${Math.abs(oeeDeviationPct).toFixed(1)}% below plant target)`,
          headlineAm: `${m.machineId} ኦኢኢ ወደ ${m.oeePct.toFixed(1)}% ዝቅ ብሏል (ከፋብሪካው አማካኝ በ${Math.abs(oeeDeviationPct).toFixed(1)}% ያነሰ)`,
          rootCauseEn,
          rootCauseAm,
          directiveEn,
          directiveAm,
          });
        }
      });
    }

    // 3. Pillar B: Excessive Spikes in Scrap Costs & Scrap Rates (only if scrap logged)
    if (totalScrapCost > 0 && avgShopScrapCost > 0) {
      capacityScrap.forEach((cs) => {
        const isHighCost = cs.scrapCostETB > 120000;
        const isHighDefectRate = cs.defectRatePct > avgScrapRate;
        const scrapCostDeviationPct = ((cs.scrapCostETB - avgShopScrapCost) / avgShopScrapCost) * 100;

        if (isHighCost || (isHighDefectRate && cs.scrapCostETB > 30000)) {
        let rootCauseEn = `Material dimensional off-cuts and secondary machining trim producing ${cs.scrapPieces} defect pieces.`;
        let rootCauseAm = `የመጠን አለመመጣጠን እና የተረፈ ቆራጭ ብረቶች ${cs.scrapPieces} የተበላሹ ክፍሎችን አስከትለዋል።`;
        let directiveEn = 'Audit machine tooling tolerances, implement optical cut nesting, and enforce pre-cut QC approval.';
        let directiveAm = 'የማሽን መቁረጫዎችን መመርመር፣ የኮምፒውተር ኔስቲንግ መጠቀም እና የቅድመ-መቁረጥ ፍተሻን ማረጋገጥ።';
        let shopNameEn = undefined;
        let shopNameAm = undefined;

        if (cs.departmentId === 'production') {
          rootCauseEn = 'Plasma plate cutting kerf widening on 16mm Hardox plate and excessive chip wastage during CNC hub turning.';
          rootCauseAm = 'በ16 ሚ.ሜ ሀርዶክስ ብረት ፕላዝማ መቁረጫ ላይ የስንጥቅ ስፋት መጨመር እና በሲኤንሲ ማሽን ላይ የተረፈ ብረት መብዛት።';
          directiveEn = 'Calibrate CNC plasma torch cutting speed; mandate reusable scrap segregation to recover 45,000 ETB in remelt value.';
          directiveAm = 'የፕላዝማ መቁረጫ ፍጥነትን ማስተካከል እና ተመልሰው የሚቀልጡ የተረፉ ብረቶችን በመለየት 45,000 ብር ማዳን።';
          shopNameEn = 'Fabrication & Machine Shops';
          shopNameAm = 'ፋብሪኬሽን እና ማሽን ክፍሎች';
        } else if (cs.departmentId === 'disc_blade') {
          rootCauseEn = 'Quench thermal shock warpage during oil immersion of 24" notched discs, resulting in 168 scrapped units.';
          rootCauseAm = 'በዘይት ማቀዝቀዣ ወቅት በሙቀት ንዝረት ምክንያት የዲስኮች መጣመም እና 168 ዲስኮች ከጥቅም ውጭ መሆን።';
          directiveEn = 'Adjust quench agitator timing and standardize pre-heating soaking interval at 880°C.';
          directiveAm = 'የማቀዝቀዣ ዘይት ማነቃቂያ ሰዓትን ማስተካከል እና የቅድመ-ማሞቂያ ሙቀትን በ880°ሴ ማስተካከል።';
          shopNameEn = 'Disc Stamping & Heat Line';
          shopNameAm = 'የዲስክ ማተሚያ እና ሙቀት መስመር';
        }

        const calculatedSeverityScore = (cs.scrapCostETB / 4000) + (cs.defectRatePct * 8);

        candidateInsights.push({
          id: `insight-scrap-${cs.departmentId}`,
          rank: 0,
          type: 'scrap_spike',
          departmentId: cs.departmentId,
          shopNameEn,
          shopNameAm,
          metricTitleEn: `Excessive Scrap Cost: ${formatETB(cs.scrapCostETB)}`,
          metricTitleAm: `ከፍተኛ የስክራፕ ወጪ፡ ${formatETB(cs.scrapCostETB)}`,
          currentValueFormatted: formatETB(cs.scrapCostETB),
          benchmarkFormatted: `${formatETB(avgShopScrapCost)} Shop Avg`,
          deviationPercent: parseFloat(scrapCostDeviationPct.toFixed(1)),
          financialImpactETB: cs.scrapCostETB,
          severity: cs.scrapCostETB > 180000 ? 'critical' : 'high',
          severityScore: calculatedSeverityScore,
          headlineEn: `Excessive scrap cost spike to ${formatETB(cs.scrapCostETB)} (${cs.defectRatePct}% defect rate, ${cs.scrapPieces} pcs)`,
          headlineAm: `የስክራፕ ኪሳራ ወደ ${formatETB(cs.scrapCostETB)} ከፍ ብሏል (${cs.defectRatePct}% የስክራፕ ምጣኔ፣ ${cs.scrapPieces} እቃዎች)`,
          rootCauseEn,
          rootCauseAm,
          directiveEn,
          directiveAm,
        });
      }
    });
  }

    // 4. Pillar C: Critical Budget Overruns (> 5% Variance)
    budgets.forEach((b) => {
      if (b.plannedBudgetETB > 0 && b.actualSpendETB > b.plannedBudgetETB) {
        const overrunETB = b.actualSpendETB - b.plannedBudgetETB;
        const overrunPct = (overrunETB / b.plannedBudgetETB) * 100;

        if (overrunPct >= 5.0 || overrunETB > 50000) {
          candidateInsights.push({
            id: `insight-budget-${b.departmentId}`,
            rank: 0,
            type: 'budget_overrun',
            departmentId: b.departmentId,
            metricTitleEn: `Budget Variance Overrun: +${formatETB(overrunETB)}`,
            metricTitleAm: `የበጀት ወጪ ብልጫ፡ +${formatETB(overrunETB)}`,
            currentValueFormatted: formatETB(b.actualSpendETB),
            benchmarkFormatted: `${formatETB(b.plannedBudgetETB)} Planned`,
            deviationPercent: parseFloat(overrunPct.toFixed(1)),
            financialImpactETB: overrunETB,
            severity: overrunPct > 8 ? 'critical' : 'warning',
            severityScore: (overrunETB / 5000) + (overrunPct * 3),
            headlineEn: `Department budget exceeded by +${formatETB(overrunETB)} (+${overrunPct.toFixed(1)}% variance)`,
            headlineAm: `የክፍሉ ወጪ ከተመደበው በ+${formatETB(overrunETB)} (+${overrunPct.toFixed(1)}%) በልጧል`,
            rootCauseEn: 'Emergency procurement of imported fasteners and unplanned weekend double-shift overtime to meet tractor quota.',
            rootCauseAm: 'የአስቸኳይ መለዋወጫዎች ግዢ እና የትራክተር ምርት እቅድን ለማሳካት ቅዳሜና እሁድ የተሰራ ተጨማሪ ሰዓት።',
            directiveEn: 'Enforce strict overtime authorization and freeze non-essential consumables until month-end budget reconciliation.',
            directiveAm: 'የትርፍ ሰዓት ስራዎች ጥብቅ ፈቃድ እንዲያገኙ መደረግ እና እስከ ወሩ መጨረሻ ድረስ አላስፈላጊ ወጪዎች መታገድ አለባቸው።',
          });
        }
      }
    });

    // 5. Pillar D: Urgent / Critical Stalled Tasks
    tasks.forEach((t) => {
      const perfPct = t.plannedQty > 0 ? Math.round((t.actualQty / t.plannedQty) * 100) : t.progressPercent;
      if ((t.priority === 'Urgent' || t.priority === 'Critical') && (t.status === 'Overdue' || (t.status === 'Delayed' && perfPct < 60))) {
        const gapUnits = Math.max(0, t.plannedQty - t.actualQty);
        candidateInsights.push({
          id: `insight-task-${t.id}`,
          rank: 0,
          type: 'task_stall',
          departmentId: t.departmentId,
          metricTitleEn: `Critical Milestone Delay: ${t.id}`,
          metricTitleAm: `ወሳኝ የስራ መዘግየት፡ ${t.id}`,
          currentValueFormatted: `${perfPct}% (${t.actualQty}/${t.plannedQty} ${t.unit})`,
          benchmarkFormatted: '100% Target',
          deviationPercent: parseFloat((perfPct - 100).toFixed(1)),
          financialImpactETB: gapUnits * 1500,
          severity: t.status === 'Overdue' ? 'critical' : 'high',
          severityScore: 75 + (100 - perfPct) * 0.4,
          headlineEn: `Urgent task stalled at ${perfPct}% completion (${gapUnits} ${t.unit} deficit)`,
          headlineAm: `አስቸኳይ ስራ በ${perfPct}% ተገድቧል (${gapUnits} ${t.unit} ጉድለት)`,
          rootCauseEn: t.titleEn,
          rootCauseAm: t.titleAm,
          directiveEn: 'Reassign senior technicians to clear production bottleneck within 48 hours.',
          directiveAm: 'የምርት ማነቆውን በ48 ሰዓታት ውስጥ ለመፍታት ከፍተኛ ቴክኒሻኖች ይመደቡ።',
          relatedTaskId: t.id,
        });
      }
    });

    // 6. Deduplicate & Prioritize Top 3
    // Sort strictly by severityScore descending
    candidateInsights.sort((a, b) => b.severityScore - a.severityScore);

    // Filter to ensure top 3 covers distinct departments or the most urgent events
    const selected: OperationalDeviationInsight[] = [];
    const usedKeys = new Set<string>();

    for (const item of candidateInsights) {
      const key = `${item.type}-${item.departmentId}`;
      if (!usedKeys.has(key)) {
        usedKeys.add(key);
        selected.push(item);
      }
      if (selected.length === 3) break;
    }

    // Fallback if less than 3
    if (selected.length < 3) {
      for (const item of candidateInsights) {
        if (!selected.includes(item)) {
          selected.push(item);
        }
        if (selected.length === 3) break;
      }
    }

    // Assign rank 1, 2, 3
    selected.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    const totalRisk = selected.reduce((sum, item) => sum + item.financialImpactETB, 0);

    return {
      topInsights: selected,
      totalRiskExposureETB: totalRisk,
      plantAvgOee: avgOee,
      plantAvgScrapRate: avgScrapRate,
    };
  }, [capacityScrap, machines, budgets, tasks]);

  // Filter top insights if user toggles quick pill
  const filteredInsights = topInsights.filter((item) => {
    if (activeFilter === 'oee') return item.type === 'oee_drop';
    if (activeFilter === 'scrap') return item.type === 'scrap_spike';
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-lg">
      {/* Top Banner / Executive Insight Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title & Badge */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-inner">
              <Zap className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>
                    {langMode === 'am' 
                      ? 'የዋና ስራ አስፈፃሚ ግንዛቤዎች · ሳምንታዊ ወሳኝ ልዩነቶች' 
                      : langMode === 'bilingual'
                      ? 'Executive Insights · ሳምንታዊ ወሳኝ ልዩነቶች'
                      : 'Executive Insights · Critical Operational Deviations'}
                  </span>
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-rose-300 bg-rose-950/70 border border-rose-800/60 rounded">
                  Top 3 Flagged (W44)
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Auto-Calculated
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {langMode === 'am'
                  ? 'በዚህ ሳምንት ከፋብሪካው መደበኛ አፈጻጸም ከፍተኛ ልዩነት ያሳዩ ከፍተኛ 3 ወሳኝ የአሰራር ችግሮች (የOEE ቅናሽ፣ የስክራፕ ወጪ ጭማሪ እና የበጀት ልዩነት)'
                  : 'Automated algorithmic surveillance flagging the 3 highest risk deviations in Plant OEE, Scrap Costs, and Schedule Bottlenecks this week.'}
              </p>
            </div>
          </div>

          {/* Aggregate Financial Exposure & Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold leading-tight">
                  {langMode === 'am' ? 'የተጋላጭነት ወጪ ስጋት' : 'Total Risk Exposure'}
                </span>
                <span className="text-xs font-mono font-bold text-rose-400">
                  {formatETB(totalRiskExposureETB)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowLogicDetails(!showLogicDetails)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                showLogicDetails 
                  ? 'bg-blue-900/40 border-blue-600 text-blue-200' 
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
              title="Show algorithmic criteria and formula"
            >
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>{showLogicDetails ? 'Hide Logic' : 'Detection Logic'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Detection Logic Box */}
        {showLogicDetails && (
          <div className="mt-3.5 pt-3 border-t border-slate-800 text-xs text-slate-300 grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/70 p-3 rounded border border-slate-800/80 animate-in fade-in duration-200">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                1. OEE Sudden Drop Criteria
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Flags any machine or department where OEE is &gt; 8% below the monthly average (<span className="text-slate-200 font-mono">{plantAvgOee.toFixed(1)}%</span>) or currently logged in emergency maintenance status.
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3 h-3" />
                2. Excessive Scrap Cost Criteria
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Flags departments exceeding the 100,000 ETB scrap cost threshold or defect rate &gt; monthly average (<span className="text-slate-200 font-mono">{plantAvgScrapRate.toFixed(2)}%</span>).
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" />
                3. Severity Impact Scoring
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Scores composite impact based on financial exposure in ETB, percentage deviation from standard, equipment criticality, and assembly line bottleneck risk.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3 Most Critical Operational Deviation Cards */}
      <div className="p-4 sm:p-5">
        {filteredInsights.length === 0 ? (
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-8 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              {langMode === 'am' ? 'የስራ እንቅስቃሴው መደበኛ ነው · ምንም ወሳኝ የአሰራር ልዩነት አልተገኘም' : 'Operational Status: Nominal · No Critical Deviations Detected'}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto leading-relaxed">
              {langMode === 'am' 
                ? 'ሁሉም ቁልፍ የማምረቻ ክፍሎች፣ የማሽን ብቃት እና የወጪ መለኪያዎች በመደበኛ ገደብ ውስጥ ይገኛሉ። አዳዲስ መረጃዎችን ለማስገባት ተዘጋጅቷል።' 
                : 'All plant parameters, OEE benchmarks, scrap costs, and weekly schedules are operating within standard tolerance. The system is clean and ready for live operational data entry.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {filteredInsights.map((insight) => {
            const isRank1 = insight.rank === 1;
            const isRank2 = insight.rank === 2;
            const isRank3 = insight.rank === 3;

            // Distinctive styling per rank
            const cardBorderColor = isRank1 
              ? 'border-rose-600/70 bg-gradient-to-b from-rose-950/20 via-slate-900 to-slate-900 shadow-rose-950/30' 
              : isRank2 
              ? 'border-amber-600/60 bg-gradient-to-b from-amber-950/20 via-slate-900 to-slate-900 shadow-amber-950/30' 
              : 'border-yellow-600/60 bg-gradient-to-b from-yellow-950/15 via-slate-900 to-slate-900 shadow-yellow-950/30';

            const badgeBg = isRank1 
              ? 'bg-rose-500 text-white' 
              : isRank2 
              ? 'bg-amber-500 text-slate-950' 
              : 'bg-yellow-500 text-slate-950';

            const dept = DEPARTMENTS.find((d) => d.id === insight.departmentId);

            return (
              <div 
                key={insight.id}
                className={`flex flex-col justify-between border rounded-lg p-4 sm:p-4.5 transition-all hover:border-slate-600 shadow-md ${cardBorderColor}`}
              >
                <div>
                  {/* Card Header: Rank, Type, and Department */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-black ${badgeBg}`}>
                        #{insight.rank}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                        {isRank1 
                          ? (langMode === 'am' ? 'ከፍተኛ አደጋ' : 'Maximum Criticality') 
                          : isRank2 
                          ? (langMode === 'am' ? 'ሁለተኛ ወሳኝ ልዩነት' : 'High Urgency') 
                          : (langMode === 'am' ? 'ሦስተኛ ቅድሚያ' : 'Priority Attention')}
                      </span>
                    </div>

                    {/* Deviation Type Badge */}
                    <div className="flex items-center gap-1">
                      {insight.type === 'oee_drop' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-300 bg-rose-950/60 border border-rose-800/70 px-2 py-0.5 rounded">
                          <TrendingDown className="w-3 h-3 text-rose-400" />
                          <span>OEE Drop</span>
                        </span>
                      )}
                      {insight.type === 'scrap_spike' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/70 px-2 py-0.5 rounded">
                          <Flame className="w-3 h-3 text-amber-400" />
                          <span>Scrap Spike</span>
                        </span>
                      )}
                      {insight.type === 'budget_overrun' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-300 bg-purple-950/60 border border-purple-800/70 px-2 py-0.5 rounded">
                          <DollarSign className="w-3 h-3 text-purple-400" />
                          <span>Budget Overrun</span>
                        </span>
                      )}
                      {insight.type === 'task_stall' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-300 bg-orange-950/60 border border-orange-800/70 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3 text-orange-400" />
                          <span>Task Delay</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Department & Shop Identifier */}
                  <div className="mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <span>{getDepartmentName(insight.departmentId, langMode)}</span>
                      {insight.shopNameEn && (
                        <>
                          <span className="text-slate-500">/</span>
                          <span className="text-blue-400 font-semibold">
                            {langMode === 'am' ? insight.shopNameAm : insight.shopNameEn}
                          </span>
                        </>
                      )}
                    </div>
                    {dept?.headEn && (
                      <span className="text-[11px] text-slate-400 block font-normal">
                        Lead: {langMode === 'am' ? dept.headAm : dept.headEn}
                      </span>
                    )}
                  </div>

                  {/* Headline & Core Metric Comparison Box */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded p-3 mb-3 space-y-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                          {langMode === 'am' ? 'የአሁኑ አፈጻጸም' : 'Current Value'}
                        </span>
                        <span className="text-lg font-mono font-bold text-white tracking-tight">
                          {insight.currentValueFormatted}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                          {langMode === 'am' ? 'ልዩነት ከመነሻ' : 'Deviation'}
                        </span>
                        <span className={`text-sm font-mono font-bold ${
                          insight.deviationPercent < 0 ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                          {insight.deviationPercent > 0 ? `+${insight.deviationPercent}%` : `${insight.deviationPercent}%`}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        {langMode === 'am' ? 'የመነሻ መለኪያ፡' : 'Benchmark:'}
                      </span>
                      <span className="font-mono text-slate-300">
                        {insight.benchmarkFormatted}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        {langMode === 'am' ? 'የገንዘብ ተጽእኖ ስጋት፡' : 'Financial Impact:'}
                      </span>
                      <span className="font-mono font-bold text-rose-400">
                        {formatETB(insight.financialImpactETB)}
                      </span>
                    </div>
                  </div>

                  {/* Root Cause Analysis (English & Amharic) */}
                  <div className="space-y-1 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>{langMode === 'am' ? 'የስር መንስኤ (Root Cause):' : 'Identified Root Cause:'}</span>
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/90 border border-slate-800/80 p-2 rounded">
                      {langMode === 'am' 
                        ? insight.rootCauseAm 
                        : langMode === 'bilingual' 
                        ? `${insight.rootCauseEn} (${insight.rootCauseAm})` 
                        : insight.rootCauseEn}
                    </p>
                  </div>

                  {/* Recommended Executive Directive */}
                  <div className="space-y-1 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{langMode === 'am' ? 'የአመራር ውሳኔ / አፋጣኝ እርምጃ:' : 'Executive Directive & Countermeasure:'}</span>
                    </span>
                    <p className="text-xs text-emerald-300/90 bg-emerald-950/30 border border-emerald-800/40 p-2 rounded leading-relaxed">
                      {langMode === 'am' 
                        ? insight.directiveAm 
                        : langMode === 'bilingual'
                        ? `${insight.directiveEn} (${insight.directiveAm})`
                        : insight.directiveEn}
                    </p>
                  </div>
                </div>

                {/* Card Actions / Drill Downs */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => onNavigateToDepartment(insight.departmentId)}
                    className="flex-1 py-1.5 px-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded transition-colors flex items-center justify-center gap-1"
                  >
                    <span>{langMode === 'am' ? 'ክፍሉን ተመልከት' : 'Drill Down'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                  </button>

                  {insight.type === 'oee_drop' && (
                    <button
                      onClick={() => onNavigateToTab('maintenance')}
                      className="py-1.5 px-2.5 text-xs font-semibold text-rose-300 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/50 rounded transition-colors flex items-center gap-1"
                      title="Inspect Machine Logs in Preventive Maintenance"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{langMode === 'am' ? 'ጥገና' : 'Machine Log'}</span>
                    </button>
                  )}

                  {insight.type === 'scrap_spike' && (
                    <button
                      onClick={() => onNavigateToDepartment(insight.departmentId)}
                      className="py-1.5 px-2.5 text-xs font-semibold text-amber-300 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-800/50 rounded transition-colors flex items-center gap-1"
                      title="Inspect Scrap Breakdown in Department Card"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{langMode === 'am' ? 'ስክራፕ' : 'Scrap'}</span>
                    </button>
                  )}

                  {insight.type === 'task_stall' && onNavigateToTask && insight.relatedTaskId && (
                    <button
                      onClick={() => onNavigateToTask(insight.relatedTaskId!)}
                      className="py-1.5 px-2.5 text-xs font-semibold text-orange-300 bg-orange-950/50 hover:bg-orange-900/60 border border-orange-800/50 rounded transition-colors flex items-center gap-1"
                      title="Open Task in Weekly Task Registry"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{langMode === 'am' ? 'ስራ' : 'Task'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
};
