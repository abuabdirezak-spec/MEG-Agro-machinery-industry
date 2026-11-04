import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Layers, 
  Activity, 
  AlertTriangle, 
  Award,
  Download,
  Filter
} from 'lucide-react';
import { DepartmentId, LanguageMode, MonthlyTrendDataPoint } from '../types/dashboard.ts';
import { DEPARTMENTS, CLEAN_HISTORICAL_TRENDS } from '../data/mockData.ts';
import { getDepartmentName } from '../utils/formatters.ts';

interface HistoricalTrendsViewProps {
  langMode: LanguageMode;
  trendsData?: MonthlyTrendDataPoint[];
  onNavigateToTab?: (tab: any) => void;
}

export const HistoricalTrendsView: React.FC<HistoricalTrendsViewProps> = ({
  langMode,
  trendsData = CLEAN_HISTORICAL_TRENDS,
  onNavigateToTab,
}) => {
  const [selectedDept, setSelectedDept] = useState<DepartmentId | 'all'>('all');
  const [metricView, setMetricView] = useState<'both' | 'oee' | 'scrap'>('both');

  // If no trend data has been logged yet (clean production mode)
  const hasData = trendsData && trendsData.length > 0;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>{langMode === 'am' ? 'የታሪካዊ አዝማሚያዎች መከታተያ ሲስተም' : 'Historical Trends & Longitudinal Analytics'}</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded">
                    Production Mode
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {langMode === 'am'
                    ? 'የማምረቻ ክፍሎች ወርሃዊ የኦኢኢ (OEE) እና የብክነት (Scrap) አዝማሚያዎች'
                    : 'Longitudinal monthly trajectory for OEE percentages and scrap defect rates across 13 departments.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">
                {langMode === 'am' ? 'የመረጃ ሁኔታ፡ ንጹህ ሲስተም' : 'System State: Clean Slate'}
              </span>
            </div>
          </div>

          <div className="py-12 px-4 text-center max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Calendar className="w-6 h-6 text-slate-500" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">
              {langMode === 'am' ? 'ምንም የታሪካዊ መረጃ አልተመዘገበም' : 'No Historical Trend Records Logged Yet'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              {langMode === 'am'
                ? 'ሲስተሙ ከማንኛውም የሙከራ መረጃ ንጹህ ሆኖ ተዘጋጅቷል። ወርሃዊ የምርት ሪፖርቶች፣ የማሽን ስራ ሰዓታት እና የምዘና ውጤቶች ሲመዘገቡ የ6 ወራት የአዝማሚያ ግራፎች በራሳቸው እዚህ ይሳላሉ።'
                : 'All internal mock data has been removed. As monthly operational milestones, equipment run hours, and department scorecards are recorded, historical trend lines will plot automatically here.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="bg-slate-950/70 border border-slate-800 rounded p-3">
                <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold block mb-1">Target OEE</span>
                <span className="text-sm font-bold font-mono text-white">85.0%</span>
                <p className="text-[10px] text-slate-500 mt-0.5">World-Class manufacturing benchmark line</p>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded p-3">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold block mb-1">Scrap Tolerance</span>
                <span className="text-sm font-bold font-mono text-white">≤ 3.0%</span>
                <p className="text-[10px] text-slate-500 mt-0.5">Upper control limit for steel defects</p>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded p-3">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold block mb-1">Structure</span>
                <span className="text-sm font-bold font-mono text-white">13 Depts</span>
                <p className="text-[10px] text-slate-500 mt-0.5">Official MEG organizational hierarchy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Department colors for multi-line comparison
  const deptColors: Record<string, string> = {
    production: '#38bdf8',                    // Blue (Fabrication, Welding, Machine)
    assembling_finishing: '#10b981',          // Emerald
    quality_control: '#06b6d4',               // Cyan
    machinery_vehicle_maintenance: '#a855f7', // Violet
    marketing: '#ec4899',                     // Pink
    human_resource: '#8b5cf6',                // Purple
    logistics: '#f97316',                     // Orange
    general_service: '#64748b',               // Slate
    change_mgmt_safety: '#eab308',            // Yellow
    procurement_finance: '#14b8a6',           // Teal
    internal_audit: '#6366f1',                // Indigo
    ict: '#3b82f6',                           // Royal Blue
    disc_blade: '#ef4444',                    // Red (Agro-Machinery Discs)
    machine_shop: '#38bdf8',
    welding_shop: '#f59e0b',
    foundry: '#f43f5e',
    assembly: '#10b981',
    maintenance: '#a855f7',
    quality_assurance: '#06b6d4',
    plant_avg: '#f8fafc',
  };

  // Format month labels based on language
  const chartData = (trendsData || []).map((item) => ({
    ...item,
    displayMonth: langMode === 'am' ? item.monthAm : item.monthShort,
  }));

  // Calculations for Single Department Summary Cards
  const getSingleDeptMetrics = (deptId: DepartmentId) => {
    const oeeKey = `${deptId}_oee`;
    const scrapKey = `${deptId}_scrap`;

    const firstMonth = (trendsData[0] || {}) as Record<string, any>;
    const lastMonth = (trendsData[trendsData.length - 1] || {}) as Record<string, any>;

    const startOee = Number(firstMonth[oeeKey] || 0);
    const endOee = Number(lastMonth[oeeKey] || 0);
    const oeeDelta = endOee - startOee;

    const startScrap = Number(firstMonth[scrapKey] || 0);
    const endScrap = Number(lastMonth[scrapKey] || 0);
    const scrapDelta = endScrap - startScrap;

    const allOee = trendsData.map((m: any) => Number((m as Record<string, any>)[oeeKey] || 0));
    const peakOee = allOee.length > 0 ? Math.max(...allOee) : 0;
    const minOee = allOee.length > 0 ? Math.min(...allOee) : 0;

    const allScrap = trendsData.map((m: any) => Number((m as Record<string, any>)[scrapKey] || 0));
    const peakScrap = allScrap.length > 0 ? Math.max(...allScrap) : 0;
    const minScrap = allScrap.length > 0 ? Math.min(...allScrap) : 0;

    return {
      startOee,
      endOee,
      oeeDelta,
      startScrap,
      endScrap,
      scrapDelta,
      peakOee,
      minOee,
      peakScrap,
      minScrap,
      avgOee: allOee.length > 0 ? allOee.reduce((a: number, b: number) => a + b, 0) / allOee.length : 0,
      avgScrap: allScrap.length > 0 ? allScrap.reduce((a: number, b: number) => a + b, 0) / allScrap.length : 0,
    };
  };

  const singleMetrics = selectedDept !== 'all' ? getSingleDeptMetrics(selectedDept) : null;

  // Export 6M Trend data to CSV
  const handleExportTrendCSV = () => {
    const headers = [
      'Month',
      'Machine Shop OEE %',
      'Machine Shop Scrap %',
      'Welding Shop OEE %',
      'Welding Shop Scrap %',
      'Foundry OEE %',
      'Foundry Scrap %',
      'Assembly OEE %',
      'Assembly Scrap %',
      'Maintenance OEE %',
      'Maintenance Scrap %',
      'Quality Assurance OEE %',
      'Quality Assurance Scrap %',
      'Plant Avg OEE %',
      'Plant Avg Scrap %',
    ];

    const rows = trendsData.map((m: any) => [
      m.month,
      m.machine_shop_oee,
      m.machine_shop_scrap,
      m.welding_shop_oee,
      m.welding_shop_scrap,
      m.foundry_oee,
      m.foundry_scrap,
      m.assembly_oee,
      m.assembly_scrap,
      m.maintenance_oee,
      m.maintenance_scrap,
      m.quality_assurance_oee,
      m.quality_assurance_scrap,
      m.plant_avg_oee,
      m.plant_avg_scrap,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '6_Month_OEE_and_Scrap_Trends.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">
                {langMode === 'am' ? 'የ6 ወራት የኦኢኢ (OEE) እና የብክነት አዝማሚያ' : langMode === 'bilingual' ? '6-Month OEE & Scrap Rate Trends · የ6 ወራት አዝማሚያ' : '6-Month OEE & Scrap Rate Trends'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {langMode === 'am' ? 'ከግንቦት እስከ ጥቅምት 2026 ድረስ ያለው የማሽን ብቃትና የብረት ብክነት ምጣኔ ለውጥ' : 'Historical longitudinal progression across all manufacturing shops (May 2026 - Oct 2026)'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded border border-slate-800 text-xs">
              <button
                onClick={() => setMetricView('both')}
                className={`px-3 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                  metricView === 'both' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {langMode === 'am' ? 'ሁለቱም (Dual Axis)' : 'OEE & Scrap Dual'}
              </button>
              <button
                onClick={() => setMetricView('oee')}
                className={`px-3 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                  metricView === 'oee' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                OEE % Only
              </button>
              <button
                onClick={() => setMetricView('scrap')}
                className={`px-3 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                  metricView === 'scrap' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Scrap % Only
              </button>
            </div>

            {/* CSV Download */}
            <button
              onClick={handleExportTrendCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Department Filter Pills */}
        <div className="pt-4 flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedDept('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
              selectedDept === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {langMode === 'am' ? 'የሁሉም ክፍሎች ንፅፅር (All Shops)' : 'All Departments Comparison'}
          </button>
          {DEPARTMENTS.filter((d) => d.id !== 'hr_admin').map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                selectedDept === dept.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {langMode === 'am' ? dept.nameAm : dept.nameEn}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Strip for Single Department Deep Dive */}
      {singleMetrics && selectedDept !== 'all' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* OEE Net Change */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              6-Month OEE Net Delta
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-xl font-bold font-mono tabular-nums ${
                  singleMetrics.oeeDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {singleMetrics.oeeDelta >= 0 ? `+${singleMetrics.oeeDelta.toFixed(1)}%` : `${singleMetrics.oeeDelta.toFixed(1)}%`}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ({singleMetrics.startOee.toFixed(1)}% → {singleMetrics.endOee.toFixed(1)}%)
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              6M Average: <span className="text-slate-300">{singleMetrics.avgOee.toFixed(1)}%</span>
            </span>
          </div>

          {/* Scrap Net Change */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              6-Month Scrap Net Delta
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-xl font-bold font-mono tabular-nums ${
                  singleMetrics.scrapDelta <= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {singleMetrics.scrapDelta > 0 ? `+${singleMetrics.scrapDelta.toFixed(2)}%` : `${singleMetrics.scrapDelta.toFixed(2)}%`}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ({singleMetrics.startScrap.toFixed(2)}% → {singleMetrics.endScrap.toFixed(2)}%)
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              6M Average: <span className="text-slate-300">{singleMetrics.avgScrap.toFixed(2)}%</span>
            </span>
          </div>

          {/* Peak Performance */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Peak Month Recorded
            </span>
            <div className="text-xl font-bold font-mono text-blue-400 tabular-nums">
              {singleMetrics.peakOee.toFixed(1)}% <span className="text-xs text-slate-400 font-normal">OEE</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              Lowest Scrap: <span className="text-emerald-400">{singleMetrics.minScrap.toFixed(2)}%</span>
            </span>
          </div>

          {/* Operational Trajectory Indicator */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Trajectory Rating
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {singleMetrics.oeeDelta > 0 && singleMetrics.scrapDelta < 0 ? (
                <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Continuous Improvement
                </span>
              ) : singleMetrics.oeeDelta < -5 || singleMetrics.scrapDelta > 1 ? (
                <span className="text-sm font-bold text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Deteriorating Alert
                </span>
              ) : (
                <span className="text-sm font-bold text-amber-400 flex items-center gap-1">
                  <Activity className="w-4 h-4 text-amber-400" />
                  Stable / Controlled
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              Baseline: May 2026 vs Oct 2026
            </span>
          </div>
        </div>
      )}

      {/* Main Recharts Line Chart Viewport */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {selectedDept === 'all'
                ? langMode === 'am' ? 'የሁሉም ክፍሎች የ6 ወራት ንፅፅር ግራፍ' : 'Factory-Wide Department Comparison Trends'
                : `${getDepartmentName(selectedDept, langMode)} — 6-Month Trajectory`}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {selectedDept === 'all'
                ? (metricView === 'both' || metricView === 'oee' ? 'Showing OEE % across all production units' : 'Showing Scrap Rate % across all production units')
                : 'Progression against the 85% World-Class OEE benchmark & 2.5% scrap ceiling'}
            </p>
          </div>

          <div className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {chartData.length} Months Tracked
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-96 w-full">
          {selectedDept === 'all' ? (
            /* Multi-Department Comparison Chart */
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 15, right: 25, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="displayMonth" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  unit="%" 
                  domain={metricView === 'scrap' ? [0, 8] : [55, 100]}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [`${Number(val).toFixed(2)}%`]}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="plainline" 
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} 
                />

                {metricView !== 'scrap' && (
                  <ReferenceLine y={85} stroke="#22c55e" strokeDasharray="3 3" label={{ value: 'World Class 85%', fill: '#22c55e', fontSize: 10, position: 'right' }} />
                )}
                {metricView === 'scrap' && (
                  <ReferenceLine y={2.5} stroke="#22c55e" strokeDasharray="3 3" label={{ value: 'Target Max 2.5%', fill: '#22c55e', fontSize: 10, position: 'right' }} />
                )}

                {/* Machine Shop */}
                <Line 
                  type="monotone" 
                  dataKey={metricView === 'scrap' ? 'machine_shop_scrap' : 'machine_shop_oee'} 
                  name="Machine Shop" 
                  stroke={deptColors.machine_shop} 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                />
                {/* Welding Shop */}
                <Line 
                  type="monotone" 
                  dataKey={metricView === 'scrap' ? 'welding_shop_scrap' : 'welding_shop_oee'} 
                  name="Welding Shop" 
                  stroke={deptColors.welding_shop} 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                />
                {/* Foundry */}
                <Line 
                  type="monotone" 
                  dataKey={metricView === 'scrap' ? 'foundry_scrap' : 'foundry_oee'} 
                  name="Foundry & Casting" 
                  stroke={deptColors.foundry} 
                  strokeWidth={2.5} 
                  dot={{ r: 4 }} 
                />
                {/* Assembly */}
                <Line 
                  type="monotone" 
                  dataKey={metricView === 'scrap' ? 'assembly_scrap' : 'assembly_oee'} 
                  name="Assembly & Finishing" 
                  stroke={deptColors.assembly} 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                />
                {/* Maintenance */}
                <Line 
                  type="monotone" 
                  dataKey={metricView === 'scrap' ? 'maintenance_scrap' : 'maintenance_oee'} 
                  name="Maintenance & Utilities" 
                  stroke={deptColors.maintenance} 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                />
                {/* QA */}
                <Line 
                  type="monotone" 
                  dataKey={metricView === 'scrap' ? 'quality_assurance_scrap' : 'quality_assurance_oee'} 
                  name="Quality Assurance" 
                  stroke={deptColors.quality_assurance} 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                />
                {/* Plant Baseline Average */}
                <Line 
                  type="monotone" 
                  dataKey={metricView === 'scrap' ? 'plant_avg_scrap' : 'plant_avg_oee'} 
                  name="Plant Average" 
                  stroke={deptColors.plant_avg} 
                  strokeWidth={2} 
                  strokeDasharray="4 4" 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            /* Single Department Dual-Axis or Synchronized Chart */
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 15, right: 35, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="displayMonth" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                {/* Left Y Axis for OEE */}
                <YAxis 
                  yAxisId="left"
                  stroke="#38bdf8" 
                  fontSize={11} 
                  unit="%" 
                  domain={[50, 100]}
                  tickLine={false}
                  axisLine={{ stroke: '#38bdf8' }}
                  label={{ value: 'OEE %', angle: -90, position: 'insideLeft', fill: '#38bdf8', fontSize: 10 }}
                />
                {/* Right Y Axis for Scrap Rate */}
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#f43f5e" 
                  fontSize={11} 
                  unit="%" 
                  domain={[0, 8]}
                  tickLine={false}
                  axisLine={{ stroke: '#f43f5e' }}
                  label={{ value: 'Scrap %', angle: 90, position: 'insideRight', fill: '#f43f5e', fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                  formatter={(val: any, name: any) => [
                    `${Number(val).toFixed(2)}%`,
                    name
                  ]}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="plainline" 
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} 
                />

                <ReferenceLine yAxisId="left" y={85} stroke="#22c55e" strokeDasharray="3 3" label={{ value: 'OEE Target: 85%', fill: '#22c55e', fontSize: 10, position: 'insideTopLeft' }} />
                <ReferenceLine yAxisId="right" y={2.5} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Scrap Ceiling: 2.5%', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }} />

                {(metricView === 'both' || metricView === 'oee') && (
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey={`${selectedDept}_oee`} 
                    name={`${getDepartmentName(selectedDept, 'en')} OEE %`} 
                    stroke="#38bdf8" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#38bdf8' }} 
                  />
                )}

                {(metricView === 'both' || metricView === 'scrap') && (
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey={`${selectedDept}_scrap`} 
                    name={`${getDepartmentName(selectedDept, 'en')} Scrap %`} 
                    stroke="#f43f5e" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#f43f5e' }} 
                  />
                )}

                {/* Plant Average Benchmarks for Context */}
                {(metricView === 'both' || metricView === 'oee') && (
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="plant_avg_oee" 
                    name="Plant Baseline OEE" 
                    stroke="#94a3b8" 
                    strokeWidth={1.5} 
                    strokeDasharray="4 4" 
                    dot={false} 
                  />
                )}

                {(metricView === 'both' || metricView === 'scrap') && (
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="plant_avg_scrap" 
                    name="Plant Baseline Scrap" 
                    stroke="#fb7185" 
                    strokeWidth={1.5} 
                    strokeDasharray="4 4" 
                    dot={false} 
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend Notes Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-500 inline-block" />
              <span>Target Standard (85% OEE / &lt;= 2.5% Scrap)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-400 border-t border-dashed border-slate-400 inline-block" />
              <span>Plant Monthly Baseline</span>
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            Source: Machine_OEE_Log &amp; Capacity_and_Scrap_Tracker (Historical 6M Rollup)
          </span>
        </div>
      </div>

      {/* Month-by-Month Tabular Verification Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            {langMode === 'am' ? 'የወር በወር የስታቲስቲክስ መዝገብ (6-Month Ledger)' : 'Month-by-Month Metric Ledger'}
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {selectedDept === 'all' ? 'All Manufacturing Units' : getDepartmentName(selectedDept, 'en')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Timeline Month</th>
                {selectedDept === 'all' ? (
                  <>
                    <th className="py-3 px-3 text-right">Machine Shop OEE</th>
                    <th className="py-3 px-3 text-right">Welding OEE</th>
                    <th className="py-3 px-3 text-right">Foundry OEE</th>
                    <th className="py-3 px-3 text-right">Assembly OEE</th>
                    <th className="py-3 px-3 text-right">Maint OEE</th>
                    <th className="py-3 px-3 text-right">QA OEE</th>
                    <th className="py-3 px-3 text-right text-white font-bold">Plant Avg OEE</th>
                    <th className="py-3 px-3 text-right text-rose-300 font-bold">Plant Avg Scrap</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-4 text-right">Department OEE %</th>
                    <th className="py-3 px-4 text-right">Plant Baseline OEE %</th>
                    <th className="py-3 px-4 text-right">OEE Variance</th>
                    <th className="py-3 px-4 text-right">Department Scrap %</th>
                    <th className="py-3 px-4 text-right">Plant Baseline Scrap %</th>
                    <th className="py-3 px-4 text-right">Scrap Variance</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {trendsData.map((m: any) => {
                if (selectedDept === 'all') {
                  return (
                    <tr key={m.month} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-sans font-semibold text-white">
                        {langMode === 'am' ? m.monthAm : m.month}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums text-slate-300">{m.machine_shop_oee}%</td>
                      <td className="py-3 px-3 text-right tabular-nums text-slate-300">{m.welding_shop_oee}%</td>
                      <td className="py-3 px-3 text-right tabular-nums text-rose-400 font-medium">{m.foundry_oee}%</td>
                      <td className="py-3 px-3 text-right tabular-nums text-emerald-400 font-medium">{m.assembly_oee}%</td>
                      <td className="py-3 px-3 text-right tabular-nums text-slate-300">{m.maintenance_oee}%</td>
                      <td className="py-3 px-3 text-right tabular-nums text-emerald-400 font-medium">{m.quality_assurance_oee}%</td>
                      <td className="py-3 px-3 text-right tabular-nums font-bold text-blue-400">{m.plant_avg_oee}%</td>
                      <td className="py-3 px-3 text-right tabular-nums font-bold text-rose-400">{m.plant_avg_scrap}%</td>
                    </tr>
                  );
                } else {
                  const mRecord = m as Record<string, any>;
                  const deptOee = Number(mRecord[`${selectedDept}_oee`] || 0);
                  const plantOee = Number(mRecord.plant_avg_oee || 0);
                  const oeeDiff = deptOee - plantOee;

                  const deptScrap = Number(mRecord[`${selectedDept}_scrap`] || 0);
                  const plantScrap = Number(mRecord.plant_avg_scrap || 0);
                  const scrapDiff = deptScrap - plantScrap;

                  return (
                    <tr key={m.month} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-sans font-semibold text-white">
                        {langMode === 'am' ? m.monthAm : m.month}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-white">
                        {deptOee.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-slate-400">
                        {plantOee.toFixed(1)}%
                      </td>
                      <td className={`py-3 px-4 text-right tabular-nums font-medium ${oeeDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {oeeDiff >= 0 ? `+${oeeDiff.toFixed(1)}%` : `${oeeDiff.toFixed(1)}%`}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-rose-300">
                        {deptScrap.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-slate-400">
                        {plantScrap.toFixed(2)}%
                      </td>
                      <td className={`py-3 px-4 text-right tabular-nums font-medium ${scrapDiff <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {scrapDiff > 0 ? `+${scrapDiff.toFixed(2)}%` : `${scrapDiff.toFixed(2)}%`}
                      </td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
