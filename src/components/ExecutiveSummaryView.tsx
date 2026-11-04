import React from 'react';
import { 
  DepartmentBudget, 
  WeeklyTask, 
  CapacityAndScrap, 
  DepartmentEvaluation, 
  MachineOEE, 
  OperationalGapSolution,
  LanguageMode 
} from '../types/dashboard.ts';
import { KPICards } from './KPICards.tsx';
import { ExecutiveInsightsPanel } from './ExecutiveInsightsPanel.tsx';
import { ChartsSection } from './ChartsSection.tsx';
import { OperationalGapsSection } from './OperationalGapsSection.tsx';
import { DeviationAlertPanel } from './DeviationAlertPanel.tsx';
import { PerformanceHeatmap } from './PerformanceHeatmap.tsx';
import { AlertTriangle, CheckCircle2, ChevronRight, Layers, ArrowUpRight, ShieldAlert, FileText } from 'lucide-react';
import { formatETB } from '../utils/formatters.ts';
import { DepartmentId } from '../types/dashboard.ts';

interface ExecutiveSummaryViewProps {
  budgets: DepartmentBudget[];
  tasks: WeeklyTask[];
  capacityScrap: CapacityAndScrap[];
  evaluations: DepartmentEvaluation[];
  machines: MachineOEE[];
  gaps: OperationalGapSolution[];
  onToggleGapStatus: (id: string) => void;
  onNavigateToTab: (tab: 'departments' | 'tasks' | 'maintenance' | 'recommendations') => void;
  onSelectDepartment?: (deptId: DepartmentId) => void;
  onNavigateToTask?: (taskId: string) => void;
  onOpenReportModal?: () => void;
  langMode: LanguageMode;
}

export const ExecutiveSummaryView: React.FC<ExecutiveSummaryViewProps> = ({
  budgets,
  tasks,
  capacityScrap,
  evaluations,
  machines,
  gaps,
  onToggleGapStatus,
  onNavigateToTab,
  onSelectDepartment,
  onNavigateToTask,
  onOpenReportModal,
  langMode,
}) => {
  const overdueTasksCount = tasks.filter((t) => t.status === 'Overdue').length;
  const criticalGapsCount = gaps.filter((g) => g.impactLevel === 'Critical' && g.status !== 'Resolved').length;

  const handleDrillDownToDepartment = (deptId: DepartmentId) => {
    if (onSelectDepartment) {
      onSelectDepartment(deptId);
    }
    onNavigateToTab('departments');
  };

  return (
    <div className="space-y-6">
      {/* Executive Headline & Company Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-sm border border-slate-700/80 overflow-hidden">
            <img 
              src="/assets/aistudio/photo_2026-07-02_16-05-45_68c4c737.jpg" 
              alt="Machinery Engineering Group (MEG) Agro-Machinery Industry" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-base font-bold text-white tracking-tight">
                {langMode === 'am' 
                  ? 'ማሽነሪ ኢንጂነሪንግ ግሩፕ (MEG) · አግሮ-ማሽነሪ ኢንዱስትሪ' 
                  : 'Machinery Engineering Group (MEG) · Agro-Machinery Industry'}
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {langMode === 'am' 
                ? 'የፋብሪካ ዋና አመራር ዳሽቦርድ እና የሳምንት ስራዎች መቆጣጠሪያ (Master Executive Dashboard v11)' 
                : langMode === 'bilingual' 
                ? 'Plant Executive Dashboard & Task Registry · የፋብሪካ ዋና አመራር መቆጣጠሪያ' 
                : 'Executive Performance Scorecard · Tracking Operational Gaps, OEE, Scrap Costs, & Weekly Tasks'}
            </p>
          </div>
        </div>

        {/* Executive Highlights Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {criticalGapsCount > 0 && (
            <button
              onClick={() => {}}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-rose-300 bg-rose-950/40 border border-rose-800/50 rounded"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>{criticalGapsCount} {langMode === 'am' ? 'ወሳኝ ክፍተቶች' : 'Critical Gaps'}</span>
            </button>
          )}

          {overdueTasksCount > 0 && (
            <button
              onClick={() => onNavigateToTab('tasks')}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-amber-300 bg-amber-950/40 border border-amber-800/50 rounded hover:bg-amber-900/40 transition-colors"
            >
              <span>{overdueTasksCount} {langMode === 'am' ? 'ያለፈባቸው ስራዎች' : 'Overdue Tasks'}</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}

          <div className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            W44 Tracking Active
          </div>

          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-blue-600/90 hover:bg-blue-600 border border-blue-500 rounded transition-colors shadow-xs"
              title="Generate Executive Report in Word, Excel, or PowerPoint"
            >
              <FileText className="w-3.5 h-3.5 text-blue-200" />
              <span>{langMode === 'am' ? 'ሪፖርት ፍጠር (Word·Excel·PPT)' : 'Generate Report (Word·Excel·PPT)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Component */}
      <KPICards
        budgets={budgets}
        tasks={tasks}
        capacityScrap={capacityScrap}
        evaluations={evaluations}
        machines={machines}
        langMode={langMode}
      />

      {/* Executive Insights Panel: Algorithmic Top 3 Critical Operational Deviations */}
      <ExecutiveInsightsPanel
        capacityScrap={capacityScrap}
        machines={machines}
        budgets={budgets}
        tasks={tasks}
        evaluations={evaluations}
        langMode={langMode}
        onNavigateToDepartment={handleDrillDownToDepartment}
        onNavigateToTab={onNavigateToTab}
        onNavigateToTask={onNavigateToTask}
      />

      {/* Department-Level Performance Heatmap Grid */}
      <PerformanceHeatmap
        budgets={budgets}
        capacityScrap={capacityScrap}
        evaluations={evaluations}
        machines={machines}
        tasks={tasks}
        onSelectDepartment={handleDrillDownToDepartment}
        langMode={langMode}
      />

      {/* Visual Alert System: OEE & Scrap Rate ±10% Deviations */}
      <DeviationAlertPanel
        capacityScrap={capacityScrap}
        machines={machines}
        onNavigateToDepartment={handleDrillDownToDepartment}
        langMode={langMode}
      />

      {/* Visual Analytics Charts Section */}
      <ChartsSection
        capacityScrap={capacityScrap}
        budgets={budgets}
        machines={machines}
        langMode={langMode}
      />

      {/* Operational Gaps & Executive Solutions */}
      <OperationalGapsSection
        gaps={gaps}
        onToggleStatus={onToggleGapStatus}
        langMode={langMode}
      />
    </div>
  );
};
