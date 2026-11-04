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
  Database
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
  tasks?: WeeklyTask[];
  onNavigateToTask?: (taskId: string, filterStatus?: TaskStatus | 'All') => void;
  onClearAllData?: () => void;
  onLoadDemoData?: () => void;
  onOpenCopilot?: () => void;
  isCleanSlate?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  langMode,
  setLangMode,
  onOpenExport,
  tasks = [],
  onNavigateToTask,
  onClearAllData,
  onLoadDemoData,
  onOpenCopilot,
  isCleanSlate = true,
}) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertFilter, setAlertFilter] = useState<'All' | 'Overdue' | 'Urgent'>('All');
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

  // Compute Overdue & Urgent tasks
  const overdueTasks = tasks.filter((t) => t.status === 'Overdue');
  const urgentTasks = tasks.filter(
    (t) => (t.priority === 'Urgent' || t.priority === 'Critical') && t.status !== 'Completed'
  );

  // Combined list of critical alert tasks
  const alertTaskMap = new Map<string, WeeklyTask>();
  overdueTasks.forEach((t) => alertTaskMap.set(t.id, t));
  urgentTasks.forEach((t) => alertTaskMap.set(t.id, t));
  const alertTasks = Array.from(alertTaskMap.values());
  const totalAlertsCount = alertTasks.length;

  const displayedAlerts = alertTasks.filter((t) => {
    if (alertFilter === 'Overdue') return t.status === 'Overdue';
    if (alertFilter === 'Urgent') return (t.priority === 'Urgent' || t.priority === 'Critical') && t.status !== 'Completed';
    return true;
  });

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
        {/* Urgent & Overdue Task Alert System */}
        <div className="relative" ref={alertRef}>
          <button
            onClick={() => setIsAlertOpen(!isAlertOpen)}
            className={`relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded border transition-all cursor-pointer ${
              isAlertOpen
                ? 'bg-rose-950 border-rose-500 text-white ring-2 ring-rose-500/40 shadow-md'
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

          {/* Executive Alert Popover Dropdown */}
          {isAlertOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-[420px] bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden text-xs">
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
                      <span className="text-rose-400 font-semibold">{overdueTasks.length} {langMode === 'am' ? 'ጊዜ ያለፈባቸው' : 'Overdue'}</span>
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

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px]">
                <button
                  onClick={() => setAlertFilter('All')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    alertFilter === 'All'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {langMode === 'am' ? 'ሁሉም' : 'All'} ({totalAlertsCount})
                </button>
                <button
                  onClick={() => setAlertFilter('Overdue')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
                    alertFilter === 'Overdue'
                      ? 'bg-rose-950 text-rose-300 font-semibold border border-rose-800/60'
                      : 'text-slate-400 hover:text-rose-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {langMode === 'am' ? 'ጊዜ ያለፈባቸው' : 'Overdue'} ({overdueTasks.length})
                </button>
                <button
                  onClick={() => setAlertFilter('Urgent')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
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
                        <div className="mt-2 flex items-center justify-between gap-2 pt-1.5 border-t border-slate-800/60">
                          <div className="flex items-center gap-1 text-[10px] text-rose-300 font-mono">
                            <Clock className="w-3 h-3 text-rose-400 shrink-0" />
                            <span>{langMode === 'am' ? 'ማጠናቀቂያ' : 'Due'}: {task.dueDate}</span>
                          </div>

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
