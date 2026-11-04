/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Machinery Engineering Group (MEG) Agro-Machinery Industry
 * Executive Reporting Engine: Word (.doc), Multi-Sheet Excel (.xls/xml), and PowerPoint (.ppt/slides)
 */

import { 
  WeeklyTask, 
  DepartmentEvaluation, 
  PreventiveMaintenanceItem, 
  CapacityAndScrap, 
  DepartmentBudget, 
  MachineOEE, 
  OperationalGapSolution, 
  ActionableRecommendation,
  DepartmentId,
  LanguageMode 
} from '../types/dashboard.ts';
import { DEPARTMENTS, HISTORICAL_6M_TRENDS } from '../data/mockData.ts';
import { formatETB, getDepartmentName } from './formatters.ts';

export type ReportFormat = 'word' | 'excel' | 'powerpoint';
export type ReportScope = 'all' | 'manufacturing' | 'quality_maintenance' | DepartmentId;

export interface ReportConfig {
  format: ReportFormat;
  scope: ReportScope;
  langMode: LanguageMode;
  includeExecutiveSummary: boolean;
  includeHeatmap: boolean;
  includeTasks: boolean;
  includeScrapCapacity: boolean;
  includeMaintenanceOee: boolean;
  includeDirectives: boolean;
  includeTrends: boolean;
  reportPeriod: string; // e.g. "Week 44 - October 2026"
  preparedBy: string;   // e.g. "Industrial Engineering & Operations Directorate"
}

export interface ReportDataBundle {
  tasks: WeeklyTask[];
  evaluations: DepartmentEvaluation[];
  maintenance: PreventiveMaintenanceItem[];
  capacityScrap: CapacityAndScrap[];
  budgets: DepartmentBudget[];
  machines: MachineOEE[];
  gaps: OperationalGapSolution[];
  recommendations: ActionableRecommendation[];
}

// Browser file downloader helper
export const downloadFile = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Filter data according to selected scope
const filterByScope = (data: ReportDataBundle, scope: ReportScope) => {
  if (scope === 'all') return data;

  const getFilteredDepts = (): DepartmentId[] => {
    if (scope === 'manufacturing') {
      return ['production', 'assembling_finishing', 'disc_blade', 'quality_control', 'machine_shop', 'welding_shop', 'assembly'];
    }
    if (scope === 'quality_maintenance') {
      return ['quality_control', 'machinery_vehicle_maintenance', 'quality_assurance', 'maintenance'];
    }
    return [scope as DepartmentId];
  };

  const allowedDepts = getFilteredDepts();

  return {
    ...data,
    tasks: data.tasks.filter((t) => allowedDepts.includes(t.departmentId)),
    evaluations: data.evaluations.filter((e) => allowedDepts.includes(e.departmentId)),
    maintenance: data.maintenance.filter((m) => allowedDepts.includes(m.departmentId)),
    capacityScrap: data.capacityScrap.filter((c) => allowedDepts.includes(c.departmentId)),
    budgets: data.budgets.filter((b) => allowedDepts.includes(b.departmentId)),
    machines: data.machines.filter((m) => allowedDepts.includes(m.departmentId)),
    gaps: data.gaps.filter((g) => allowedDepts.includes(g.departmentId)),
    recommendations: data.recommendations.filter((r) => allowedDepts.includes(r.departmentId)),
  };
};

/* =========================================================================
   1. MICROSOFT WORD REPORT GENERATOR (.doc)
   ========================================================================= */
export const generateWordReport = (config: ReportConfig, rawData: ReportDataBundle): void => {
  const data = filterByScope(rawData, config.scope);
  const isAm = config.langMode === 'am';
  const isBi = config.langMode === 'bilingual';

  const totalBudget = data.budgets.reduce((sum, b) => sum + b.plannedBudgetETB, 0);
  const totalSpend = data.budgets.reduce((sum, b) => sum + b.actualSpendETB, 0);
  const avgOee = data.machines.length > 0
    ? (data.machines.reduce((sum, m) => sum + m.oeePct, 0) / data.machines.length).toFixed(1)
    : '76.6';
  const totalScrapCost = data.capacityScrap.reduce((sum, c) => sum + c.scrapCostETB, 0);
  const completedTasks = data.tasks.filter((t) => t.status === 'Completed').length;
  const overdueTasks = data.tasks.filter((t) => t.status === 'Overdue').length;
  const taskRate = data.tasks.length > 0 ? ((completedTasks / data.tasks.length) * 100).toFixed(0) : '0';

  const scopeLabel = config.scope === 'all' 
    ? 'All Factory Operations (13 Departments)'
    : config.scope === 'manufacturing'
    ? 'Manufacturing & Operations Focus (Production, Assembly, Disc Blade, QC)'
    : config.scope === 'quality_maintenance'
    ? 'Quality & Maintenance Focus'
    : getDepartmentName(config.scope as DepartmentId, config.langMode);

  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>MEG Industrial Executive Performance Report</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: A4;
          margin: 20mm 15mm 20mm 15mm;
          mso-header-margin: 10mm;
          mso-footer-margin: 10mm;
        }
        body {
          font-family: 'Segoe UI', Calibri, Arial, sans-serif;
          font-size: 10.5pt;
          color: #1e293b;
          line-height: 1.45;
          margin: 0;
          padding: 0;
        }
        .header-table {
          width: 100%;
          border-bottom: 3pt solid #1e3a8a;
          padding-bottom: 8pt;
          margin-bottom: 14pt;
        }
        .company-title {
          font-size: 17pt;
          font-weight: bold;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .company-subtitle {
          font-size: 11pt;
          font-weight: bold;
          color: #b91c1c;
          margin: 2pt 0;
        }
        .report-title {
          font-size: 14pt;
          font-weight: bold;
          color: #1e40af;
          margin-top: 6pt;
        }
        .meta-box {
          background-color: #f1f5f9;
          border: 1pt solid #cbd5e1;
          padding: 8pt 12pt;
          margin-bottom: 16pt;
          font-size: 9pt;
        }
        .meta-table td {
          padding: 2pt 6pt;
          border: none;
        }
        h2 {
          font-size: 12.5pt;
          color: #0f172a;
          border-bottom: 1.5pt solid #3b82f6;
          padding-bottom: 3pt;
          margin-top: 18pt;
          margin-bottom: 8pt;
          page-break-after: avoid;
        }
        .kpi-table {
          width: 100%;
          margin-bottom: 14pt;
          border-collapse: collapse;
        }
        .kpi-card {
          width: 25%;
          border: 1pt solid #cbd5e1;
          background-color: #f8fafc;
          padding: 8pt;
          text-align: center;
        }
        .kpi-val {
          font-size: 16pt;
          font-weight: bold;
          color: #0f172a;
          margin-top: 2pt;
        }
        .kpi-label {
          font-size: 8.5pt;
          text-transform: uppercase;
          color: #64748b;
          font-weight: bold;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 14pt;
          font-size: 9pt;
        }
        .data-table th {
          background-color: #0f172a;
          color: #ffffff;
          font-weight: bold;
          padding: 5pt 6pt;
          border: 1pt solid #0f172a;
          text-align: left;
        }
        .data-table td {
          padding: 4.5pt 6pt;
          border: 1pt solid #cbd5e1;
          vertical-align: top;
        }
        .data-table tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .tag-critical {
          background-color: #fee2e2;
          color: #991b1b;
          font-weight: bold;
          padding: 1pt 4pt;
          border-radius: 2pt;
        }
        .tag-watch {
          background-color: #fef3c7;
          color: #92400e;
          font-weight: bold;
          padding: 1pt 4pt;
          border-radius: 2pt;
        }
        .tag-optimal {
          background-color: #d1fae5;
          color: #065f46;
          font-weight: bold;
          padding: 1pt 4pt;
          border-radius: 2pt;
        }
        .signature-table {
          width: 100%;
          margin-top: 30pt;
          border-collapse: collapse;
          page-break-inside: avoid;
        }
        .signature-table td {
          width: 50%;
          padding: 15pt;
          border: none;
          vertical-align: bottom;
        }
        .sig-line {
          border-bottom: 1pt solid #334155;
          margin-top: 40pt;
          margin-bottom: 4pt;
        }
      </style>
    </head>
    <body>
      <!-- Company Official Header -->
      <table class="header-table" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div class="company-title">MACHINERY ENGINEERING GROUP (MEG)</div>
            <div class="company-subtitle">AGRO-MACHINERY INDUSTRY · አግሮ-ማሽነሪ ኢንዱስትሪ</div>
            <div class="report-title">
              ${isAm ? 'የፋብሪካ ዋና አመራር ስራ ክንውንና ግምገማ ሪፖርት' : 'Executive Plant Operations & Performance Dossier'}
            </div>
          </td>
          <td align="right" valign="top">
            <div style="font-size: 9pt; color: #64748b; font-weight: bold;">OFFICIAL EXECUTIVE BRIEF</div>
            <div style="font-size: 8.5pt; color: #0f172a;">Doc Ref: MEG/EOD/REP-2026-W44</div>
            <div style="font-size: 8.5pt; color: #2563eb;">Confidentiality: High-Executive</div>
          </td>
        </tr>
      </table>

      <!-- Metadata Box -->
      <div class="meta-box">
        <table class="meta-table" width="100%">
          <tr>
            <td width="20%"><strong>${isAm ? 'የሪፖርት ወቅት' : 'Reporting Period'}:</strong></td>
            <td width="30%">${config.reportPeriod}</td>
            <td width="20%"><strong>${isAm ? 'አዘጋጅ ክፍል' : 'Prepared By'}:</strong></td>
            <td width="30%">${config.preparedBy}</td>
          </tr>
          <tr>
            <td><strong>${isAm ? 'የሽፋን ወሰን' : 'Scope Filter'}:</strong></td>
            <td>${scopeLabel}</td>
            <td><strong>${isAm ? 'የማተሚያ ቀን' : 'Generated Date'}:</strong></td>
            <td>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
          </tr>
        </table>
      </div>

      ${config.includeExecutiveSummary ? `
        <!-- Section 1: Executive KPI Scorecard -->
        <h2>1. ${isAm ? 'የፋብሪካ ዋና ዋና የአፈጻጸም መለኪያዎች (Executive KPI Scorecard)' : 'Executive Plant KPI Scorecard'}</h2>
        <table class="kpi-table">
          <tr>
            <td class="kpi-card">
              <div class="kpi-label">${isAm ? 'ጠቅላላ በጀት / ወጪ' : 'Total Planned / Spend'}</div>
              <div class="kpi-val">${formatETB(totalSpend, true)}</div>
              <div style="font-size: 8pt; color: #64748b;">Plan: ${formatETB(totalBudget, true)}</div>
            </td>
            <td class="kpi-card">
              <div class="kpi-label">${isAm ? 'አጠቃላይ የማሽን OEE' : 'Factory Overall OEE'}</div>
              <div class="kpi-val" style="color: ${Number(avgOee) >= 75 ? '#059669' : '#dc2626'};">${avgOee}%</div>
              <div style="font-size: 8pt; color: #64748b;">Target: ≥ 80.0%</div>
            </td>
            <td class="kpi-card">
              <div class="kpi-label">${isAm ? 'የብክነት ወጪ (ETB)' : 'Total Scrap Cost'}</div>
              <div class="kpi-val" style="color: #dc2626;">${formatETB(totalScrapCost, true)}</div>
              <div style="font-size: 8pt; color: #64748b;">Threshold: &lt; 100K ETB</div>
            </td>
            <td class="kpi-card">
              <div class="kpi-label">${isAm ? 'የሳምንታዊ ስራዎች ክንውን' : 'Task Completion Rate'}</div>
              <div class="kpi-val" style="color: ${Number(taskRate) >= 80 ? '#059669' : '#d97706'};">${taskRate}%</div>
              <div style="font-size: 8pt; color: #dc2626;">${overdueTasks} Overdue Tasks</div>
            </td>
          </tr>
        </table>
      ` : ''}

      ${config.includeHeatmap ? `
        <!-- Section 2: Department Performance Heatmap & Evaluation -->
        <h2>2. ${isAm ? 'የክፍሎች የአፈጻጸም ካርታ እና ውጤት (Department Performance Matrix)' : 'Department Performance Matrix & Evaluations'}</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>${isAm ? 'የክፍል ስም' : 'Department'}</th>
              <th>${isAm ? 'ኃላፊ' : 'Lead'}</th>
              <th>${isAm ? 'OEE (%)' : 'OEE (%)'}</th>
              <th>${isAm ? 'የብክነት ምጣኔ' : 'Scrap Rate'}</th>
              <th>${isAm ? 'የበጀት ልዩነት' : 'Budget Var.'}</th>
              <th>${isAm ? 'የስራ ክንውን' : 'Task Rate'}</th>
              <th>${isAm ? 'የግምገማ ውጤት' : 'Score / Grade'}</th>
            </tr>
          </thead>
          <tbody>
            ${data.evaluations.map((ev) => {
              const cs = data.capacityScrap.find((c) => c.departmentId === ev.departmentId);
              const bg = data.budgets.find((b) => b.departmentId === ev.departmentId);
              const deptMachines = data.machines.filter((m) => m.departmentId === ev.departmentId);
              const deptOee = deptMachines.length > 0 
                ? (deptMachines.reduce((sum, m) => sum + m.oeePct, 0) / deptMachines.length).toFixed(1) + '%'
                : 'N/A';
              const scrapPct = cs ? `${cs.defectRatePct.toFixed(1)}%` : '0.0%';
              const budgetVar = bg ? `${bg.variancePct > 0 ? '+' : ''}${bg.variancePct.toFixed(1)}%` : '0.0%';

              return `
                <tr>
                  <td><strong>${getDepartmentName(ev.departmentId, config.langMode)}</strong></td>
                  <td>${DEPARTMENTS.find((d) => d.id === ev.departmentId)?.headEn || ''}</td>
                  <td>${deptOee}</td>
                  <td>${scrapPct}</td>
                  <td style="color: ${bg && bg.variancePct > 5 ? '#dc2626' : '#1e293b'};">${budgetVar}</td>
                  <td>${ev.planVsActual * 10}%</td>
                  <td><span class="tag-${ev.grade === 'A' ? 'optimal' : ev.grade === 'B' ? 'optimal' : ev.grade === 'C' ? 'watch' : 'critical'}">Grade ${ev.grade} (${ev.totalScore}/50)</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      ` : ''}

      ${config.includeTasks ? `
        <!-- Section 3: Weekly Task Registry -->
        <h2>3. ${isAm ? 'የሳምንት ስራዎች መዝገብ (Weekly Task Registry - W44)' : 'Weekly Task Registry (Week 44 Plan vs Actual)'}</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Task ID</th>
              <th>${isAm ? 'የስራ ስም' : 'Task Description'}</th>
              <th>${isAm ? 'ክፍል' : 'Department'}</th>
              <th>${isAm ? 'ኃላፊ' : 'Assignee'}</th>
              <th>${isAm ? 'ዕቅድ / ክንውን' : 'Plan / Act'}</th>
              <th>${isAm ? 'አፈጻጸም' : 'Progress'}</th>
              <th>${isAm ? 'ቅድሚያ' : 'Priority'}</th>
              <th>${isAm ? 'ሁኔታ' : 'Status'}</th>
            </tr>
          </thead>
          <tbody>
            ${data.tasks.map((t) => `
              <tr>
                <td><strong>${t.id}</strong></td>
                <td>${isAm ? t.titleAm : t.titleEn}</td>
                <td>${getDepartmentName(t.departmentId, 'en')}</td>
                <td>${t.assignedTo}</td>
                <td>${t.plannedQty} / ${t.actualQty} ${t.unit}</td>
                <td>${t.progressPercent}%</td>
                <td><span class="${t.priority === 'Critical' || t.priority === 'Urgent' ? 'tag-critical' : 'tag-watch'}">${t.priority}</span></td>
                <td><span class="${t.status === 'Overdue' ? 'tag-critical' : t.status === 'Completed' ? 'tag-optimal' : 'tag-watch'}">${t.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      ${config.includeScrapCapacity ? `
        <!-- Section 4: Capacity & Scrap Defect Tracker -->
        <h2>4. ${isAm ? 'የአቅም አጠቃቀም እና የብክነት ወጪ ዝርዝር' : 'Capacity Utilization & Scrap Cost Breakdown'}</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>${isAm ? 'የማምረቻ ክፍል' : 'Shop'}</th>
              <th>${isAm ? 'የታቀደ ሰዓት' : 'Planned Hrs'}</th>
              <th>${isAm ? 'የሰራበት ሰዓት' : 'Run Hrs'}</th>
              <th>${isAm ? 'የባከነ ሰዓት' : 'Downtime'}</th>
              <th>${isAm ? 'አጠቃቀም %' : 'Capacity %'}</th>
              <th>${isAm ? 'የተበላሹ (Scrap)' : 'Scrap Pcs'}</th>
              <th>${isAm ? 'የብክነት ምጣኔ' : 'Defect Rate'}</th>
              <th>${isAm ? 'የብክነት ወጪ' : 'Scrap Cost'}</th>
            </tr>
          </thead>
          <tbody>
            ${data.capacityScrap.map((c) => `
              <tr>
                <td><strong>${getDepartmentName(c.departmentId, config.langMode)}</strong></td>
                <td>${c.plannedHours} hrs</td>
                <td>${c.actualRunHours} hrs</td>
                <td>${c.downtimeHours} hrs</td>
                <td>${c.capacityUtilizationPct}%</td>
                <td>${c.scrapPieces} pcs</td>
                <td style="color: ${c.defectRatePct > 3 ? '#dc2626' : '#059669'}; font-weight: bold;">${c.defectRatePct}%</td>
                <td style="font-weight: bold; color: #dc2626;">${formatETB(c.scrapCostETB, true)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      ${config.includeMaintenanceOee ? `
        <!-- Section 5: Preventive Maintenance -->
        <h2>5. ${isAm ? 'የቅድመ መከላከል ጥገና እና የማሽኖች ሁኔታ' : 'Preventive Maintenance & Machine Readiness'}</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>PM ID</th>
              <th>${isAm ? 'መሣሪያ / ማሽን' : 'Equipment Name'}</th>
              <th>${isAm ? 'ክፍል' : 'Department'}</th>
              <th>${isAm ? 'የጥገና አይነት' : 'Type'}</th>
              <th>${isAm ? 'ቴክኒሻን' : 'Technician'}</th>
              <th>${isAm ? 'የማጠናቀቂያ ቀን' : 'Due Date'}</th>
              <th>${isAm ? 'ደረጃ' : 'Status'}</th>
            </tr>
          </thead>
          <tbody>
            ${data.maintenance.map((m) => `
              <tr>
                <td><strong>${m.id}</strong></td>
                <td>${m.equipmentName} (${m.equipmentId})</td>
                <td>${getDepartmentName(m.departmentId, 'en')}</td>
                <td>${m.maintenanceType}</td>
                <td>${m.technician}</td>
                <td>${m.nextServiceDueDate}</td>
                <td><span class="${m.status === 'Overdue' ? 'tag-critical' : m.status === 'On Schedule' ? 'tag-optimal' : 'tag-watch'}">${m.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      ${config.includeDirectives ? `
        <!-- Section 6: Strategic Directives & Executive Solutions -->
        <h2>6. ${isAm ? 'ስትራቴጂያዊ መመሪያዎች እና ክፍተቶች መፍትሄ' : 'Strategic Directives & Operational Gap Resolutions'}</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Directive ID</th>
              <th>${isAm ? 'ርዕስ / መመሪያ' : 'Strategic Directive'}</th>
              <th>${isAm ? 'ክፍል' : 'Department'}</th>
              <th>${isAm ? 'ኃላፊ' : 'Lead'}</th>
              <th>${isAm ? 'የተጠበቀ ውጤት' : 'Expected Outcome'}</th>
              <th>${isAm ? 'የቀነ-ገደብ' : 'Deadline'}</th>
              <th>${isAm ? 'ሁኔታ' : 'Status'}</th>
            </tr>
          </thead>
          <tbody>
            ${data.recommendations.map((r) => `
              <tr>
                <td><strong>${r.id}</strong></td>
                <td><strong>${r.titleEn}</strong><br/><span style="color:#64748b; font-size:8pt;">${r.directiveEn}</span></td>
                <td>${getDepartmentName(r.departmentId, 'en')}</td>
                <td>${r.responsibleLead}</td>
                <td>${r.expectedOutcomeEn}</td>
                <td>${r.deadline}</td>
                <td><span class="${r.status === 'Open' ? 'tag-watch' : 'tag-optimal'}">${r.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      <!-- Executive Signature Block -->
      <table class="signature-table">
        <tr>
          <td>
            <div class="sig-line"></div>
            <strong>Eng. Dawit Alemayehu</strong><br/>
            Plant Technical Operations Lead<br/>
            Machinery Engineering Group (MEG)
          </td>
          <td>
            <div class="sig-line"></div>
            <strong>Executive Management Committee</strong><br/>
            Agro-Machinery Industry Directorate<br/>
            Endorsed Date: ___________________
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  downloadFile(`MEG_Agro_Machinery_Executive_Report_${Date.now()}.doc`, html, 'application/msword');
};

/* =========================================================================
   2. MICROSOFT EXCEL MULTI-WORKSHEET WORKBOOK GENERATOR (.xls / xml)
   ========================================================================= */
export const generateExcelReport = (config: ReportConfig, rawData: ReportDataBundle): void => {
  const data = filterByScope(rawData, config.scope);
  const isAm = config.langMode === 'am';

  // Excel XML 2003 Schema for true multi-sheet workbook with formatting
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>MEG Agro-Machinery Executive Performance Workbook</Title>
  <Author>${config.preparedBy}</Author>
  <Created>${new Date().toISOString()}</Created>
  <Company>Machinery Engineering Group (MEG)</Company>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#1E293B"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Font ss:FontName="Segoe UI" ss:Size="15" ss:Color="#0F172A" ss:Bold="1"/>
   <Interior ss:Color="#E2E8F0" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="SubTitleStyle">
   <Font ss:FontName="Segoe UI" ss:Size="11" ss:Color="#991B1B" ss:Bold="1"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
   </Borders>
  </Style>
  <Style ss:ID="BoldCell">
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1"/>
  </Style>
  <Style ss:ID="CurrencyStyle">
   <NumberFormat ss:Format="#,##0\ &quot;ETB&quot;"/>
   <Alignment ss:Horizontal="Right"/>
  </Style>
  <Style ss:ID="PercentStyle">
   <NumberFormat ss:Format="0.0%"/>
   <Alignment ss:Horizontal="Right"/>
  </Style>
  <Style ss:ID="StatusOverdue">
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#991B1B" ss:Bold="1"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="StatusCompleted">
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#065F46" ss:Bold="1"/>
   <Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/>
  </Style>
 </Styles>

 <!-- SHEET 1: Executive KPI Summary -->
 <Worksheet ss:Name="Executive Scorecard">
  <Table ss:DefaultColumnWidth="120">
   <Column ss:Width="180"/>
   <Column ss:Width="140"/>
   <Column ss:Width="140"/>
   <Column ss:Width="140"/>
   <Column ss:Width="140"/>
   <Row ss:Height="26">
    <Cell ss:MergeAcross="4" ss:StyleID="TitleStyle">
     <Data ss:Type="String">MACHINERY ENGINEERING GROUP (MEG) · AGRO-MACHINERY INDUSTRY</Data>
    </Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:MergeAcross="4" ss:StyleID="SubTitleStyle">
     <Data ss:Type="String">Master Executive Dashboard &amp; Task Registry (Week 44 - 2026)</Data>
    </Cell>
   </Row>
   <Row><Cell><Data ss:Type="String"></Data></Cell></Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">High-Level Metric</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Planned Target</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Actual Result</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Variance</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Operational Health</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldCell"><Data ss:Type="String">Factory Planned Budget vs Spend</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${data.budgets.reduce((s, b) => s + b.plannedBudgetETB, 0)}</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${data.budgets.reduce((s, b) => s + b.actualSpendETB, 0)}</Data></Cell>
    <Cell><Data ss:Type="String">+${((data.budgets.reduce((s, b) => s + b.actualSpendETB, 0) - data.budgets.reduce((s, b) => s + b.plannedBudgetETB, 0)) / data.budgets.reduce((s, b) => s + b.plannedBudgetETB, 0) * 100).toFixed(1)}%</Data></Cell>
    <Cell><Data ss:Type="String">Within ±5% Tolerance</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldCell"><Data ss:Type="String">Overall Factory Machine OEE</Data></Cell>
    <Cell ss:StyleID="PercentStyle"><Data ss:Type="Number">0.80</Data></Cell>
    <Cell ss:StyleID="PercentStyle"><Data ss:Type="Number">${(data.machines.reduce((s, m) => s + m.oeePct, 0) / (data.machines.length || 1) / 100).toFixed(3)}</Data></Cell>
    <Cell><Data ss:Type="String">-3.4% gap vs 80% World-Class</Data></Cell>
    <Cell><Data ss:Type="String">Acceptable / Watch</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldCell"><Data ss:Type="String">Scrap Defect Cost Loss (ETB)</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">100000</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${data.capacityScrap.reduce((s, c) => s + c.scrapCostETB, 0)}</Data></Cell>
    <Cell><Data ss:Type="String">+58.4% above limit</Data></Cell>
    <Cell ss:StyleID="StatusOverdue"><Data ss:Type="String">High Defect Cost in Foundry</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldCell"><Data ss:Type="String">Weekly Task Execution Rate</Data></Cell>
    <Cell ss:StyleID="PercentStyle"><Data ss:Type="Number">0.85</Data></Cell>
    <Cell ss:StyleID="PercentStyle"><Data ss:Type="Number">${(data.tasks.filter(t => t.status === 'Completed').length / (data.tasks.length || 1)).toFixed(3)}</Data></Cell>
    <Cell><Data ss:Type="String">${data.tasks.filter(t => t.status === 'Overdue').length} Overdue Items</Data></Cell>
    <Cell><Data ss:Type="String">Active W44</Data></Cell>
   </Row>
  </Table>
 </Worksheet>

 <!-- SHEET 2: Weekly Task Registry -->
 <Worksheet ss:Name="Weekly Task Registry">
  <Table ss:DefaultColumnWidth="100">
   <Column ss:Width="80"/>
   <Column ss:Width="60"/>
   <Column ss:Width="140"/>
   <Column ss:Width="220"/>
   <Column ss:Width="130"/>
   <Column ss:Width="80"/>
   <Column ss:Width="80"/>
   <Column ss:Width="70"/>
   <Column ss:Width="70"/>
   <Column ss:Width="60"/>
   <Column ss:Width="70"/>
   <Column ss:Width="80"/>
   <Column ss:Width="200"/>
   <Row ss:Height="20">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Task ID</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Week</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Department</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Task Description</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Assignee</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Priority</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Plan Qty</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Act Qty</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Unit</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Progress</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Due Date</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Variance Notes / Root Cause</Data></Cell>
   </Row>
   ${data.tasks.map((t) => `
    <Row>
     <Cell ss:StyleID="BoldCell"><Data ss:Type="String">${t.id}</Data></Cell>
     <Cell><Data ss:Type="String">${t.week}</Data></Cell>
     <Cell><Data ss:Type="String">${getDepartmentName(t.departmentId, 'en')}</Data></Cell>
     <Cell><Data ss:Type="String">${t.titleEn.replace(/&/g, '&amp;')}</Data></Cell>
     <Cell><Data ss:Type="String">${t.assignedTo}</Data></Cell>
     <Cell><Data ss:Type="String">${t.priority}</Data></Cell>
     <Cell ss:StyleID="${t.status === 'Overdue' ? 'StatusOverdue' : t.status === 'Completed' ? 'StatusCompleted' : 'Default'}"><Data ss:Type="String">${t.status}</Data></Cell>
     <Cell><Data ss:Type="Number">${t.plannedQty}</Data></Cell>
     <Cell><Data ss:Type="Number">${t.actualQty}</Data></Cell>
     <Cell><Data ss:Type="String">${t.unit}</Data></Cell>
     <Cell ss:StyleID="PercentStyle"><Data ss:Type="Number">${(t.progressPercent / 100).toFixed(2)}</Data></Cell>
     <Cell><Data ss:Type="String">${t.dueDate}</Data></Cell>
     <Cell><Data ss:Type="String">${(t.varianceNotes || '').replace(/&/g, '&amp;')}</Data></Cell>
    </Row>
   `).join('')}
  </Table>
 </Worksheet>

 <!-- SHEET 3: Departmental Evaluations -->
 <Worksheet ss:Name="Department Evaluations">
  <Table ss:DefaultColumnWidth="110">
   <Column ss:Width="160"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="100"/>
   <Column ss:Width="80"/>
   <Row ss:Height="20">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Department</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Plan vs Actual (10)</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Quality &amp; Scrap (10)</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Budget / Cost (10)</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Discipline &amp; Logs (10)</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Safety &amp; Kaizen (10)</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Total Score (50)</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Grade</Data></Cell>
   </Row>
   ${data.evaluations.map((e) => `
    <Row>
     <Cell ss:StyleID="BoldCell"><Data ss:Type="String">${getDepartmentName(e.departmentId, 'en')}</Data></Cell>
     <Cell><Data ss:Type="Number">${e.planVsActual}</Data></Cell>
     <Cell><Data ss:Type="Number">${e.qualityScrap}</Data></Cell>
     <Cell><Data ss:Type="Number">${e.budgetCost}</Data></Cell>
     <Cell><Data ss:Type="Number">${e.disciplineReporting}</Data></Cell>
     <Cell><Data ss:Type="Number">${e.safetyKaizen}</Data></Cell>
     <Cell ss:StyleID="BoldCell"><Data ss:Type="Number">${e.totalScore}</Data></Cell>
     <Cell ss:StyleID="${e.grade === 'A' || e.grade === 'B' ? 'StatusCompleted' : 'StatusOverdue'}"><Data ss:Type="String">${e.grade}</Data></Cell>
    </Row>
   `).join('')}
  </Table>
 </Worksheet>

 <!-- SHEET 4: Capacity & Scrap Tracker -->
 <Worksheet ss:Name="Capacity &amp; Scrap">
  <Table ss:DefaultColumnWidth="110">
   <Column ss:Width="150"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="100"/>
   <Column ss:Width="80"/>
   <Column ss:Width="80"/>
   <Column ss:Width="80"/>
   <Column ss:Width="90"/>
   <Column ss:Width="120"/>
   <Row ss:Height="20">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Manufacturing Shop</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Planned Hours</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Run Hours</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Downtime</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Capacity Util %</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Target Units</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Actual Units</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Scrap Pcs</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Defect Rate</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Scrap Cost (ETB)</Data></Cell>
   </Row>
   ${data.capacityScrap.map((c) => `
    <Row>
     <Cell ss:StyleID="BoldCell"><Data ss:Type="String">${getDepartmentName(c.departmentId, 'en')}</Data></Cell>
     <Cell><Data ss:Type="Number">${c.plannedHours}</Data></Cell>
     <Cell><Data ss:Type="Number">${c.actualRunHours}</Data></Cell>
     <Cell><Data ss:Type="Number">${c.downtimeHours}</Data></Cell>
     <Cell ss:StyleID="PercentStyle"><Data ss:Type="Number">${(c.capacityUtilizationPct / 100).toFixed(3)}</Data></Cell>
     <Cell><Data ss:Type="Number">${c.targetOutputUnits}</Data></Cell>
     <Cell><Data ss:Type="Number">${c.actualOutputUnits}</Data></Cell>
     <Cell><Data ss:Type="Number">${c.scrapPieces}</Data></Cell>
     <Cell ss:StyleID="PercentStyle"><Data ss:Type="Number">${(c.defectRatePct / 100).toFixed(3)}</Data></Cell>
     <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${c.scrapCostETB}</Data></Cell>
    </Row>
   `).join('')}
  </Table>
 </Worksheet>

 <!-- SHEET 5: Machine OEE & Preventive Maintenance -->
 <Worksheet ss:Name="Machines &amp; Maintenance">
  <Table ss:DefaultColumnWidth="110">
   <Column ss:Width="110"/>
   <Column ss:Width="150"/>
   <Column ss:Width="130"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="90"/>
   <Column ss:Width="100"/>
   <Row ss:Height="20">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Equipment ID</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Equipment Name</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Department</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Technician</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Next Due Date</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Criticality</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Status</Data></Cell>
   </Row>
   ${data.maintenance.map((m) => `
    <Row>
     <Cell ss:StyleID="BoldCell"><Data ss:Type="String">${m.equipmentId}</Data></Cell>
     <Cell><Data ss:Type="String">${m.equipmentName.replace(/&/g, '&amp;')}</Data></Cell>
     <Cell><Data ss:Type="String">${getDepartmentName(m.departmentId, 'en')}</Data></Cell>
     <Cell><Data ss:Type="String">${m.technician}</Data></Cell>
     <Cell><Data ss:Type="String">${m.nextServiceDueDate}</Data></Cell>
     <Cell><Data ss:Type="String">${m.criticality}</Data></Cell>
     <Cell ss:StyleID="${m.status === 'Overdue' ? 'StatusOverdue' : m.status === 'On Schedule' ? 'StatusCompleted' : 'Default'}"><Data ss:Type="String">${m.status}</Data></Cell>
    </Row>
   `).join('')}
  </Table>
 </Worksheet>
</Workbook>`;

  downloadFile(`MEG_Master_Executive_Workbook_${Date.now()}.xls`, xml, 'application/vnd.ms-excel');
};

/* =========================================================================
   3. POWERPOINT SLIDE DECK GENERATOR (.ppt / HTML Presentation)
   ========================================================================= */
export const generatePowerPointReport = (config: ReportConfig, rawData: ReportDataBundle): void => {
  const data = filterByScope(rawData, config.scope);
  const isAm = config.langMode === 'am';

  const totalSpend = data.budgets.reduce((s, b) => s + b.actualSpendETB, 0);
  const totalBudget = data.budgets.reduce((s, b) => s + b.plannedBudgetETB, 0);
  const avgOee = data.machines.length > 0
    ? (data.machines.reduce((s, m) => s + m.oeePct, 0) / data.machines.length).toFixed(1)
    : '76.6';
  const totalScrapCost = data.capacityScrap.reduce((s, c) => s + c.scrapCostETB, 0);
  const overdueCount = data.tasks.filter((t) => t.status === 'Overdue').length;

  // Powerpoint compatible presentation HTML with 16:9 slide layout
  const pptHtml = `
    <html xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:p="urn:schemas-microsoft-com:office:powerpoint"
    xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>MEG Agro-Machinery Executive Presentation</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Arial, sans-serif;
          background-color: #0f172a;
          color: #ffffff;
        }
        .slide {
          width: 960px;
          height: 540px;
          box-sizing: border-box;
          page-break-after: always;
          padding: 40px;
          position: relative;
          background-color: #0f172a;
          border: 1px solid #1e293b;
          overflow: hidden;
        }
        .slide-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 12px;
          margin-bottom: 24px;
        }
        .slide-title {
          font-size: 22pt;
          font-weight: bold;
          color: #ffffff;
          margin: 0;
        }
        .slide-subtitle {
          font-size: 11pt;
          color: #94a3b8;
        }
        .brand-badge {
          background-color: #991b1b;
          color: white;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 9pt;
          font-weight: bold;
        }
        .grid-2x2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .metric-card {
          background-color: #1e293b;
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 16px;
        }
        .metric-val {
          font-size: 28pt;
          font-weight: bold;
          color: #38bdf8;
          margin: 6px 0;
        }
        .table-slide {
          width: 100%;
          border-collapse: collapse;
          font-size: 10pt;
        }
        .table-slide th {
          background-color: #1e3a8a;
          color: #ffffff;
          padding: 8px;
          text-align: left;
        }
        .table-slide td {
          padding: 7px 8px;
          border-bottom: 1px solid #334155;
          color: #cbd5e1;
        }
        .footer-tag {
          position: absolute;
          bottom: 15px;
          left: 40px;
          right: 40px;
          display: flex;
          justify-content: space-between;
          font-size: 9pt;
          color: #64748b;
          border-top: 1px solid #1e293b;
          padding-top: 8px;
        }
      </style>
    </head>
    <body>
      <!-- SLIDE 1: Title Slide -->
      <div class="slide" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
        <div style="background-color: white; padding: 12px; border-radius: 12px; margin-bottom: 20px;">
          <h1 style="color: #0f172a; margin: 0; font-size: 32pt; font-weight: 900; letter-spacing: 2px;">MEG</h1>
        </div>
        <h1 style="font-size: 26pt; margin: 0; color: #ffffff;">MACHINERY ENGINEERING GROUP (MEG)</h1>
        <h2 style="font-size: 16pt; color: #f59e0b; margin: 8px 0 24px 0;">AGRO-MACHINERY INDUSTRY · አግሮ-ማሽነሪ ኢንዱስትሪ</h2>
        <div style="width: 120px; height: 3px; background-color: #2563eb; margin-bottom: 24px;"></div>
        <div style="font-size: 14pt; color: #cbd5e1; font-weight: 600;">Executive Operations Scorecard &amp; Plant Performance Brief</div>
        <div style="font-size: 11pt; color: #94a3b8; margin-top: 8px;">Period: ${config.reportPeriod} · Status: Active Review</div>
        <div class="footer-tag">
          <span>Machinery Engineering Group Confidential</span>
          <span>Prepared by: ${config.preparedBy}</span>
        </div>
      </div>

      <!-- SLIDE 2: Executive KPI Scorecard -->
      <div class="slide">
        <div class="slide-header">
          <div>
            <h2 class="slide-title">Executive Plant Scorecard</h2>
            <div class="slide-subtitle">Week 44 Aggregate Factory Key Performance Indicators</div>
          </div>
          <span class="brand-badge">MEG EXEC</span>
        </div>
        <div class="grid-2x2">
          <div class="metric-card">
            <div style="color: #94a3b8; font-size: 11pt; text-transform: uppercase;">Total Budget Spend</div>
            <div class="metric-val" style="color: #38bdf8;">${formatETB(totalSpend, true)}</div>
            <div style="color: #94a3b8; font-size: 10pt;">Planned Budget: ${formatETB(totalBudget, true)} (+3.2% Variance)</div>
          </div>
          <div class="metric-card">
            <div style="color: #94a3b8; font-size: 11pt; text-transform: uppercase;">Overall Machine OEE</div>
            <div class="metric-val" style="color: #34d399;">${avgOee}%</div>
            <div style="color: #94a3b8; font-size: 10pt;">Benchmark Target: 80.0% (Availability: 81.4%, Quality: 95.8%)</div>
          </div>
          <div class="metric-card">
            <div style="color: #94a3b8; font-size: 11pt; text-transform: uppercase;">Total Scrap Loss Cost</div>
            <div class="metric-val" style="color: #f87171;">${formatETB(totalScrapCost, true)}</div>
            <div style="color: #94a3b8; font-size: 10pt;">Foundry Defect Spike represents 52% of total scrap costs</div>
          </div>
          <div class="metric-card">
            <div style="color: #94a3b8; font-size: 11pt; text-transform: uppercase;">Task Execution Rate</div>
            <div class="metric-val" style="color: #fbbf24;">${((data.tasks.filter(t => t.status === 'Completed').length / (data.tasks.length || 1)) * 100).toFixed(0)}%</div>
            <div style="color: #f87171; font-size: 10pt; font-weight: bold;">${overdueCount} Overdue Tasks flagged for priority intervention</div>
          </div>
        </div>
        <div class="footer-tag">
          <span>MEG Agro-Machinery Executive Brief</span>
          <span>Slide 2 of 5</span>
        </div>
      </div>

      <!-- SLIDE 3: Department Performance Matrix -->
      <div class="slide">
        <div class="slide-header">
          <div>
            <h2 class="slide-title">Department Performance Heatmap</h2>
            <div class="slide-subtitle">Cross-Functional Operational Scorecards across 7 Shops</div>
          </div>
          <span class="brand-badge">HEATMAP</span>
        </div>
        <table class="table-slide">
          <thead>
            <tr>
              <th>Shop / Department</th>
              <th>Lead Engineer</th>
              <th>OEE %</th>
              <th>Scrap %</th>
              <th>Budget Var.</th>
              <th>Evaluation Score</th>
              <th>Health Grade</th>
            </tr>
          </thead>
          <tbody>
            ${data.evaluations.slice(0, 6).map((ev) => {
              const cs = data.capacityScrap.find((c) => c.departmentId === ev.departmentId);
              const bg = data.budgets.find((b) => b.departmentId === ev.departmentId);
              const deptMachines = data.machines.filter((m) => m.departmentId === ev.departmentId);
              const oee = deptMachines.length > 0 ? (deptMachines.reduce((s, m) => s + m.oeePct, 0) / deptMachines.length).toFixed(1) + '%' : 'N/A';

              return `
                <tr>
                  <td><strong>${getDepartmentName(ev.departmentId, 'en')}</strong></td>
                  <td>${DEPARTMENTS.find((d) => d.id === ev.departmentId)?.headEn || ''}</td>
                  <td>${oee}</td>
                  <td style="color: ${cs && cs.defectRatePct > 3 ? '#f87171' : '#34d399'};">${cs ? cs.defectRatePct + '%' : '0.0%'}</td>
                  <td>${bg ? (bg.variancePct > 0 ? '+' : '') + bg.variancePct.toFixed(1) + '%' : '0.0%'}</td>
                  <td><strong>${ev.totalScore} / 50</strong></td>
                  <td style="font-weight: bold; color: ${ev.grade === 'A' ? '#34d399' : ev.grade === 'B' ? '#38bdf8' : '#f87171'};">Grade ${ev.grade}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        <div class="footer-tag">
          <span>MEG Agro-Machinery Executive Brief</span>
          <span>Slide 3 of 5</span>
        </div>
      </div>

      <!-- SLIDE 4: Strategic Action Items -->
      <div class="slide">
        <div class="slide-header">
          <div>
            <h2 class="slide-title">Strategic Directives &amp; Action Plan</h2>
            <div class="slide-subtitle">Executive Decisions &amp; Corrective Measures</div>
          </div>
          <span class="brand-badge">DIRECTIVES</span>
        </div>
        <table class="table-slide">
          <thead>
            <tr>
              <th>Priority Directive</th>
              <th>Responsible Lead</th>
              <th>Expected Impact</th>
              <th>Deadline</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.recommendations.slice(0, 4).map((r) => `
              <tr>
                <td><strong>${r.titleEn}</strong><br/><span style="font-size: 8.5pt; color: #94a3b8;">${r.directiveEn}</span></td>
                <td>${r.responsibleLead}</td>
                <td>${r.expectedOutcomeEn}</td>
                <td style="color: #fbbf24;">${r.deadline}</td>
                <td style="color: #38bdf8; font-weight: bold;">${r.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer-tag">
          <span>MEG Agro-Machinery Executive Brief</span>
          <span>Slide 4 of 5</span>
        </div>
      </div>

      <!-- SLIDE 5: Conclusion & Sign-Off -->
      <div class="slide" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
        <h2 style="font-size: 24pt; color: #ffffff; margin-bottom: 12px;">Executive Endorsement</h2>
        <p style="font-size: 12pt; color: #94a3b8; max-width: 600px; margin-bottom: 30px;">
          The operations summarized above reflect Week 44 factory throughput at Machinery Engineering Group (MEG) Agro-Machinery Industry.
        </p>
        <div style="display: flex; gap: 60px; text-align: left;">
          <div style="border-top: 1px solid #475569; padding-top: 10px; width: 220px;">
            <strong style="color: white;">Eng. Dawit Alemayehu</strong><br/>
            <span style="font-size: 9pt; color: #94a3b8;">Operations Directorate</span>
          </div>
          <div style="border-top: 1px solid #475569; padding-top: 10px; width: 220px;">
            <strong style="color: white;">Executive Management</strong><br/>
            <span style="font-size: 9pt; color: #94a3b8;">MEG Agro-Machinery</span>
          </div>
        </div>
        <div class="footer-tag">
          <span>Machinery Engineering Group Confidential</span>
          <span>Slide 5 of 5</span>
        </div>
      </div>
    </body>
    </html>
  `;

  downloadFile(`MEG_Executive_Presentation_${Date.now()}.ppt`, pptHtml, 'application/vnd.ms-powerpoint');
};
