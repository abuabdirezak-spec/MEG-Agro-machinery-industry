import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  AlertTriangle,
  Calendar,
  Layers,
  Calculator,
  PlusCircle,
  FileCheck2,
  Edit3,
  Trash2,
  Target,
  Zap,
  BarChart3,
  ArrowRight,
  TrendingUp,
  FileText,
  Download,
  RotateCcw,
  Check,
  ChevronRight,
  Play,
  Hourglass,
  Timer,
  CheckCircle,
  Flame,
  CalendarRange,
  Lock,
  Link2,
  ShieldAlert
} from 'lucide-react';
import { WeeklyTask, DepartmentId, TaskStatus, TaskPriority, LanguageMode } from '../types/dashboard.ts';
import { DEPARTMENTS } from '../data/mockData.ts';
import { getDepartmentName } from '../utils/formatters.ts';

export type WorkflowStage = 'plan' | 'execution' | 'performance';
export type ProgressDisplayMode = 'both' | 'status' | 'timeline';

interface TaskRegistryViewProps {
  tasks: WeeklyTask[];
  onAddTask: () => void;
  onRegisterQuickTask?: (task: WeeklyTask) => void;
  onUpdateTask: (task: WeeklyTask) => void;
  onEditTask?: (task: WeeklyTask) => void;
  onDeleteTask?: (task: WeeklyTask) => void;
  onLogExecution?: (task: WeeklyTask) => void;
  langMode: LanguageMode;
  initialStatusFilter?: TaskStatus | 'All';
  initialSearchQuery?: string;
  highlightedTaskId?: string | null;
  onClearHighlight?: () => void;
  onBulkRescheduleOverdue?: (taskIds: string[]) => void;
}

export const TaskRegistryView: React.FC<TaskRegistryViewProps> = ({
  tasks,
  onAddTask,
  onRegisterQuickTask,
  onUpdateTask,
  onEditTask,
  onDeleteTask,
  onLogExecution,
  langMode,
  initialStatusFilter = 'All',
  initialSearchQuery = '',
  highlightedTaskId = null,
  onClearHighlight,
  onBulkRescheduleOverdue,
}) => {
  // 3-Stage Workflow Separation: Plan -> Execution -> Performance Evaluation
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('plan');
  // Progress Bar Display Mode (status completion, timeline/remaining time, or dual overview)
  const [progressMode, setProgressMode] = useState<ProgressDisplayMode>('both');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'All'>(initialStatusFilter);
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'All'>('All');
  const [selectedDept, setSelectedDept] = useState<DepartmentId | 'All'>('All');
  const [selectedWeek, setSelectedWeek] = useState<string>('All');

  // Sync with incoming alert navigation filters
  React.useEffect(() => {
    if (initialStatusFilter) {
      setSelectedStatus(initialStatusFilter);
      if (initialStatusFilter === 'Overdue' || initialStatusFilter === 'Delayed') {
        setWorkflowStage('execution');
      }
    }
  }, [initialStatusFilter]);

  React.useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Dynamic list of weeks from tasks
  const availableWeeks = React.useMemo(() => {
    const list = new Set(['W44', 'W45', 'W46']);
    tasks.forEach((t) => {
      if (t.week) list.add(t.week);
    });
    return Array.from(list).sort();
  }, [tasks]);

  const WEEK_DATES: Record<string, string> = {
    W44: 'Oct 26 – Nov 01',
    W45: 'Nov 02 – Nov 08',
    W46: 'Nov 09 – Nov 15',
    W47: 'Nov 16 – Nov 22',
  };

  // Stage 1: PURE PLAN ENTRY STATE (No actual quantity required!)
  const [planTaskTitle, setPlanTaskTitle] = useState('');
  const [planDept, setPlanDept] = useState<DepartmentId>('production');
  const [planWeek, setPlanWeek] = useState('W44');
  const [planUnit, setPlanUnit] = useState('Pcs');
  const [planQty, setPlanQty] = useState<number | ''>(500);
  const [planLead, setPlanLead] = useState('');
  const [planStartDate, setPlanStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [planEndDate, setPlanEndDate] = useState(
    new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [planPriority, setPlanPriority] = useState<TaskPriority>('High');
  const [planBlockedBy, setPlanBlockedBy] = useState<string>('');
  const [carryOverMessage, setCarryOverMessage] = useState<string | null>(null);
  const [dependencyWarning, setDependencyWarning] = useState<string | null>(null);

  // Sync planWeek when selectedWeek changes
  React.useEffect(() => {
    if (selectedWeek !== 'All') {
      setPlanWeek(selectedWeek);
    }
  }, [selectedWeek]);

  // Helper: check if a task is currently blocked by an incomplete predecessor
  const getTaskBlocker = (task: WeeklyTask) => {
    if (!task.blockedBy) return null;
    const predecessor = tasks.find((t) => t.id === task.blockedBy);
    if (!predecessor) return null;
    if (predecessor.status === 'Completed') return null;
    return predecessor;
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTaskTitle.trim()) return;

    const targetVal = Number(planQty) || 1;

    const newTask: WeeklyTask = {
      id: `TSK-${Math.floor(4420 + Math.random() * 80)}`,
      departmentId: planDept,
      week: planWeek,
      titleEn: planTaskTitle.trim(),
      titleAm: planTaskTitle.trim(),
      assignedTo: planLead.trim() || 'Floor Supervisor',
      priority: planPriority,
      status: 'Planned', // Initial state before start button is clicked
      progressPercent: 0,
      plannedQty: targetVal,
      actualQty: 0, // Freshly planned: execution has not happened yet!
      unit: planUnit.trim() || 'Pcs',
      startDate: planStartDate,
      endDate: planEndDate,
      dueDate: planEndDate,
      blockedBy: planBlockedBy.trim() || undefined,
    };

    if (onRegisterQuickTask) {
      onRegisterQuickTask(newTask);
    } else {
      onUpdateTask(newTask);
    }

    // Reset plan form
    setPlanTaskTitle('');
    setPlanQty(500);
    setPlanLead('');
    setPlanBlockedBy('');
  };

  // Mark task as Started (begins execution) with dependency enforcement
  const handleStartTask = (task: WeeklyTask) => {
    const blocker = getTaskBlocker(task);
    if (blocker) {
      const msg = langMode === 'am'
        ? `⚠️ ስራው መጀመር አይችልም! አስቀድሞ መጠናቀቅ ያለበት ስራ፡ ${blocker.id} ("${blocker.titleAm || blocker.titleEn}") ገና አልተጠናቀቀም።`
        : `⚠️ Cannot start task! Prerequisite deliverable ${blocker.id} ("${blocker.titleEn}") must be completed first.`;
      setDependencyWarning(msg);
      setTimeout(() => setDependencyWarning(null), 6000);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const updated: WeeklyTask = {
      ...task,
      status: 'In Progress',
      actualStartDate: task.actualStartDate || todayStr,
    };
    onUpdateTask(updated);
  };

  // Quick Inline Complete Toggle (or complete directly)
  const handleQuickComplete = (task: WeeklyTask) => {
    const isCompleted = task.status === 'Completed';
    const todayStr = new Date().toISOString().split('T')[0];
    const updated: WeeklyTask = {
      ...task,
      status: isCompleted ? 'In Progress' : 'Completed',
      actualQty: isCompleted ? 0 : (task.actualQty > 0 ? task.actualQty : task.plannedQty),
      progressPercent: isCompleted ? 0 : 100,
      completionDate: isCompleted ? undefined : todayStr,
    };
    onUpdateTask(updated);
  };

  // Carry-over unfinished or deficit tasks to the subsequent week
  const handleCarryOverIncomplete = () => {
    const targetWeek = selectedWeek === 'All' ? 'W44' : selectedWeek;
    const currentWeekNum = parseInt(targetWeek.replace(/\D/g, ''), 10) || 44;
    const nextWeek = `W${currentWeekNum + 1}`;

    const incompleteTasks = tasks.filter((t) => {
      const isTargetWeek = t.week === targetWeek;
      const hasDeficit = t.actualQty < t.plannedQty || t.status !== 'Completed';
      return isTargetWeek && hasDeficit;
    });

    if (incompleteTasks.length === 0) {
      setCarryOverMessage(
        langMode === 'am' 
          ? `በ${targetWeek} ያልተጠናቀቀ እቅድ የለም (ሁሉም ተጠናቋል)!` 
          : `No unfinished tasks found in ${targetWeek} to carry over!`
      );
      setTimeout(() => setCarryOverMessage(null), 4000);
      return;
    }

    let count = 0;
    incompleteTasks.forEach((task) => {
      const remainingQty = Math.max(1, task.plannedQty - task.actualQty);
      const carryOverTask: WeeklyTask = {
        id: `TSK-${Math.floor(4420 + Math.random() * 80)}`,
        departmentId: task.departmentId,
        week: nextWeek,
        titleEn: `[Carry-Over from ${targetWeek}] ${task.titleEn}`,
        titleAm: `[ከ${targetWeek} የተዛወረ] ${task.titleAm}`,
        assignedTo: task.assignedTo,
        priority: 'High',
        status: 'In Progress',
        progressPercent: 0,
        plannedQty: remainingQty,
        actualQty: 0,
        unit: task.unit,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        varianceNotes: `Carried over from ${targetWeek} (${remainingQty} ${task.unit} deficit remaining). ${task.varianceNotes || ''}`.trim(),
      };

      if (onRegisterQuickTask) {
        onRegisterQuickTask(carryOverTask);
      } else {
        onUpdateTask(carryOverTask);
      }
      count++;
    });

    setCarryOverMessage(
      langMode === 'am'
        ? `${count} ያልተጠናቀቁ እቅዶች ወደ ${nextWeek} በተሳካ ሁኔታ ተዛውረዋል!`
        : `Successfully rolled forward ${count} incomplete deliverables into ${nextWeek}!`
    );
    setTimeout(() => setCarryOverMessage(null), 5000);
  };

  // Export clean CSV report for Plan vs Execution
  const handleExportWeeklyCSV = () => {
    const activeWeekLabel = selectedWeek === 'All' ? 'All_Weeks' : selectedWeek;
    const headers = [
      'Week',
      'Task ID',
      'Deliverable (En)',
      'Deliverable (Am)',
      'Department',
      'Lead',
      'Unit',
      'Planned Target (እቅድ)',
      'Actual Delivered (ክንውን)',
      'Delta Variance (ልዩነት)',
      'Performance Rate % (አፈፃፀም)',
      'Status',
      'Due Date',
      'Root Cause / Variance Notes'
    ];

    const rows = filteredTasks.map((t) => {
      const perf = t.plannedQty > 0 ? ((t.actualQty / t.plannedQty) * 100).toFixed(1) : '0';
      const delta = t.actualQty - t.plannedQty;
      return [
        `"${t.week || 'W44'}"`,
        `"${t.id}"`,
        `"${(t.titleEn || '').replace(/"/g, '""')}"`,
        `"${(t.titleAm || '').replace(/"/g, '""')}"`,
        `"${t.departmentId}"`,
        `"${t.assignedTo || ''}"`,
        `"${t.unit || 'Pcs'}"`,
        t.plannedQty,
        t.actualQty,
        delta,
        `${perf}%`,
        `"${t.status}"`,
        `"${t.dueDate}"`,
        `"${(t.varianceNotes || 'None').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `weekly_plan_vs_execution_${activeWeekLabel}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = 
      t.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.titleAm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
    const matchesPriority = selectedPriority === 'All' || 
      (selectedPriority === 'Critical' ? (t.priority === 'Critical' || t.priority === 'Urgent') : t.priority === selectedPriority);
    const matchesDept = selectedDept === 'All' || t.departmentId === selectedDept;
    const matchesWeek = selectedWeek === 'All' || t.week === selectedWeek;

    return matchesSearch && matchesStatus && matchesPriority && matchesDept && matchesWeek;
  });

  // Aggregated Performance Statistics
  const totalPlannedUnits = filteredTasks.reduce((acc, t) => acc + (t.plannedQty || 0), 0);
  const totalActualUnits = filteredTasks.reduce((acc, t) => acc + (t.actualQty || 0), 0);
  const overallPerformancePct = totalPlannedUnits > 0 
    ? Number(((totalActualUnits / totalPlannedUnits) * 100).toFixed(1)) 
    : 0;

  // Root-cause categorization for deficit tasks
  const rootCauseBreakdown = React.useMemo(() => {
    const breakdown = [
      { name: 'Machine Downtime', am: 'የማሽን ብልሽት', count: 0, color: 'text-rose-400 bg-rose-950/40 border-rose-800/40' },
      { name: 'Raw Material Delay', am: 'የጥሬ እቃ እጥረት', count: 0, color: 'text-amber-400 bg-amber-950/40 border-amber-800/40' },
      { name: 'Power Outage', am: 'የኃይል መቋረጥ', count: 0, color: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/40' },
      { name: 'Quality Scrap / Defect', am: 'የጥራት ጉድለት/ስክራፕ', count: 0, color: 'text-purple-400 bg-purple-950/40 border-purple-800/40' },
      { name: 'Labor Shortage', am: 'የሰው ኃይል እጥረት', count: 0, color: 'text-blue-400 bg-blue-950/40 border-blue-800/40' },
    ];

    filteredTasks.forEach((t) => {
      if (t.actualQty < t.plannedQty || t.status === 'Delayed' || t.status === 'Overdue') {
        const text = (t.varianceNotes || '').toLowerCase();
        if (text.includes('machine') || text.includes('breakdown') || text.includes('ማሽን') || text.includes('ብልሽት')) {
          breakdown[0].count++;
        }
        if (text.includes('material') || text.includes('supply') || text.includes('stockout') || text.includes('ጥሬ እቃ')) {
          breakdown[1].count++;
        }
        if (text.includes('power') || text.includes('outage') || text.includes('መብራት') || text.includes('ኃይል')) {
          breakdown[2].count++;
        }
        if (text.includes('quality') || text.includes('scrap') || text.includes('defect') || text.includes('ስክራፕ') || text.includes('ጥራት')) {
          breakdown[3].count++;
        }
        if (text.includes('labor') || text.includes('operator') || text.includes('absent') || text.includes('ሰው ኃይል')) {
          breakdown[4].count++;
        }
      }
    });

    return breakdown.filter((item) => item.count > 0);
  }, [filteredTasks]);

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Planned':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
            <Calendar className="w-3 h-3 text-slate-400" />
            {langMode === 'am' ? 'የታቀደ' : 'Planned'}
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3" />
            {langMode === 'am' ? 'ተጠናቋል' : 'Completed'}
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 whitespace-nowrap">
            <Clock className="w-3 h-3" />
            {langMode === 'am' ? 'በሂደት ላይ' : 'In Progress'}
          </span>
        );
      case 'Delayed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
            <AlertTriangle className="w-3 h-3" />
            {langMode === 'am' ? 'የዘገየ' : 'Delayed'}
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 whitespace-nowrap">
            <AlertCircle className="w-3 h-3" />
            {langMode === 'am' ? 'ያለፈበት' : 'Overdue'}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/70 text-rose-300 border border-rose-700/60 uppercase shadow-xs whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            {langMode === 'am' ? 'ወሳኝ' : 'Critical'}
          </span>
        );
      case 'Urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/50 text-rose-400 border border-rose-800/50 uppercase whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            {langMode === 'am' ? 'አስቸኳይ' : 'Urgent'}
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-950/50 text-amber-300 border border-amber-700/50 uppercase whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {langMode === 'am' ? 'ከፍተኛ' : 'High'}
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-950/50 text-blue-300 border border-blue-700/50 uppercase whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            {langMode === 'am' ? 'መካከለኛ' : 'Medium'}
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-normal bg-slate-800 text-slate-300 border border-slate-700 uppercase whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            {langMode === 'am' ? 'ዝቅተኛ' : 'Low'}
          </span>
        );
    }
  };

  /**
   * Calculates time elapsed and remaining between start date and end date
   */
  const computeTaskTimeProgress = (task: WeeklyTask) => {
    const startStr = task.startDate || task.dueDate;
    const endStr = task.endDate || task.dueDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(startStr);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(endStr);
    endDate.setHours(0, 0, 0, 0);

    const totalDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const elapsedDays = Math.round((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysRemaining = Math.round((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let timePercent = 0;
    let labelEn = '';
    let labelAm = '';
    let timeColor = 'bg-blue-500';
    let textColor = 'text-blue-400';
    let isOverdue = false;

    if (task.status === 'Completed') {
      timePercent = 100;
      labelEn = 'Completed';
      labelAm = 'ተጠናቋል';
      timeColor = 'bg-emerald-500';
      textColor = 'text-emerald-400';
    } else if (today.getTime() < startDate.getTime()) {
      timePercent = 0;
      const daysUntil = Math.round((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      labelEn = `Starts in ${daysUntil}d`;
      labelAm = `በ${daysUntil} ቀን ይጀምራል`;
      timeColor = 'bg-slate-500';
      textColor = 'text-slate-400';
    } else if (today.getTime() > endDate.getTime()) {
      timePercent = 100;
      const overdueDays = Math.abs(daysRemaining);
      isOverdue = true;
      labelEn = overdueDays === 0 ? 'Due Today' : `Overdue by ${overdueDays}d`;
      labelAm = overdueDays === 0 ? 'ዛሬ ማጠናቀቂያ' : `በ${overdueDays} ቀን ያለፈበት`;
      timeColor = 'bg-rose-500';
      textColor = 'text-rose-400';
    } else {
      timePercent = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
      if (daysRemaining === 0) {
        labelEn = 'Last Day (Due Today)';
        labelAm = 'የመጨረሻ ቀን (ዛሬ)';
        timeColor = 'bg-amber-500';
        textColor = 'text-amber-400';
      } else if (daysRemaining === 1) {
        labelEn = '1 day remaining';
        labelAm = '1 ቀን ይቀራል';
        timeColor = 'bg-amber-500';
        textColor = 'text-amber-400';
      } else {
        labelEn = `${daysRemaining} days left (${totalDays}d span)`;
        labelAm = `${daysRemaining} ቀናት ይቀራሉ`;
        timeColor = timePercent > 80 ? 'bg-amber-500' : 'bg-blue-500';
        textColor = timePercent > 80 ? 'text-amber-400' : 'text-blue-400';
      }
    }

    return {
      totalDays,
      daysRemaining,
      timePercent,
      labelEn,
      labelAm,
      timeColor,
      textColor,
      isOverdue,
      startStr,
      endStr
    };
  };

  /**
   * Computes the task's completion progress rate % based on actual vs planned or explicit status
   */
  const computeTaskStatusProgress = (task: WeeklyTask) => {
    let completionPct = 0;
    if (task.status === 'Completed') {
      completionPct = 100;
    } else if (task.plannedQty > 0 && task.actualQty > 0) {
      completionPct = Math.min(100, Number(((task.actualQty / task.plannedQty) * 100).toFixed(0)));
    } else if (task.progressPercent > 0) {
      completionPct = Math.min(100, task.progressPercent);
    } else if (task.status === 'In Progress') {
      completionPct = 25; // Default active baseline
    } else {
      completionPct = 0;
    }

    let statusColor = 'bg-slate-600';
    let statusTextColor = 'text-slate-400';

    if (task.status === 'Completed' || completionPct >= 100) {
      statusColor = 'bg-emerald-500';
      statusTextColor = 'text-emerald-400';
    } else if (task.status === 'Delayed' || task.status === 'Overdue') {
      statusColor = 'bg-rose-500';
      statusTextColor = 'text-rose-400';
    } else if (completionPct >= 75) {
      statusColor = 'bg-blue-500';
      statusTextColor = 'text-blue-400';
    } else if (completionPct > 0) {
      statusColor = 'bg-amber-500';
      statusTextColor = 'text-amber-400';
    }

    return {
      completionPct,
      statusColor,
      statusTextColor
    };
  };

  /**
   * Renders the interactive progress bar for a task:
   * - Shows completion status rate
   * - Shows timeframe elapsed / remaining time
   * - Supports 'both' mode or targeted single bar
   */
  const renderTaskProgressBar = (task: WeeklyTask, mode: ProgressDisplayMode = progressMode) => {
    const timeInfo = computeTaskTimeProgress(task);
    const statusInfo = computeTaskStatusProgress(task);

    return (
      <div className="space-y-1.5 w-full min-w-[150px] max-w-[210px]">
        {/* View 1: Status / Deliverable Completion Progress */}
        {(mode === 'both' || mode === 'status') && (
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <CheckCircle className="w-2.5 h-2.5 text-slate-500" />
                <span>{langMode === 'am' ? 'ክንውን' : 'Completion'}:</span>
              </span>
              <span className={`font-bold ${statusInfo.statusTextColor}`}>
                {statusInfo.completionPct}%
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800/80">
              <div
                className={`h-full rounded-full transition-all duration-300 ${statusInfo.statusColor}`}
                style={{ width: `${Math.max(4, statusInfo.completionPct)}%` }}
              />
            </div>
          </div>
        )}

        {/* View 2: Timeline / Remaining Time Progress */}
        {(mode === 'both' || mode === 'timeline') && (
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                {timeInfo.isOverdue ? (
                  <Flame className="w-2.5 h-2.5 text-rose-400" />
                ) : (
                  <Timer className="w-2.5 h-2.5 text-slate-500" />
                )}
                <span className="truncate max-w-[95px]" title={langMode === 'am' ? timeInfo.labelAm : timeInfo.labelEn}>
                  {langMode === 'am' ? timeInfo.labelAm : timeInfo.labelEn}
                </span>
              </span>
              <span className={`font-semibold text-[9px] ${timeInfo.textColor}`}>
                {timeInfo.timePercent}% time
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800/80">
              <div
                className={`h-full rounded-full transition-all duration-300 ${timeInfo.timeColor}`}
                style={{ width: `${Math.max(4, timeInfo.timePercent)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 font-sans">
      {/* 3-Stage Workflow Architecture Header Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              {langMode === 'am' ? 'የእቅድና ክንውን መከታተያ የስራ ፍሰት' : 'Planning, Execution & Performance Workflow'}
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-400 font-semibold uppercase">
              Separated Cadence
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {langMode === 'am' 
              ? 'ደረጃ 1፡ እቅድ መመዝገብ (Plan) ➔ ደረጃ 2፡ ሳምንታዊ ክንውን ማዘመን (Execution) ➔ ደረጃ 3፡ አፈፃፀም መገምገም (Performance)'
              : 'Separated workflow: Record plan targets first, log actual deliverables later, and analyze performance rates'}
          </p>
        </div>

        {/* 3 Separate Workflow Stage Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 w-full md:w-auto">
          {/* Tab 1: Plan Entry */}
          <button
            type="button"
            onClick={() => setWorkflowStage('plan')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              workflowStage === 'plan'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>{langMode === 'am' ? '1. እቅድ መዝግብ' : '1. Plan Entry'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-mono">
              {tasks.length}
            </span>
          </button>

          {/* Tab 2: Execution Logging */}
          <button
            type="button"
            onClick={() => setWorkflowStage('execution')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              workflowStage === 'execution'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{langMode === 'am' ? '2. ክንውን መዝግብ' : '2. Execution Logging'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-mono">
              {tasks.filter((t) => t.status !== 'Completed').length}
            </span>
          </button>

          {/* Tab 3: Performance Evaluation */}
          <button
            type="button"
            onClick={() => setWorkflowStage('performance')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              workflowStage === 'performance'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{langMode === 'am' ? '3. አፈፃፀም ግምገማ' : '3. Performance & M&E'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-mono">
              {overallPerformancePct}%
            </span>
          </button>
        </div>
      </div>

      {/* Carry-Over Notification Banner */}
      {carryOverMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-3 flex items-center justify-between text-emerald-300 text-xs shadow-md animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{carryOverMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setCarryOverMessage(null)}
            className="text-[11px] text-emerald-400 hover:text-white underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Weekly Cadence & Week Selector Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
        {/* Left: Week selection tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1.5 mr-2 text-xs font-semibold text-slate-300">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>{langMode === 'am' ? 'የሳምንት ዑደት:' : 'Weekly Cycle:'}</span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedWeek('All')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              selectedWeek === 'All'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {langMode === 'am' ? 'ሁሉም ሳምንታት' : 'All Weeks'}
            <span className="ml-1.5 text-[10px] font-mono px-1 py-0.2 rounded bg-black/30">
              {tasks.length}
            </span>
          </button>

          {availableWeeks.map((wk) => {
            const countInWeek = tasks.filter((t) => t.week === wk).length;
            const completedInWeek = tasks.filter((t) => t.week === wk && t.status === 'Completed').length;
            const isCurrent = wk === 'W44';

            return (
              <button
                key={wk}
                type="button"
                onClick={() => setSelectedWeek(wk)}
                className={`px-3 py-1 text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedWeek === wk
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{wk}</span>
                {WEEK_DATES[wk] && (
                  <span className="text-[10px] opacity-75 hidden sm:inline">
                    ({WEEK_DATES[wk]})
                  </span>
                )}
                {isCurrent && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    Current
                  </span>
                )}
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/30">
                  {completedInWeek}/{countInWeek}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Quick Search and CSV export */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={langMode === 'am' ? 'ፈልግ...' : 'Search task, lead...'}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={handleExportWeeklyCSV}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
            title="Download Plan vs Execution CSV for the active week"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">{langMode === 'am' ? 'CSV አውርድ' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Priority Filter Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>{langMode === 'am' ? 'በደረጃ አጣራ (Priority):' : 'Filter by Priority:'}</span>
          </span>

          {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map((prio) => {
            const count = prio === 'All'
              ? (selectedWeek === 'All' ? tasks.length : tasks.filter((t) => t.week === selectedWeek).length)
              : tasks.filter((t) => (selectedWeek === 'All' || t.week === selectedWeek) && (prio === 'Critical' ? (t.priority === 'Critical' || t.priority === 'Urgent') : t.priority === prio)).length;
            const isSelected = selectedPriority === prio;

            return (
              <button
                key={prio}
                type="button"
                onClick={() => setSelectedPriority(prio)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? prio === 'Critical'
                      ? 'bg-rose-600 text-white font-bold shadow-xs'
                      : prio === 'High'
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : prio === 'Medium'
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : prio === 'Low'
                      ? 'bg-slate-600 text-white font-bold shadow-xs'
                      : 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {prio === 'Critical' && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />}
                {prio === 'High' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                {prio === 'Medium' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                {prio === 'Low' && <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                <span>
                  {prio === 'All'
                    ? (langMode === 'am' ? 'ሁሉም ደረጃዎች' : 'All Priorities')
                    : prio === 'Critical'
                    ? (langMode === 'am' ? 'ወሳኝ' : 'Critical')
                    : prio === 'High'
                    ? (langMode === 'am' ? 'ከፍተኛ' : 'High')
                    : prio === 'Medium'
                    ? (langMode === 'am' ? 'መካከለኛ' : 'Medium')
                    : (langMode === 'am' ? 'ዝቅተኛ' : 'Low')}
                </span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/30">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Progress Mode Display Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono px-1.5 flex items-center gap-1 hidden sm:inline-flex">
            <Timer className="w-3 h-3 text-blue-400" />
            <span>{langMode === 'am' ? 'የእድገት ባር እይታ:' : 'Progress Bar:'}</span>
          </span>
          <button
            type="button"
            onClick={() => setProgressMode('both')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              progressMode === 'both'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Show both Task Completion % and Time Elapsed / Remaining bar"
          >
            {langMode === 'am' ? 'ሁለቱም (Dual)' : 'Dual (Status + Time)'}
          </button>
          <button
            type="button"
            onClick={() => setProgressMode('status')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              progressMode === 'status'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Show Task Completion Status % bar"
          >
            {langMode === 'am' ? 'ክንውን (Status)' : 'Status %'}
          </button>
          <button
            type="button"
            onClick={() => setProgressMode('timeline')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              progressMode === 'timeline'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Show Remaining Time / Date Range progress bar"
          >
            {langMode === 'am' ? 'ቀሪ ጊዜ (Time Left)' : 'Time Left'}
          </button>
        </div>

        {selectedPriority !== 'All' && (
          <button
            type="button"
            onClick={() => setSelectedPriority('All')}
            className="text-xs text-amber-400 hover:text-white underline cursor-pointer font-medium"
          >
            {langMode === 'am' ? 'ማጣሪያ አጽዳ (Reset Filter)' : 'Reset Priority Filter'}
          </button>
        )}
      </div>

      {/* Critical Overdue Alert Banner & Bulk Reschedule Strip */}
      {(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const criticalOverdueList = tasks.filter(
          (t) => t.status !== 'Completed' && (t.endDate || t.dueDate) && todayStr > (t.endDate || t.dueDate)
        );

        if (criticalOverdueList.length === 0) return null;

        return (
          <div className="bg-rose-950/70 border-2 border-rose-600/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-rose-950/40 animate-in fade-in duration-200">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center shrink-0 shadow-md">
                <Flame className="w-5 h-5 text-white animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold font-mono uppercase bg-rose-600 text-white px-2 py-0.5 rounded shadow-xs">
                    {langMode === 'am' ? 'ወሳኝ ጊዜ ያለፈባቸው (Critical Overdue)' : 'Critical Overdue Alert'}
                  </span>
                  <span className="text-xs font-semibold text-rose-200">
                    {criticalOverdueList.length} {langMode === 'am' ? 'ስራዎች ከማጠናቀቂያ ቀናቸው አልፈዋል' : 'deliverables remain incomplete past end date'}
                  </span>
                </div>
                <p className="text-[11px] text-rose-300/80 mt-0.5">
                  {langMode === 'am'
                    ? 'እነዚህ ስራዎች ወዲያውኑ ክንውናቸው ካልተጠናቀቀ ወደ ቀጣይ የስራ ሳምንት በጅምላ ማዛወር ይችላሉ።'
                    : 'These active plans have elapsed past their target timeframe. Bulk-reschedule them to the next working week to realign baseline targets.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              {onBulkRescheduleOverdue && (
                <button
                  type="button"
                  onClick={() => onBulkRescheduleOverdue(criticalOverdueList.map((t) => t.id))}
                  className="w-full sm:w-auto px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-900/50 transition-all cursor-pointer"
                >
                  <CalendarRange className="w-3.5 h-3.5" />
                  <span>
                    {langMode === 'am'
                      ? `${criticalOverdueList.length} ስራዎችን ወደ ቀጣይ ሳምንት አዛውር`
                      : `Bulk Reschedule (${criticalOverdueList.length}) to Next Week`}
                  </span>
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* STAGE 1: PLAN REGISTRATION (እቅድ መዝገብ - Pure Planning Phase) */}
      {/* ============================================================== */}
      {workflowStage === 'plan' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Quick Plan Target Entry Bar */}
          <div className="bg-slate-900 border border-blue-900/50 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-white text-xs">
                  {langMode === 'am' ? 'አዲስ እቅድ ማስገቢያ (Plan Target Registration)' : 'Fast Target Plan Registration (እቅድ)'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {langMode === 'am' ? 'የታቀደውን የስራ ዝርዝርና መጠን ብቻ እዚህ ያስገቡ (ክንውን ወደፊት የሚመዘገብ ነው)' : 'Input baseline deliverables and target quantities (Execution output is logged later)'}
                </span>
              </div>
              <button
                type="button"
                onClick={onAddTask}
                className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                + {langMode === 'am' ? 'ሙሉ ቅጽ ክፈት' : 'Open Detailed Modal'}
              </button>
            </div>

            <form onSubmit={handlePlanSubmit} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 items-end">
                {/* Field 1: Task Title */}
                <div className="lg:col-span-3">
                  <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                    1. Deliverable / Task Name (የስራ ዝርዝር) *
                  </label>
                  <input
                    type="text"
                    required
                    value={planTaskTitle}
                    onChange={(e) => setPlanTaskTitle(e.target.value)}
                    placeholder="e.g. Precision CNC machining of drive shafts"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Field 2: Department */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                    2. Department (ክፍል) *
                  </label>
                  <select
                    value={planDept}
                    onChange={(e) => setPlanDept(e.target.value as DepartmentId)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field: Target Week */}
                <div>
                  <label className="text-[10px] font-semibold text-blue-300 block mb-1">
                    3. Week (ሳምንት) *
                  </label>
                  <select
                    value={planWeek}
                    onChange={(e) => setPlanWeek(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  >
                    {availableWeeks.map((wk) => (
                      <option key={wk} value={wk}>
                        {wk}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field 3: Measurement */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                    4. Unit (መለኪያ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={planUnit}
                    onChange={(e) => setPlanUnit(e.target.value)}
                    placeholder="Pcs, Sets, Hrs"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 2: Target Qty, Start Date, End Date, Assigned Lead, Priority, Blocked By, Submit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5 items-end pt-1">
                {/* Field 4: Planned Qty */}
                <div>
                  <label className="text-[10px] font-bold text-blue-400 block mb-1">
                    5. Target Plan (እቅድ) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={planQty}
                    onChange={(e) => setPlanQty(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="500"
                    className="w-full bg-slate-950 border border-blue-500/60 rounded px-2.5 py-1.5 text-white text-xs font-mono font-bold focus:outline-none focus:border-blue-400"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                    6. Start Date (መጀመሪያ) *
                  </label>
                  <input
                    type="date"
                    required
                    value={planStartDate}
                    onChange={(e) => setPlanStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                    7. End Date (ማጠናቀቂያ) *
                  </label>
                  <input
                    type="date"
                    required
                    min={planStartDate}
                    value={planEndDate}
                    onChange={(e) => setPlanEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Field 5: Lead / Supervisor */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                    8. Lead / Supervisor (ኃላፊ)
                  </label>
                  <input
                    type="text"
                    value={planLead}
                    onChange={(e) => setPlanLead(e.target.value)}
                    placeholder="Supervisor name"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Field 6: Priority */}
                <div>
                  <label className="text-[10px] font-semibold text-amber-300 block mb-1">
                    9. Priority (ደረጃ) *
                  </label>
                  <select
                    value={planPriority}
                    onChange={(e) => setPlanPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Critical">🔴 Critical (ወሳኝ)</option>
                    <option value="High">🟠 High (ከፍተኛ)</option>
                    <option value="Medium">🔵 Medium (መካከለኛ)</option>
                    <option value="Low">⚪ Low (ዝቅተኛ)</option>
                  </select>
                </div>

                {/* Field 7: Blocked By / Predecessor */}
                <div>
                  <label className="text-[10px] font-semibold text-amber-300 block mb-1 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-amber-400" />
                    <span>10. Blocked By (ጥገኝነት)</span>
                  </label>
                  <select
                    value={planBlockedBy}
                    onChange={(e) => setPlanBlockedBy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="">None (ገለልተኛ)</option>
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id}: {t.titleEn.slice(0, 24)}... ({t.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Plan Button */}
                <div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2 px-3 rounded shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{langMode === 'am' ? 'እቅድ መዝግብ' : 'Save Plan'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Dependency Warning Toast */}
          {dependencyWarning && (
            <div className="bg-amber-950/90 border border-amber-600 rounded-lg p-3 text-xs text-amber-200 flex items-center gap-2 shadow-md animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-medium">{dependencyWarning}</span>
            </div>
          )}

          {/* Planned Deliverables Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-3.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-white text-xs">
                  {langMode === 'am' ? 'የተመዘገቡ የፋብሪካ እቅዶች (Active Planned Deliverables)' : 'Active Planned Deliverables (እቅድ)'}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  ({filteredTasks.length} planned items)
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Total Planned: {totalPlannedUnits.toLocaleString()} units
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 font-mono text-[11px] text-slate-400 uppercase">
                    <th className="py-2.5 px-3 w-20">Task ID</th>
                    <th className="py-2.5 px-4 min-w-[200px]">Deliverable (የስራ ዝርዝር)</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Unit</th>
                    <th className="py-2.5 px-3 text-right font-bold text-blue-400">Target Plan (እቅድ)</th>
                    <th className="py-2.5 px-3">Lead</th>
                    <th className="py-2.5 px-3 min-w-[150px]">Timeframe (ጊዜ ወሰን)</th>
                    <th className="py-2.5 px-4 min-w-[170px]">Progress &amp; Time (የእድገት ባር)</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3 text-center w-40">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        <FileCheck2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="font-semibold text-slate-300">No planned tasks found.</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Use the quick form above to register your first production plan.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => {
                      const startDateVal = task.startDate || task.dueDate;
                      const endDateVal = task.endDate || task.dueDate;
                      const todayStr = new Date().toISOString().split('T')[0];
                      const isPastDue = task.status !== 'Completed' && todayStr > endDateVal;
                      const blocker = getTaskBlocker(task);

                      return (
                        <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                            {task.id}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">
                              {langMode === 'am' ? task.titleAm : task.titleEn}
                            </div>
                            {langMode === 'bilingual' && (
                              <div className="text-[11px] text-slate-400 mt-0.5">{task.titleAm}</div>
                            )}

                            {/* Task Dependency / Blocked By Visual Indicator */}
                            {blocker ? (
                              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700/80 shadow-xs">
                                  <Lock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                  <span>Blocked by: {blocker.id}</span>
                                </span>
                                <span className="text-[10px] text-amber-200/90 truncate max-w-[170px]" title={blocker.titleEn}>
                                  ({blocker.status} - {blocker.titleEn})
                                </span>
                              </div>
                            ) : task.blockedBy ? (
                              <div className="mt-1">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
                                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                                  <span>Prerequisite {task.blockedBy} completed</span>
                                </span>
                              </div>
                            ) : null}
                          </td>
                          <td className="py-3 px-3 text-slate-300">
                            {getDepartmentName(task.departmentId, langMode === 'bilingual' ? 'en' : langMode)}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-300">
                            {task.unit}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-white text-sm">
                            {task.plannedQty.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-slate-300">
                            {task.assignedTo}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px]">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-slate-300">
                                {startDateVal} <span className="text-slate-500">➔</span> {endDateVal}
                              </span>
                              {task.actualStartDate && (
                                <span className="text-[10px] text-emerald-400">
                                  Started: {task.actualStartDate}
                                </span>
                              )}
                              {isPastDue && (
                                <span className="text-[10px] text-rose-400 font-bold">
                                  ⚠️ Past End Date
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {renderTaskProgressBar(task)}
                          </td>
                          <td className="py-3 px-3">
                            {getStatusBadge(task.status)}
                          </td>
                          <td className="py-3 px-3">
                            {getPriorityBadge(task.priority)}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* 1. If Planned, check if blocked by predecessor */}
                              {task.status === 'Planned' ? (
                                blocker ? (
                                  <button
                                    type="button"
                                    onClick={() => handleStartTask(task)}
                                    className="px-2.5 py-1 text-[11px] font-semibold text-amber-300 bg-amber-950/80 hover:bg-amber-900 border border-amber-700/80 rounded flex items-center gap-1 transition-colors cursor-not-allowed shadow-xs opacity-90"
                                    title={`Cannot start until prerequisite ${blocker.id} is completed (${blocker.status})`}
                                  >
                                    <Lock className="w-3 h-3 text-amber-400" />
                                    <span>{langMode === 'am' ? 'የታገደ' : 'Blocked'}</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleStartTask(task)}
                                    className="px-2.5 py-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/70 rounded flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                                    title="Mark execution as Started (ጀምር)"
                                  >
                                    <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                                    <span>{langMode === 'am' ? 'ጀምር' : 'Start'}</span>
                                  </button>
                                )
                              ) : task.status !== 'Completed' ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (onLogExecution) {
                                        onLogExecution(task);
                                      } else {
                                        setWorkflowStage('execution');
                                      }
                                    }}
                                    className="px-2 py-1 text-[11px] font-semibold text-amber-300 bg-amber-950/60 hover:bg-amber-900 border border-amber-800/60 rounded flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Log Execution output"
                                  >
                                    <Zap className="w-3 h-3" />
                                    <span>Log Output</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleQuickComplete(task)}
                                    className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                    title="Mark as Completed (አጠናቅ)"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-950/40 rounded border border-emerald-800/40">
                                  <Check className="w-3 h-3" /> Done
                                </span>
                              )}

                              {onEditTask && (
                                <button
                                  type="button"
                                  onClick={() => onEditTask(task)}
                                  className="p-1 rounded text-blue-400 hover:text-white hover:bg-blue-600/30 transition-colors cursor-pointer"
                                  title="Edit plan parameters"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {onDeleteTask && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteTask(task)}
                                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                                  title="Delete plan"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STAGE 2: EXECUTION & PROGRESS LOGGING (የክንውን መዝገብ - Floor Output)  */}
      {/* ===================================================================== */}
      {workflowStage === 'execution' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Execution Cadence Banner */}
          <div className="bg-slate-900 border border-amber-900/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{langMode === 'am' ? 'የሳምንት ክንውን መከታተያና መመዝገቢያ' : 'Weekly Execution & Progress Logging (የክንውን መዝገብ)'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {langMode === 'am' 
                  ? 'እቅዱ ቀደም ሲል ተመዝግቧል። አሁን የተጠናቀቀውን ትክክለኛ ክንውን (Actual Delivered) ብቻ ያስገቡ።' 
                  : 'The baseline plan is locked. Floor supervisors input verified actual delivery, status, and variance notes.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">
                Pending Execution: <strong className="text-amber-400">{tasks.filter(t => t.status !== 'Completed').length}</strong>
              </span>
            </div>
          </div>

          {/* Execution Tasks Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 font-mono text-[11px] text-slate-400 uppercase">
                    <th className="py-2.5 px-3 w-20">Task ID</th>
                    <th className="py-2.5 px-4 min-w-[200px]">Deliverable (የስራ ዝርዝር)</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3 text-right">Fixed Plan (እቅድ)</th>
                    <th className="py-2.5 px-3 text-right font-bold text-amber-400">Actual (ክንውን)</th>
                    <th className="py-2.5 px-4 min-w-[180px]">Delivery &amp; Time Progress %</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 min-w-[160px]">Variance Notes &amp; Blockers</th>
                    <th className="py-2.5 px-3 text-center w-28">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        <p className="font-semibold text-slate-300">No tasks pending execution update.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => {
                      const perfPct = task.plannedQty > 0 
                        ? Number(((task.actualQty / task.plannedQty) * 100).toFixed(1)) 
                        : 0;
                      const variance = task.actualQty - task.plannedQty;

                      return (
                        <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                            {task.id}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">
                              {langMode === 'am' ? task.titleAm : task.titleEn}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <span>Lead: {task.assignedTo}</span>
                              <span>·</span>
                              <span className="text-slate-300">
                                {task.startDate || task.dueDate} ➔ {task.endDate || task.dueDate}
                              </span>
                              {task.actualStartDate && (
                                <span className="text-emerald-400 font-semibold">
                                  (Started: {task.actualStartDate})
                                </span>
                              )}
                            </div>

                            {/* Task Dependency / Blocked By Visual Indicator in Stage 2 */}
                            {(() => {
                              const blocker = getTaskBlocker(task);
                              if (blocker) {
                                return (
                                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700/80 shadow-xs">
                                      <Lock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                      <span>Blocked by: {blocker.id}</span>
                                    </span>
                                    <span className="text-[10px] text-amber-200/90 truncate max-w-[170px]" title={blocker.titleEn}>
                                      ({blocker.status} - {blocker.titleEn})
                                    </span>
                                  </div>
                                );
                              }
                              if (task.blockedBy) {
                                return (
                                  <div className="mt-1">
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
                                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                                      <span>Prerequisite {task.blockedBy} completed</span>
                                    </span>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </td>
                          <td className="py-3 px-3 text-slate-300">
                            {getDepartmentName(task.departmentId, langMode === 'bilingual' ? 'en' : langMode)}
                          </td>
                          <td className="py-3 px-3">
                            {getPriorityBadge(task.priority)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-300 font-medium">
                            {task.plannedQty.toLocaleString()} {task.unit}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-white text-sm">
                            <span className={task.actualQty > 0 ? 'text-emerald-400' : 'text-slate-500'}>
                              {task.actualQty.toLocaleString()} {task.unit}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1.5 min-w-[150px]">
                              {/* 1. Deliverable Output / Status Progress Bar */}
                              {(progressMode === 'both' || progressMode === 'status') && (
                                <div className="space-y-0.5">
                                  <div className="flex items-center justify-between text-xs font-mono">
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                      <CheckCircle className="w-2.5 h-2.5 text-slate-500" />
                                      <span>Output:</span>
                                    </span>
                                    <span className={`font-bold ${perfPct >= 100 ? 'text-emerald-400' : perfPct >= 75 ? 'text-blue-400' : 'text-amber-400'}`}>
                                      {perfPct}%
                                    </span>
                                    <span className={`text-[10px] ${variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      {variance > 0 ? `+${variance}` : variance} {task.unit}
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                                    <div
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        perfPct >= 100 ? 'bg-emerald-500' : perfPct >= 75 ? 'bg-blue-500' : 'bg-amber-500'
                                      }`}
                                      style={{ width: `${Math.min(100, Math.max(4, perfPct))}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* 2. Remaining Time Progress Bar */}
                              {(progressMode === 'both' || progressMode === 'timeline') && (() => {
                                const timeInfo = computeTaskTimeProgress(task);
                                return (
                                  <div className="space-y-0.5">
                                    <div className="flex items-center justify-between text-[10px] font-mono">
                                      <span className="text-slate-400 flex items-center gap-1">
                                        {timeInfo.isOverdue ? (
                                          <Flame className="w-2.5 h-2.5 text-rose-400" />
                                        ) : (
                                          <Timer className="w-2.5 h-2.5 text-slate-500" />
                                        )}
                                        <span className="truncate max-w-[105px]" title={langMode === 'am' ? timeInfo.labelAm : timeInfo.labelEn}>
                                          {langMode === 'am' ? timeInfo.labelAm : timeInfo.labelEn}
                                        </span>
                                      </span>
                                      <span className={`font-semibold text-[9px] ${timeInfo.textColor}`}>
                                        {timeInfo.timePercent}% time
                                      </span>
                                    </div>
                                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                                      <div
                                        className={`h-full rounded-full transition-all duration-300 ${timeInfo.timeColor}`}
                                        style={{ width: `${Math.max(4, timeInfo.timePercent)}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            {getStatusBadge(task.status)}
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-300">
                            {task.varianceNotes ? (
                              <span className="text-[11px] text-amber-200/90 font-mono bg-amber-950/30 px-2 py-0.5 rounded border border-amber-900/40 line-clamp-2">
                                ↳ {task.varianceNotes}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-600 italic">No blockers logged</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {task.status === 'Planned' && (() => {
                                const blocker = getTaskBlocker(task);
                                if (blocker) {
                                  return (
                                    <button
                                      type="button"
                                      onClick={() => handleStartTask(task)}
                                      className="px-2.5 py-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/80 rounded font-semibold text-xs transition-colors flex items-center justify-center gap-1 shadow-sm cursor-not-allowed opacity-90"
                                      title={`Cannot start until prerequisite ${blocker.id} is completed (${blocker.status})`}
                                    >
                                      <Lock className="w-3 h-3 text-amber-400" />
                                      <span>{langMode === 'am' ? 'የታገደ' : 'Blocked'}</span>
                                    </button>
                                  );
                                }
                                return (
                                  <button
                                    type="button"
                                    onClick={() => handleStartTask(task)}
                                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold text-xs transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                                    title="Mark execution as Started (ጀምር)"
                                  >
                                    <Play className="w-3 h-3 fill-white" />
                                    <span>{langMode === 'am' ? 'ጀምር' : 'Start'}</span>
                                  </button>
                                );
                              })()}

                              <button
                                type="button"
                                onClick={() => {
                                  if (onLogExecution) {
                                    onLogExecution(task);
                                  } else if (onEditTask) {
                                    onEditTask(task);
                                  }
                                }}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold text-xs transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                              >
                                <Zap className="w-3 h-3" />
                                <span>{langMode === 'am' ? 'ክንውን መዝግብ' : 'Log Output'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleQuickComplete(task)}
                                className={`p-1.5 rounded transition-colors cursor-pointer ${
                                  task.status === 'Completed'
                                    ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60'
                                    : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                                }`}
                                title={task.status === 'Completed' ? 'Completed (Click to Reopen)' : 'Mark as Complete (አጠናቅ)'}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STAGE 3: PERFORMANCE & M&E EVALUATION (የአፈፃፀም ግምገማና ንጽጽር)         */}
      {/* ===================================================================== */}
      {workflowStage === 'performance' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Executive Performance Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Planned Volume (እቅድ)</span>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {totalPlannedUnits.toLocaleString()} <span className="text-xs text-slate-400 font-normal">units</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Delivered Output (ክንውን)</span>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                {totalActualUnits.toLocaleString()} <span className="text-xs text-slate-400 font-normal">units</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Overall Delivery Rate (አፈፃፀም)</span>
              <div className={`text-lg font-bold font-mono mt-0.5 ${overallPerformancePct >= 90 ? 'text-emerald-400' : overallPerformancePct >= 75 ? 'text-blue-400' : 'text-amber-400'}`}>
                {overallPerformancePct}%
              </div>
            </div>

            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Tasks Completed On-Schedule</span>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {filteredTasks.filter(t => t.status === 'Completed').length} <span className="text-xs text-slate-400 font-normal">/ {filteredTasks.length}</span>
              </div>
            </div>
          </div>

          {/* Weekly Closeout Comparative Analysis Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    {langMode === 'am' ? 'የሳምንት ማጠቃለያና ንጽጽር ግምገማ' : 'Weekly Plan vs. Execution Closeout Review'}
                    {selectedWeek !== 'All' && (
                      <span className="ml-2 text-emerald-400 font-mono">
                        [{selectedWeek} {WEEK_DATES[selectedWeek] ? `· ${WEEK_DATES[selectedWeek]}` : ''}]
                      </span>
                    )}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {langMode === 'am'
                    ? 'የሳምንቱን የታቀደ መጠን ከትክክለኛ ክንውን ጋር በማነጻጸር ጉድለቶችን ይገምግሙና ወደ ቀጣይ ሳምንት ያዛውሩ'
                    : 'Compare baseline plan targets against end-of-week delivered output, review deficit causes, and roll balances forward.'}
                </p>
              </div>

              {/* Action Buttons: Carry-Over & Export */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCarryOverIncomplete}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  title="Roll forward any incomplete or deficit tasks into the next weekly cycle"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{langMode === 'am' ? 'ያልተጠናቀቁትን ወደ ቀጣይ ሳምንት አዛውር' : 'Carry Over Unfinished to Next Week'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportWeeklyCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{langMode === 'am' ? 'የሳምንት ሪፖርት (CSV)' : 'Export Closeout CSV'}</span>
                </button>
              </div>
            </div>

            {/* Visual Comparative Progress Bar & Variance Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3.5 items-center">
              {/* Column 1: Visual Delivery Gauge */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Target Delivery Rate:</span>
                  <span className={`font-bold ${overallPerformancePct >= 100 ? 'text-emerald-400' : overallPerformancePct >= 75 ? 'text-blue-400' : 'text-amber-400'}`}>
                    {overallPerformancePct}%
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      overallPerformancePct >= 100 ? 'bg-emerald-500' : overallPerformancePct >= 75 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, overallPerformancePct))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Planned: {totalPlannedUnits.toLocaleString()}</span>
                  <span>Delivered: {totalActualUnits.toLocaleString()}</span>
                </div>
              </div>

              {/* Column 2: Net Variance */}
              <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Weekly Volume Variance (ልዩነት)</span>
                  <div className={`text-base font-bold font-mono mt-0.5 ${
                    totalActualUnits - totalPlannedUnits >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {totalActualUnits - totalPlannedUnits >= 0 
                      ? `+${(totalActualUnits - totalPlannedUnits).toLocaleString()} units surplus` 
                      : `${(totalActualUnits - totalPlannedUnits).toLocaleString()} units deficit`}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Closeout Status</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border inline-block mt-0.5 ${
                    overallPerformancePct >= 100
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : overallPerformancePct >= 75
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {overallPerformancePct >= 100 ? 'Target Met' : overallPerformancePct >= 75 ? 'Acceptable' : 'Under Target'}
                  </span>
                </div>
              </div>

              {/* Column 3: Root-Cause Blocker Attribution */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Root Cause Attributions for Deficits</span>
                {rootCauseBreakdown.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No deficit blockers registered for this period.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {rootCauseBreakdown.map((item) => (
                      <span
                        key={item.name}
                        className={`text-[10px] px-2 py-0.5 rounded border font-medium ${item.color}`}
                      >
                        {langMode === 'am' ? item.am : item.name} ({item.count})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Unified Comparison Table: Plan vs. Actual vs. Performance % */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-3.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white text-xs">
                  {langMode === 'am' ? 'የእቅድና ክንውን ማነጻጸሪያ ሰንጠረዥ (Plan vs. Execution Performance Rate)' : 'Plan vs. Execution Performance Matrix (እቅድ ➔ ክንውን ➔ አፈፃፀም)'}
                </span>
              </div>

              <span className="font-mono text-[11px] text-slate-400">
                Formula: (Actual / Plan) &times; 100
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 font-mono text-[11px] text-slate-400 uppercase">
                    <th className="py-2.5 px-3 w-20">ID</th>
                    <th className="py-2.5 px-4 min-w-[200px]">1. Deliverable (የስራ ዝርዝር)</th>
                    <th className="py-2.5 px-3">2. Unit</th>
                    <th className="py-2.5 px-3 text-right">3. Plan (እቅድ)</th>
                    <th className="py-2.5 px-3 text-right">4. Actual (ክንውን)</th>
                    <th className="py-2.5 px-3 text-right font-mono">5. Delta (&plusmn;)</th>
                    <th className="py-2.5 px-4 w-36 text-white font-bold">6. Performance Rate % (አፈፃፀም)</th>
                    <th className="py-2.5 px-3">7. Department</th>
                    <th className="py-2.5 px-3">8. Priority</th>
                    <th className="py-2.5 px-3">9. Status</th>
                    <th className="py-2.5 px-3 text-center w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        <p className="font-semibold text-slate-300">No evaluation records available.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => {
                      const perfPct = task.plannedQty > 0 
                        ? Number(((task.actualQty / task.plannedQty) * 100).toFixed(1)) 
                        : 0;
                      const delta = task.actualQty - task.plannedQty;

                      return (
                        <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                            {task.id}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">
                              {langMode === 'am' ? task.titleAm : task.titleEn}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {task.startDate || task.dueDate} ➔ {task.endDate || task.dueDate}
                              {task.actualStartDate && (
                                <span className="text-emerald-400 ml-1.5">(Started: {task.actualStartDate})</span>
                              )}
                            </div>
                            {task.varianceNotes && (
                              <div className="text-[10px] text-amber-400/90 font-mono mt-0.5">
                                ↳ {task.varianceNotes}
                              </div>
                            )}

                            {/* Task Dependency / Blocked By Visual Indicator in Stage 3 */}
                            {(() => {
                              const blocker = getTaskBlocker(task);
                              if (blocker) {
                                return (
                                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700/80 shadow-xs">
                                      <Lock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                      <span>Blocked by: {blocker.id}</span>
                                    </span>
                                    <span className="text-[10px] text-amber-200/90 truncate max-w-[170px]" title={blocker.titleEn}>
                                      ({blocker.status} - {blocker.titleEn})
                                    </span>
                                  </div>
                                );
                              }
                              if (task.blockedBy) {
                                return (
                                  <div className="mt-1">
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
                                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                                      <span>Prerequisite {task.blockedBy} completed</span>
                                    </span>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-300">
                            {task.unit}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-300">
                            {task.plannedQty.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-white">
                            {task.actualQty.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold">
                            <span className={delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {delta > 0 ? `+${delta}` : delta}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1.5 min-w-[155px]">
                              {/* 1. Performance Output Rate */}
                              <div className="space-y-0.5">
                                <div className="flex items-center justify-between text-xs font-mono">
                                  <span className={`font-bold ${perfPct >= 100 ? 'text-emerald-400' : perfPct >= 75 ? 'text-blue-400' : 'text-amber-400'}`}>
                                    {perfPct}%
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    {perfPct >= 100 ? 'Optimal' : perfPct >= 75 ? 'Acceptable' : 'Deficit'}
                                  </span>
                                </div>
                                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      perfPct >= 100 ? 'bg-emerald-500' : perfPct >= 75 ? 'bg-blue-500' : 'bg-amber-500'
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(4, perfPct))}%` }}
                                  />
                                </div>
                              </div>

                              {/* 2. Schedule & Remaining Time Indicator */}
                              {(progressMode === 'both' || progressMode === 'timeline') && (() => {
                                const timeInfo = computeTaskTimeProgress(task);
                                return (
                                  <div className="space-y-0.5">
                                    <div className="flex items-center justify-between text-[10px] font-mono">
                                      <span className="text-slate-400 flex items-center gap-1">
                                        {timeInfo.isOverdue ? (
                                          <Flame className="w-2.5 h-2.5 text-rose-400" />
                                        ) : (
                                          <Timer className="w-2.5 h-2.5 text-slate-500" />
                                        )}
                                        <span className="truncate max-w-[100px]" title={langMode === 'am' ? timeInfo.labelAm : timeInfo.labelEn}>
                                          {langMode === 'am' ? timeInfo.labelAm : timeInfo.labelEn}
                                        </span>
                                      </span>
                                      <span className={`font-semibold text-[9px] ${timeInfo.textColor}`}>
                                        {timeInfo.timePercent}% time
                                      </span>
                                    </div>
                                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                                      <div
                                        className={`h-full rounded-full transition-all duration-300 ${timeInfo.timeColor}`}
                                        style={{ width: `${Math.max(4, timeInfo.timePercent)}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-300">
                            {getDepartmentName(task.departmentId, langMode === 'bilingual' ? 'en' : langMode)}
                          </td>
                          <td className="py-3 px-3">
                            {getPriorityBadge(task.priority)}
                          </td>
                          <td className="py-3 px-3">
                            {getStatusBadge(task.status)}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              {task.status === 'Planned' && (() => {
                                const blocker = getTaskBlocker(task);
                                if (blocker) {
                                  return (
                                    <button
                                      type="button"
                                      onClick={() => handleStartTask(task)}
                                      className="px-2 py-1 text-[10px] font-semibold text-amber-300 bg-amber-950/80 hover:bg-amber-900 border border-amber-700/80 rounded flex items-center gap-1 transition-colors cursor-not-allowed opacity-90"
                                      title={`Cannot start until prerequisite ${blocker.id} is completed (${blocker.status})`}
                                    >
                                      <Lock className="w-2.5 h-2.5 text-amber-400" />
                                      <span>Blocked</span>
                                    </button>
                                  );
                                }
                                return (
                                  <button
                                    type="button"
                                    onClick={() => handleStartTask(task)}
                                    className="px-2 py-1 text-[10px] font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 rounded flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Mark execution as Started (ጀምር)"
                                  >
                                    <Play className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400" />
                                    <span>Start</span>
                                  </button>
                                );
                              })()}
                              <button
                                type="button"
                                onClick={() => handleQuickComplete(task)}
                                className={`p-1.5 rounded transition-colors cursor-pointer ${
                                  task.status === 'Completed'
                                    ? 'text-emerald-400 hover:bg-emerald-950/60'
                                    : 'text-slate-500 hover:text-white hover:bg-slate-800'
                                }`}
                                title={task.status === 'Completed' ? 'Mark In Progress' : 'Mark Completed'}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              {onEditTask && (
                                <button
                                  type="button"
                                  onClick={() => onEditTask(task)}
                                  className="p-1.5 rounded text-blue-400 hover:text-white hover:bg-blue-600/30 transition-colors cursor-pointer"
                                  title="Edit full task record"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {onDeleteTask && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteTask(task)}
                                  className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                                  title="Delete task record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
