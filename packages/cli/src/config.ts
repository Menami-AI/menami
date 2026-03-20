import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

function configDir(): string {
  return path.join(os.homedir(), '.menami');
}

function configPath(): string {
  return path.join(configDir(), 'config.json');
}

export interface MenamiConfig {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  serverUrl: string;
  defaultCity?: string;
}

export function getConfigPath(): string {
  return configPath();
}

export function loadConfig(): MenamiConfig | null {
  try {
    const p = configPath();
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, 'utf-8');
    return JSON.parse(raw) as MenamiConfig;
  } catch {
    return null;
  }
}

export function saveConfig(config: MenamiConfig): void {
  const dir = configDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  }
  fs.writeFileSync(configPath(), JSON.stringify(config, null, 2), { mode: 0o600 });
}

export function clearConfig(): void {
  const p = configPath();
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
  }
}
