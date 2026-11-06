import React, { useState, useEffect } from 'react';
import { X, Compass, Edit3, Trash2, Save, Calendar, User, TrendingUp } from 'lucide-react';
import { ActionableRecommendation, DepartmentId, LanguageMode } from '../types/dashboard.ts';
import { DEPARTMENTS } from '../data/mockData.ts';

interface EditDirectiveModalProps {
  isOpen: boolean;
  directive: ActionableRecommendation | null;
  onClose: () => void;
  onSave: (updatedRec: ActionableRecommendation) => void;
  onDelete?: (directiveId: string) => void;
  langMode?: LanguageMode;
}

export const EditDirectiveModal: React.FC<EditDirectiveModalProps> = ({
  isOpen,
  directive,
  onClose,
  onSave,
  onDelete,
  langMode = 'en',
}) => {
  const [titleEn, setTitleEn] = useState('');
  const [titleAm, setTitleAm] = useState('');
  const [departmentId, setDepartmentId] = useState<DepartmentId>('production');
  const [responsibleLead, setResponsibleLead] = useState('');
  const [directiveEn, setDirectiveEn] = useState('');
  const [directiveAm, setDirectiveAm] = useState('');
  const [expectedOutcomeEn, setExpectedOutcomeEn] = useState('');
  const [expectedOutcomeAm, setExpectedOutcomeAm] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<ActionableRecommendation['priority']>('Immediate');
  const [status, setStatus] = useState<ActionableRecommendation['status']>('Open');

  useEffect(() => {
    if (directive) {
      setTitleEn(directive.titleEn);
      setTitleAm(directive.titleAm || '');
      setDepartmentId(directive.departmentId);
      setResponsibleLead(directive.responsibleLead);
      setDirectiveEn(directive.directiveEn);
      setDirectiveAm(directive.directiveAm || '');
      setExpectedOutcomeEn(directive.expectedOutcomeEn);
      setExpectedOutcomeAm(directive.expectedOutcomeAm || '');
      setDeadline(directive.deadline);
      setPriority(directive.priority);
      setStatus(directive.status);
    }
  }, [directive, isOpen]);

  if (!isOpen || !directive) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim() || !responsibleLead.trim()) return;

    const updatedRec: ActionableRecommendation = {
      ...directive,
      titleEn: titleEn.trim(),
      titleAm: titleAm.trim() || titleEn.trim(),
      departmentId,
      responsibleLead: responsibleLead.trim(),
      directiveEn: directiveEn.trim(),
      directiveAm: directiveAm.trim() || directiveEn.trim(),
      expectedOutcomeEn: expectedOutcomeEn.trim(),
      expectedOutcomeAm: expectedOutcomeAm.trim() || expectedOutcomeEn.trim(),
      deadline,
      priority,
      status,
    };

    onSave(updatedRec);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && directive) {
      onDelete(directive.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full text-xs shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {langMode === 'am' ? 'ስትራቴጂያዊ መመሪያን አስተካክል' : 'Edit Strategic Directive'}
                </h3>
                <span className="font-mono text-[10px] bg-slate-800 text-blue-400 px-2 py-0.5 rounded border border-slate-700">
                  {directive.id}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {langMode === 'am' ? 'የተሳሳተ መረጃን ማረም፣ የአመራር መመሪያዎችን እና ውጤቶችን ማዘመን' : 'Correct executive directives, assigned leads, and expected ROI impact'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto flex-1">
          <div>
            <label className="text-[11px] font-semibold text-white block mb-1">
              Directive Title (English) *
            </label>
            <input
              type="text"
              required
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="e.g. Implement Lean 5S & Scrap Minimization Protocol"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Directive Title (Amharic - አማራጭ)
            </label>
            <input
              type="text"
              value={titleAm}
              onChange={(e) => setTitleAm(e.target.value)}
              placeholder="የመመሪያው ርዕስ በአማርኛ..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-white block mb-1">
                Department *
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value as DepartmentId)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-white block mb-1">
                Responsible Lead *
              </label>
              <input
                type="text"
                required
                value={responsibleLead}
                onChange={(e) => setResponsibleLead(e.target.value)}
                placeholder="e.g. Deputy Managing Director"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-white block mb-1">
              Executive Directive Action (English) *
            </label>
            <textarea
              rows={2}
              required
              value={directiveEn}
              onChange={(e) => setDirectiveEn(e.target.value)}
              placeholder="Detailed mandate from executive leadership..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-white block mb-1">
              Expected ROI / Outcome (English) *
            </label>
            <textarea
              rows={2}
              required
              value={expectedOutcomeEn}
              onChange={(e) => setExpectedOutcomeEn(e.target.value)}
              placeholder="e.g. 15% scrap reduction saving approx 420,000 ETB monthly..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value="Immediate">Immediate</option>
                <option value="Short-Term">Short-Term</option>
                <option value="Strategic">Strategic</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Deadline</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            {onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{langMode === 'am' ? 'መመሪያውን ሰርዝ (Delete)' : 'Delete Directive'}</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {langMode === 'am' ? 'ይቅር (Cancel)' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-lg shadow-blue-900/40 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{langMode === 'am' ? 'አስቀምጥ (Save Changes)' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
