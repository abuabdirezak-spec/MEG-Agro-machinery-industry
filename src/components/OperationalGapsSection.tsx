import React from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { OperationalGapSolution, LanguageMode } from '../types/dashboard.ts';
import { getDepartmentName } from '../utils/formatters.ts';

interface OperationalGapsSectionProps {
  gaps: OperationalGapSolution[];
  onToggleStatus: (id: string) => void;
  langMode: LanguageMode;
}

export const OperationalGapsSection: React.FC<OperationalGapsSectionProps> = ({
  gaps,
  onToggleStatus,
  langMode,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-800 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight">
              {langMode === 'am' ? 'የአሰራር ክፍተቶችና የአመራር መፍትሄዎች' : langMode === 'bilingual' ? 'Operational Gaps & Executive Solutions · ክፍተቶችና መፍትሄዎች' : 'Operational Gaps & Executive Solutions'}
            </h3>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {gaps.length} Active Gaps
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {langMode === 'am' ? 'በፋብሪካው ስራ ላይ ተፅዕኖ የፈጠሩ ዋና ዋና ችግሮች እና የተወሰዱ ውሳኔዎች' : 'High-impact bottlenecks, root cause analysis, and active executive directives'}
          </p>
        </div>
      </div>

      {gaps.length === 0 ? (
        <div className="py-8 text-center text-slate-400 bg-slate-950/40 rounded-lg border border-slate-800">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-white">
            {langMode === 'am' ? 'ምንም ያልተፈታ የአሰራር ክፍተት አልተመዘገበም' : 'No Operational Gaps Logged'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {langMode === 'am' ? 'የፋብሪካው አሰራር በመደበኛ ሁኔታ ላይ ይገኛል።' : 'All plant processes running nominally without active bottleneck alerts.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {gaps.map((gap) => {
          const isCritical = gap.impactLevel === 'Critical';
          const isResolved = gap.status === 'Resolved';
          const isUnderReview = gap.status === 'Under Review';

          return (
            <div
              key={gap.id}
              className={`border rounded-lg p-4 transition-colors flex flex-col justify-between ${
                isResolved
                  ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                  : isCritical
                  ? 'bg-slate-900 border-rose-900/40 hover:border-rose-700/60'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header row: ID, Department, Impact */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="font-semibold text-slate-300">{gap.id}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-blue-400 font-sans">
                      {getDepartmentName(gap.departmentId, langMode === 'bilingual' ? 'en' : langMode)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                        gap.impactLevel === 'Critical'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : gap.impactLevel === 'High'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {gap.impactLevel} Impact
                    </span>
                  </div>
                </div>

                {/* Gap Statement */}
                <h4 className="text-xs font-semibold text-white leading-relaxed mb-2">
                  {langMode === 'am' ? gap.gapIdentifiedAm : gap.gapIdentifiedEn}
                </h4>

                {langMode === 'bilingual' && (
                  <p className="text-[11px] text-slate-400 italic mb-2 leading-relaxed">
                    {gap.gapIdentifiedAm}
                  </p>
                )}

                {/* Root Cause Box */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded p-2.5 mb-2.5 text-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                    {langMode === 'am' ? 'የችግሩ መንስኤ (Root Cause):' : 'Root Cause:'}
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {langMode === 'am' ? gap.rootCauseAm : gap.rootCauseEn}
                  </p>
                </div>

                {/* Executive Solution Box */}
                <div className="bg-blue-950/20 border border-blue-900/30 rounded p-2.5 text-xs mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 block mb-0.5">
                    {langMode === 'am' ? 'የአመራር መፍትሄ (Executive Solution):' : 'Executive Solution:'}
                  </span>
                  <p className="text-slate-200 text-[11px] leading-relaxed">
                    {langMode === 'am' ? gap.executiveSolutionAm : gap.executiveSolutionEn}
                  </p>
                </div>
              </div>

              {/* Footer info & interactive status toggle */}
              <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] font-mono">
                  {langMode === 'am' ? 'ዒላማ ቀን:' : 'Target:'} <span className="text-slate-300">{gap.targetDate}</span>
                </span>

                <button
                  onClick={() => onToggleStatus(gap.id)}
                  className={`text-[11px] font-medium px-2 py-1 rounded transition-colors flex items-center gap-1.5 ${
                    isResolved
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/40'
                      : isUnderReview
                      ? 'bg-amber-950/40 text-amber-400 border border-amber-800/50 hover:bg-amber-900/40'
                      : 'bg-blue-950/40 text-blue-400 border border-blue-800/50 hover:bg-blue-900/40'
                  }`}
                  title="Click to advance status"
                >
                  {isResolved ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  <span>{gap.status}</span>
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};
