import React, { useState } from 'react';
import { 
  Compass, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  User, 
  Layers, 
  TrendingUp, 
  ArrowRight,
  Plus,
  Sliders,
  DollarSign
} from 'lucide-react';
import { ActionableRecommendation, DepartmentId, LanguageMode } from '../types/dashboard.ts';
import { DEPARTMENTS } from '../data/mockData.ts';
import { getDepartmentName } from '../utils/formatters.ts';

interface StrategicDirectivesViewProps {
  recommendations: ActionableRecommendation[];
  onUpdateStatus: (id: string, status: ActionableRecommendation['status']) => void;
  onAddRecommendation: (rec: ActionableRecommendation) => void;
  langMode: LanguageMode;
}

export const StrategicDirectivesView: React.FC<StrategicDirectivesViewProps> = ({
  recommendations,
  onUpdateStatus,
  onAddRecommendation,
  langMode,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Immediate' | 'Short-Term' | 'Strategic'>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for new recommendation
  const [titleEn, setTitleEn] = useState('');
  const [titleAm, setTitleAm] = useState('');
  const [deptId, setDeptId] = useState<DepartmentId>('machine_shop');
  const [lead, setLead] = useState('');
  const [directiveEn, setDirectiveEn] = useState('');
  const [expectedOutcomeEn, setExpectedOutcomeEn] = useState('');
  const [deadline, setDeadline] = useState('2026-12-01');
  const [priority, setPriority] = useState<ActionableRecommendation['priority']>('Immediate');

  const filteredRecs = selectedFilter === 'All'
    ? recommendations
    : recommendations.filter((r) => r.priority === selectedFilter);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim() || !lead.trim()) return;

    const newRec: ActionableRecommendation = {
      id: `REC-0${recommendations.length + 1}`,
      titleEn,
      titleAm: titleAm || titleEn,
      departmentId: deptId,
      responsibleLead: lead,
      directiveEn,
      directiveAm: directiveEn,
      expectedOutcomeEn,
      expectedOutcomeAm: expectedOutcomeEn,
      deadline,
      priority,
      status: 'Open',
    };

    onAddRecommendation(newRec);
    setShowAddModal(false);
    setTitleEn('');
    setTitleAm('');
    setLead('');
    setDirectiveEn('');
    setExpectedOutcomeEn('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-400" />
            <span>{langMode === 'am' ? 'ስትራቴጂያዊ ውሳኔዎችና የአመራር መመሪያዎች' : langMode === 'bilingual' ? 'Executive Strategic Directives · ስትራቴጂያዊ ውሳኔዎች' : 'Executive Strategic Directives'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {langMode === 'am' ? 'የፋብሪካውን ትርፋማነት፣ ጥራትና የማሽን ብቃት ለማሳደግ የተላለፉ ዋና ዋና ውሳኔዎች' : 'C-suite actionable recommendations, assigned executive leads, and expected financial returns'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Priority filter buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedFilter('All')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                selectedFilter === 'All' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter('Immediate')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                selectedFilter === 'Immediate' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Immediate
            </button>
            <button
              onClick={() => setSelectedFilter('Strategic')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                selectedFilter === 'Strategic' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Strategic
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Directive</span>
          </button>
        </div>
      </div>

      {/* Grid of Actionable Directives */}
      {filteredRecs.length === 0 ? (
        <div className="py-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-lg">
          <Compass className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">
            {langMode === 'am' ? 'ምንም ስልታዊ መመሪያ አልተመዘገበም' : 'No Strategic Directives Recorded'}
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {langMode === 'am' ? 'አዳዲስ የአመራር መመሪያዎችን ለማከል "New Directive" የሚለውን ይጫኑ።' : 'Click "New Directive" to record factory leadership directives and track execution.'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-3 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold cursor-pointer shadow-xs"
          >
            + {langMode === 'am' ? 'አዲስ መመሪያ መዝግብ' : 'Add First Directive'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecs.map((rec) => {
          const isClosed = rec.status === 'Closed';
          const isInProgress = rec.status === 'In Progress';

          return (
            <div
              key={rec.id}
              className={`bg-slate-900 border rounded-lg p-5 flex flex-col justify-between transition-colors ${
                isClosed
                  ? 'border-slate-800 opacity-70'
                  : rec.priority === 'Immediate'
                  ? 'border-blue-900/60 hover:border-blue-600'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header: ID, Priority, Department */}
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="font-semibold text-white">{rec.id}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-blue-400 font-sans">
                      {getDepartmentName(rec.departmentId, langMode === 'bilingual' ? 'en' : langMode)}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                      rec.priority === 'Immediate'
                        ? 'text-rose-400 bg-rose-950/40 border border-rose-800/40'
                        : rec.priority === 'Short-Term'
                        ? 'text-amber-400 bg-amber-950/40 border border-amber-800/40'
                        : 'text-blue-400 bg-blue-950/40 border border-blue-800/40'
                    }`}
                  >
                    {rec.priority}
                  </span>
                </div>

                {/* Directive Title */}
                <h3 className="text-sm font-bold text-white tracking-tight mb-1">
                  {langMode === 'am' ? rec.titleAm : rec.titleEn}
                </h3>
                {langMode === 'bilingual' && (
                  <p className="text-xs text-slate-400 italic mb-2">{rec.titleAm}</p>
                )}

                {/* Directive Statement */}
                <div className="bg-slate-950/70 border border-slate-800 rounded p-3 mb-3 text-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                    {langMode === 'am' ? 'የውሳኔው ይዘት (Directive):' : 'Executive Directive:'}
                  </span>
                  <p className="text-slate-200 leading-relaxed text-[11px]">
                    {langMode === 'am' ? rec.directiveAm : rec.directiveEn}
                  </p>
                </div>

                {/* Expected Outcome */}
                <div className="bg-emerald-950/20 border border-emerald-900/40 rounded p-3 mb-3 text-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {langMode === 'am' ? 'የሚጠበቅ ውጤት (Expected Outcome):' : 'Expected ROI / Impact:'}
                  </span>
                  <p className="text-emerald-200/90 leading-relaxed text-[11px]">
                    {langMode === 'am' ? rec.expectedOutcomeAm : rec.expectedOutcomeEn}
                  </p>
                </div>

                {/* Meta details: Responsible lead & Deadline */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 py-2 border-t border-slate-800/80 gap-2">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{rec.responsibleLead}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{rec.deadline}</span>
                  </div>
                </div>
              </div>

              {/* Status Switcher Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs mt-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  {langMode === 'am' ? 'ሁኔታ:' : 'Status:'} <span className="text-white font-medium">{rec.status}</span>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateStatus(rec.id, 'Open')}
                    className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                      rec.status === 'Open' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => onUpdateStatus(rec.id, 'In Progress')}
                    className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                      rec.status === 'In Progress' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => onUpdateStatus(rec.id, 'Closed')}
                    className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                      rec.status === 'Closed' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Closed
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Lookups & Configuration Master Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
          <Sliders className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            {langMode === 'am' ? 'የማስተር መረጃና ኮንፊገሬሽን (Lookups_Config)' : 'Master Lookups & System Configuration'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Enterprise Identity */}
          <div className="bg-slate-950/60 border border-slate-800 rounded p-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
              Enterprise Identity
            </span>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded bg-white p-0.5 flex items-center justify-center shrink-0 border border-slate-700/70 overflow-hidden">
                <img 
                  src="/assets/aistudio/photo_2026-07-02_16-05-45_68c4c737.jpg" 
                  alt="MEG Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-[11px] font-mono leading-tight">
                <div className="text-white font-bold">MEG Group</div>
                <div className="text-amber-400 font-semibold text-[10px]">Agro-Machinery Industry</div>
                <div className="text-[9px] text-slate-400">ማሽነሪ ኢንጂነሪንግ</div>
              </div>
            </div>
          </div>

          {/* Shift Schedule */}
          <div className="bg-slate-950/60 border border-slate-800 rounded p-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
              Plant Shift Schedule (24/7)
            </span>
            <div className="space-y-1.5 text-slate-300 font-mono text-[11px]">
              <div className="flex justify-between">
                <span>Shift 1 (Morning):</span>
                <span className="text-slate-400">07:00 - 15:30</span>
              </div>
              <div className="flex justify-between">
                <span>Shift 2 (Afternoon):</span>
                <span className="text-slate-400">15:30 - 23:30</span>
              </div>
              <div className="flex justify-between">
                <span>Shift 3 (Night):</span>
                <span className="text-slate-400">23:30 - 07:00</span>
              </div>
            </div>
          </div>

          {/* Currency & Financials */}
          <div className="bg-slate-950/60 border border-slate-800 rounded p-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
              Currency & Cost Centers
            </span>
            <div className="space-y-1.5 text-slate-300 font-mono text-[11px]">
              <div className="flex justify-between">
                <span>Currency Symbol:</span>
                <span className="text-emerald-400 font-bold">ETB (ብር)</span>
              </div>
              <div className="flex justify-between">
                <span>Scrap Cost Metric:</span>
                <span className="text-slate-400">Cost per Kg / Unit</span>
              </div>
              <div className="flex justify-between">
                <span>Fiscal Quarter:</span>
                <span className="text-slate-400">Q4 FY2026</span>
              </div>
            </div>
          </div>

          {/* Benchmark Standards */}
          <div className="bg-slate-950/60 border border-slate-800 rounded p-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
              Target Key Benchmarks
            </span>
            <div className="space-y-1.5 text-slate-300 font-mono text-[11px]">
              <div className="flex justify-between">
                <span>World-Class OEE:</span>
                <span className="text-blue-400 font-bold">85.0%</span>
              </div>
              <div className="flex justify-between">
                <span>Max Defect Rate:</span>
                <span className="text-rose-400 font-bold">&lt;= 2.50%</span>
              </div>
              <div className="flex justify-between">
                <span>Dept Grade A Cutoff:</span>
                <span className="text-emerald-400 font-bold">&gt;= 45 / 50</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Directive Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-5 max-w-lg w-full text-xs">
            <h3 className="text-sm font-bold text-white mb-3">Add New Strategic Directive</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Title (English) *</label>
                <input
                  type="text"
                  required
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Ultrasonic Leak Testing of Hydraulic Fittings"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Title (Amharic Optional)</label>
                <input
                  type="text"
                  value={titleAm}
                  onChange={(e) => setTitleAm(e.target.value)}
                  placeholder="e.g. የሀይድሮሊክ መገጣጠሚያዎች የፍሳሽ ፍተሻ"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Department</label>
                  <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>{d.nameEn}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Responsible Lead *</label>
                  <input
                    type="text"
                    required
                    value={lead}
                    onChange={(e) => setLead(e.target.value)}
                    placeholder="e.g. Eng. Biruk & Plant GM"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Executive Directive *</label>
                <textarea
                  rows={2}
                  required
                  value={directiveEn}
                  onChange={(e) => setDirectiveEn(e.target.value)}
                  placeholder="Specific executive mandate and operational instructions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Expected Financial ROI / Impact *</label>
                <input
                  type="text"
                  required
                  value={expectedOutcomeEn}
                  onChange={(e) => setExpectedOutcomeEn(e.target.value)}
                  placeholder="e.g. ETB 180,000 monthly savings from oil recovery"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Short-Term">Short-Term</option>
                    <option value="Strategic">Strategic</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded hover:bg-blue-500"
                >
                  Save Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
