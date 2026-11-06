import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Users, 
  Edit3, 
  TrendingUp, 
  TrendingDown,
  Layers,
  Check,
  ChevronRight,
  Sliders,
  DollarSign
} from 'lucide-react';
import { 
  DepartmentId, 
  DepartmentEvaluation, 
  DepartmentBudget, 
  CapacityAndScrap, 
  WeeklyTask, 
  LanguageMode 
} from '../types/dashboard.ts';
import { DEPARTMENTS } from '../data/mockData.ts';
import { getDepartmentName, getDepartmentHead, formatETB } from '../utils/formatters.ts';

interface DepartmentScorecardViewProps {
  evaluations: DepartmentEvaluation[];
  budgets: DepartmentBudget[];
  capacityScrap: CapacityAndScrap[];
  tasks: WeeklyTask[];
  onEditEvaluation: (evaluation: DepartmentEvaluation) => void;
  onEditDepartmentData?: (budget: DepartmentBudget, capacity: CapacityAndScrap) => void;
  selectedDeptId?: DepartmentId | 'all';
  onSelectDeptId?: (id: DepartmentId | 'all') => void;
  langMode: LanguageMode;
}

export const DepartmentScorecardView: React.FC<DepartmentScorecardViewProps> = ({
  evaluations,
  budgets,
  capacityScrap,
  tasks,
  onEditEvaluation,
  onEditDepartmentData,
  selectedDeptId: externalSelectedDeptId,
  onSelectDeptId,
  langMode,
}) => {
  const [internalSelectedDeptId, setInternalSelectedDeptId] = useState<DepartmentId | 'all'>('all');
  const selectedDeptId = externalSelectedDeptId !== undefined ? externalSelectedDeptId : internalSelectedDeptId;
  const setSelectedDeptId = (id: DepartmentId | 'all') => {
    if (onSelectDeptId) {
      onSelectDeptId(id);
    }
    setInternalSelectedDeptId(id);
  };

  const filteredDepts = selectedDeptId === 'all' 
    ? DEPARTMENTS 
    : DEPARTMENTS.filter((d) => d.id === selectedDeptId);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'B': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'C': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default: return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Department Selector Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>{langMode === 'am' ? 'የክፍሎች የሩብ ዓመት ምዘና ካርድ' : langMode === 'bilingual' ? 'Departmental Evaluation Cards · የክፍሎች ምዘና' : 'Departmental Evaluation Cards'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {langMode === 'am' ? 'በ5 ቁልፍ መለኪያዎች ላይ የተመሰረተ ምዘና (ከ50 ነጥብ)፣ ጥንካሬዎችና ድክመቶች' : '5 key criteria (50 pts total), performance grades, identified strengths & weaknesses'}
          </p>
        </div>

        {/* Filter Pills / Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedDeptId('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
              selectedDeptId === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {langMode === 'am' ? `ሁሉም ክፍሎች (${DEPARTMENTS.length})` : `All Departments (${DEPARTMENTS.length})`}
          </button>
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDeptId(dept.id)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                selectedDeptId === dept.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {langMode === 'am' ? dept.nameAm : dept.nameEn}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredDepts.map((dept) => {
          const evalData = evaluations.find((e) => e.departmentId === dept.id) || {
            departmentId: dept.id,
            planVsActual: 0,
            qualityScrap: 0,
            budgetCost: 0,
            disciplineReporting: 0,
            safetyKaizen: 0,
            totalScore: 0,
            grade: 'C',
            strengthsEn: [],
            strengthsAm: [],
            weaknessesEn: [],
            weaknessesAm: [],
          };

          const budgetData = budgets.find((b) => b.departmentId === dept.id);
          const capacityData = capacityScrap.find((c) => c.departmentId === dept.id);
          const deptTasks = tasks.filter((t) => t.departmentId === dept.id);

          return (
            <div
              key={dept.id}
              className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                {/* Header: Title, Head of Dept, Grade */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {langMode === 'am' ? dept.nameAm : dept.nameEn}
                    </h3>
                    {langMode === 'bilingual' && (
                      <p className="text-xs text-slate-400 mt-0.5">{dept.nameAm}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5">
                      <span className="flex items-center gap-1 text-slate-300">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        {getDepartmentHead(dept.id, langMode)}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="flex items-center gap-1 font-mono text-slate-400 text-[11px]">
                        <Users className="w-3 h-3 text-slate-500" />
                        {dept.operatorCount} {langMode === 'am' ? 'ባለሙያዎች' : 'Operators'}
                      </span>
                    </div>

                    {/* Sub-Shops Pills for Production */}
                    {dept.shops && dept.shops.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[10px] text-slate-400 font-semibold">{langMode === 'am' ? 'ክፍሎች:' : 'Operating Shops:'}</span>
                        {dept.shops.map((s) => (
                          <span key={s.id} className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/50 font-mono font-medium">
                            {langMode === 'am' ? s.nameAm : s.nameEn}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Visual Progress Bar: Budget Used Percentage */}
                    {(() => {
                      const budgetUsedPct = (budgetData && budgetData.plannedBudgetETB > 0)
                        ? (budgetData.actualSpendETB / budgetData.plannedBudgetETB) * 100
                        : 0;
                      return (
                        <div className="mt-3 p-2.5 rounded bg-slate-950/80 border border-slate-800/90 shadow-inner">
                          <div className="flex items-center justify-between text-[11px] mb-1.5">
                            <span className="text-slate-300 font-medium flex items-center gap-1.5">
                              <span className="text-slate-400">
                                {langMode === 'am' ? 'የበጀት አጠቃቀም (Budget Used):' : 'Budget Used:'}
                              </span>
                              <span
                                className={`font-mono font-bold ${
                                  budgetUsedPct > 100
                                    ? 'text-rose-400'
                                    : budgetUsedPct >= 90
                                    ? 'text-amber-400'
                                    : 'text-emerald-400'
                                }`}
                              >
                                {budgetUsedPct.toFixed(1)}%
                              </span>
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {formatETB(budgetData?.actualSpendETB || 0, true)} / {formatETB(budgetData?.plannedBudgetETB || 0, true)}
                            </span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800/70">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                budgetUsedPct > 100
                                  ? 'bg-rose-500'
                                  : budgetUsedPct >= 90
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, budgetUsedPct))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}

                    {/* Staffing Load: Current vs Target Capacity Horizontal Bar */}
                    {(() => {
                      const currentStaff = capacityData && capacityData.operatorsActive > 0 ? capacityData.operatorsActive : dept.operatorCount;
                      const targetCapacity = dept.targetCapacity || dept.operatorCount;
                      const staffingLoadPct = targetCapacity > 0 ? (currentStaff / targetCapacity) * 100 : 100;
                      const isOver = staffingLoadPct > 105;
                      const isOptimal = staffingLoadPct >= 90 && staffingLoadPct <= 105;

                      return (
                        <div className="mt-2 p-2.5 rounded bg-slate-950/80 border border-slate-800/90 shadow-inner">
                          <div className="flex items-center justify-between text-[11px] mb-1.5">
                            <span className="text-slate-300 font-medium flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span className="text-slate-300">
                                {langMode === 'am' ? 'የሰው ኃይል ምጣኔ (Staffing Load):' : 'Staffing Load:'}
                              </span>
                              <span className="font-mono font-bold text-white">
                                {staffingLoadPct.toFixed(0)}%
                              </span>
                            </span>
                            <div className="flex items-center gap-1.5 font-mono text-[10px]">
                              <span className="text-slate-200 font-semibold">{currentStaff}</span>
                              <span className="text-slate-500">/</span>
                              <span className="text-slate-400">{targetCapacity} {langMode === 'am' ? 'ዒላማ' : 'target'}</span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase ${
                                  isOver
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    : isOptimal
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}
                              >
                                {isOver
                                  ? (langMode === 'am' ? 'ከአቅም በላይ' : 'Over-capacity')
                                  : isOptimal
                                  ? (langMode === 'am' ? 'ምቹ አቅም' : 'Optimal')
                                  : (langMode === 'am' ? 'ያነሰ ኃይል' : 'Understaffed')}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800/70">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isOver
                                  ? 'bg-rose-500'
                                  : isOptimal
                                  ? 'bg-blue-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, staffingLoadPct))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`px-2.5 py-1 rounded border font-mono font-bold text-sm ${getGradeColor(evalData.grade)}`}>
                      Grade {evalData.grade}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEditEvaluation(evalData)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        title={langMode === 'am' ? 'የምዘና ውጤቶችን አርም (Edit Scores)' : 'Edit Evaluation Scores (0-50 pts)'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {onEditDepartmentData && (
                        <button
                          type="button"
                          onClick={() => {
                            const b = budgetData || {
                              departmentId: dept.id,
                              plannedBudgetETB: 0,
                              actualSpendETB: 0,
                              varianceETB: 0,
                              variancePct: 0,
                            };
                            const c = capacityData || {
                              departmentId: dept.id,
                              plannedHours: 0,
                              actualRunHours: 0,
                              downtimeHours: 0,
                              capacityUtilizationPct: 0,
                              targetOutputUnits: 0,
                              actualOutputUnits: 0,
                              scrapPieces: 0,
                              defectRatePct: 0,
                              scrapCostETB: 0,
                              operatorsActive: dept.operatorCount,
                            };
                            onEditDepartmentData(b, c);
                          }}
                          className="p-1.5 text-blue-400 hover:text-white hover:bg-blue-600/30 rounded transition-colors cursor-pointer"
                          title={langMode === 'am' ? 'የበጀትና የማምረቻ መረጃን አርም (Edit Budgets & Scrap)' : 'Edit Budgets, Run Hours, Output & Scrap'}
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score Summary & 5 Metric Breakdown */}
                <div className="my-4">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                      {langMode === 'am' ? 'ጠቅላላ ውጤት (Total Score)' : 'Overall Evaluation'}
                    </span>
                    <div className="text-lg font-bold font-mono text-white tabular-nums">
                      {evalData.totalScore.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 50.0</span>
                    </div>
                  </div>

                  {/* 5 Metric Bars */}
                  <div className="space-y-2.5 text-xs">
                    {/* Metric 1 */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">
                          {langMode === 'am' ? '1. ዕቅድ ከትክክለኛ አፈጻጸም' : '1. Plan vs. Actual Delivery'}
                        </span>
                        <span className="font-mono text-slate-200 tabular-nums font-medium">{evalData.planVsActual} / 10</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(evalData.planVsActual / 10) * 100}%` }} />
                      </div>
                    </div>

                    {/* Metric 2 */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">
                          {langMode === 'am' ? '2. ጥራትና የብክነት ቁጥጥር' : '2. Quality & Scrap Control'}
                        </span>
                        <span className="font-mono text-slate-200 tabular-nums font-medium">{evalData.qualityScrap} / 10</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(evalData.qualityScrap / 10) * 100}%` }} />
                      </div>
                    </div>

                    {/* Metric 3 */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">
                          {langMode === 'am' ? '3. በጀትና ወጪ ቁጥጥር' : '3. Budget & Cost Discipline'}
                        </span>
                        <span className="font-mono text-slate-200 tabular-nums font-medium">{evalData.budgetCost} / 10</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${(evalData.budgetCost / 10) * 100}%` }} />
                      </div>
                    </div>

                    {/* Metric 4 */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">
                          {langMode === 'am' ? '4. ሪፖርትና የስራ ስነ-ስርዓት' : '4. Reporting & Shift Discipline'}
                        </span>
                        <span className="font-mono text-slate-200 tabular-nums font-medium">{evalData.disciplineReporting} / 10</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${(evalData.disciplineReporting / 10) * 100}%` }} />
                      </div>
                    </div>

                    {/* Metric 5 */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">
                          {langMode === 'am' ? '5. ደህንነትና ካይዘን (5S)' : '5. Safety & Kaizen (5S)'}
                        </span>
                        <span className="font-mono text-slate-200 tabular-nums font-medium">{evalData.safetyKaizen} / 10</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${(evalData.safetyKaizen / 10) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 mb-4 text-xs">
                  {/* Strengths */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded p-2.5">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1 mb-1.5">
                      <CheckCircle2 className="w-3 h-3" />
                      {langMode === 'am' ? 'ጥንካሬዎች' : 'Documented Strengths'}
                    </span>
                    {(langMode === 'am' ? evalData.strengthsAm : evalData.strengthsEn).length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic py-1">
                        {langMode === 'am' ? 'ምንም የተመዘገበ ጥንካሬ የለም (ለማስገባት ከላይ ያለውን የብዕር ምልክት ይጫኑ)' : 'No documented strengths recorded yet (Click edit above to score).'}
                      </p>
                    ) : (
                      <ul className="space-y-1 text-slate-300 text-[11px]">
                        {(langMode === 'am' ? evalData.strengthsAm : evalData.strengthsEn).map((str, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 mt-0.5">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded p-2.5">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1 mb-1.5">
                      <AlertTriangle className="w-3 h-3" />
                      {langMode === 'am' ? 'ማሻሻያ የሚሹ ድክመቶች' : 'Operational Weaknesses'}
                    </span>
                    {(langMode === 'am' ? evalData.weaknessesAm : evalData.weaknessesEn).length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic py-1">
                        {langMode === 'am' ? 'ምንም የተመዘገበ ድክመት የለም' : 'No operational weaknesses recorded yet.'}
                      </p>
                    ) : (
                      <ul className="space-y-1 text-slate-300 text-[11px]">
                        {(langMode === 'am' ? evalData.weaknessesAm : evalData.weaknessesEn).map((wk, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-rose-500 mt-0.5">•</span>
                            <span>{wk}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Quick Sub-Stats Strip: Budget & Output */}
                <div className="bg-slate-950/40 border border-slate-800/60 rounded p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {budgetData && (
                    <div>
                      <span className="text-[10px] text-slate-400 block">{langMode === 'am' ? 'የወሩ ወጪ:' : 'Actual Spend:'}</span>
                      <span className="font-mono font-semibold text-slate-200 tabular-nums">
                        {formatETB(budgetData.actualSpendETB, true)}
                      </span>
                    </div>
                  )}

                  {capacityData && (
                    <div>
                      <span className="text-[10px] text-slate-400 block">{langMode === 'am' ? 'የአቅም አጠቃቀም:' : 'Capacity Util:'}</span>
                      <span className="font-mono font-semibold text-blue-400 tabular-nums">
                        {capacityData.capacityUtilizationPct}%
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] text-slate-400 block">{langMode === 'am' ? 'ንቁ ስራዎች:' : 'Active Tasks:'}</span>
                    <span className="font-mono font-semibold text-slate-200 tabular-nums">
                      {deptTasks.length} {langMode === 'am' ? 'ስራዎች' : 'tasks'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
