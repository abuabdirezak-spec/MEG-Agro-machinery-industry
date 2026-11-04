export type LanguageMode = 'en' | 'bilingual' | 'am';

export type ActiveTab = 'overview' | 'departments' | 'tasks' | 'maintenance' | 'trends' | 'recommendations';

export interface MonthlyTrendDataPoint {
  month: string;
  monthShort: string;
  monthAm: string;
  [key: string]: string | number;
}

export type DepartmentId = 
  | 'production'
  | 'assembling_finishing'
  | 'quality_control'
  | 'machinery_vehicle_maintenance'
  | 'marketing'
  | 'human_resource'
  | 'logistics'
  | 'general_service'
  | 'change_mgmt_safety'
  | 'procurement_finance'
  | 'internal_audit'
  | 'ict'
  | 'disc_blade'
  // Legacy aliases
  | 'machine_shop'
  | 'welding_shop'
  | 'maintenance'
  | 'foundry'
  | 'assembly'
  | 'quality_assurance'
  | 'hr_admin';

export interface DepartmentShop {
  id: string;
  nameEn: string;
  nameAm: string;
}

export interface DepartmentInfo {
  id: DepartmentId;
  nameEn: string;
  nameAm: string;
  headEn: string;
  headAm: string;
  operatorCount: number;
  targetCapacity?: number;
  shops?: DepartmentShop[];
  category?: 'Manufacturing & Operations' | 'Maintenance & Tech' | 'Commercial & Supply' | 'Administration & Governance' | 'Governance & Finance';
}

export type TaskStatus = 'Completed' | 'In Progress' | 'Delayed' | 'Overdue';
export type TaskPriority = 'Urgent' | 'Critical' | 'High' | 'Medium' | 'Low';

export interface WeeklyTask {
  id: string; // e.g. TSK-4401
  departmentId: DepartmentId;
  week: string; // e.g. 'W44', 'W45', 'W46'
  titleEn: string;
  titleAm: string;
  assignedTo: string;
  priority: TaskPriority;
  status: TaskStatus;
  progressPercent: number;
  plannedQty: number;
  actualQty: number;
  unit: string;
  dueDate: string;
  completionDate?: string;
  varianceNotes?: string;
}

export interface DepartmentEvaluation {
  departmentId: DepartmentId;
  planVsActual: number; // out of 10
  qualityScrap: number; // out of 10
  budgetCost: number; // out of 10
  disciplineReporting: number; // out of 10
  safetyKaizen: number; // out of 10
  totalScore: number; // out of 50
  grade: 'A' | 'B' | 'C' | 'D';
  strengthsEn: string[];
  strengthsAm: string[];
  weaknessesEn: string[];
  weaknessesAm: string[];
}

export interface CapacityAndScrap {
  departmentId: DepartmentId;
  plannedHours: number;
  actualRunHours: number;
  downtimeHours: number;
  capacityUtilizationPct: number;
  targetOutputUnits: number;
  actualOutputUnits: number;
  scrapPieces: number;
  defectRatePct: number;
  scrapCostETB: number;
  operatorsActive: number;
}

export interface MachineOEE {
  machineId: string; // e.g. CNC-LATHE-01
  nameEn: string;
  nameAm: string;
  departmentId: DepartmentId;
  availabilityPct: number;
  performancePct: number;
  qualityPct: number;
  oeePct: number;
  status: 'Operational' | 'Idle' | 'Maintenance';
  operator: string;
}

export type MaintenanceStatus = 'Overdue' | 'On Schedule' | 'In Progress' | 'Pending Inspection';
export type MaintenanceCriticality = 'Critical' | 'High' | 'Medium';

export interface PreventiveMaintenanceItem {
  id: string; // e.g. PM-204
  equipmentId: string;
  equipmentName: string;
  departmentId: DepartmentId;
  maintenanceType: string;
  frequency: 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'Quarterly';
  technician: string;
  lastServiceDate: string;
  nextServiceDueDate: string;
  criticality: MaintenanceCriticality;
  status: MaintenanceStatus;
  checklistEn: string;
  checklistAm: string;
}

export interface OperationalGapSolution {
  id: string;
  categoryEn: string;
  categoryAm: string;
  gapIdentifiedEn: string;
  gapIdentifiedAm: string;
  rootCauseEn: string;
  rootCauseAm: string;
  executiveSolutionEn: string;
  executiveSolutionAm: string;
  departmentId: DepartmentId;
  impactLevel: 'High' | 'Medium' | 'Critical';
  targetDate: string;
  status: 'In Implementation' | 'Under Review' | 'Resolved';
}

export interface ActionableRecommendation {
  id: string;
  titleEn: string;
  titleAm: string;
  departmentId: DepartmentId;
  responsibleLead: string;
  directiveEn: string;
  directiveAm: string;
  expectedOutcomeEn: string;
  expectedOutcomeAm: string;
  deadline: string;
  priority: 'Immediate' | 'Short-Term' | 'Strategic';
  status: 'Open' | 'In Progress' | 'Closed';
}

export interface DepartmentBudget {
  departmentId: DepartmentId;
  plannedBudgetETB: number;
  actualSpendETB: number;
  varianceETB: number;
  variancePct: number;
}
