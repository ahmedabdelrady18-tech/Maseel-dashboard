import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

const excelPath = path.join(process.cwd(), 'data', 'project-dashboard.xlsx');

function excelDateToISO(value: any) {
  if (value === null || value === undefined || value === '') return '';

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

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

    if (
      key.toLowerCase().includes('date') ||
      key.toLowerCase().includes('start') ||
      key.toLowerCase().includes('finish')
    ) {
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

function readSCurve(workbook: XLSX.WorkBook) {
  const sheet = workbook.Sheets['S-Curve'];
  if (!sheet) return [];

  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
    raw: true,
  });

  const headerIndex = rows.findIndex(
    (row) => String(row[0]).trim().toUpperCase() === 'MONTH'
  );

  if (headerIndex === -1) return [];

  const months = rows[headerIndex] || [];
  const planned = rows[headerIndex + 1] || [];
  const cumPlanned = rows[headerIndex + 2] || [];
  const actual = rows[headerIndex + 3] || [];
  const cumActual = rows[headerIndex + 4] || [];

  return months
    .map((month: any, index: number) => {
      if (index === 0 || month === '') return null;

      return {
        month: excelDateToISO(month),
        planned: Number(planned[index] || 0),
        cumPlanned: Number(cumPlanned[index] || 0),
        actual: actual[index] === '' ? null : Number(actual[index] || 0),
        cumActual: cumActual[index] === '' ? null : Number(cumActual[index] || 0),
      };
    })
    .filter(Boolean);
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
  const spiSheet = workbook.Sheets['SPI Trend'];
let spiTrend: any[] = [];

if (spiSheet) {
  const rows: any[][] = XLSX.utils.sheet_to_json(spiSheet, {
    header: 1,
    defval: '',
    raw: true,
  });

  const headerIndex = rows.findIndex(
    (row) => String(row[0]).trim().toLowerCase() === 'month'
  );

  if (headerIndex !== -1) {
    const months = rows[headerIndex] || [];
    const spi = rows[headerIndex + 1] || [];

    spiTrend = months
      .map((month: any, index: number) => {
        if (index === 0 || month === '') return null;

        return {
          month: excelDateToISO(month),
          spi: spi[index] === '' ? null : Number(spi[index] || 0),
        };
      })
      .filter(Boolean);
  }
}
  const sCurve = readSCurve(workbook);

  return {
    projectInfo,
    overall,
    phases,
    activities,
    delays,
    risks,
    photos,
    spiTrend: spiTrend,
    sCurve,
    updatedAt: new Date().toISOString(),
  };
}

export function pct(value: any) {
  const n = Number(value);
  if (Number.isNaN(n)) return '0.00%';
  return `${(n * 100).toFixed(2)}%`;
}