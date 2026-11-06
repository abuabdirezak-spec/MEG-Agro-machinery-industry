import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calculator, Save, RotateCcw, AlertTriangle, Building2, Clock, Trash2 } from 'lucide-react';
import { DepartmentBudget, CapacityAndScrap, DepartmentId, LanguageMode } from '../types/dashboard.ts';
import { DEPARTMENTS } from '../data/mockData.ts';
import { getDepartmentName, formatETB } from '../utils/formatters.ts';

interface EditDepartmentDataModalProps {
  isOpen: boolean;
  departmentId: DepartmentId | null;
  budget: DepartmentBudget | null;
  capacityScrap: CapacityAndScrap | null;
  onClose: () => void;
  onSave: (updatedBudget: DepartmentBudget, updatedCapacity: CapacityAndScrap) => void;
  langMode?: LanguageMode;
}

export const EditDepartmentDataModal: React.FC<EditDepartmentDataModalProps> = ({
  isOpen,
  departmentId,
  budget,
  capacityScrap,
  onClose,
  onSave,
  langMode = 'en',
}) => {
  // Budget States
  const [plannedBudget, setPlannedBudget] = useState<number | ''>(0);
  const [actualSpend, setActualSpend] = useState<number | ''>(0);

  // Capacity & Scrap States
  const [plannedHours, setPlannedHours] = useState<number | ''>(0);
  const [actualRunHours, setActualRunHours] = useState<number | ''>(0);
  const [downtimeHours, setDowntimeHours] = useState<number | ''>(0);
  const [targetUnits, setTargetUnits] = useState<number | ''>(0);
  const [actualUnits, setActualUnits] = useState<number | ''>(0);
  const [scrapPieces, setScrapPieces] = useState<number | ''>(0);
  const [scrapCost, setScrapCost] = useState<number | ''>(0);
  const [activeOperators, setActiveOperators] = useState<number | ''>(0);

  useEffect(() => {
    if (budget) {
      setPlannedBudget(budget.plannedBudgetETB);
      setActualSpend(budget.actualSpendETB);
    } else {
      setPlannedBudget(0);
      setActualSpend(0);
    }

    if (capacityScrap) {
      setPlannedHours(capacityScrap.plannedHours);
      setActualRunHours(capacityScrap.actualRunHours);
      setDowntimeHours(capacityScrap.downtimeHours);
      setTargetUnits(capacityScrap.targetOutputUnits);
      setActualUnits(capacityScrap.actualOutputUnits);
      setScrapPieces(capacityScrap.scrapPieces);
      setScrapCost(capacityScrap.scrapCostETB);
      setActiveOperators(capacityScrap.operatorsActive);
    } else {
      setPlannedHours(0);
      setActualRunHours(0);
      setDowntimeHours(0);
      setTargetUnits(0);
      setActualUnits(0);
      setScrapPieces(0);
      setScrapCost(0);
      setActiveOperators(0);
    }
  }, [budget, capacityScrap, isOpen]);

  if (!isOpen || !departmentId) return null;

  const deptInfo = DEPARTMENTS.find((d) => d.id === departmentId);
  const deptDisplayName = deptInfo
    ? (langMode === 'am' ? deptInfo.nameAm : deptInfo.nameEn)
    : departmentId;

  // Live calculations
  const pBudget = Number(plannedBudget) || 0;
  const aSpend = Number(actualSpend) || 0;
  const varianceETB = pBudget - aSpend;
  const variancePct = pBudget > 0 ? Number(((varianceETB / pBudget) * 100).toFixed(1)) : 0;
  const spendPct = pBudget > 0 ? Number(((aSpend / pBudget) * 100).toFixed(1)) : 0;

  const pHours = Number(plannedHours) || 0;
  const rHours = Number(actualRunHours) || 0;
  const dtHours = Number(downtimeHours) || 0;
  const capacityUtilPct = pHours > 0 ? Number(((rHours / pHours) * 100).toFixed(1)) : 0;

  const tUnits = Number(targetUnits) || 0;
  const aUnits = Number(actualUnits) || 0;
  const sPieces = Number(scrapPieces) || 0;
  const defectRatePct = aUnits > 0 ? Number(((sPieces / aUnits) * 100).toFixed(2)) : 0;
  const sCost = Number(scrapCost) || 0;
  const operators = Number(activeOperators) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedBudget: DepartmentBudget = {
      departmentId,
      plannedBudgetETB: pBudget,
      actualSpendETB: aSpend,
      varianceETB,
      variancePct,
    };

    const updatedCapacity: CapacityAndScrap = {
      departmentId,
      plannedHours: pHours,
      actualRunHours: rHours,
      downtimeHours: dtHours,
      capacityUtilizationPct: capacityUtilPct,
      targetOutputUnits: tUnits,
      actualOutputUnits: aUnits,
      scrapPieces: sPieces,
      defectRatePct,
      scrapCostETB: sCost,
      operatorsActive: operators,
    };

    onSave(updatedBudget, updatedCapacity);
    onClose();
  };

  const handleResetToZero = () => {
    setPlannedBudget(0);
    setActualSpend(0);
    setPlannedHours(0);
    setActualRunHours(0);
    setDowntimeHours(0);
    setTargetUnits(0);
    setActualUnits(0);
    setScrapPieces(0);
    setScrapCost(0);
    setActiveOperators(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full text-xs shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {langMode === 'am' ? 'የክፍል ፋይናንስና ማምረቻ መረጃ አርም' : 'Edit Department Metrics'}
                </h3>
                <span className="font-mono text-[10px] bg-slate-800 text-blue-400 px-2 py-0.5 rounded border border-slate-700">
                  {departmentId}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {deptDisplayName} · {langMode === 'am' ? 'የተሳሳተ በጀት፣ ሰዓታት፣ ምርትና የብክነት መረጃዎችን ማስተካከል' : 'Correct and submit financial budgets, run hours, output, and scrap logs'}
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
          {/* Section 1: Financial & Budget Metrics */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>{langMode === 'am' ? 'የበጀትና የወጪ መረጃ (ETB)' : '1. Budget & Expenditure (ETB)'}</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                {langMode === 'am' ? 'የኢትዮጵያ ብር' : 'Currency: ETB'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  {langMode === 'am' ? 'የታቀደ በጀት (Planned Budget ETB) *' : 'Planned Budget (ETB) *'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={plannedBudget}
                  onChange={(e) => setPlannedBudget(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 1500000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  {langMode === 'am' ? 'ትክክለኛ የወጣ ወጪ (Actual Spend ETB) *' : 'Actual Spend (ETB) *'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={actualSpend}
                  onChange={(e) => setActualSpend(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 1420000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Calculated Budget Summary */}
            <div className="pt-2 flex items-center justify-between text-xs font-mono bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">
                {langMode === 'am' ? 'የበጀት አጠቃቀም ምጣኔ:' : 'Budget Consumption:'}
                <span className={`ml-2 font-bold ${spendPct > 100 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {spendPct}%
                </span>
              </span>
              <span className="text-slate-400">
                {langMode === 'am' ? 'ልዩነት (Variance):' : 'Variance:'}
                <span className={`ml-2 font-bold ${varianceETB < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {formatETB(varianceETB, true)} ({variancePct}%)
                </span>
              </span>
            </div>
          </div>

          {/* Section 2: Operating Hours & Capacity */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{langMode === 'am' ? 'የስራ ሰዓታትና የአቅም አጠቃቀም' : '2. Operating Hours & Capacity Utilization'}</span>
              </span>
              <span className="font-mono text-[10px] text-blue-400 font-bold">
                Util: {capacityUtilPct}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Planned Run Hours
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={plannedHours}
                  onChange={(e) => setPlannedHours(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 720"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Actual Run Hours
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={actualRunHours}
                  onChange={(e) => setActualRunHours(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 680"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Downtime Hours
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={downtimeHours}
                  onChange={(e) => setDowntimeHours(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 40"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Output Units, Scrap & Defect Metrics */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>{langMode === 'am' ? 'የምርት ብዛት፣ ብክነትና የሰራተኛ ምጣኔ' : '3. Output Units, Scrap Loss & Staffing'}</span>
              </span>
              <span className="font-mono text-[10px] text-rose-400 font-bold">
                Defect Rate: {defectRatePct}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Target Output Units
                </label>
                <input
                  type="number"
                  min="0"
                  value={targetUnits}
                  onChange={(e) => setTargetUnits(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 5000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Actual Output Units
                </label>
                <input
                  type="number"
                  min="0"
                  value={actualUnits}
                  onChange={(e) => setActualUnits(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 4820"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Scrap Pieces
                </label>
                <input
                  type="number"
                  min="0"
                  value={scrapPieces}
                  onChange={(e) => setScrapPieces(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 45"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Scrap Cost (ETB)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={scrapCost}
                  onChange={(e) => setScrapCost(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 18500"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Active Operators
                </label>
                <input
                  type="number"
                  min="0"
                  value={activeOperators}
                  onChange={(e) => setActiveOperators(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 28"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetToZero}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-400 hover:text-white bg-amber-950/40 hover:bg-amber-900 border border-amber-800/60 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{langMode === 'am' ? 'ወደ ባዶ መልስ (Reset to Zero)' : 'Reset to Zero'}</span>
            </button>

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
                <span>{langMode === 'am' ? 'አስቀምጥ (Save / Submit)' : 'Save / Submit Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
