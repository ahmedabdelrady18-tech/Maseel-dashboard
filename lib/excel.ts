import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

const excelPath = path.join(process.cwd(), 'data', 'project-dashboard.xlsx');

function excelDateToISO(value: any) {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return String(value);
    return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
  }
  return String(value);
}

function normalizeRow(row: any) {
  const out: any = {};
  Object.keys(row).forEach((key) => {
    const value = row[key];
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('start') || key.toLowerCase().includes('finish')) {
      out[key] = excelDateToISO(value);
    } else {
      out[key] = value ?? '';
    }
  });
  return out;
}

function sheetRows(workbook: XLSX.WorkBook, sheetName: string) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet, { defval: '' }).map(normalizeRow);
}

export function getDashboardData() {
  if (!fs.existsSync(excelPath)) {
    throw new Error(`Excel file not found at ${excelPath}`);
  }

  const buffer = fs.readFileSync(excelPath);
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });

  const projectInfo = sheetRows(workbook, 'Project_Info')[0] || {};
  const overall = sheetRows(workbook, 'Overall_Progress')[0] || {};
  const phases = sheetRows(workbook, 'Phase_Progress');
  const activities = sheetRows(workbook, 'Activities');
  const delays = sheetRows(workbook, 'Delays');
  const risks = sheetRows(workbook, 'Issues_Risks');
  const photos = sheetRows(workbook, 'Site_Photos');

  const spiRaw = sheetRows(workbook, 'SPI Trend');
  const sCurveRaw = sheetRows(workbook, 'S-Curve');

  return {
    projectInfo,
    overall,
    phases,
    activities,
    delays,
    risks,
    photos,
    spiTrend: spiRaw,
    sCurve: sCurveRaw,
    updatedAt: new Date().toISOString(),
  };
}

export function pct(value: any) {
  const n = Number(value);
  if (Number.isNaN(n)) return '0.00%';
  return `${(n * 100).toFixed(2)}%`;
}
