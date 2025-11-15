import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RockCompositionService } from './rock-composition.service';
import { RockCompositionSnapshot } from '../models/yield-2-sell.models';

class MockStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe('RockCompositionService', () => {
  let service: RockCompositionService;
  let storage: MockStorage;
  const snapshot: RockCompositionSnapshot = {
    id: '1',
    rockSize: 32,
    inertFilter: 5,
    materials: [{ name: 'Quantanium', percentage: 50 }],
    savedAt: new Date().toISOString()
  };

  beforeEach(() => {
    storage = new MockStorage();
    Object.defineProperty(window, 'localStorage', {
      value: storage,
      configurable: true
    });

    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }]
    });

    service = TestBed.inject(RockCompositionService);
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>)['localStorage'];
    TestBed.resetTestingModule();
  });

  it('persists and retrieves snapshots through localStorage', () => {
    const saved = service.saveSnapshot(snapshot);
    expect(saved.length).toBe(1);
    expect(JSON.parse(storage.getItem('rock-composition-snapshots') || '[]').length).toBe(1);

    const stored = service.getSnapshots();
    expect(stored[0].id).toBe(snapshot.id);
  });

  it('deletes snapshots when requested', () => {
    service.saveSnapshot(snapshot);
    service.deleteSnapshot(snapshot.id);
    const stored = service.getSnapshots();
    expect(stored.length).toBe(0);
  });

  it('throws when storage is unavailable outside the browser', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }]
    });

    const nonBrowserService = TestBed.inject(RockCompositionService);
    expect(() => nonBrowserService.saveSnapshot(snapshot)).toThrowError(/not available outside the browser/);
  });
});
