import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart3, 
  Layers, 
  ListTodo, 
  Wrench, 
  Compass, 
  Download,
  FileText,
  Languages,
  TrendingUp,
  Bell,
  AlertTriangle,
  Clock,
  ChevronRight,
  X,
  ExternalLink,
  AlertCircle,
  Sparkles,
  Trash2,
  RotateCcw,
  Database,
  FileSpreadsheet,
  Workflow,
  CalendarRange,
  Flame,
  CheckSquare
} from 'lucide-react';

import { LanguageMode, ActiveTab, WeeklyTask, TaskStatus } from '../types/dashboard.ts';
import { getDepartmentName } from '../utils/formatters.ts';

export type { ActiveTab, LanguageMode };

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  langMode: LanguageMode;
  setLangMode: (mode: LanguageMode) => void;
  onOpenExport: () => void;
  onOpenGoogleSheets?: () => void;
  onOpenMEWorkflow?: () => void;
  tasks?: WeeklyTask[];
  onNavigateToTask?: (taskId: string, filterStatus?: TaskStatus | 'All') => void;
  onClearAllData?: () => void;
  onLoadDemoData?: () => void;
  onOpenCopilot?: () => void;
  isCleanSlate?: boolean;
  onBulkRescheduleOverdue?: (taskIds: string[]) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  langMode,
  setLangMode,
  onOpenExport,
  onOpenGoogleSheets,
  onOpenMEWorkflow,
  tasks = [],
  onNavigateToTask,
  onClearAllData,
  onLoadDemoData,
  onOpenCopilot,
  isCleanSlate = true,
  onBulkRescheduleOverdue,
}) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertFilter, setAlertFilter] = useState<'All' | 'CriticalOverdue' | 'Overdue' | 'Urgent'>('All');
  const [rescheduleMessage, setRescheduleMessage] = useState<string | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (alertRef.current && !alertRef.current.contains(event.target as Node)) {
        setIsAlertOpen(false);
      }
    };
    if (isAlertOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAlertOpen]);

  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to determine if an incomplete task is past its end date / due date
  const isTaskPastEndDate = (task: WeeklyTask) => {
    if (task.status === 'Completed') return false;
    const taskEndDate = task.endDate || task.dueDate;
    if (!taskEndDate) return false;
    return todayStr > taskEndDate;
  };

  // 1. Critical Overdue tasks: Incomplete tasks strictly past their end date
  const criticalOverdueTasks = tasks.filter(isTaskPastEndDate);

  // 2. Marked Overdue tasks
  const overdueTasks = tasks.filter((t) => t.status === 'Overdue' || isTaskPastEndDate(t));

  // 3. Urgent or Critical priority incomplete tasks
  const urgentTasks = tasks.filter(
    (t) => (t.priority === 'Urgent' || t.priority === 'Critical') && t.status !== 'Completed'
  );

  // Combined list of critical alert tasks
  const alertTaskMap = new Map<string, WeeklyTask>();
  criticalOverdueTasks.forEach((t) => alertTaskMap.set(t.id, t));
  overdueTasks.forEach((t) => alertTaskMap.set(t.id, t));
  urgentTasks.forEach((t) => alertTaskMap.set(t.id, t));
  const alertTasks = Array.from(alertTaskMap.values());
  const totalAlertsCount = alertTasks.length;

  const displayedAlerts = alertTasks.filter((t) => {
    if (alertFilter === 'CriticalOverdue') return isTaskPastEndDate(t);
    if (alertFilter === 'Overdue') return t.status === 'Overdue' || isTaskPastEndDate(t);
    if (alertFilter === 'Urgent') return (t.priority === 'Urgent' || t.priority === 'Critical') && t.status !== 'Completed';
    return true;
  });

  const handleBulkReschedule = () => {
    const idsToReschedule = criticalOverdueTasks.map((t) => t.id);
    if (idsToReschedule.length === 0) return;
    if (onBulkRescheduleOverdue) {
      onBulkRescheduleOverdue(idsToReschedule);
      setRescheduleMessage(
        langMode === 'am'
          ? `${idsToReschedule.length} ስራዎች ወደ ቀጣይ የስራ ሳምንት ተዘዋውረዋል!`
          : `Successfully rescheduled ${idsToReschedule.length} Critical Overdue tasks to next working week!`
      );
      setTimeout(() => setRescheduleMessage(null), 4000);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 py-3.5 flex items-center justify-between gap-8 transition-colors">
      {/* Zone 1: Company Logo & Brand Name */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-md bg-white p-1 flex items-center justify-center shrink-0 shadow-md border border-slate-700/60 overflow-hidden">
          <img 
            src="/assets/aistudio/photo_2026-07-02_16-05-45_68c4c737.jpg" 
            alt="Machinery Engineering Group (MEG) Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-white whitespace-nowrap">
              {langMode === 'am' ? 'ማሽነሪ ኢንጂነሪንግ ግሩፕ (MEG)' : 'Machinery Engineering Group (MEG)'}
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 bg-red-950/60 text-red-400 border border-red-800/50 rounded uppercase tracking-wider">
              MEG
            </span>
          </div>
          <div className="text-[11px] font-medium text-slate-300 tracking-wide flex items-center gap-1.5 flex-wrap">
            <span className="text-amber-400 font-semibold">
              {langMode === 'am' ? 'አግሮ-ማሽነሪ ኢንዱስትሪ' : 'Agro-Machinery Industry'}
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-[10px] text-slate-400 font-normal uppercase hidden md:inline">
              {langMode === 'am' ? 'የአመራር ዳሽቦርድ v11' : langMode === 'bilingual' ? 'Executive Dashboard · የአመራር መቆጣጠሪያ' : 'Executive Dashboard v11'}
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'overview'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{langMode === 'am' ? 'አጠቃላይ እይታ' : langMode === 'bilingual' ? 'Overview · አጠቃላይ' : 'Executive Overview'}</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'departments'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{langMode === 'am' ? 'የክፍሎች ምዘና' : langMode === 'bilingual' ? 'Departments · ክፍሎች' : 'Department Scorecards'}</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'tasks'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5" />
          <span>{langMode === 'am' ? 'ሳምንታዊ ስራዎች' : langMode === 'bilingual' ? 'Tasks · ስራዎች' : 'Weekly Task Registry'}</span>
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'maintenance'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>{langMode === 'am' ? 'OEE እና ጥገና' : langMode === 'bilingual' ? 'OEE & Maint · ጥገና' : 'OEE & Maintenance'}</span>
        </button>

        <button
          onClick={() => setActiveTab('trends')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'trends'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{langMode === 'am' ? 'የ6 ወራት አዝማሚያ' : langMode === 'bilingual' ? 'Trends · አዝማሚያ' : '6M Trends'}</span>
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'recommendations'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{langMode === 'am' ? 'ስትራቴጂያዊ ውሳኔዎች' : langMode === 'bilingual' ? 'Directives · ውሳኔዎች' : 'Action Directives'}</span>
        </button>
      </nav>

      {/* Zone 3: Primary Action & Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Critical Overdue & Alerts Highlight in Header */}
        <div className="relative" ref={alertRef}>
          <div className="flex items-center gap-1.5">
            {/* Dedicated Critical Overdue Pulse Pill */}
            {criticalOverdueTasks.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setAlertFilter('CriticalOverdue');
                  setIsAlertOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md bg-rose-600 hover:bg-rose-500 text-white border border-rose-400/80 shadow-md animate-pulse transition-all cursor-pointer"
                title={`${criticalOverdueTasks.length} tasks remain incomplete past their end date! Click to review & bulk-reschedule.`}
              >
                <Flame className="w-3.5 h-3.5 text-white" />
                <span className="font-mono text-[11px] uppercase tracking-wide">
                  {langMode === 'am' ? 'ጊዜ ያለፈባቸው ወሳኝ ስራዎች' : 'Critical Overdue'}
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
                  {criticalOverdueTasks.length}
                </span>
              </button>
            )}

            {/* Standard Alerts Button */}
            <button
              onClick={() => setIsAlertOpen(!isAlertOpen)}
              className={`relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded border transition-all cursor-pointer ${
                isAlertOpen
                  ? 'bg-rose-950 border-rose-500 text-white ring-2 ring-rose-500/40 shadow-md'
                  : criticalOverdueTasks.length > 0
                  ? 'bg-rose-950/80 hover:bg-rose-900 border-rose-700 text-rose-200 hover:text-white'
                  : totalAlertsCount > 0
                  ? 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-800/70 text-rose-200 hover:text-white'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title={`${totalAlertsCount} Overdue or Urgent tasks requiring executive attention`}
              aria-label="Executive Task Alerts"
            >
              <div className="relative flex items-center justify-center">
                <Bell className={`w-3.5 h-3.5 ${totalAlertsCount > 0 ? 'text-rose-400' : 'text-slate-400'}`} />
                {totalAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </div>

              <span className="hidden sm:inline">
                {langMode === 'am' ? 'ማስጠንቀቂያ' : 'Alerts'}
              </span>

              {totalAlertsCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-rose-600 text-white rounded-full">
                  {totalAlertsCount}
                </span>
              )}
            </button>
          </div>

          {/* Executive Alert Popover Dropdown */}
          {isAlertOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-[460px] bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden text-xs">
              {/* Popover Header */}
              <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-rose-950 border border-rose-800 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs tracking-tight">
                      {langMode === 'am' ? 'የአመራር አስቸኳይ ማስጠንቀቂያዎች' : 'Executive Deadline & Priority Alerts'}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      <span className="text-rose-400 font-semibold">{criticalOverdueTasks.length} {langMode === 'am' ? 'ወሳኝ ጊዜ ያለፈባቸው' : 'Critical Overdue'}</span>
                      {' · '}
                      <span className="text-amber-400 font-semibold">{urgentTasks.length} {langMode === 'am' ? 'አስቸኳይ' : 'Urgent'}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAlertOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Bulk Reschedule Action Notification Bar */}
              {criticalOverdueTasks.length > 0 && (
                <div className="bg-rose-950/80 border-b border-rose-800/80 px-3.5 py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-rose-200">
                    <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-bounce" />
                    <span>
                      <strong>{criticalOverdueTasks.length}</strong> {langMode === 'am' ? 'ስራዎች ከማጠናቀቂያ ጊዜያቸው አልፈዋል' : 'tasks incomplete past end date'}
                    </span>
                  </div>

                  {onBulkRescheduleOverdue && (
                    <button
                      type="button"
                      onClick={handleBulkReschedule}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-[10px] uppercase font-mono tracking-wide flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                      title="Bulk-reschedule all Critical Overdue deliverables to next working week"
                    >
                      <CalendarRange className="w-3 h-3" />
                      <span>{langMode === 'am' ? 'ወደ ቀጣይ ሳምንት አዛውር' : 'Reschedule to Next Week'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Notification toast if rescheduled */}
              {rescheduleMessage && (
                <div className="bg-emerald-950 border-b border-emerald-800 px-3 py-1.5 text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{rescheduleMessage}</span>
                </div>
              )}

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] overflow-x-auto">
                <button
                  onClick={() => setAlertFilter('All')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                    alertFilter === 'All'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {langMode === 'am' ? 'ሁሉም' : 'All'} ({totalAlertsCount})
                </button>
                <button
                  onClick={() => setAlertFilter('CriticalOverdue')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
                    alertFilter === 'CriticalOverdue'
                      ? 'bg-rose-600 text-white font-bold shadow-xs'
                      : 'text-rose-400 hover:bg-rose-950/40'
                  }`}
                >
                  <Flame className="w-3 h-3" />
                  {langMode === 'am' ? 'ወሳኝ ጊዜ ያለፈባቸው' : 'Critical Overdue'} ({criticalOverdueTasks.length})
                </button>
                <button
                  onClick={() => setAlertFilter('Overdue')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
                    alertFilter === 'Overdue'
                      ? 'bg-rose-950 text-rose-300 font-semibold border border-rose-800/60'
                      : 'text-slate-400 hover:text-rose-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {langMode === 'am' ? 'ያለፈባቸው' : 'Overdue'} ({overdueTasks.length})
                </button>
                <button
                  onClick={() => setAlertFilter('Urgent')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
                    alertFilter === 'Urgent'
                      ? 'bg-amber-950 text-amber-300 font-semibold border border-amber-800/60'
                      : 'text-slate-400 hover:text-amber-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {langMode === 'am' ? 'አስቸኳይ' : 'Urgent'} ({urgentTasks.length})
                </button>
              </div>

              {/* Tasks List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/70 p-2 space-y-1">
                {displayedAlerts.length === 0 ? (
                  <div className="py-6 text-center text-slate-400">
                    <p className="text-xs">No matching tasks in this category.</p>
                  </div>
                ) : (
                  displayedAlerts.map((task) => {
                    const isOverdue = task.status === 'Overdue';
                    const isUrgent = task.priority === 'Urgent' || task.priority === 'Critical';

                    return (
                      <div
                        key={task.id}
                        className={`p-2.5 rounded-md transition-colors ${
                          isOverdue 
                            ? 'bg-rose-950/25 hover:bg-rose-950/40 border border-rose-900/50' 
                            : 'bg-slate-950/70 hover:bg-slate-800/50 border border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded">
                              {task.id}
                            </span>
                            <span className="text-[10px] text-blue-400 font-medium">
                              {getDepartmentName(task.departmentId, langMode === 'bilingual' ? 'en' : langMode)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {isTaskPastEndDate(task) && (
                              <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded bg-rose-600 text-white animate-pulse flex items-center gap-0.5 shadow-xs">
                                <Flame className="w-2.5 h-2.5" />
                                <span>Critical Overdue</span>
                              </span>
                            )}
                            {isUrgent && (
                              <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded bg-rose-950 text-rose-300 border border-rose-800/70">
                                {task.priority}
                              </span>
                            )}
                            <span
                              className={`px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded ${
                                isOverdue
                                  ? 'bg-rose-600 text-white font-bold'
                                  : task.status === 'Delayed'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                                  : 'bg-blue-950 text-blue-300 border border-blue-800/60'
                              }`}
                            >
                              {task.status}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <div className="mt-1.5 font-semibold text-white text-xs leading-snug">
                          {langMode === 'am' ? task.titleAm : task.titleEn}
                        </div>
                        {langMode === 'bilingual' && (
                          <div className="text-[10px] text-slate-400 line-clamp-1">{task.titleAm}</div>
                        )}

                        {/* Metrics Bar */}
                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                          <div>
                            <span className="text-slate-500">Plan vs Actual:</span>{' '}
                            <span className="font-mono font-semibold text-slate-200">
                              {task.actualQty} / {task.plannedQty} {task.unit}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-slate-300">
                            {task.progressPercent}%
                          </span>
                        </div>

                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isOverdue ? 'bg-rose-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, task.progressPercent)}%` }}
                          />
                        </div>

                        {/* Due Date & Action */}
                        <div className="mt-2 flex items-center justify-between gap-2 pt-1.5 border-t border-slate-800/60 flex-wrap">
                          <div className="flex items-center gap-1 text-[10px] text-rose-300 font-mono">
                            <Clock className="w-3 h-3 text-rose-400 shrink-0" />
                            <span>{langMode === 'am' ? 'ማጠናቀቂያ' : 'Due'}: {task.endDate || task.dueDate}</span>
                            {isTaskPastEndDate(task) && (
                              <span className="text-rose-400 font-bold ml-1">
                                (Past End Date)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isTaskPastEndDate(task) && onBulkRescheduleOverdue && (
                              <button
                                type="button"
                                onClick={() => onBulkRescheduleOverdue([task.id])}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/90 hover:bg-rose-900 text-rose-300 border border-rose-700/80 flex items-center gap-1 transition-colors cursor-pointer"
                                title="Reschedule deliverable to next working week"
                              >
                                <CalendarRange className="w-2.5 h-2.5 text-rose-400" />
                                <span>{langMode === 'am' ? 'ሳምንት አዛውር' : 'Reschedule'}</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setIsAlertOpen(false);
                                if (onNavigateToTask) {
                                  onNavigateToTask(task.id, task.status);
                                } else {
                                  setActiveTab('tasks');
                                }
                              }}
                              className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <span>{langMode === 'am' ? 'ስራውን ክፈት' : 'Inspect Task'}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {task.varianceNotes && (
                          <div className="mt-1.5 text-[10px] text-amber-200/90 bg-amber-950/30 border border-amber-900/40 rounded px-2 py-1 leading-tight">
                            <span className="font-semibold text-amber-300">Blocker/Root Cause:</span> {task.varianceNotes}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Popover Footer */}
              <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {totalAlertsCount} critical action items
                </span>

                <button
                  onClick={() => {
                    setIsAlertOpen(false);
                    if (onNavigateToTask) {
                      onNavigateToTask('', 'Overdue');
                    } else {
                      setActiveTab('tasks');
                    }
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>{langMode === 'am' ? 'ሁሉንም በስራ መዝገብ እይ' : 'Open in Task Registry'}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* System Data Slate Controls */}
        <div className="hidden md:flex items-center gap-1.5">
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded">
            <Database className="w-3 h-3 text-emerald-400" />
            <span>{langMode === 'am' ? 'የፋብሪካ ሲስተም' : 'Production System'}</span>
          </span>
          {onClearAllData && (
            <button
              type="button"
              onClick={onClearAllData}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors cursor-pointer"
              title="Reset all inputs back to clean slate"
            >
              <Trash2 className="w-3 h-3 text-rose-400" />
              <span>{langMode === 'am' ? 'ዳግም አጽዳ' : 'Reset System'}</span>
            </button>
          )}
        </div>

        {/* Gemini AI Plant Copilot */}
        {onOpenCopilot && (
          <button
            type="button"
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-sky-200 bg-gradient-to-r from-sky-950/90 to-blue-900/90 hover:from-sky-900 hover:to-blue-800 border border-sky-600/50 rounded transition-all shadow-xs cursor-pointer"
            title="MEG Agro-Machinery AI Operations Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span className="hidden sm:inline font-medium">MEG Copilot</span>
          </button>
        )}

        {/* Bilingual Selector */}
        <div className="flex items-center bg-slate-800/90 rounded border border-slate-700/80 p-0.5">
          <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
          <button
            onClick={() => setLangMode('en')}
            className={`px-2 py-1 text-[11px] font-semibold rounded whitespace-nowrap transition-colors ${
              langMode === 'en' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
            title="English"
          >
            EN
          </button>
          <button
            onClick={() => setLangMode('bilingual')}
            className={`px-2 py-1 text-[11px] font-semibold rounded whitespace-nowrap transition-colors ${
              langMode === 'bilingual' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
            title="Bilingual English + Amharic"
          >
            EN/አማ
          </button>
          <button
            onClick={() => setLangMode('am')}
            className={`px-2 py-1 text-[11px] font-semibold rounded whitespace-nowrap transition-colors ${
              langMode === 'am' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
            title="አማርኛ"
          >
            አማ
          </button>
        </div>

        {/* Google Sheets Sync & Live Export */}
        {onOpenGoogleSheets && (
          <button
            type="button"
            onClick={onOpenGoogleSheets}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-200 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 rounded transition-all whitespace-nowrap cursor-pointer shadow-sm shadow-emerald-950/40"
            title="Google Sheets: Live multi-sheet sync to your Google Drive spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{langMode === 'am' ? 'Google Sheets' : 'Google Sheets'}</span>
          </button>
        )}

        {/* M&E Workflow Framework: Plan -> Execution -> Performance */}
        {onOpenMEWorkflow && (
          <button
            type="button"
            onClick={onOpenMEWorkflow}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-200 bg-blue-950/80 hover:bg-blue-900 border border-blue-600/60 rounded transition-all whitespace-nowrap cursor-pointer shadow-sm shadow-blue-950/40"
            title="Monitoring & Evaluation: Plan (እቅድ) -> Execution (ክንውን) -> Performance Rate (አፈፃፀም) Workflow"
          >
            <Workflow className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">{langMode === 'am' ? 'ክትትልና ግምገማ (M&E)' : 'M&E Workflow'}</span>
          </button>
        )}

        {/* Executive Reporting System (Word, Excel, PowerPoint) */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600/90 hover:bg-blue-600 border border-blue-500/70 rounded transition-all whitespace-nowrap cursor-pointer shadow-sm shadow-blue-950/40"
          title="Executive Reporting System: Generate Word (.doc), Multi-Sheet Excel (.xls), or PowerPoint (.ppt)"
        >
          <FileText className="w-3.5 h-3.5 text-blue-200" />
          <span>{langMode === 'am' ? 'ሪፖርት (Word·Excel·PPT)' : 'Reports (Word·Excel·PPT)'}</span>
        </button>
      </div>
    </header>
  );
};
