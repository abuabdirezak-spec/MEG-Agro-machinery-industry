import React, { useState } from 'react';
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  Filter, 
  SlidersHorizontal,
  Flame,
  Activity,
  Award
} from 'lucide-react';
import { 
  DepartmentId, 
  CapacityAndScrap, 
  MachineOEE, 
  LanguageMode 
} from '../types/dashboard.ts';
import { DEPARTMENTS } from '../data/mockData.ts';
import { getDepartmentName, formatETB } from '../utils/formatters.ts';

export interface DeviationAlert {
  id: string;
  departmentId: DepartmentId;
  metric: 'OEE' | 'Scrap Rate';
  departmentValue: number;
  monthlyAverage: number;
  deviationPercent: number; // e.g. +48.2% or -21.0%
  direction: 'unfavorable' | 'favorable';
  severity: 'critical' | 'warning' | 'benchmark';
  rootCauseEn: string;
  rootCauseAm: string;
  financialImpactETB?: number;
}

interface DeviationAlertPanelProps {
  capacityScrap: CapacityAndScrap[];
  machines: MachineOEE[];
  onNavigateToDepartment: (deptId: DepartmentId) => void;
  langMode: LanguageMode;
}

export const DeviationAlertPanel: React.FC<DeviationAlertPanelProps> = ({
  capacityScrap,
  machines,
  onNavigateToDepartment,
  langMode,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'unfavorable' | 'favorable'>('all');
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // 1. Calculate Monthly Plant Average Scrap Rate (weighted by actual production units)
  const totalScrap = capacityScrap.reduce((sum, c) => sum + c.scrapPieces, 0);
  const totalUnits = capacityScrap.reduce((sum, c) => sum + c.actualOutputUnits, 0);
  const monthlyAvgScrapRate = totalUnits > 0 ? (totalScrap / totalUnits) * 100 : 0;

  // 2. Calculate Monthly Plant Average OEE
  const monthlyAvgOee = machines.length > 0
    ? machines.reduce((sum, m) => sum + m.oeePct, 0) / machines.length
    : 0;

  // 3. Department-level OEE calculation
  const deptOeeMap: Partial<Record<DepartmentId, { totalOee: number; count: number }>> = {};
  DEPARTMENTS.forEach((d) => {
    deptOeeMap[d.id] = { totalOee: 0, count: 0 };
  });

  machines.forEach((m) => {
    if (!deptOeeMap[m.departmentId]) {
      deptOeeMap[m.departmentId] = { totalOee: 0, count: 0 };
    }
    deptOeeMap[m.departmentId]!.totalOee += m.oeePct;
    deptOeeMap[m.departmentId]!.count += 1;
  });

  const alerts: DeviationAlert[] = [];

  // 4. Identify Scrap Rate Deviations (> 10% difference from monthly average) - only when production has started
  if (monthlyAvgScrapRate > 0) {
    capacityScrap.forEach((cs) => {
      const deviationPct = ((cs.defectRatePct - monthlyAvgScrapRate) / monthlyAvgScrapRate) * 100;
      
      // Higher scrap is UNFAVORABLE; lower scrap is FAVORABLE
      if (Math.abs(deviationPct) >= 10 && cs.actualOutputUnits > 0) {
        const isUnfavorable = deviationPct > 0;
        
        let rootCauseEn = 'Automated CNC tool wear offset tracking keeping defect rates low.';
        let rootCauseAm = 'የመሳሪያዎች መበላት በሲኤንሲ አውቶማቲክ ቁጥጥር ዝቅተኛ ብክነት ማስመዝገቡ።';

        if (cs.departmentId === 'foundry') {
          rootCauseEn = 'Sand muller moisture instability and high slag inclusion in cast volute housings.';
          rootCauseAm = 'በአሸዋ ዝግጅት ወቅት ያለው የእርጥበት አለመረጋጋት እና በሞተር ቤቶች ላይ የቆሻሻ መቀላቀል ብክነት።';
        } else if (cs.departmentId === 'welding_shop' || cs.departmentId === 'production') {
          rootCauseEn = 'Shielding gas valve leakage and root-pass porosities on chassis fabrication.';
          rootCauseAm = 'የአርገን ጋዝ መፍሰስ እና በቻሲ መገጣጠም ላይ በሚፈጠር የአየር ቀዳዳ ምክንያት ድጋሚ ስራ መብዛቱ።';
        } else if (cs.departmentId === 'assembling_finishing') {
          rootCauseEn = 'Strict torque verification and zero-defect 5S fastener protocol.';
          rootCauseAm = 'ጥብቅ የቦልት ማጥበቂያ ቁጥጥር እና ዜሮ-ብክለት የካይዘን 5S አሰራር።';
        }

        alerts.push({
          id: `SCRAP-${cs.departmentId}`,
          departmentId: cs.departmentId,
          metric: 'Scrap Rate',
          departmentValue: cs.defectRatePct,
          monthlyAverage: monthlyAvgScrapRate,
          deviationPercent: deviationPct,
          direction: isUnfavorable ? 'unfavorable' : 'favorable',
          severity: isUnfavorable ? (deviationPct >= 25 ? 'critical' : 'warning') : 'benchmark',
          rootCauseEn,
          rootCauseAm,
          financialImpactETB: cs.scrapCostETB,
        });
      }
    });
  }

  // 5. Identify OEE Deviations (> 10% difference from monthly average) - only when machines are logged
  if (monthlyAvgOee > 0) {
    (Object.keys(deptOeeMap) as DepartmentId[]).forEach((deptId) => {
      const entry = deptOeeMap[deptId];
      if (entry && entry.count > 0) {
        const deptAvg = entry.totalOee / entry.count;
        const deviationPct = ((deptAvg - monthlyAvgOee) / monthlyAvgOee) * 100;

        // Lower OEE is UNFAVORABLE; higher OEE is FAVORABLE
        if (Math.abs(deviationPct) >= 10) {
          const isUnfavorable = deviationPct < 0;

          let rootCauseEn = 'Equipments undergoing standard preventative maintenance check.';
          let rootCauseAm = 'መሳሪያዎች በመደበኛ የመከላከያ ጥገና ፍተሻ ላይ ይገኛሉ።';

          if (deptId === 'disc_blade') {
            rootCauseEn = 'Quenching furnace thermocouple drift and heat treating delays.';
            rootCauseAm = 'የእቶን ቴርሞካፕል መዛባት እና የሙቀት ማጠንከር መዘግየቶች።';
          } else if (deptId === 'machinery_vehicle_maintenance') {
            rootCauseEn = 'Central screw compressor overhaul in progress.';
            rootCauseAm = 'የማዕከላዊ አየር ኮምፕረሰር አጠቃላይ ጥገና በሂደት ላይ።';
          }

          alerts.push({
            id: `OEE-${deptId}`,
            departmentId: deptId,
            metric: 'OEE',
            departmentValue: deptAvg,
            monthlyAverage: monthlyAvgOee,
            deviationPercent: deviationPct,
            direction: isUnfavorable ? 'unfavorable' : 'favorable',
            severity: isUnfavorable ? (deviationPct <= -20 ? 'critical' : 'warning') : 'benchmark',
            rootCauseEn,
            rootCauseAm,
            financialImpactETB: Math.round(Math.abs(deviationPct) * 1200),
          });
        }
      }
    });
  }

  // Filter alerts by state
  const visibleAlerts = alerts
    .filter((a) => !dismissedAlerts.includes(a.id))
    .filter((a) => {
      if (filterType === 'unfavorable') return a.direction === 'unfavorable';
      if (filterType === 'favorable') return a.direction === 'favorable';
      return true;
    });

  const unfavorableCount = alerts.filter((a) => a.direction === 'unfavorable').length;
  const favorableCount = alerts.filter((a) => a.direction === 'favorable').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      {/* Alert Header & Monthly Benchmark Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {langMode === 'am' ? 'የኦኢኢ (OEE) እና የብክነት ልዩነት ማስጠንቀቂያ ስርዓት' : langMode === 'bilingual' ? 'Departmental Variance & Deviation Alert System · የልዩነት ማስጠንቀቂያ' : 'Departmental Variance & Deviation Alert System'}
            </h3>
            <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
              ±10% Monthly Threshold
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {langMode === 'am' 
              ? `ከወርሃዊው አማካይ (OEE: ${monthlyAvgOee.toFixed(1)}%, ብክነት: ${monthlyAvgScrapRate.toFixed(2)}%) ከ10% በላይ የተለዩ ክፍሎች`
              : `Flagging shops exceeding 10% statistical deviation from monthly baselines (Avg OEE: ${monthlyAvgOee.toFixed(1)}%, Avg Scrap: ${monthlyAvgScrapRate.toFixed(2)}%)`
            }
          </p>
        </div>

        {/* Filter Toggle Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded border border-slate-800 text-xs shrink-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {langMode === 'am' ? `ሁሉም (${alerts.length})` : `All (${alerts.length})`}
          </button>
          <button
            onClick={() => setFilterType('unfavorable')}
            className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              filterType === 'unfavorable'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-400 hover:text-rose-300'
            }`}
          >
            <TrendingDown className="w-3 h-3" />
            <span>{langMode === 'am' ? `ጉድለት (${unfavorableCount})` : `Deficit Alerts (${unfavorableCount})`}</span>
          </button>
          <button
            onClick={() => setFilterType('favorable')}
            className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              filterType === 'favorable'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <Award className="w-3 h-3" />
            <span>{langMode === 'am' ? `ምርጥ (${favorableCount})` : `Benchmarks (${favorableCount})`}</span>
          </button>
        </div>
      </div>

      {/* Baseline Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 p-3 bg-slate-950/70 border border-slate-800/80 rounded text-xs font-mono">
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Monthly Baseline OEE</span>
          <span className="text-sm font-bold text-blue-400 tabular-nums">{monthlyAvgOee.toFixed(1)}%</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">OEE Alert Limit (&lt; -10%)</span>
          <span className="text-sm font-bold text-rose-400 tabular-nums">&lt; {(monthlyAvgOee * 0.90).toFixed(1)}%</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Monthly Baseline Scrap</span>
          <span className="text-sm font-bold text-slate-300 tabular-nums">{monthlyAvgScrapRate.toFixed(2)}%</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Scrap Alert Limit (&gt; +10%)</span>
          <span className="text-sm font-bold text-rose-400 tabular-nums">&gt; {(monthlyAvgScrapRate * 1.10).toFixed(2)}%</span>
        </div>
      </div>

      {/* Alert Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {visibleAlerts.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-500 text-xs">
            {langMode === 'am' ? 'ምንም አይነት ያልተለመደ ልዩነት አልተገኘም' : 'No active alerts in this filter view.'}
          </div>
        ) : (
          visibleAlerts.map((alert) => {
            const isUnfavorable = alert.direction === 'unfavorable';
            const isCritical = alert.severity === 'critical';

            return (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 flex flex-col justify-between transition-all ${
                  isUnfavorable
                    ? isCritical
                      ? 'bg-rose-950/20 border-rose-900/60 hover:border-rose-700'
                      : 'bg-amber-950/20 border-amber-900/60 hover:border-amber-700'
                    : 'bg-emerald-950/20 border-emerald-900/60 hover:border-emerald-700'
                }`}
              >
                <div>
                  {/* Top Bar: Dept Name + Severity Tag */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {getDepartmentName(alert.departmentId, langMode === 'bilingual' ? 'en' : langMode)}
                      </span>
                      {langMode === 'bilingual' && (
                        <span className="text-[10px] text-slate-400 block -mt-0.5">
                          {getDepartmentName(alert.departmentId, 'am')}
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase whitespace-nowrap ${
                        isUnfavorable
                          ? isCritical
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isUnfavorable ? (isCritical ? 'Critical Deficit' : 'Warning Deficit') : 'Benchmark Lead'}
                    </span>
                  </div>

                  {/* Metric Deviation Details */}
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded p-2.5 mb-2.5">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400 font-medium">
                        {alert.metric} {langMode === 'am' ? 'ልዩነት' : 'Deviation'}:
                      </span>
                      <span
                        className={`font-mono font-bold text-sm tabular-nums flex items-center gap-1 ${
                          isUnfavorable ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {alert.deviationPercent > 0 ? `+${alert.deviationPercent.toFixed(1)}%` : `${alert.deviationPercent.toFixed(1)}%`}
                        {isUnfavorable ? (
                          <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </span>
                    </div>

                    {/* Department vs Baseline Comparison */}
                    <div className="flex items-baseline justify-between text-[11px] font-mono text-slate-300 pt-1 border-t border-slate-900">
                      <span>
                        {langMode === 'am' ? 'ትክክለኛ:' : 'Dept:'}{' '}
                        <span className="font-bold text-white">
                          {alert.metric === 'OEE'
                            ? `${alert.departmentValue.toFixed(1)}%`
                            : `${alert.departmentValue.toFixed(2)}%`}
                        </span>
                      </span>
                      <span className="text-slate-500">
                        {langMode === 'am' ? 'አማካይ:' : 'Avg:'}{' '}
                        <span className="text-slate-400">
                          {alert.metric === 'OEE'
                            ? `${alert.monthlyAverage.toFixed(1)}%`
                            : `${alert.monthlyAverage.toFixed(2)}%`}
                        </span>
                      </span>
                    </div>

                    {/* Financial Loss Indicator if scrap */}
                    {alert.financialImpactETB && alert.financialImpactETB > 0 && (
                      <div className="mt-1 pt-1 border-t border-slate-900 flex justify-between text-[10px] font-mono text-rose-300">
                        <span>{langMode === 'am' ? 'የወሩ ብክነት ወጪ:' : 'Monthly Scrap Loss:'}</span>
                        <span className="font-bold">{formatETB(alert.financialImpactETB)}</span>
                      </div>
                    )}
                  </div>

                  {/* Root Cause Context */}
                  <div className="text-[11px] text-slate-300 leading-snug mb-3">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5">
                      {langMode === 'am' ? 'መንስኤ / ሁኔታ:' : 'Operational Driver:'}
                    </span>
                    <p className="line-clamp-2">
                      {langMode === 'am' ? alert.rootCauseAm : alert.rootCauseEn}
                    </p>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onNavigateToDepartment(alert.departmentId)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>{langMode === 'am' ? 'ክፍሉን መርምር' : 'Drill Down'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => setDismissedAlerts([...dismissedAlerts, alert.id])}
                    className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                    title="Acknowledge & Hide"
                  >
                    {langMode === 'am' ? 'ተረድቻለሁ' : 'Acknowledge'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
