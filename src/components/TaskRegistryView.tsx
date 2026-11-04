import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Layers,
  ArrowUpDown,
  Calculator,
  PlusCircle,
  FileCheck2
} from 'lucide-react';
import { WeeklyTask, DepartmentId, TaskStatus, TaskPriority, LanguageMode } from '../types/dashboard.ts';
import { DEPARTMENTS } from '../data/mockData.ts';
import { getDepartmentName } from '../utils/formatters.ts';

interface TaskRegistryViewProps {
  tasks: WeeklyTask[];
  onAddTask: () => void;
  onRegisterQuickTask?: (task: WeeklyTask) => void;
  onUpdateTask: (task: WeeklyTask) => void;
  langMode: LanguageMode;
  initialStatusFilter?: TaskStatus | 'All';
  initialSearchQuery?: string;
  highlightedTaskId?: string | null;
  onClearHighlight?: () => void;
}

export const TaskRegistryView: React.FC<TaskRegistryViewProps> = ({
  tasks,
  onAddTask,
  onRegisterQuickTask,
  onUpdateTask,
  langMode,
  initialStatusFilter = 'All',
  initialSearchQuery = '',
  highlightedTaskId = null,
  onClearHighlight,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'All'>(initialStatusFilter);
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'All'>('All');
  const [selectedDept, setSelectedDept] = useState<DepartmentId | 'All'>('All');
  const [selectedWeek, setSelectedWeek] = useState<string>('All');
  const [showQuickRegister, setShowQuickRegister] = useState(true);

  // Sync with incoming alert navigation filters
  React.useEffect(() => {
    if (initialStatusFilter) {
      setSelectedStatus(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  React.useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Quick Registration State matching exact format: [task, measurement, Plan, actual, performance in %, department]
  const [quickTask, setQuickTask] = useState('');
  const [quickMeasurement, setQuickMeasurement] = useState('Pcs');
  const [quickPlan, setQuickPlan] = useState<number | ''>(500);
  const [quickActual, setQuickActual] = useState<number | ''>(450);
  const [quickDept, setQuickDept] = useState<DepartmentId>('production');
  const [quickOwner, setQuickOwner] = useState('');

  // Live Performance % calculation
  const planVal = Number(quickPlan) || 0;
  const actualVal = Number(quickActual) || 0;
  const quickPerformanceInPct = planVal > 0 ? Number(((actualVal / planVal) * 100).toFixed(1)) : 0;

  const handleQuickRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTask.trim()) return;

    const newTask: WeeklyTask = {
      id: `TSK-${Math.floor(4420 + Math.random() * 80)}`,
      departmentId: quickDept,
      week: 'W44',
      titleEn: quickTask.trim(),
      titleAm: quickTask.trim(),
      assignedTo: quickOwner.trim() || 'Floor Supervisor',
      priority: 'High',
      status: quickPerformanceInPct >= 100 ? 'Completed' : 'In Progress',
      progressPercent: Math.min(100, Math.round(quickPerformanceInPct)),
      plannedQty: planVal,
      actualQty: actualVal,
      unit: quickMeasurement.trim() || 'Pcs',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completionDate: quickPerformanceInPct >= 100 ? new Date().toISOString().split('T')[0] : undefined,
    };

    if (onRegisterQuickTask) {
      onRegisterQuickTask(newTask);
    } else {
      onUpdateTask(newTask);
    }

    // Reset quick form
    setQuickTask('');
    setQuickPlan(500);
    setQuickActual(0);
    setQuickOwner('');
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = 
      t.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.titleAm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
    const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;
    const matchesDept = selectedDept === 'All' || t.departmentId === selectedDept;
    const matchesWeek = selectedWeek === 'All' || t.week === selectedWeek;

    return matchesSearch && matchesStatus && matchesPriority && matchesDept && matchesWeek;
  });

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
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
      case 'Urgent':
        return (
          <span className="font-mono text-[10px] uppercase font-bold text-rose-300 bg-rose-950/80 border border-rose-700/60 px-1.5 py-0.5 rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            {langMode === 'am' ? 'አስቸኳይ' : 'Urgent'}
          </span>
        );
      case 'Critical':
        return (
          <span className="font-mono text-[10px] uppercase font-bold text-rose-400 bg-rose-950/40 border border-rose-800/40 px-1.5 py-0.5 rounded">
            {langMode === 'am' ? 'ወሳኝ' : 'Critical'}
          </span>
        );
      case 'High':
        return (
          <span className="font-mono text-[10px] uppercase font-bold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">
            {langMode === 'am' ? 'ከፍተኛ' : 'High'}
          </span>
        );
      case 'Medium':
        return (
          <span className="font-mono text-[10px] uppercase font-medium text-blue-400 bg-blue-950/40 border border-blue-800/40 px-1.5 py-0.5 rounded">
            {langMode === 'am' ? 'መካከለኛ' : 'Medium'}
          </span>
        );
      case 'Low':
        return (
          <span className="font-mono text-[10px] uppercase font-medium text-slate-400 bg-slate-900 border border-slate-700/40 px-1.5 py-0.5 rounded">
            {langMode === 'am' ? 'ዝቅተኛ' : 'Low'}
          </span>
        );
    }
  };

  // Quick toggle progress completion
  const handleQuickComplete = (task: WeeklyTask) => {
    const updated: WeeklyTask = {
      ...task,
      status: task.status === 'Completed' ? 'In Progress' : 'Completed',
      progressPercent: task.status === 'Completed' ? 50 : 100,
      actualQty: task.status === 'Completed' ? Math.floor(task.plannedQty * 0.5) : task.plannedQty,
      completionDate: task.status === 'Completed' ? undefined : new Date().toISOString().split('T')[0],
    };
    onUpdateTask(updated);
  };

  return (
    <div className="space-y-4">
      {/* 1. Dedicated Weekly Task Registration Panel */}
      <div className="bg-slate-900 border border-blue-900/40 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <PlusCircle className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {langMode === 'am' ? 'ሳምንታዊ የስራ ምዝገባ (Weekly Task Registration)' : 'Weekly Task Registration Form'}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Mandatory Format: [Task, Measurement, Plan, Actual, Performance in %, Department]
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQuickRegister(!showQuickRegister)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>{showQuickRegister ? 'Collapse' : 'Expand Form'}</span>
              {showQuickRegister ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onAddTask}
              className="px-2.5 py-1 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-950/40 border border-blue-800/40 rounded"
            >
              Open Full Modal
            </button>
          </div>
        </div>

        {/* Form Inputs Matching Exact Format */}
        {showQuickRegister && (
          <form onSubmit={handleQuickRegisterSubmit} className="pt-3.5 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-2.5 items-end text-xs">
              {/* Field 1: TASK */}
              <div className="md:col-span-2">
                <label className="text-[11px] font-semibold text-white block mb-1">
                  1. Task (ስራ / የስራ ዝርዝር) *
                </label>
                <input
                  type="text"
                  required
                  value={quickTask}
                  onChange={(e) => setQuickTask(e.target.value)}
                  placeholder="e.g. CNC batch milling of drive shafts"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              {/* Field 2: MEASUREMENT */}
              <div>
                <label className="text-[11px] font-semibold text-white block mb-1">
                  2. Measurement (መለኪያ) *
                </label>
                <select
                  value={quickMeasurement}
                  onChange={(e) => setQuickMeasurement(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 text-xs font-mono"
                >
                  <option value="Pcs">Pcs (ቁራጭ)</option>
                  <option value="Units">Units (አሃድ)</option>
                  <option value="Batches">Batches (ባች)</option>
                  <option value="Frames">Frames (ማዕቀፍ)</option>
                  <option value="Shells">Shells (ሼል)</option>
                  <option value="Hours">Hours (ሰዓት)</option>
                  <option value="Meters">Meters (ሜትር)</option>
                  <option value="Tons">Tons (ቶን)</option>
                </select>
              </div>

              {/* Field 3: PLAN */}
              <div>
                <label className="text-[11px] font-semibold text-white block mb-1">
                  3. Plan (ዕቅድ) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={quickPlan}
                  onChange={(e) => setQuickPlan(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="500"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 font-mono text-xs tabular-nums text-right"
                />
              </div>

              {/* Field 4: ACTUAL */}
              <div>
                <label className="text-[11px] font-semibold text-white block mb-1">
                  4. Actual (ክንውን) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={quickActual}
                  onChange={(e) => setQuickActual(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="450"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 font-mono text-xs tabular-nums text-right"
                />
              </div>

              {/* Field 5: PERFORMANCE IN % (Live Computed) */}
              <div>
                <label className="text-[11px] font-semibold text-white block mb-1">
                  5. Performance in % (አፈጻጸም በ%)
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 flex items-center justify-between font-mono">
                  <span
                    className={`font-bold tabular-nums text-xs ${
                      quickPerformanceInPct >= 100
                        ? 'text-emerald-400'
                        : quickPerformanceInPct >= 75
                        ? 'text-blue-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {quickPerformanceInPct}%
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {actualVal}/{planVal}
                  </span>
                </div>
              </div>
            </div>

            {/* Field 6: DEPARTMENT & Submit Action */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 items-end pt-1">
              {/* Field 6: DEPARTMENT */}
              <div className="md:col-span-2">
                <label className="text-[11px] font-semibold text-white block mb-1">
                  6. Department (ክፍል) *
                </label>
                <select
                  value={quickDept}
                  onChange={(e) => setQuickDept(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 text-xs"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {langMode === 'am' ? d.nameAm : `${d.nameEn} (${d.nameAm})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Responsible Lead / Engineer
                </label>
                <input
                  type="text"
                  value={quickOwner}
                  onChange={(e) => setQuickOwner(e.target.value)}
                  placeholder="e.g. Mulugeta Assefa"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors shadow-xs"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>{langMode === 'am' ? 'ስራውን መዝግብ' : 'Register Task'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={langMode === 'am' ? 'ስራ፣ መታወቂያ፣ ባለሙያ ፈልግ...' : 'Search task, owner, ID...'}
              className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">{langMode === 'am' ? 'ሁሉም ሁኔታዎች (All Status)' : 'All Statuses'}</option>
              <option value="Completed">{langMode === 'am' ? 'ተጠናቋል (Completed)' : 'Completed'}</option>
              <option value="In Progress">{langMode === 'am' ? 'በሂደት ላይ (In Progress)' : 'In Progress'}</option>
              <option value="Delayed">{langMode === 'am' ? 'የዘገየ (Delayed)' : 'Delayed'}</option>
              <option value="Overdue">{langMode === 'am' ? 'ያለፈበት (Overdue)' : 'Overdue'}</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">{langMode === 'am' ? 'ሁሉም ክፍሎች (All Depts)' : 'All Departments'}</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {langMode === 'am' ? d.nameAm : d.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">{langMode === 'am' ? 'ሁሉም ቅድሚያዎች (All Priority)' : 'All Priorities'}</option>
              <option value="Urgent">{langMode === 'am' ? 'አስቸኳይ (Urgent)' : 'Urgent'}</option>
              <option value="Critical">{langMode === 'am' ? 'ወሳኝ (Critical)' : 'Critical'}</option>
              <option value="High">{langMode === 'am' ? 'ከፍተኛ (High)' : 'High'}</option>
              <option value="Medium">{langMode === 'am' ? 'መካከለኛ (Medium)' : 'Medium'}</option>
              <option value="Low">{langMode === 'am' ? 'ዝቅተኛ (Low)' : 'Low'}</option>
            </select>
          </div>

          {/* Week Filter */}
          <div>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="All">All Weeks (W44 - W46)</option>
              <option value="W44">Week 44 (Current)</option>
              <option value="W45">Week 45</option>
              <option value="W46">Week 46</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Alert Filter Banner (if opened from Executive Alerts) */}
      {(highlightedTaskId || selectedStatus === 'Overdue') && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="font-semibold text-rose-300">
              {highlightedTaskId 
                ? `Inspecting Critical Task: ${highlightedTaskId}`
                : 'Filtering: All Overdue Tasks requiring executive resolution'}
            </span>
          </div>

          <button
            onClick={() => {
              setSelectedStatus('All');
              setSelectedPriority('All');
              setSearchQuery('');
              if (onClearHighlight) onClearHighlight();
            }}
            className="text-[11px] font-semibold text-rose-300 hover:text-white underline cursor-pointer"
          >
            Show All Tasks (ሁሉንም አሳይ)
          </button>
        </div>
      )}

      {/* 3. High-Density Data Grid with Requested Columns */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-300">
                {/* 1. TASK */}
                <th className="py-3 px-4 min-w-[240px] text-white">
                  1. Task (ስራ / የስራ ዝርዝር)
                </th>

                {/* 2. MEASUREMENT */}
                <th className="py-3 px-3 w-28 text-slate-300">
                  2. Measurement (መለኪያ)
                </th>

                {/* 3. PLAN */}
                <th className="py-3 px-3 text-right w-24 text-slate-300">
                  3. Plan (ዕቅድ)
                </th>

                {/* 4. ACTUAL */}
                <th className="py-3 px-3 text-right w-24 text-slate-300">
                  4. Actual (ክንውን)
                </th>

                {/* 5. PERFORMANCE IN % */}
                <th className="py-3 px-4 w-36 text-white font-bold">
                  5. Performance in % (አፈጻጸም በ%)
                </th>

                {/* 6. DEPARTMENT */}
                <th className="py-3 px-3 text-slate-300">
                  6. Department (ክፍል)
                </th>

                {/* Auxiliary metadata */}
                <th className="py-3 px-3 w-20 text-slate-500 font-normal">Task ID</th>
                <th className="py-3 px-3 text-slate-500 font-normal">Owner</th>
                <th className="py-3 px-3 w-24 text-slate-500 font-normal">Priority</th>
                <th className="py-3 px-3 w-24 text-slate-500 font-normal">Status</th>
                <th className="py-3 px-3 text-center w-16 text-slate-500 font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 text-xs">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <FileCheck2 className="w-8 h-8 text-slate-600" />
                      <p className="font-semibold text-slate-300">
                        {tasks.length === 0
                          ? (langMode === 'am' ? 'ምንም የተመዘገበ ስራ የለም። ከላይ ባለው ቅጽ የመጀመሪያውን ስራ ይመዝግቡ።' : 'No tasks registered yet. The system is clean and ready for live production entry.')
                          : (langMode === 'am' ? 'በዚህ ማጣሪያ ምንም የተገኘ ስራ የለም' : 'No tasks match the selected filter criteria.')}
                      </p>
                      {tasks.length === 0 && (
                        <button
                          type="button"
                          onClick={onAddTask}
                          className="mt-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          + {langMode === 'am' ? 'አዲስ ስራ መዝግብ' : 'Add New Task'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const performancePct = task.plannedQty > 0 
                    ? Number(((task.actualQty / task.plannedQty) * 100).toFixed(1)) 
                    : task.progressPercent;

                  const isHighlighted = highlightedTaskId === task.id;

                  return (
                    <tr 
                      key={task.id} 
                      id={`task-row-${task.id}`}
                      className={`transition-colors group ${
                        isHighlighted 
                          ? 'bg-rose-950/40 border-l-4 border-l-rose-500 ring-1 ring-rose-500/50' 
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* 1. TASK */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white leading-snug">
                          {langMode === 'am' ? task.titleAm : task.titleEn}
                        </div>
                        {langMode === 'bilingual' && (
                          <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {task.titleAm}
                          </div>
                        )}
                        {task.varianceNotes && (
                          <div className="text-[10px] text-amber-400/90 font-mono mt-0.5">
                            ↳ {task.varianceNotes}
                          </div>
                        )}
                      </td>

                      {/* 2. MEASUREMENT */}
                      <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80 text-[11px]">
                          {task.unit}
                        </span>
                      </td>

                      {/* 3. PLAN */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300 font-medium">
                        {task.plannedQty.toLocaleString()}
                      </td>

                      {/* 4. ACTUAL */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-white font-bold">
                        {task.actualQty.toLocaleString()}
                      </td>

                      {/* 5. PERFORMANCE IN % */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span
                              className={`font-bold tabular-nums ${
                                performancePct >= 100
                                  ? 'text-emerald-400'
                                  : performancePct >= 75
                                  ? 'text-blue-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              {performancePct}%
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {task.actualQty >= task.plannedQty ? 'Target Met' : `${task.plannedQty - task.actualQty} Left`}
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                performancePct >= 100
                                  ? 'bg-emerald-500'
                                  : performancePct >= 75
                                  ? 'bg-blue-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, performancePct)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 6. DEPARTMENT */}
                      <td className="py-3 px-3 text-slate-200 font-medium whitespace-nowrap">
                        {getDepartmentName(task.departmentId, langMode === 'bilingual' ? 'en' : langMode)}
                      </td>

                      {/* Auxiliary Metadata */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                        {task.id}
                      </td>

                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap text-[11px]">
                        {task.assignedTo}
                      </td>

                      <td className="py-3 px-3">
                        {getPriorityBadge(task.priority)}
                      </td>

                      <td className="py-3 px-3">
                        {getStatusBadge(task.status)}
                      </td>

                      {/* Quick Action */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleQuickComplete(task)}
                          className={`p-1.5 rounded transition-colors ${
                            task.status === 'Completed'
                              ? 'text-emerald-400 hover:bg-emerald-950/60'
                              : 'text-slate-500 hover:text-white hover:bg-slate-800'
                          }`}
                          title={task.status === 'Completed' ? 'Mark In Progress' : 'Mark Completed'}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-slate-950/90 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>
              {langMode === 'am' ? 'የተገኙ ስራዎች:' : 'Showing:'} <span className="font-mono text-white font-medium">{filteredTasks.length}</span> of {tasks.length}
            </span>
            <span>
              {langMode === 'am' ? 'የተጠናቀቁ:' : 'Completed:'} <span className="font-mono text-emerald-400 font-medium">{tasks.filter(t => t.status === 'Completed').length}</span>
            </span>
            <span>
              {langMode === 'am' ? 'ያለፈባቸው/የዘገዩ:' : 'Overdue/Delayed:'} <span className="font-mono text-rose-400 font-medium">{tasks.filter(t => t.status === 'Overdue' || t.status === 'Delayed').length}</span>
            </span>
          </div>

          <span className="font-mono text-[11px] text-slate-500">
            Format: Task · Measurement · Plan · Actual · Performance in % · Department
          </span>
        </div>
      </div>
    </div>
  );
};
