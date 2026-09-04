import { ScanResult } from '../src/types.ts';
import fs from 'fs';
import path from 'path';

class StorageManager {
  private scans: Map<string, ScanResult> = new Map();
  private storageFile: string;

  constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err) {
        console.error('Could not create data dir:', err);
      }
    }
    this.storageFile = path.join(dataDir, 'scans.json');
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf-8');
        const list: ScanResult[] = JSON.parse(raw);
        for (const scan of list) {
          this.scans.set(scan.id, scan);
        }
      }
    } catch (err) {
      console.warn('Failed to load historical scans from disk:', err);
    }
  }

  private persistToDisk() {
    try {
      const list = Array.from(this.scans.values());
      fs.writeFileSync(this.storageFile, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to save scans to disk:', err);
    }
  }

  public saveScan(scan: ScanResult): ScanResult {
    this.scans.set(scan.id, scan);
    this.persistToDisk();
    return scan;
  }

  public getScan(id: string): ScanResult | undefined {
    return this.scans.get(id);
  }

  public getAllScans(): ScanResult[] {
    return Array.from(this.scans.values()).sort((a, b) => {
      return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
    });
  }

  public deleteScan(id: string): boolean {
    const deleted = this.scans.delete(id);
    if (deleted) {
      this.persistToDisk();
    }
    return deleted;
  }

  public clearAll(): void {
    this.scans.clear();
    this.persistToDisk();
  }
}

export const storage = new StorageManager();
