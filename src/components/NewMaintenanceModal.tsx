import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PreventiveMaintenanceItem, DepartmentId, MaintenanceCriticality, MaintenanceStatus } from '../types/dashboard.ts';
import { DEPARTMENTS } from '../data/mockData.ts';

interface NewMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: PreventiveMaintenanceItem) => void;
}

export const NewMaintenanceModal: React.FC<NewMaintenanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [equipmentId, setEquipmentId] = useState('');
  const [equipmentName, setEquipmentName] = useState('');
  const [departmentId, setDepartmentId] = useState<DepartmentId>('machine_shop');
  const [maintenanceType, setMaintenanceType] = useState('');
  const [frequency, setFrequency] = useState<PreventiveMaintenanceItem['frequency']>('Monthly');
  const [technician, setTechnician] = useState('');
  const [nextServiceDueDate, setNextServiceDueDate] = useState('2026-11-20');
  const [criticality, setCriticality] = useState<MaintenanceCriticality>('High');
  const [status, setStatus] = useState<MaintenanceStatus>('On Schedule');
  const [checklistEn, setChecklistEn] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentId.trim() || !equipmentName.trim() || !technician.trim()) return;

    const newItem: PreventiveMaintenanceItem = {
      id: `PM-${Math.floor(210 + Math.random() * 50)}`,
      equipmentId: equipmentId.toUpperCase(),
      equipmentName,
      departmentId,
      maintenanceType,
      frequency,
      technician,
      lastServiceDate: new Date().toISOString().split('T')[0],
      nextServiceDueDate,
      criticality,
      status,
      checklistEn: checklistEn || 'Standard lubrication and sensor diagnostic',
      checklistAm: 'መደበኛ የቅባትና ዳሳሾች ፍተሻ',
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-lg w-full text-xs shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <h3 className="text-sm font-bold text-white tracking-tight">Schedule Preventive Maintenance</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Machine / Equipment Tag *</label>
              <input
                type="text"
                required
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                placeholder="e.g. CNC-MILL-02"
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white uppercase font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>{d.nameEn}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Equipment Name & Description *</label>
            <input
              type="text"
              required
              value={equipmentName}
              onChange={(e) => setEquipmentName(e.target.value)}
              placeholder="e.g. 5-Axis CNC Milling Center #2"
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Maintenance Scope / Service Type *</label>
            <input
              type="text"
              required
              value={maintenanceType}
              onChange={(e) => setMaintenanceType(e.target.value)}
              placeholder="e.g. Hydraulic pump overhaul and seal replacement"
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Assigned Technician *</label>
              <input
                type="text"
                required
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                placeholder="e.g. Biruk Kebede"
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Service Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Weekly">Weekly</option>
                <option value="Bi-Weekly">Bi-Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Next Service Due *</label>
              <input
                type="date"
                required
                value={nextServiceDueDate}
                onChange={(e) => setNextServiceDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Criticality</label>
              <select
                value={criticality}
                onChange={(e) => setCriticality(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="On Schedule">On Schedule</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending Inspection">Pending Inspection</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Inspection Checklist Notes</label>
            <input
              type="text"
              value={checklistEn}
              onChange={(e) => setChecklistEn(e.target.value)}
              placeholder="e.g. Verify pressure relief setting, inspect spindle bearings"
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
            />
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
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded"
            >
              Add Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
