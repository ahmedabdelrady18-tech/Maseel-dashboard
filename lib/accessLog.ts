import fs from 'fs';
import path from 'path';

const logPath = path.join(process.cwd(), 'data', 'access-logs.json');

export type AccessLog = {
  name: string;
  role: string;
  time: string;
  ip: string;
  country: string;
  city: string;
  userAgent: string;
};

export function saveAccessLog(log: AccessLog) {
  try {
    const dir = path.dirname(logPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const oldLogs = fs.existsSync(logPath)
      ? JSON.parse(fs.readFileSync(logPath, 'utf8') || '[]')
      : [];

    oldLogs.unshift(log);

    fs.writeFileSync(logPath, JSON.stringify(oldLogs.slice(0, 500), null, 2));
  } catch (error) {
    console.error('Access log save error:', error);
  }
}

export function readAccessLogs() {
  try {
    if (!fs.existsSync(logPath)) return [];
    return JSON.parse(fs.readFileSync(logPath, 'utf8') || '[]');
  } catch {
    return [];
  }
}