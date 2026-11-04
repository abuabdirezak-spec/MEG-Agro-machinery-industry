import { DepartmentId, LanguageMode } from '../types/dashboard.ts';
import { DEPARTMENTS } from '../data/mockData.ts';

export const formatETB = (amount: number, compact: boolean = false): string => {
  if (compact) {
    if (Math.abs(amount) >= 1_000_000) {
      return `ETB ${(amount / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `ETB ${(amount / 1_000).toFixed(1)}K`;
    }
    return `ETB ${amount.toLocaleString()}`;
  }
  return `ETB ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

const LEGACY_DEPT_ALIAS_MAP: Record<string, DepartmentId> = {
  machine_shop: 'production',
  welding_shop: 'production',
  maintenance: 'machinery_vehicle_maintenance',
  foundry: 'disc_blade',
  assembly: 'assembling_finishing',
  quality_assurance: 'quality_control',
  hr_admin: 'human_resource',
};

export const getDepartmentName = (
  deptId: DepartmentId,
  langMode: LanguageMode = 'en'
): string => {
  let dept = DEPARTMENTS.find((d) => d.id === deptId);
  if (!dept && LEGACY_DEPT_ALIAS_MAP[deptId]) {
    dept = DEPARTMENTS.find((d) => d.id === LEGACY_DEPT_ALIAS_MAP[deptId]);
  }
  if (!dept) return deptId;

  if (langMode === 'am') {
    return dept.nameAm;
  }
  if (langMode === 'bilingual') {
    return `${dept.nameEn} (${dept.nameAm})`;
  }
  return dept.nameEn;
};

export const getDepartmentHead = (
  deptId: DepartmentId,
  langMode: LanguageMode = 'en'
): string => {
  let dept = DEPARTMENTS.find((d) => d.id === deptId);
  if (!dept && LEGACY_DEPT_ALIAS_MAP[deptId]) {
    dept = DEPARTMENTS.find((d) => d.id === LEGACY_DEPT_ALIAS_MAP[deptId]);
  }
  if (!dept) return '';
  return langMode === 'am' ? dept.headAm : dept.headEn;
};
