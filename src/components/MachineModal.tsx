import React, { useState, useEffect } from 'react';
import { X, Cpu, Edit3, Trash2, Save, Calculator } from 'lucide-react';
import { MachineOEE, DepartmentId, LanguageMode } from '../types/dashboard.ts';
import { DEPARTMENTS } from '../data/mockData.ts';

interface MachineModalProps {
  isOpen: boolean;
  machine: MachineOEE | null; // null means adding a new machine
  onClose: () => void;
  onSave: (savedMachine: MachineOEE) => void;
  onDelete?: (machineId: string) => void;
  langMode?: LanguageMode;
}

export const MachineModal: React.FC<MachineModalProps> = ({
  isOpen,
  machine,
  onClose,
  onSave,
  onDelete,
  langMode = 'en',
}) => {
  const isEditMode = Boolean(machine);

  const [machineId, setMachineId] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameAm, setNameAm] = useState('');
  const [departmentId, setDepartmentId] = useState<DepartmentId>('production');
  const [operator, setOperator] = useState('');
  const [availabilityPct, setAvailabilityPct] = useState<number | ''>(90);
  const [performancePct, setPerformancePct] = useState<number | ''>(90);
  const [qualityPct, setQualityPct] = useState<number | ''>(95);
  const [status, setStatus] = useState<MachineOEE['status']>('Operational');

  useEffect(() => {
    if (machine) {
      setMachineId(machine.machineId);
      setNameEn(machine.nameEn);
      setNameAm(machine.nameAm || '');
      setDepartmentId(machine.departmentId);
      setOperator(machine.operator);
      setAvailabilityPct(machine.availabilityPct);
      setPerformancePct(machine.performancePct);
      setQualityPct(machine.qualityPct);
      setStatus(machine.status);
    } else {
      setMachineId(`EQ-${Math.floor(100 + Math.random() * 900)}`);
      setNameEn('');
      setNameAm('');
      setDepartmentId('production');
      setOperator('');
      setAvailabilityPct(90);
      setPerformancePct(90);
      setQualityPct(95);
      setStatus('Operational');
    }
  }, [machine, isOpen]);

  if (!isOpen) return null;

  const aVal = Number(availabilityPct) || 0;
  const pVal = Number(performancePct) || 0;
  const qVal = Number(qualityPct) || 0;
  const calculatedOee = Number(((aVal * pVal * qVal) / 10000).toFixed(1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineId.trim() || !nameEn.trim()) return;

    const savedMachine: MachineOEE = {
      machineId: machineId.trim().toUpperCase(),
      nameEn: nameEn.trim(),
      nameAm: nameAm.trim() || nameEn.trim(),
      departmentId,
      availabilityPct: aVal,
      performancePct: pVal,
      qualityPct: qVal,
      oeePct: calculatedOee,
      status,
      operator: operator.trim() || 'Unassigned',
    };

    onSave(savedMachine);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && machine) {
      onDelete(machine.machineId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full text-xs shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {isEditMode
                  ? (langMode === 'am' ? 'የማሽን መረጃን አስተካክል (Edit Machine)' : 'Edit Machine & OEE Record')
                  : (langMode === 'am' ? 'አዲስ ማሽን መዝግብ (Register Machine)' : 'Register Machine & OEE Tag')}
              </h3>
              <p className="text-[10px] text-slate-400">
                {isEditMode ? 'Correct equipment tags, operator assignment, or availability metrics' : 'Add new machinery to the plant equipment registry'}
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
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-white block mb-1">
                Machine Tag / ID *
              </label>
              <input
                type="text"
                required
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                placeholder="e.g. CNC-MILL-01"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white uppercase font-mono focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-white block mb-1">
                Department *
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value as DepartmentId)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-white block mb-1">
              Machine Name (English) *
            </label>
            <input
              type="text"
              required
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. 5-Axis CNC Milling Center"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Machine Name (Amharic - አማራጭ)
            </label>
            <input
              type="text"
              value={nameAm}
              onChange={(e) => setNameAm(e.target.value)}
              placeholder="የማሽን ስም በአማርኛ..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-white block mb-1">
                Assigned Operator
              </label>
              <input
                type="text"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                placeholder="Operator name"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-white block mb-1">
                Machine Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value="Operational">Operational (በስራ ላይ)</option>
                <option value="Maintenance">Maintenance (በጥገና ላይ)</option>
                <option value="Idle">Idle (ስራ የቆመ)</option>
              </select>
            </div>
          </div>

          {/* OEE 3-Component Factors */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-3">
            <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
              <Calculator className="w-3.5 h-3.5 text-blue-400" />
              <span>OEE Components (A × P × Q):</span>
            </span>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Availability (A) %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  value={availabilityPct}
                  onChange={(e) => setAvailabilityPct(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-center text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Performance (P) %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  value={performancePct}
                  onChange={(e) => setPerformancePct(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-center text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Quality (Q) %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  value={qualityPct}
                  onChange={(e) => setQualityPct(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-center text-white font-mono text-xs"
                />
              </div>
            </div>

            {/* Calculated Result */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Calculated OEE:</span>
              <span className={`font-mono text-base font-bold tabular-nums ${
                calculatedOee >= 85 ? 'text-emerald-400' : calculatedOee >= 75 ? 'text-blue-400' : 'text-amber-400'
              }`}>
                {calculatedOee}%
              </span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            {isEditMode && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{langMode === 'am' ? 'ማሽኑን ሰርዝ (Delete)' : 'Delete Machine'}</span>
              </button>
            ) : <div />}

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
                <span>{langMode === 'am' ? 'አስቀምጥ (Save Changes)' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
