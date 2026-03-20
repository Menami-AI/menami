import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

vi.mock('fs');
vi.mock('os');

import { loadConfig, saveConfig, clearConfig, getConfigPath } from '../config.js';

describe('config', () => {
  const mockHome = '/mock/home';
  const configPath = path.join(mockHome, '.menami', 'config.json');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(os.homedir).mockReturnValue(mockHome);
  });

  describe('loadConfig', () => {
    it('returns null when config file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      expect(loadConfig()).toBeNull();
    });

    it('returns parsed config when file exists', () => {
      const config = { accessToken: 'men_abc', refreshToken: 'men_xyz', expiresAt: 9999999999999, serverUrl: 'https://api.menami.com' };
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(config));
      expect(loadConfig()).toEqual(config);
    });

    it('returns null on malformed JSON', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('not json');
      expect(loadConfig()).toBeNull();
    });
  });

  describe('saveConfig', () => {
    it('creates config directory and writes file with restricted permissions', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
      vi.mocked(fs.writeFileSync).mockReturnValue(undefined);

      saveConfig({ accessToken: 'a', refreshToken: 'b', expiresAt: 1, serverUrl: 'http://localhost' });

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('.menami'),
        expect.objectContaining({ mode: 0o700 }),
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        configPath,
        expect.any(String),
        expect.objectContaining({ mode: 0o600 }),
      );
    });
  });

  describe('clearConfig', () => {
    it('deletes config file when it exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.unlinkSync).mockReturnValue(undefined);
      clearConfig();
      expect(fs.unlinkSync).toHaveBeenCalledWith(configPath);
    });

    it('does nothing when file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      clearConfig();
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('getConfigPath', () => {
    it('returns path to config file', () => {
      expect(getConfigPath()).toBe(configPath);
    });
  });
});
