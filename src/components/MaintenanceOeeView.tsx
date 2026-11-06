import React, { useState } from 'react';
import { 
  Wrench, 
  Activity, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert,
  Sliders,
  Layers,
  Cpu,
  Edit3,
  Trash2
} from 'lucide-react';
import { 
  MachineOEE, 
  PreventiveMaintenanceItem, 
  CapacityAndScrap, 
  MaintenanceStatus, 
  DepartmentId, 
  LanguageMode 
} from '../types/dashboard.ts';
import { DEPARTMENTS } from '../data/mockData.ts';
import { getDepartmentName, formatETB } from '../utils/formatters.ts';

interface MaintenanceOeeViewProps {
  machines: MachineOEE[];
  maintenanceItems: PreventiveMaintenanceItem[];
  capacityScrap: CapacityAndScrap[];
  onAddMaintenance: () => void;
  onUpdateMaintenanceStatus: (id: string, newStatus: MaintenanceStatus) => void;
  onEditMaintenance?: (item: PreventiveMaintenanceItem) => void;
  onDeleteMaintenance?: (item: PreventiveMaintenanceItem) => void;
  onAddMachine?: () => void;
  onEditMachine?: (machine: MachineOEE) => void;
  onDeleteMachine?: (machine: MachineOEE) => void;
  langMode: LanguageMode;
}

export const MaintenanceOeeView: React.FC<MaintenanceOeeViewProps> = ({
  machines,
  maintenanceItems,
  capacityScrap,
  onAddMaintenance,
  onUpdateMaintenanceStatus,
  onEditMaintenance,
  onDeleteMaintenance,
  onAddMachine,
  onEditMachine,
  onDeleteMachine,
  langMode,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'maintenance' | 'machines' | 'capacity'>('maintenance');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<MaintenanceStatus | 'All'>('All');
  const [selectedDept, setSelectedDept] = useState<DepartmentId | 'All'>('All');

  // Filter maintenance items
  const filteredMaintenance = maintenanceItems.filter((item) => {
    const matchesSearch = 
      item.equipmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.technician.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.maintenanceType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    const matchesDept = selectedDept === 'All' || item.departmentId === selectedDept;

    return matchesSearch && matchesStatus && matchesDept;
  });

  const getMaintenanceStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 whitespace-nowrap">
            <AlertTriangle className="w-3 h-3" />
            {langMode === 'am' ? 'ያለፈበት' : 'Overdue'}
          </span>
        );
      case 'On Schedule':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3" />
            {langMode === 'am' ? 'በመርሐግብር ላይ' : 'On Schedule'}
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 whitespace-nowrap">
            <Clock className="w-3 h-3" />
            {langMode === 'am' ? 'በጥገና ላይ' : 'In Progress'}
          </span>
        );
      case 'Pending Inspection':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
            <Sliders className="w-3 h-3" />
            {langMode === 'am' ? 'ምርመራ በመጠባበቅ ላይ' : 'Pending Inspection'}
          </span>
        );
    }
  };

  const getMachineStatusBadge = (status: MachineOEE['status']) => {
    switch (status) {
      case 'Operational':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {langMode === 'am' ? 'በስራ ላይ' : 'Operational'}
          </span>
        );
      case 'Idle':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {langMode === 'am' ? 'ቆሟል' : 'Idle'}
          </span>
        );
      case 'Maintenance':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            {langMode === 'am' ? 'በጥገና ላይ' : 'In Maintenance'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* View Switcher Sub-Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-400" />
            <span>{langMode === 'am' ? 'የመከላከያ ጥገናና የማሽኖች ብቃት (OEE)' : langMode === 'bilingual' ? 'Preventive Maintenance & OEE Logs · ጥገናና OEE' : 'Preventive Maintenance & OEE Logs'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {langMode === 'am' ? 'የመሳሪያዎች አገልግሎት መርሐግብር፣ የአቅም አጠቃቀም እና የብክነት መረጃ' : 'Equipment upkeep cycles, shop capacity tracking, and OEE availability-performance-quality logs'}
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded border border-slate-800">
          <button
            onClick={() => setActiveSubTab('maintenance')}
            className={`px-3 py-1.5 text-xs font-semibold rounded whitespace-nowrap transition-colors ${
              activeSubTab === 'maintenance'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {langMode === 'am' ? 'የጥገና መርሐግብር' : 'Preventive Maintenance'}
          </button>
          <button
            onClick={() => setActiveSubTab('machines')}
            className={`px-3 py-1.5 text-xs font-semibold rounded whitespace-nowrap transition-colors ${
              activeSubTab === 'machines'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {langMode === 'am' ? 'የማሽኖች OEE' : 'Machine OEE Logs'}
          </button>
          <button
            onClick={() => setActiveSubTab('capacity')}
            className={`px-3 py-1.5 text-xs font-semibold rounded whitespace-nowrap transition-colors ${
              activeSubTab === 'capacity'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {langMode === 'am' ? 'የአቅምና ብክነት መዝገብ' : 'Capacity & Scrap'}
          </button>
        </div>
      </div>

      {/* 1. Preventive Maintenance View */}
      {activeSubTab === 'maintenance' && (
        <div className="space-y-3">
          {/* Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-3 w-full">
              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={langMode === 'am' ? 'መሳሪያ፣ ቴክኒሻን፣ የጥገና አይነት...' : 'Search machine, technician...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="All">{langMode === 'am' ? 'ሁሉም የጥገና ሁኔታ' : 'All Statuses'}</option>
                <option value="Overdue">{langMode === 'am' ? 'ያለፈበት (Overdue)' : 'Overdue'}</option>
                <option value="On Schedule">{langMode === 'am' ? 'በመርሐግብር ላይ (On Schedule)' : 'On Schedule'}</option>
                <option value="In Progress">{langMode === 'am' ? 'በጥገና ላይ (In Progress)' : 'In Progress'}</option>
                <option value="Pending Inspection">{langMode === 'am' ? 'ምርመራ የሚጠበቅ' : 'Pending Inspection'}</option>
              </select>

              {/* Department Filter */}
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="All">{langMode === 'am' ? 'ሁሉም ክፍሎች' : 'All Departments'}</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>{langMode === 'am' ? d.nameAm : d.nameEn}</option>
                ))}
              </select>
            </div>

            <button
              onClick={onAddMaintenance}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors whitespace-nowrap shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{langMode === 'am' ? 'አዲስ የጥገና መዝገብ' : 'Schedule Service'}</span>
            </button>
          </div>

          {/* Maintenance Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3 w-20">Log ID</th>
                    <th className="py-3 px-3 w-28">Machine ID</th>
                    <th className="py-3 px-4 min-w-[200px]">Equipment & Maintenance Service</th>
                    <th className="py-3 px-3">Shop</th>
                    <th className="py-3 px-3">Frequency</th>
                    <th className="py-3 px-3">Technician</th>
                    <th className="py-3 px-3 font-mono">Last Service</th>
                    <th className="py-3 px-3 font-mono">Next Due</th>
                    <th className="py-3 px-3">Criticality</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredMaintenance.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400 text-xs">
                        <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                          <Wrench className="w-8 h-8 text-slate-600" />
                          <p className="font-semibold text-slate-300">
                            {maintenanceItems.length === 0 
                              ? (langMode === 'am' ? 'ምንም የተመዘገበ የጥገና መርሐግብር የለም።' : 'No preventive maintenance schedules registered yet.')
                              : (langMode === 'am' ? 'በዚህ ማጣሪያ ምንም የተገኘ መዝገብ የለም።' : 'No maintenance logs match the selected filter.')}
                          </p>
                          {maintenanceItems.length === 0 && (
                            <button
                              onClick={onAddMaintenance}
                              className="mt-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold cursor-pointer shadow-xs"
                            >
                              + {langMode === 'am' ? 'አዲስ መርሐግብር መዝግብ' : 'Schedule First Service'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredMaintenance.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-slate-300">
                        {item.id}
                      </td>
                      <td className="py-3 px-3 font-mono text-blue-400 font-medium">
                        {item.equipmentId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{item.equipmentName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.maintenanceType}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                          {langMode === 'am' ? item.checklistAm : item.checklistEn}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                        {getDepartmentName(item.departmentId, langMode === 'bilingual' ? 'en' : langMode)}
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {item.frequency}
                      </td>
                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                        {item.technician}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {item.lastServiceDate}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap">
                        <span className={item.status === 'Overdue' ? 'text-rose-400 font-semibold' : 'text-slate-300'}>
                          {item.nextServiceDueDate}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          item.criticality === 'Critical'
                            ? 'text-rose-400 bg-rose-950/40 border border-rose-800/40'
                            : 'text-amber-400 bg-amber-950/40 border border-amber-800/40'
                        }`}>
                          {item.criticality}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {getMaintenanceStatusBadge(item.status)}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const nextState = 
                                item.status === 'Overdue' || item.status === 'In Progress' 
                                  ? 'On Schedule' 
                                  : 'In Progress';
                              onUpdateMaintenanceStatus(item.id, nextState);
                            }}
                            className="px-2 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
                          >
                            {item.status === 'On Schedule' ? 'Log Service' : 'Mark Serviced'}
                          </button>
                          {onEditMaintenance && (
                            <button
                              type="button"
                              onClick={() => onEditMaintenance(item)}
                              className="p-1 rounded text-blue-400 hover:text-white hover:bg-blue-600/30 transition-colors cursor-pointer"
                              title={langMode === 'am' ? 'የተሳሳተ መረጃን አርም' : 'Edit incorrect schedule'}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteMaintenance && (
                            <button
                              type="button"
                              onClick={() => onDeleteMaintenance(item)}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title={langMode === 'am' ? 'መርሐግብሩን ሰርዝ' : 'Delete schedule'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Machine OEE Log */}
      {activeSubTab === 'machines' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden space-y-0">
          {/* Machines Registry Header Bar */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>{langMode === 'am' ? 'የማሽነሪዎች OEE መዝገብ' : 'Equipment & Machinery OEE Registry'}</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {langMode === 'am' ? 'የማሽኖች መገኘት (Availability)፣ አፈጻጸም (Performance) እና ጥራት (Quality) ምጣኔ' : 'Live OEE components (A × P × Q), assigned operators, and operational statuses'}
              </p>
            </div>

            {onAddMachine && (
              <button
                type="button"
                onClick={onAddMachine}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{langMode === 'am' ? 'አዲስ ማሽን መዝግብ' : '+ Add Machine'}</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3 w-28">Machine Tag</th>
                  <th className="py-3 px-4 min-w-[200px]">Equipment Name & Type</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Assigned Operator</th>
                  <th className="py-3 px-3 text-right">Availability (A)</th>
                  <th className="py-3 px-3 text-right">Performance (P)</th>
                  <th className="py-3 px-3 text-right">Quality (Q)</th>
                  <th className="py-3 px-3 text-right">Total OEE %</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {machines.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <Cpu className="w-8 h-8 text-slate-600" />
                        <p className="font-semibold text-slate-300">
                          {langMode === 'am' ? 'ምንም የተመዘገበ ማሽን የለም።' : 'No equipment OEE records registered in the system.'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {langMode === 'am' ? 'የፋብሪካ ማሽነሪዎች ሲመዘገቡ እዚህ ይታያሉ።' : 'Machine tags, availability, performance, and OEE percentages will appear here.'}
                        </p>
                        {onAddMachine && (
                          <button
                            type="button"
                            onClick={onAddMachine}
                            className="mt-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold cursor-pointer shadow-xs"
                          >
                            + {langMode === 'am' ? 'የመጀመሪያውን ማሽን መዝግብ' : 'Register First Machine'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  machines.map((machine) => (
                  <tr key={machine.machineId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-blue-400">
                      {machine.machineId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">
                        {langMode === 'am' ? machine.nameAm : machine.nameEn}
                      </div>
                      {langMode === 'bilingual' && (
                        <div className="text-[11px] text-slate-400 mt-0.5">{machine.nameAm}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {getDepartmentName(machine.departmentId, langMode === 'bilingual' ? 'en' : langMode)}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {machine.operator}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                      {machine.availabilityPct.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                      {machine.performancePct.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                      {machine.qualityPct.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-sm">
                      <span className={machine.oeePct >= 85 ? 'text-emerald-400' : machine.oeePct >= 75 ? 'text-blue-400' : 'text-amber-400'}>
                        {machine.oeePct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {getMachineStatusBadge(machine.status)}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {onEditMachine && (
                          <button
                            type="button"
                            onClick={() => onEditMachine(machine)}
                            className="p-1 rounded text-blue-400 hover:text-white hover:bg-blue-600/30 transition-colors cursor-pointer"
                            title={langMode === 'am' ? 'የማሽን መረጃን አርም' : 'Edit machine & OEE'}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteMachine && (
                          <button
                            type="button"
                            onClick={() => onDeleteMachine(machine)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title={langMode === 'am' ? 'ማሽኑን ሰርዝ' : 'Delete machine'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Capacity and Scrap Tracker */}
      {activeSubTab === 'capacity' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Production Shop</th>
                  <th className="py-3 px-3 text-right">Planned Hours</th>
                  <th className="py-3 px-3 text-right">Run Hours</th>
                  <th className="py-3 px-3 text-right">Downtime Hours</th>
                  <th className="py-3 px-3 text-right">Capacity Util %</th>
                  <th className="py-3 px-3 text-right">Target Output</th>
                  <th className="py-3 px-3 text-right">Actual Output</th>
                  <th className="py-3 px-3 text-right">Scrap Pieces</th>
                  <th className="py-3 px-3 text-right">Defect Rate %</th>
                  <th className="py-3 px-3 text-right">Scrap Cost (ETB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {capacityScrap.map((item) => (
                  <tr key={item.departmentId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">
                      {getDepartmentName(item.departmentId, langMode)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-400">
                      {item.plannedHours} hrs
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                      {item.actualRunHours} hrs
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-rose-400">
                      {item.downtimeHours} hrs
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold">
                      <span className={item.capacityUtilizationPct >= 85 ? 'text-emerald-400' : 'text-blue-400'}>
                        {item.capacityUtilizationPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-400">
                      {item.targetOutputUnits.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200">
                      {item.actualOutputUnits.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-rose-400">
                      {item.scrapPieces}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-rose-300 font-semibold">
                      {item.defectRatePct.toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-rose-400 font-bold">
                      {formatETB(item.scrapCostETB)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
