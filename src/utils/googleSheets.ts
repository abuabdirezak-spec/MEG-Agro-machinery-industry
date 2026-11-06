import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  WeeklyTask, 
  PreventiveMaintenanceItem, 
  DepartmentEvaluation, 
  CapacityAndScrap, 
  DepartmentBudget, 
  MachineOEE, 
  ActionableRecommendation 
} from '../types/dashboard.ts';
import { getDepartmentName } from './formatters.ts';

// Initialize or reuse Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider with Google Sheets & Drive scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory access token caching (Never store tokens in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else if (!isSigningIn) {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google OAuth access token');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in failed:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const signOutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface PlantExportData {
  tasks: WeeklyTask[];
  maintenance: PreventiveMaintenanceItem[];
  evaluations: DepartmentEvaluation[];
  capacityScrap: CapacityAndScrap[];
  budgets: DepartmentBudget[];
  machines: MachineOEE[];
  recommendations: ActionableRecommendation[];
}

/**
 * Creates a complete multi-sheet Google Spreadsheet with MEG Plant data.
 */
export const createGoogleSpreadsheet = async (
  title: string,
  data: PlantExportData
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Please sign in with Google to export to Google Sheets.');
  }

  // 1. Create Spreadsheet with initial sheets
  const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title || `MEG Agro-Machinery Operations - ${new Date().toISOString().split('T')[0]}`,
      },
      sheets: [
        { properties: { title: 'Executive Overview', tabColor: { red: 0.1, green: 0.4, blue: 0.8 } } },
        { properties: { title: 'Weekly Task Registry', tabColor: { red: 0.1, green: 0.7, blue: 0.4 } } },
        { properties: { title: 'Preventive Maintenance', tabColor: { red: 0.9, green: 0.5, blue: 0.1 } } },
        { properties: { title: 'Department Evaluations', tabColor: { red: 0.6, green: 0.2, blue: 0.8 } } },
        { properties: { title: 'Equipment OEE & Scrap', tabColor: { red: 0.8, green: 0.2, blue: 0.2 } } },
      ],
    }),
  });

  if (!createResponse.ok) {
    const errorBody = await createResponse.json().catch(() => ({}));
    throw new Error(errorBody.error?.message || `Failed to create spreadsheet: HTTP ${createResponse.status}`);
  }

  const createdSpreadsheet = await createResponse.json();
  const spreadsheetId = createdSpreadsheet.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare Tab Data
  // Tab 1: Executive Overview
  const overviewValues = [
    ['MEG Agro-Machinery Industry · Executive Operations Dashboard'],
    ['Export Timestamp', new Date().toLocaleString()],
    ['Active Departments', '13 Official Departments'],
    [],
    ['KEY PERFORMANCE INDICATORS (KPIs)'],
    ['Metric', 'Value', 'Status / Benchmark'],
    ['Total Registered Tasks', data.tasks.length, 'Live registry'],
    ['Completed Tasks', data.tasks.filter((t) => t.status === 'Completed').length, `${((data.tasks.filter((t) => t.status === 'Completed').length / (data.tasks.length || 1)) * 100).toFixed(1)}% Completed`],
    ['Overdue / Delayed Tasks', data.tasks.filter((t) => t.status === 'Overdue' || t.status === 'Delayed').length, 'Requires Immediate Action'],
    ['Equipment in Fleet', data.machines.length, 'Tracked OEE Assets'],
    ['Maintenance Items On Schedule', data.maintenance.filter((m) => m.status === 'On Schedule').length, 'Preventive Servicing'],
    ['Total Plant Budget (ETB)', data.budgets.reduce((acc, b) => acc + b.plannedBudgetETB, 0), 'ETB'],
    ['Total Plant Actual Spend (ETB)', data.budgets.reduce((acc, b) => acc + b.actualSpendETB, 0), 'ETB'],
    ['Total Scrap Loss (ETB)', data.capacityScrap.reduce((acc, c) => acc + c.scrapCostETB, 0), 'ETB'],
  ];

  // Tab 2: Weekly Task Registry
  const taskHeaders = [
    'Task ID',
    'Week',
    'Task Name (English)',
    'Task Name (Amharic)',
    'Measurement Unit',
    'Planned Quantity',
    'Actual Quantity',
    'Performance %',
    'Department',
    'Assigned Lead',
    'Priority',
    'Status',
    'Due Date',
    'Variance Notes',
  ];
  const taskRows = data.tasks.map((t) => [
    t.id,
    t.week,
    t.titleEn,
    t.titleAm || t.titleEn,
    t.unit,
    t.plannedQty,
    t.actualQty,
    `${t.plannedQty > 0 ? ((t.actualQty / t.plannedQty) * 100).toFixed(1) : t.progressPercent}%`,
    getDepartmentName(t.departmentId, 'en'),
    t.assignedTo,
    t.priority,
    t.status,
    t.dueDate,
    t.varianceNotes || '',
  ]);
  const taskValues = [taskHeaders, ...taskRows];

  // Tab 3: Preventive Maintenance
  const maintHeaders = [
    'Schedule ID',
    'Equipment ID',
    'Equipment Name',
    'Department',
    'Maintenance Type',
    'Frequency',
    'Technician',
    'Last Service Date',
    'Next Due Date',
    'Criticality',
    'Status',
    'Checklist (EN)',
    'Checklist (AM)',
  ];
  const maintRows = data.maintenance.map((m) => [
    m.id,
    m.equipmentId,
    m.equipmentName,
    getDepartmentName(m.departmentId, 'en'),
    m.maintenanceType,
    m.frequency,
    m.technician,
    m.lastServiceDate,
    m.nextServiceDueDate,
    m.criticality,
    m.status,
    m.checklistEn,
    m.checklistAm || '',
  ]);
  const maintValues = [maintHeaders, ...maintRows];

  // Tab 4: Department Evaluations
  const evalHeaders = [
    'Department',
    'Plan vs Actual (10)',
    'Quality & Scrap (10)',
    'Budget & Cost (10)',
    'Discipline & Reporting (10)',
    'Safety & Kaizen (10)',
    'Total Score (50)',
    'Grade',
    'Documented Strengths',
    'Operational Weaknesses',
  ];
  const evalRows = data.evaluations.map((e) => [
    getDepartmentName(e.departmentId, 'en'),
    e.planVsActual,
    e.qualityScrap,
    e.budgetCost,
    e.disciplineReporting,
    e.safetyKaizen,
    e.totalScore,
    e.grade,
    (e.strengthsEn || []).join('; '),
    (e.weaknessesEn || []).join('; '),
  ]);
  const evalValues = [evalHeaders, ...evalRows];

  // Tab 5: Equipment OEE & Scrap
  const oeeHeaders = [
    'Machine ID',
    'Machine Name',
    'Department',
    'Operator',
    'Availability %',
    'Performance %',
    'Quality %',
    'Total OEE %',
    'Status',
  ];
  const oeeRows = data.machines.map((m) => [
    m.machineId,
    m.nameEn,
    getDepartmentName(m.departmentId, 'en'),
    m.operator,
    `${m.availabilityPct}%`,
    `${m.performancePct}%`,
    `${m.qualityPct}%`,
    `${m.oeePct}%`,
    m.status,
  ]);
  const oeeValues = [oeeHeaders, ...oeeRows];

  // 3. Batch Update data values into each Sheet
  const updateDataPayload = {
    valueInputOption: 'USER_ENTERED',
    data: [
      { range: "'Executive Overview'!A1", values: overviewValues },
      { range: "'Weekly Task Registry'!A1", values: taskValues },
      { range: "'Preventive Maintenance'!A1", values: maintValues },
      { range: "'Department Evaluations'!A1", values: evalValues },
      { range: "'Equipment OEE & Scrap'!A1", values: oeeValues },
    ],
  };

  const updateResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateDataPayload),
    }
  );

  if (!updateResponse.ok) {
    const errorBody = await updateResponse.json().catch(() => ({}));
    throw new Error(errorBody.error?.message || `Failed to populate spreadsheet: HTTP ${updateResponse.status}`);
  }

  return { spreadsheetId, spreadsheetUrl };
};
