import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  LogOut, 
  Check, 
  Copy,
  TableProperties
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  signInWithGoogle, 
  signOutGoogle, 
  initGoogleAuth, 
  createGoogleSpreadsheet, 
  PlantExportData 
} from '../utils/googleSheets.ts';
import { LanguageMode } from '../types/dashboard.ts';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PlantExportData;
  langMode?: LanguageMode;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  data,
  langMode = 'en',
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sheetTitle, setSheetTitle] = useState(
    `MEG Agro-Machinery Operations - ${new Date().toISOString().split('T')[0]}`
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (isOpen) {
      initGoogleAuth(
        (user, token) => {
          setCurrentUser(user);
          setAccessToken(token);
        },
        () => {
          setCurrentUser(null);
          setAccessToken(null);
        }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setExportError(null);
    setIsSigningIn(true);
    try {
      const res = await signInWithGoogle();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err: any) {
      setExportError(err?.message || 'Authentication with Google failed');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOutGoogle();
    setCurrentUser(null);
    setAccessToken(null);
    setCreatedUrl(null);
  };

  const handleProceedExport = async () => {
    setShowConfirmDialog(false);
    setIsExporting(true);
    setExportError(null);

    try {
      const result = await createGoogleSpreadsheet(sheetTitle, data);
      setCreatedUrl(result.spreadsheetUrl);
    } catch (err: any) {
      setExportError(err?.message || 'Failed to export to Google Sheets');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = () => {
    if (createdUrl) {
      navigator.clipboard.writeText(createdUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-emerald-900/60 rounded-xl max-w-lg w-full text-xs shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-emerald-950/20 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {langMode === 'am' ? 'ወደ Google Sheets አስገባ (Export to Google Sheets)' : 'Export to Google Sheets'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {langMode === 'am' ? 'የፋብሪካውን መረጃ በቀጥታ ወደ Google Drive እና Sheets ይላኩ' : 'Direct live synchronization with your Google Workspace Spreadsheets'}
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

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* User Auth Status Banner */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google User'}
                    className="w-7 h-7 rounded-full border border-slate-700"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-xs">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-white text-xs leading-none">
                    {currentUser.displayName || 'Connected Account'}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                    {currentUser.email}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-slate-300 text-xs">
                  {langMode === 'am' ? 'የGoogle መለያ አልተገናኘም' : 'Google account not connected'}
                </span>
              </div>
            )}

            {currentUser ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors px-2 py-1 rounded hover:bg-slate-800"
                title="Disconnect Google account"
              >
                <LogOut className="w-3 h-3" />
                <span>Disconnect</span>
              </button>
            ) : (
              /* Official Google Sign-in Styled Button */
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-medium text-xs rounded shadow-xs transition-colors cursor-pointer"
              >
                {isSigningIn ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-800" />
                ) : (
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-3.5 h-3.5">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                )}
                <span>Sign in with Google</span>
              </button>
            )}
          </div>

          {/* Export Error Alert */}
          {exportError && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-[11px] leading-relaxed">
                <span className="font-semibold block mb-0.5">Google Sheets Operation Notice:</span>
                {exportError}
              </div>
            </div>
          )}

          {/* Export Success Result */}
          {createdUrl ? (
            <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Spreadsheet successfully generated in Google Drive!</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Your spreadsheet contains 5 operational tabs with current tasks, maintenance schedules, evaluations, and OEE metrics.
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={createdUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs shadow-md transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Google Sheet</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Spreadsheet Details */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-white block mb-1">
                    Spreadsheet Name
                  </label>
                  <input
                    type="text"
                    value={sheetTitle}
                    onChange={(e) => setSheetTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                {/* Included Multi-Sheets Preview */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <TableProperties className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Included Tabs (Multi-Worksheet Structure):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300">1. Executive Overview</span>
                      <span className="text-emerald-400 font-mono text-[10px]">KPIs & Budgets</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300">2. Weekly Task Registry</span>
                      <span className="text-emerald-400 font-mono text-[10px]">{data.tasks.length} tasks</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300">3. Preventive Maintenance</span>
                      <span className="text-emerald-400 font-mono text-[10px]">{data.maintenance.length} items</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300">4. Department Evaluations</span>
                      <span className="text-emerald-400 font-mono text-[10px]">13 Depts (50 pts)</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between sm:col-span-2">
                      <span className="text-slate-300">5. Equipment OEE &amp; Scrap</span>
                      <span className="text-emerald-400 font-mono text-[10px]">{data.machines.length} machine tags</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explicit Mandatory User Confirmation Dialog before creation */}
              {showConfirmDialog ? (
                <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-xl space-y-3 animate-in fade-in">
                  <div className="font-semibold text-emerald-300 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Confirm Google Drive Spreadsheet Creation</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    This will create a new Google Sheet named <strong className="text-white">"{sheetTitle}"</strong> in your Google Drive and populate all 5 worksheets with your live factory records.
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowConfirmDialog(false)}
                      className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleProceedExport}
                      disabled={isExporting}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-md cursor-pointer"
                    >
                      {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                      <span>Yes, Export Now</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {createdUrl ? 'Close' : 'Cancel'}
          </button>

          {!createdUrl && !showConfirmDialog && (
            <button
              type="button"
              disabled={isExporting}
              onClick={() => {
                if (!currentUser) {
                  handleSignIn();
                } else {
                  setShowConfirmDialog(true);
                }
              }}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-lg shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>
                {!currentUser ? 'Sign in to Export' : 'Generate Google Sheet'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
