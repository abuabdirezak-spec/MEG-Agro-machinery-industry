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
  TaskStatus,
  MachineOEE,
  DepartmentBudget,
  CapacityAndScrap
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
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal.tsx';
import { EditTaskModal } from './components/EditTaskModal.tsx';
import { EditMaintenanceModal } from './components/EditMaintenanceModal.tsx';
import { MachineModal } from './components/MachineModal.tsx';
import { EditDepartmentDataModal } from './components/EditDepartmentDataModal.tsx';
import { EditDirectiveModal } from './components/EditDirectiveModal.tsx';
import { GoogleSheetsModal } from './components/GoogleSheetsModal.tsx';
import { MonitoringEvaluationWorkflowModal } from './components/MonitoringEvaluationWorkflowModal.tsx';
import { LogExecutionModal } from './components/LogExecutionModal.tsx';

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
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const [isMEWorkflowOpen, setIsMEWorkflowOpen] = useState(false);

  // Edit & Delete Specific Modal States
  const [editingTask, setEditingTask] = useState<WeeklyTask | null>(null);
  const [loggingExecutionTask, setLoggingExecutionTask] = useState<WeeklyTask | null>(null);
  const [editingMaintenance, setEditingMaintenance] = useState<PreventiveMaintenanceItem | null>(null);
  const [editingMachine, setEditingMachine] = useState<MachineOEE | null>(null);
  const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);
  const [editingDeptData, setEditingDeptData] = useState<{
    deptId: DepartmentId;
    budget: DepartmentBudget;
    capacity: CapacityAndScrap;
  } | null>(null);
  const [editingDirective, setEditingDirective] = useState<ActionableRecommendation | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'task' | 'maintenance' | 'machine' | 'directive';
    id: string;
    title: string;
  }>({
    isOpen: false,
    type: 'task',
    id: '',
    title: '',
  });

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

  // Bulk Reschedule Critical Overdue Tasks to the next working week
  const handleBulkRescheduleOverdue = (taskIds: string[]) => {
    const today = new Date();
    // Next working week Monday (7 days ahead)
    const nextMonday = new Date(today.getTime() + (7 - today.getDay() + 1) * 24 * 60 * 60 * 1000);
    const nextSaturday = new Date(nextMonday.getTime() + 5 * 24 * 60 * 60 * 1000);
    const nextStartStr = nextMonday.toISOString().split('T')[0];
    const nextEndStr = nextSaturday.toISOString().split('T')[0];

    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (!taskIds.includes(t.id)) return t;

        // Compute next week code e.g. W44 -> W45
        const curNum = parseInt((t.week || 'W44').replace(/\D/g, ''), 10) || 44;
        const nextWeekCode = `W${curNum + 1}`;
        const prevEnd = t.endDate || t.dueDate;

        return {
          ...t,
          week: nextWeekCode,
          startDate: nextStartStr,
          endDate: nextEndStr,
          dueDate: nextEndStr,
          status: 'In Progress', // Re-opened for active execution in the new week
          varianceNotes: `Rescheduled from ${prevEnd} (${t.week || 'W44'}) to ${nextWeekCode} (${nextStartStr} to ${nextEndStr}). ${t.varianceNotes || ''}`.trim(),
        };
      })
    );
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

  // Comprehensive Edit & Delete Handlers
  const handleSaveEditedTask = (updatedTask: WeeklyTask) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setEditingTask(null);
  };

  const handlePromptDeleteTask = (task: WeeklyTask) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'task',
      id: task.id,
      title: task.titleEn,
    });
  };

  const handleSaveEditedMaintenance = (updatedItem: PreventiveMaintenanceItem) => {
    setMaintenanceItems(maintenanceItems.map((m) => (m.id === updatedItem.id ? updatedItem : m)));
    setEditingMaintenance(null);
  };

  const handlePromptDeleteMaintenance = (item: PreventiveMaintenanceItem) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'maintenance',
      id: item.id,
      title: `${item.equipmentName} (${item.equipmentId})`,
    });
  };

  const handleSaveMachine = (savedMachine: MachineOEE) => {
    const exists = machines.some((m) => m.machineId === savedMachine.machineId);
    if (exists) {
      setMachines(machines.map((m) => (m.machineId === savedMachine.machineId ? savedMachine : m)));
    } else {
      setMachines([savedMachine, ...machines]);
    }
    setEditingMachine(null);
    setIsAddMachineOpen(false);
  };

  const handlePromptDeleteMachine = (machine: MachineOEE) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'machine',
      id: machine.machineId,
      title: `${machine.nameEn} (${machine.machineId})`,
    });
  };

  const handleSaveDepartmentData = (
    updatedBudget: DepartmentBudget,
    updatedCapacity: CapacityAndScrap
  ) => {
    setBudgets(budgets.map((b) => (b.departmentId === updatedBudget.departmentId ? updatedBudget : b)));
    setCapacityScrap(capacityScrap.map((c) => (c.departmentId === updatedCapacity.departmentId ? updatedCapacity : c)));
    setEditingDeptData(null);
  };

  const handleSaveEditedDirective = (updatedRec: ActionableRecommendation) => {
    setRecommendations(recommendations.map((r) => (r.id === updatedRec.id ? updatedRec : r)));
    setEditingDirective(null);
  };

  const handlePromptDeleteDirective = (rec: ActionableRecommendation) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'directive',
      id: rec.id,
      title: rec.titleEn,
    });
  };

  const handleExecuteDelete = () => {
    const { type, id } = deleteConfirm;
    if (type === 'task') {
      setTasks(tasks.filter((t) => t.id !== id));
      if (editingTask?.id === id) setEditingTask(null);
    } else if (type === 'maintenance') {
      setMaintenanceItems(maintenanceItems.filter((m) => m.id !== id));
      if (editingMaintenance?.id === id) setEditingMaintenance(null);
    } else if (type === 'machine') {
      setMachines(machines.filter((m) => m.machineId !== id));
      if (editingMachine?.machineId === id) setEditingMachine(null);
    } else if (type === 'directive') {
      setRecommendations(recommendations.filter((r) => r.id !== id));
      if (editingDirective?.id === id) setEditingDirective(null);
    }
    setDeleteConfirm({ isOpen: false, type: 'task', id: '', title: '' });
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
        onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
        onOpenMEWorkflow={() => setIsMEWorkflowOpen(true)}
        tasks={tasks}
        onNavigateToTask={handleNavigateToTask}
        onClearAllData={handleClearAllData}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        isCleanSlate={isCleanSlate}
        onBulkRescheduleOverdue={handleBulkRescheduleOverdue}
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
            onEditDepartmentData={(b, c) => setEditingDeptData({ deptId: b.departmentId, budget: b, capacity: c })}
            langMode={langMode}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskRegistryView
            tasks={tasks}
            onAddTask={() => setIsTaskModalOpen(true)}
            onRegisterQuickTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onEditTask={(task) => setEditingTask(task)}
            onDeleteTask={(task) => handlePromptDeleteTask(task)}
            onLogExecution={(task) => setLoggingExecutionTask(task)}
            langMode={langMode}
            initialStatusFilter={taskFilterStatus}
            highlightedTaskId={highlightedTaskId}
            onClearHighlight={() => {
              setHighlightedTaskId(null);
              setTaskFilterStatus('All');
            }}
            onBulkRescheduleOverdue={handleBulkRescheduleOverdue}
          />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceOeeView
            machines={machines}
            maintenanceItems={maintenanceItems}
            capacityScrap={capacityScrap}
            onAddMaintenance={() => setIsMaintenanceModalOpen(true)}
            onUpdateMaintenanceStatus={handleUpdateMaintenanceStatus}
            onEditMaintenance={(m) => setEditingMaintenance(m)}
            onDeleteMaintenance={(m) => handlePromptDeleteMaintenance(m)}
            onAddMachine={() => setIsAddMachineOpen(true)}
            onEditMachine={(m) => setEditingMachine(m)}
            onDeleteMachine={(m) => handlePromptDeleteMachine(m)}
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
            onEditDirective={(rec) => setEditingDirective(rec)}
            onDeleteDirective={(rec) => handlePromptDeleteDirective(rec)}
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
        tasks={tasks}
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

      {/* Dynamic Edit, Save & Delete Modals */}
      <EditTaskModal
        isOpen={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEditedTask}
        onDelete={(taskId) => {
          if (editingTask) handlePromptDeleteTask(editingTask);
        }}
        langMode={langMode}
        tasks={tasks}
      />

      {/* Pure Execution Logging Modal (Separated from Planning) */}
      <LogExecutionModal
        isOpen={!!loggingExecutionTask}
        task={loggingExecutionTask}
        onClose={() => setLoggingExecutionTask(null)}
        onSave={handleSaveEditedTask}
        langMode={langMode}
      />

      <EditMaintenanceModal
        isOpen={!!editingMaintenance}
        item={editingMaintenance}
        onClose={() => setEditingMaintenance(null)}
        onSave={handleSaveEditedMaintenance}
        onDelete={(id) => {
          if (editingMaintenance) handlePromptDeleteMaintenance(editingMaintenance);
        }}
        langMode={langMode}
      />

      {/* Machine Modal for Editing */}
      <MachineModal
        isOpen={!!editingMachine}
        machine={editingMachine}
        onClose={() => setEditingMachine(null)}
        onSave={handleSaveMachine}
        onDelete={(machineId) => {
          if (editingMachine) handlePromptDeleteMachine(editingMachine);
        }}
        langMode={langMode}
      />

      {/* Machine Modal for Registering New Equipment */}
      <MachineModal
        isOpen={isAddMachineOpen}
        machine={null}
        onClose={() => setIsAddMachineOpen(false)}
        onSave={handleSaveMachine}
        langMode={langMode}
      />

      <EditDepartmentDataModal
        isOpen={!!editingDeptData}
        departmentId={editingDeptData?.deptId || null}
        budget={editingDeptData?.budget || null}
        capacityScrap={editingDeptData?.capacity || null}
        onClose={() => setEditingDeptData(null)}
        onSave={handleSaveDepartmentData}
        langMode={langMode}
      />

      <EditDirectiveModal
        isOpen={!!editingDirective}
        directive={editingDirective}
        onClose={() => setEditingDirective(null)}
        onSave={handleSaveEditedDirective}
        onDelete={(dirId) => {
          if (editingDirective) handlePromptDeleteDirective(editingDirective);
        }}
        langMode={langMode}
      />

      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.title}
        itemIdentifier={deleteConfirm.id}
        onConfirm={handleExecuteDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, type: 'task', id: '', title: '' })}
        langMode={langMode}
      />

      <GoogleSheetsModal
        isOpen={isGoogleSheetsOpen}
        onClose={() => setIsGoogleSheetsOpen(false)}
        data={{
          tasks,
          maintenance: maintenanceItems,
          evaluations,
          capacityScrap,
          budgets,
          machines,
          recommendations,
        }}
        langMode={langMode}
      />

      <MonitoringEvaluationWorkflowModal
        isOpen={isMEWorkflowOpen}
        onClose={() => setIsMEWorkflowOpen(false)}
        tasks={tasks}
        onOpenNewTask={() => setIsTaskModalOpen(true)}
        onOpenReportModal={() => setIsExportModalOpen(true)}
        onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
        langMode={langMode}
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
