import React, { useState, useEffect } from 'react';
import { X, Award, Save } from 'lucide-react';
import { DepartmentEvaluation } from '../types/dashboard.ts';
import { getDepartmentName } from '../utils/formatters.ts';

interface EditEvaluationModalProps {
  isOpen: boolean;
  evaluation: DepartmentEvaluation | null;
  onClose: () => void;
  onSave: (updated: DepartmentEvaluation) => void;
}

export const EditEvaluationModal: React.FC<EditEvaluationModalProps> = ({
  isOpen,
  evaluation,
  onClose,
  onSave,
}) => {
  const [planVsActual, setPlanVsActual] = useState(7.5);
  const [qualityScrap, setQualityScrap] = useState(7.5);
  const [budgetCost, setBudgetCost] = useState(7.5);
  const [disciplineReporting, setDisciplineReporting] = useState(7.5);
  const [safetyKaizen, setSafetyKaizen] = useState(7.5);

  useEffect(() => {
    if (evaluation) {
      setPlanVsActual(evaluation.planVsActual);
      setQualityScrap(evaluation.qualityScrap);
      setBudgetCost(evaluation.budgetCost);
      setDisciplineReporting(evaluation.disciplineReporting);
      setSafetyKaizen(evaluation.safetyKaizen);
    }
  }, [evaluation]);

  if (!isOpen || !evaluation) return null;

  const totalScore = Number(
    (planVsActual + qualityScrap + budgetCost + disciplineReporting + safetyKaizen).toFixed(1)
  );

  const calculateGrade = (score: number): 'A' | 'B' | 'C' | 'D' => {
    if (score >= 45) return 'A';
    if (score >= 38) return 'B';
    if (score >= 30) return 'C';
    return 'D';
  };

  const currentGrade = calculateGrade(totalScore);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: DepartmentEvaluation = {
      ...evaluation,
      planVsActual,
      qualityScrap,
      budgetCost,
      disciplineReporting,
      safetyKaizen,
      totalScore,
      grade: currentGrade,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full text-xs shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Evaluate {getDepartmentName(evaluation.departmentId, 'en')}
            </h3>
            <p className="text-[11px] text-slate-400">Departmental_Evaluation_Card 5-Criteria Matrix</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Score Header */}
          <div className="bg-slate-950/80 border border-slate-800 rounded p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Calculated Total</span>
              <div className="text-xl font-bold font-mono text-white tabular-nums">
                {totalScore} <span className="text-xs text-slate-500 font-normal">/ 50.0</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Performance Grade</span>
              <span className="text-base font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                Grade {currentGrade}
              </span>
            </div>
          </div>

          {/* 5 Criteria Sliders / Number Inputs */}
          <div className="space-y-3">
            {/* 1 */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-medium">1. Plan vs. Actual Delivery</span>
                <span className="font-mono text-blue-400">{planVsActual} / 10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={planVsActual}
                onChange={(e) => setPlanVsActual(parseFloat(e.target.value))}
                className="w-full accent-blue-600 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* 2 */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-medium">2. Quality & Scrap Control</span>
                <span className="font-mono text-emerald-400">{qualityScrap} / 10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={qualityScrap}
                onChange={(e) => setQualityScrap(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* 3 */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-medium">3. Budget & Cost Discipline</span>
                <span className="font-mono text-amber-400">{budgetCost} / 10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={budgetCost}
                onChange={(e) => setBudgetCost(parseFloat(e.target.value))}
                className="w-full accent-amber-600 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* 4 */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-medium">4. Reporting & Shift Discipline</span>
                <span className="font-mono text-purple-400">{disciplineReporting} / 10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={disciplineReporting}
                onChange={(e) => setDisciplineReporting(parseFloat(e.target.value))}
                className="w-full accent-purple-600 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* 5 */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-medium">5. Safety & Kaizen (5S)</span>
                <span className="font-mono text-teal-400">{safetyKaizen} / 10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={safetyKaizen}
                onChange={(e) => setSafetyKaizen(parseFloat(e.target.value))}
                className="w-full accent-teal-600 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Card</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
