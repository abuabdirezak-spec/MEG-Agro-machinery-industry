import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { LanguageMode } from '../types/dashboard.ts';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  itemIdentifier?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  langMode?: LanguageMode;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  itemIdentifier,
  message,
  onConfirm,
  onCancel,
  langMode = 'en',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-rose-900/60 rounded-xl max-w-md w-full shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-rose-950/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {langMode === 'am' ? 'መረጃውን መሰረዝ ይፈልጋሉ?' : 'Confirm Record Deletion'}
              </h3>
              <p className="text-[10px] text-rose-300/80 font-mono">
                {langMode === 'am' ? 'ይህ ተግባር የተሳሳተ ወይም አላስፈላጊ መረጃን ከሲስተሙ ያስወግዳል' : 'Irreversible Action · Permanently removes record from system'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5">
          {itemIdentifier && (
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 flex items-center justify-between">
              <span className="text-slate-500">{langMode === 'am' ? 'የመረጃ መለያ:' : 'Record:'}</span>
              <span className="text-white font-bold bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                {itemIdentifier}
              </span>
            </div>
          )}

          <p className="text-slate-300 leading-relaxed text-xs">
            {message || (langMode === 'am'
              ? `እርግጠኛ ነዎት "${title}" መሰረዝ ይፈልጋሉ? የተሰረዘው መረጃ ወዲያውኑ ከዳሽቦርዱ እና ከሪፖርቶች ይወገዳል።`
              : `Are you sure you want to delete "${title}"? This record will be permanently purged from calculations, KPIs, and reports.`)}
          </p>

          <div className="p-3 bg-amber-950/25 border border-amber-800/40 rounded-lg text-[11px] text-amber-200/90 leading-tight">
            <span className="font-semibold text-amber-300">{langMode === 'am' ? 'ማስታወሻ፡' : 'Notice:'}</span>{' '}
            {langMode === 'am'
              ? 'መረጃው የተሳሳተ ከሆነ "Edit" የሚለውን በመጫን ማስተካከል ይችላሉ። መሰረዝ የሚፈልጉ ከሆነ ከታች ያለውን ቀይ ቁልፍ ይጫኑ።'
              : 'If you only made a typo, you can click Cancel and choose Edit instead. To completely erase this incorrect record, confirm below.'}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {langMode === 'am' ? 'ይቅር (Cancel)' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-950/50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{langMode === 'am' ? 'በእርግጠኝነት ሰርዝ (Delete)' : 'Confirm Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
