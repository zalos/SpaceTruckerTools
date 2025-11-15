import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RockCompositionSnapshot } from '../models/yield-2-sell.models';

const STORAGE_KEY = 'rock-composition-snapshots';

@Injectable({ providedIn: 'root' })
export class RockCompositionService {
  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  getSnapshots(): RockCompositionSnapshot[] {
    const storage = this.getStorage();
    if (!storage) {
      return [];
    }

    try {
      const raw = storage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as RockCompositionSnapshot[]) : [];
    } catch (error) {
      console.error('Failed to parse stored rock compositions', error);
      return [];
    }
  }

  saveSnapshot(snapshot: RockCompositionSnapshot): RockCompositionSnapshot[] {
    const storage = this.getStorage(true);
    const next = [snapshot, ...this.getSnapshots()];
    this.persist(storage, next);
    return next;
  }

  deleteSnapshot(id: string): RockCompositionSnapshot[] {
    const storage = this.getStorage(true);
    const next = this.getSnapshots().filter((snapshot) => snapshot.id !== id);
    this.persist(storage, next);
    return next;
  }

  private getStorage(requireWritable: true): Storage;
  private getStorage(requireWritable?: false): Storage | null;
  private getStorage(requireWritable = false): Storage | null {
    if (!isPlatformBrowser(this.platformId)) {
      if (requireWritable) {
        throw new Error(
          'Rock composition storage is not available outside the browser environment.'
        );
      }
      return null;
    }

    try {
      return window.localStorage;
    } catch (error) {
      console.error('Accessing localStorage failed', error);
      if (requireWritable) {
        throw new Error('Cannot access persistent storage.');
      }
      return null;
    }
  }

  private persist(storage: Storage, snapshots: RockCompositionSnapshot[]): void {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
    } catch (error) {
      console.error('Failed to persist rock compositions', error);
      throw new Error('Unable to persist rock composition snapshots.');
    }
  }
}
