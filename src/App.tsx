import React, { useState, useEffect } from 'react';
import { 
  DEPARTMENTS, 
  CLEAN_EVALUATIONS, 
  CLEAN_BUDGETS, 
  CLEAN_CAPACITY_SCRAP, 
  CLEAN_TASKS, 
  CLEAN_MACHINES, 
  CLEAN_PREVENTIVE_MAINTENANCE, 
  CLEAN_OPERATIONAL_GAPS, 
  CLEAN_RECOMMENDATIONS,
  CLEAN_HISTORICAL_TRENDS,
} from './data/mockData.ts';
import { 
  WeeklyTask, 
  DepartmentEvaluation, 
  PreventiveMaintenanceItem, 
  OperationalGapSolution, 
  ActionableRecommendation, 
  MaintenanceStatus,
  DepartmentId,
  TaskStatus
} from './types/dashboard.ts';
import { Header, ActiveTab, LanguageMode } from './components/Header.tsx';
import { ExecutiveSummaryView } from './components/ExecutiveSummaryView.tsx';
import { DepartmentScorecardView } from './components/DepartmentScorecardView.tsx';
import { TaskRegistryView } from './components/TaskRegistryView.tsx';
import { MaintenanceOeeView } from './components/MaintenanceOeeView.tsx';
import { StrategicDirectivesView } from './components/StrategicDirectivesView.tsx';
import { HistoricalTrendsView } from './components/HistoricalTrendsView.tsx';
import { NewTaskModal } from './components/NewTaskModal.tsx';
import { NewMaintenanceModal } from './components/NewMaintenanceModal.tsx';
import { EditEvaluationModal } from './components/EditEvaluationModal.tsx';
import { ExecutiveReportingModal } from './components/ExecutiveReportingModal.tsx';
import { GeminiPlantCopilot } from './components/GeminiPlantCopilot.tsx';

export default function App() {
  // Main Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [langMode, setLangMode] = useState<LanguageMode>('en');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<DepartmentId | 'all'>('all');

  // Application Data States (Starts in Clean Slate Mode for real factory operations)
  const [isCleanSlate, setIsCleanSlate] = useState<boolean>(true);
  const [tasks, setTasks] = useState<WeeklyTask[]>(CLEAN_TASKS);
  const [evaluations, setEvaluations] = useState<DepartmentEvaluation[]>(CLEAN_EVALUATIONS);
  const [maintenanceItems, setMaintenanceItems] = useState<PreventiveMaintenanceItem[]>(CLEAN_PREVENTIVE_MAINTENANCE);
  const [gaps, setGaps] = useState<OperationalGapSolution[]>(CLEAN_OPERATIONAL_GAPS);
  const [recommendations, setRecommendations] = useState<ActionableRecommendation[]>(CLEAN_RECOMMENDATIONS);
  const [budgets, setBudgets] = useState(CLEAN_BUDGETS);
  const [capacityScrap, setCapacityScrap] = useState(CLEAN_CAPACITY_SCRAP);
  const [machines, setMachines] = useState(CLEAN_MACHINES);

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<DepartmentEvaluation | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Automatic mount effect: Ensure browser storage is cleared of any residual demo records
  useEffect(() => {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
  }, []);

  // Handler to clear all inside data back to pristine system slate
  const handleClearAllData = () => {
    setTasks([]);
    setEvaluations(CLEAN_EVALUATIONS);
    setMaintenanceItems([]);
    setGaps([]);
    setRecommendations([]);
    setBudgets(CLEAN_BUDGETS);
    setCapacityScrap(CLEAN_CAPACITY_SCRAP);
    setMachines([]);
    setIsCleanSlate(true);
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
  };

  // Executive Alert Navigation & Highlighting
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [taskFilterStatus, setTaskFilterStatus] = useState<TaskStatus | 'All'>('All');

  const handleNavigateToTask = (taskId: string, filterStatus?: TaskStatus | 'All') => {
    setActiveTab('tasks');
    if (filterStatus) {
      setTaskFilterStatus(filterStatus);
    }
    if (taskId) {
      setHighlightedTaskId(taskId);
      setTimeout(() => {
        const el = document.getElementById(`task-row-${taskId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    } else {
      setHighlightedTaskId(null);
    }
  };

  // Handlers for Tasks
  const handleAddTask = (newTask: WeeklyTask) => {
    setTasks([newTask, ...tasks]);
  };

  const handleUpdateTask = (updatedTask: WeeklyTask) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  // Handlers for Preventive Maintenance
  const handleAddMaintenance = (newItem: PreventiveMaintenanceItem) => {
    setMaintenanceItems([newItem, ...maintenanceItems]);
  };

  const handleUpdateMaintenanceStatus = (id: string, newStatus: MaintenanceStatus) => {
    setMaintenanceItems(
      maintenanceItems.map((m) => {
        if (m.id === id) {
          const isServicing = newStatus === 'On Schedule';
          return {
            ...m,
            status: newStatus,
            lastServiceDate: isServicing ? new Date().toISOString().split('T')[0] : m.lastServiceDate,
            nextServiceDueDate: isServicing 
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
              : m.nextServiceDueDate,
          };
        }
        return m;
      })
    );
  };

  // Handlers for Evaluations
  const handleSaveEvaluation = (updated: DepartmentEvaluation) => {
    setEvaluations(evaluations.map((e) => (e.departmentId === updated.departmentId ? updated : e)));
  };

  // Handlers for Operational Gaps
  const handleToggleGapStatus = (id: string) => {
    setGaps(
      gaps.map((g) => {
        if (g.id === id) {
          const nextStatus = 
            g.status === 'In Implementation' 
              ? 'Under Review' 
              : g.status === 'Under Review' 
              ? 'Resolved' 
              : 'In Implementation';
          return { ...g, status: nextStatus };
        }
        return g;
      })
    );
  };

  // Handlers for Recommendations
  const handleUpdateRecommendationStatus = (id: string, status: ActionableRecommendation['status']) => {
    setRecommendations(
      recommendations.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const handleAddRecommendation = (newRec: ActionableRecommendation) => {
    setRecommendations([newRec, ...recommendations]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 3-Zone Clean Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        langMode={langMode}
        setLangMode={setLangMode}
        onOpenExport={() => setIsExportModalOpen(true)}
        tasks={tasks}
        onNavigateToTask={handleNavigateToTask}
        onClearAllData={handleClearAllData}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        isCleanSlate={isCleanSlate}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Production Mode Active Strip */}
        <div className="mb-5 bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="font-semibold text-slate-200">
                {langMode === 'am' ? 'የፋብሪካ ንጹህ ሲስተም ዝግጁ ነው' : 'Production System Active · Pure System Slate'}
              </span>
              <span className="text-slate-400 ml-2">
                {langMode === 'am' 
                  ? 'ሁሉም የሙከራ መረጃዎች ተጠርገዋል። 13ቱም የማምረቻና አስተዳደር ክፍሎች አዲስ መረጃ ለመመዝገብ ተዘጋጅተዋል።' 
                  : 'Inside data cleared. The official 13-department hierarchy is initialized for real plant operations.'}
              </span>
            </div>
          </div>
          <button
            onClick={handleClearAllData}
            className="text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded transition-colors cursor-pointer shrink-0"
            title="Reset system back to blank production baseline"
          >
            {langMode === 'am' ? 'ዳግም አጽዳ' : 'Reset System'}
          </button>
        </div>

        {activeTab === 'overview' && (
          <ExecutiveSummaryView
            budgets={budgets}
            tasks={tasks}
            capacityScrap={capacityScrap}
            evaluations={evaluations}
            machines={machines}
            gaps={gaps}
            onToggleGapStatus={handleToggleGapStatus}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onSelectDepartment={(deptId) => setSelectedDepartmentFilter(deptId)}
            onOpenReportModal={() => setIsExportModalOpen(true)}
            onNavigateToTask={(taskId) => handleNavigateToTask(taskId)}
            langMode={langMode}
          />
        )}

        {activeTab === 'departments' && (
          <DepartmentScorecardView
            evaluations={evaluations}
            budgets={budgets}
            capacityScrap={capacityScrap}
            tasks={tasks}
            selectedDeptId={selectedDepartmentFilter}
            onSelectDeptId={setSelectedDepartmentFilter}
            onEditEvaluation={(evalData) => setEditingEvaluation(evalData)}
            langMode={langMode}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskRegistryView
            tasks={tasks}
            onAddTask={() => setIsTaskModalOpen(true)}
            onRegisterQuickTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            langMode={langMode}
            initialStatusFilter={taskFilterStatus}
            highlightedTaskId={highlightedTaskId}
            onClearHighlight={() => {
              setHighlightedTaskId(null);
              setTaskFilterStatus('All');
            }}
          />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceOeeView
            machines={machines}
            maintenanceItems={maintenanceItems}
            capacityScrap={capacityScrap}
            onAddMaintenance={() => setIsMaintenanceModalOpen(true)}
            onUpdateMaintenanceStatus={handleUpdateMaintenanceStatus}
            langMode={langMode}
          />
        )}

        {activeTab === 'trends' && (
          <HistoricalTrendsView
            langMode={langMode}
            trendsData={CLEAN_HISTORICAL_TRENDS}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'recommendations' && (
          <StrategicDirectivesView
            recommendations={recommendations}
            onUpdateStatus={handleUpdateRecommendationStatus}
            onAddRecommendation={handleAddRecommendation}
            langMode={langMode}
          />
        )}
      </main>

      {/* Modals */}
      <NewTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleAddTask}
        langMode={langMode}
      />

      <NewMaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        onSave={handleAddMaintenance}
      />

      <EditEvaluationModal
        isOpen={!!editingEvaluation}
        evaluation={editingEvaluation}
        onClose={() => setEditingEvaluation(null)}
        onSave={handleSaveEvaluation}
      />

      <ExecutiveReportingModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        tasks={tasks}
        maintenance={maintenanceItems}
        evaluations={evaluations}
        capacityScrap={capacityScrap}
        budgets={budgets}
        machines={machines}
        gaps={gaps}
        recommendations={recommendations}
        langMode={langMode}
      />

      <GeminiPlantCopilot
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        langMode={langMode}
        tasksCount={tasks.length}
        overdueTasksCount={tasks.filter((t) => t.status === 'Overdue').length}
      />

      {/* Industrial Plant Quiet Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-white p-0.5 flex items-center justify-center shrink-0">
              <img 
                src="/assets/aistudio/photo_2026-07-02_16-05-45_68c4c737.jpg" 
                alt="MEG Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-semibold text-slate-200">Machinery Engineering Group (MEG)</span>
            <span className="text-amber-400 font-medium">Agro-Machinery Industry</span>
            <span className="text-slate-600">·</span>
            <span>Master Executive Dashboard &amp; Task Registry (v11)</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Plant Manufacturing Operations</span>
            <span className="text-slate-600">·</span>
            <span>Currency: ETB (የኢትዮጵያ ብር)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
