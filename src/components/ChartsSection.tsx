import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  CapacityAndScrap, 
  DepartmentBudget, 
  MachineOEE, 
  LanguageMode 
} from '../types/dashboard.ts';
import { getDepartmentName, formatETB } from '../utils/formatters.ts';

interface ChartsSectionProps {
  capacityScrap: CapacityAndScrap[];
  budgets: DepartmentBudget[];
  machines: MachineOEE[];
  langMode: LanguageMode;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  capacityScrap,
  budgets,
  machines,
  langMode,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'utilization' | 'scrap' | 'budget' | 'oee'>('utilization');

  // Format data for Capacity Utilization
  const capacityData = capacityScrap.map((item) => ({
    name: getDepartmentName(item.departmentId, langMode === 'bilingual' ? 'en' : langMode),
    fullDept: item.departmentId,
    utilization: item.capacityUtilizationPct,
    runHours: item.actualRunHours,
    plannedHours: item.plannedHours,
    downtime: item.downtimeHours,
  }));

  // Format data for Scrap Cost
  const scrapData = capacityScrap.map((item) => ({
    name: getDepartmentName(item.departmentId, langMode === 'bilingual' ? 'en' : langMode),
    scrapCost: item.scrapCostETB,
    defectRate: item.defectRatePct,
    pieces: item.scrapPieces,
  }));

  // Format data for Cost Variance
  const budgetData = budgets.map((item) => ({
    name: getDepartmentName(item.departmentId, langMode === 'bilingual' ? 'en' : langMode),
    planned: item.plannedBudgetETB / 1000, // in Thousands ETB
    actual: item.actualSpendETB / 1000,
    variance: item.varianceETB / 1000,
  }));

  // Format data for Machine OEE
  const oeeData = machines.map((m) => ({
    name: m.machineId,
    displayName: langMode === 'am' ? m.nameAm : m.nameEn,
    oee: m.oeePct,
    availability: m.availabilityPct,
    performance: m.performancePct,
    quality: m.qualityPct,
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      {/* Chart Navigation Tabs & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-5">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            {langMode === 'am' ? 'የፋብሪካ ቁልፍ ስታቲስቲክስና ግራፎች' : langMode === 'bilingual' ? 'Operational Performance Analytics · የፋብሪካ ግራፎች' : 'Operational Performance Analytics'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {langMode === 'am' ? 'የማምረት አቅም አጠቃቀም፣ የብክነት ወጪ እና የበጀት ንፅፅር' : 'Interactive visual tracking for capacity, scrap costs, and budget variances'}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded border border-slate-800">
          <button
            onClick={() => setActiveChartTab('utilization')}
            className={`px-3 py-1.5 text-xs font-semibold rounded whitespace-nowrap transition-colors ${
              activeChartTab === 'utilization'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {langMode === 'am' ? 'የአቅም አጠቃቀም %' : 'Capacity Utilization %'}
          </button>
          <button
            onClick={() => setActiveChartTab('scrap')}
            className={`px-3 py-1.5 text-xs font-semibold rounded whitespace-nowrap transition-colors ${
              activeChartTab === 'scrap'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {langMode === 'am' ? 'የብክነት ወጪ (ETB)' : 'Scrap Cost (ETB)'}
          </button>
          <button
            onClick={() => setActiveChartTab('budget')}
            className={`px-3 py-1.5 text-xs font-semibold rounded whitespace-nowrap transition-colors ${
              activeChartTab === 'budget'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {langMode === 'am' ? 'የበጀት ልዩነት' : 'Cost Variance by Dept'}
          </button>
          <button
            onClick={() => setActiveChartTab('oee')}
            className={`px-3 py-1.5 text-xs font-semibold rounded whitespace-nowrap transition-colors ${
              activeChartTab === 'oee'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {langMode === 'am' ? 'የማሽን OEE' : 'Machine OEE Logs'}
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-80 w-full">
        {activeChartTab === 'utilization' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={capacityData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                unit="%" 
                domain={[0, 100]}
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
                formatter={(value: any, name: any) => [
                  `${value}%`,
                  langMode === 'am' ? 'የአቅም አጠቃቀም' : 'Capacity Utilization'
                ]}
              />
              <ReferenceLine y={85} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: 'Target: 85%', fill: '#60a5fa', fontSize: 11, position: 'top' }} />
              <Bar dataKey="utilization" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {capacityData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.utilization >= 85 ? '#22c55e' : entry.utilization >= 75 ? '#3b82f6' : '#f59e0b'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeChartTab === 'scrap' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scrapData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
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
                formatter={(value: any, name: any, props: any) => [
                  `${formatETB(Number(value))} (${props.payload.defectRate}% Defect rate, ${props.payload.pieces} pcs)`,
                  langMode === 'am' ? 'የብክነት ወጪ' : 'Scrap Cost'
                ]}
              />
              <ReferenceLine y={197500} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Avg Cost: 198k', fill: '#fbbf24', fontSize: 10, position: 'top' }} />
              <Bar dataKey="scrapCost" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {scrapData.map((entry, index) => {
                  // Monthly avg defect rate is ~3.67%. If entry.defectRate > 3.67 * 1.10 = 4.04% -> Red alert
                  const isHighDeviation = entry.defectRate > 4.04;
                  return (
                    <Cell 
                      key={`scrap-cell-${index}`} 
                      fill={isHighDeviation ? '#f43f5e' : entry.defectRate < 2.0 ? '#10b981' : '#3b82f6'} 
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeChartTab === 'budget' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={budgetData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickFormatter={(val) => `${val}k`}
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
                formatter={(value: any, name: any) => [
                  `ETB ${(Number(value) * 1000).toLocaleString()}`,
                  name === 'planned' ? (langMode === 'am' ? 'ዕቅድ በጀት' : 'Planned Budget') : (langMode === 'am' ? 'ትክክለኛ ወጪ' : 'Actual Spend')
                ]}
              />
              <Bar dataKey="planned" name="planned" fill="#64748b" radius={[3, 3, 0, 0]} maxBarSize={28} />
              <Bar dataKey="actual" name="actual" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeChartTab === 'oee' && (
          oeeData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
              <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mb-2 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
              </div>
              <p className="font-semibold text-slate-300">
                {langMode === 'am' ? 'ምንም የተመዘገበ ማሽን የለም' : 'No Machine OEE Records Logged Yet'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                {langMode === 'am' ? 'የማሽኖች መረጃ በጥገና ክፍል ሲገባ ግራፉ እዚህ በራስ-ሰር ይሳላል።' : 'Machine tags, availability, performance, and overall OEE will chart here dynamically.'}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={oeeData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  unit="%" 
                  domain={[50, 100]}
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
                  formatter={(value: any, name: any) => [`${value}%`, name.toUpperCase()]}
                />
                <ReferenceLine y={85} stroke="#22c55e" strokeDasharray="3 3" label={{ value: 'World Class 85%', fill: '#22c55e', fontSize: 10 }} />
                <Line type="monotone" dataKey="oee" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6' }} name="OEE Total" />
                <Line type="monotone" dataKey="availability" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="2 2" dot={false} name="Availability" />
                <Line type="monotone" dataKey="performance" stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="2 2" dot={false} name="Performance" />
                <Line type="monotone" dataKey="quality" stroke="#10b981" strokeWidth={1.5} strokeDasharray="2 2" dot={false} name="Quality" />
              </LineChart>
            </ResponsiveContainer>
          )
        )}
      </div>

      {/* Chart Legend Summary */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          {activeChartTab === 'utilization' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
                <span>&gt;= 85% Benchmark</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 inline-block" />
                <span>75% - 84% Nominal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
                <span>&lt; 75% Constrained</span>
              </div>
            </>
          )}

          {activeChartTab === 'scrap' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-medium">
                {langMode === 'am' ? 'ከፍተኛ ብክነት ያለበት:' : 'Top Loss Driver:'}
              </span>
              <span className="text-rose-400 font-mono font-medium">Foundry & Casting (ETB 385,000 / 5.44%)</span>
            </div>
          )}

          {activeChartTab === 'budget' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-500 inline-block" />
                <span>{langMode === 'am' ? 'ዕቅድ በጀት' : 'Planned Budget'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 inline-block" />
                <span>{langMode === 'am' ? 'ትክክለኛ ወጪ' : 'Actual Spend'}</span>
              </div>
            </>
          )}

          {activeChartTab === 'oee' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-blue-500 inline-block" />
                <span>OEE Total</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-purple-500 inline-block" />
                <span>Availability</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-sky-400 inline-block" />
                <span>Performance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-500 inline-block" />
                <span>Quality</span>
              </div>
            </>
          )}
        </div>

        <span className="font-mono text-[11px] text-slate-400">
          Source: Machine_OEE_Log &amp; Capacity_and_Scrap_Tracker
        </span>
      </div>
    </div>
  );
};
