import React, { useState, useEffect } from 'react';
import { X, Wrench, Edit3, Trash2, Save, Calendar, User, ShieldAlert } from 'lucide-react';
import { PreventiveMaintenanceItem, DepartmentId, MaintenanceCriticality, MaintenanceStatus, LanguageMode } from '../types/dashboard.ts';
import { DEPARTMENTS } from '../data/mockData.ts';

interface EditMaintenanceModalProps {
  isOpen: boolean;
  item: PreventiveMaintenanceItem | null;
  onClose: () => void;
  onSave: (updatedItem: PreventiveMaintenanceItem) => void;
  onDelete?: (id: string) => void;
  langMode?: LanguageMode;
}

export const EditMaintenanceModal: React.FC<EditMaintenanceModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
  onDelete,
  langMode = 'en',
}) => {
  const [equipmentId, setEquipmentId] = useState('');
  const [equipmentName, setEquipmentName] = useState('');
  const [departmentId, setDepartmentId] = useState<DepartmentId>('production');
  const [maintenanceType, setMaintenanceType] = useState('');
  const [frequency, setFrequency] = useState<PreventiveMaintenanceItem['frequency']>('Monthly');
  const [technician, setTechnician] = useState('');
  const [lastServiceDate, setLastServiceDate] = useState('');
  const [nextServiceDueDate, setNextServiceDueDate] = useState('');
  const [criticality, setCriticality] = useState<MaintenanceCriticality>('High');
  const [status, setStatus] = useState<MaintenanceStatus>('On Schedule');
  const [checklistEn, setChecklistEn] = useState('');
  const [checklistAm, setChecklistAm] = useState('');

  useEffect(() => {
    if (item) {
      setEquipmentId(item.equipmentId || '');
      setEquipmentName(item.equipmentName || '');
      setDepartmentId(item.departmentId);
      setMaintenanceType(item.maintenanceType || '');
      setFrequency(item.frequency || 'Monthly');
      setTechnician(item.technician || '');
      setLastServiceDate(item.lastServiceDate || '');
      setNextServiceDueDate(item.nextServiceDueDate || '');
      setCriticality(item.criticality);
      setStatus(item.status);
      setChecklistEn(item.checklistEn || '');
      setChecklistAm(item.checklistAm || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentId.trim() || !equipmentName.trim() || !technician.trim()) return;

    const updatedItem: PreventiveMaintenanceItem = {
      ...item,
      equipmentId: equipmentId.trim().toUpperCase(),
      equipmentName: equipmentName.trim(),
      departmentId,
      maintenanceType: maintenanceType.trim(),
      frequency,
      technician: technician.trim(),
      lastServiceDate,
      nextServiceDueDate,
      criticality,
      status,
      checklistEn: checklistEn.trim() || 'Standard diagnostic and service protocol',
      checklistAm: checklistAm.trim() || 'መደበኛ የፍተሻ እና የጥገና ስራዎች',
    };

    onSave(updatedItem);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && item) {
      onDelete(item.id);
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
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {langMode === 'am' ? 'የጥገና መርሐግብር አስተካክል' : 'Edit Maintenance Schedule'}
                </h3>
                <span className="font-mono text-[10px] bg-slate-800 text-blue-400 px-2 py-0.5 rounded border border-slate-700">
                  {item.id}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {langMode === 'am' ? 'የተሳሳተ የማሽን ወይም የቴክኒሻን መረጃ ማረም' : 'Update equipment tag, schedule frequency, technician, or status'}
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
                Equipment Tag (የማሽን መለያ) *
              </label>
              <input
                type="text"
                required
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                placeholder="e.g. CNC-MILL-01"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white uppercase font-mono focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-white block mb-1">
                Department (ክፍል) *
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
              Equipment / Machine Name (የማሽን ስም) *
            </label>
            <input
              type="text"
              required
              value={equipmentName}
              onChange={(e) => setEquipmentName(e.target.value)}
              placeholder="e.g. 5-Axis CNC Milling Center"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-white block mb-1">
                Service Procedure Type *
              </label>
              <input
                type="text"
                required
                value={maintenanceType}
                onChange={(e) => setMaintenanceType(e.target.value)}
                placeholder="e.g. Spindle Taper & Lube Inspection"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-white block mb-1">
                Assigned Technician *
              </label>
              <input
                type="text"
                required
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                placeholder="Technician / Engineer name"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Bi-Weekly">Bi-Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Semi-Annual">Semi-Annual</option>
                <option value="Annual">Annual</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Criticality</label>
              <select
                value={criticality}
                onChange={(e) => setCriticality(e.target.value as MaintenanceCriticality)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value="Critical">Critical (High Bottleneck Risk)</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value="On Schedule">On Schedule</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending Inspection">Pending Inspection</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Last Service</label>
              <input
                type="date"
                value={lastServiceDate}
                onChange={(e) => setLastServiceDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Next Due Date</label>
              <input
                type="date"
                required
                value={nextServiceDueDate}
                onChange={(e) => setNextServiceDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Checklist (English)</label>
            <textarea
              rows={2}
              value={checklistEn}
              onChange={(e) => setChecklistEn(e.target.value)}
              placeholder="e.g. Inspect spindle runout, change synthetic lubricant, test safety interlock..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Checklist (Amharic - አማራጭ)</label>
            <input
              type="text"
              value={checklistAm}
              onChange={(e) => setChecklistAm(e.target.value)}
              placeholder="የፍተሻ ዝርዝር በአማርኛ..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            {onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{langMode === 'am' ? 'መርሐግብሩን ሰርዝ (Delete)' : 'Delete Schedule'}</span>
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
