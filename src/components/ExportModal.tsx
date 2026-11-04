import React from 'react';
import { X, Download, FileSpreadsheet, Check } from 'lucide-react';
import { WeeklyTask, PreventiveMaintenanceItem, DepartmentEvaluation, CapacityAndScrap } from '../types/dashboard.ts';
import { getDepartmentName } from '../utils/formatters.ts';
import { HISTORICAL_6M_TRENDS } from '../data/mockData.ts';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: WeeklyTask[];
  maintenance: PreventiveMaintenanceItem[];
  evaluations: DepartmentEvaluation[];
  capacityScrap: CapacityAndScrap[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  tasks,
  maintenance,
  evaluations,
  capacityScrap,
}) => {
  if (!isOpen) return null;

  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportTasks = () => {
    const headers = ['Task ID', 'Week', 'Department', 'Task Name', 'Assignee', 'Priority', 'Status', 'Planned Qty', 'Actual Qty', 'Unit', 'Progress %', 'Due Date', 'Variance Notes'];
    const rows = tasks.map((t) => [
      t.id,
      t.week,
      getDepartmentName(t.departmentId, 'en'),
      `"${t.titleEn.replace(/"/g, '""')}"`,
      `"${t.assignedTo}"`,
      t.priority,
      t.status,
      t.plannedQty,
      t.actualQty,
      t.unit,
      `${t.progressPercent}%`,
      t.dueDate,
      `"${(t.varianceNotes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV('Weekly_Task_Registry_Export.csv', csvContent);
  };

  const handleExportMaintenance = () => {
    const headers = ['Log ID', 'Equipment ID', 'Equipment Name', 'Department', 'Maintenance Type', 'Frequency', 'Technician', 'Last Service Date', 'Next Due Date', 'Criticality', 'Status'];
    const rows = maintenance.map((m) => [
      m.id,
      m.equipmentId,
      `"${m.equipmentName.replace(/"/g, '""')}"`,
      getDepartmentName(m.departmentId, 'en'),
      `"${m.maintenanceType.replace(/"/g, '""')}"`,
      m.frequency,
      `"${m.technician}"`,
      m.lastServiceDate,
      m.nextServiceDueDate,
      m.criticality,
      m.status,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV('Preventive_Maintenance_Log_Export.csv', csvContent);
  };

  const handleExportScorecards = () => {
    const headers = ['Department', 'Plan vs Actual (10)', 'Quality/Scrap (10)', 'Budget/Cost (10)', 'Reporting/Discipline (10)', 'Safety/Kaizen (10)', 'Total Score (50)', 'Grade'];
    const rows = evaluations.map((e) => [
      getDepartmentName(e.departmentId, 'en'),
      e.planVsActual,
      e.qualityScrap,
      e.budgetCost,
      e.disciplineReporting,
      e.safetyKaizen,
      e.totalScore,
      e.grade,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV('Departmental_Evaluation_Cards_Export.csv', csvContent);
  };

  const handleExportCapacity = () => {
    const headers = ['Shop', 'Planned Hours', 'Actual Run Hours', 'Downtime Hours', 'Capacity Utilization %', 'Target Units', 'Actual Output Units', 'Scrap Pieces', 'Defect Rate %', 'Scrap Cost (ETB)'];
    const rows = capacityScrap.map((c) => [
      getDepartmentName(c.departmentId, 'en'),
      c.plannedHours,
      c.actualRunHours,
      c.downtimeHours,
      `${c.capacityUtilizationPct}%`,
      c.targetOutputUnits,
      c.actualOutputUnits,
      c.scrapPieces,
      `${c.defectRatePct}%`,
      c.scrapCostETB,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV('Capacity_and_Scrap_Tracker_Export.csv', csvContent);
  };

  const handleExportTrends = () => {
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
      'QA OEE %',
      'QA Scrap %',
      'Plant Avg OEE %',
      'Plant Avg Scrap %',
    ];

    const rows = HISTORICAL_6M_TRENDS.map((m) => [
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
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV('6_Month_OEE_and_Scrap_Trends.csv', csvContent);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full text-xs shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-white p-0.5 flex items-center justify-center shrink-0 border border-slate-700/60 overflow-hidden">
              <img 
                src="/assets/aistudio/photo_2026-07-02_16-05-45_68c4c737.jpg" 
                alt="MEG Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Export Workbook Data</h3>
              <p className="text-[10px] text-amber-400 font-medium">Machinery Engineering Group (MEG) Agro-Machinery</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-300">
            Download standard Excel-compatible CSV files corresponding to the Master Executive Dashboard sheets:
          </p>

          <div className="space-y-2 pt-1">
            <button
              onClick={handleExportTasks}
              className="w-full flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 transition-colors text-left"
            >
              <div>
                <div className="font-semibold text-white">Weekly_Task_Registry.csv</div>
                <div className="text-[11px] text-slate-400">{tasks.length} tasks with planned vs. actual outputs and progress</div>
              </div>
              <Download className="w-4 h-4 text-blue-400" />
            </button>

            <button
              onClick={handleExportMaintenance}
              className="w-full flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 transition-colors text-left"
            >
              <div>
                <div className="font-semibold text-white">Preventive_Maintenance.csv</div>
                <div className="text-[11px] text-slate-400">{maintenance.length} equipment logs, technician assignments, due dates</div>
              </div>
              <Download className="w-4 h-4 text-blue-400" />
            </button>

            <button
              onClick={handleExportScorecards}
              className="w-full flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 transition-colors text-left"
            >
              <div>
                <div className="font-semibold text-white">Departmental_Evaluation_Cards.csv</div>
                <div className="text-[11px] text-slate-400">{evaluations.length} departments 5-criteria ratings and grades</div>
              </div>
              <Download className="w-4 h-4 text-blue-400" />
            </button>

            <button
              onClick={handleExportCapacity}
              className="w-full flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 transition-colors text-left"
            >
              <div>
                <div className="font-semibold text-white">Capacity_and_Scrap_Tracker.csv</div>
                <div className="text-[11px] text-slate-400">Shop run hours, defect rates, and ETB scrap costs</div>
              </div>
              <Download className="w-4 h-4 text-blue-400" />
            </button>

            <button
              onClick={handleExportTrends}
              className="w-full flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 transition-colors text-left"
            >
              <div>
                <div className="font-semibold text-white">6_Month_OEE_and_Scrap_Trends.csv</div>
                <div className="text-[11px] text-slate-400">Monthly OEE % and scrap defect rates (May - Oct 2026)</div>
              </div>
              <Download className="w-4 h-4 text-blue-400" />
            </button>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 text-slate-200 hover:text-white rounded"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
