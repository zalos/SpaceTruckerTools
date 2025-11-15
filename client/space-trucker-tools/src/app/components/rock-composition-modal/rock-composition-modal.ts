import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RockCompositionSnapshot, RockMaterialInput } from '../../models/yield-2-sell.models';

interface CompositionRow {
  name: string;
  percentage: number;
  scu: number;
}

@Component({
  selector: 'app-rock-composition-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rock-composition-modal.html',
  styleUrl: './rock-composition-modal.scss',
})
export class RockCompositionModalComponent implements OnChanges {
  @Input() open = false;
  @Input() snapshots: RockCompositionSnapshot[] | null = [];
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<RockCompositionSnapshot>();
  @Output() snapshotDeleted = new EventEmitter<string>();

  rockSize = 0;
  inertFilter = 0;
  materials: RockMaterialInput[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue && !changes['open'].previousValue && !this.materials.length) {
      this.addMaterial();
      this.addMaterial('Inert Material', 0);
    }
  }

  close(): void {
    this.closed.emit();
  }

  addMaterial(name = '', percentage = 0): void {
    this.materials = [...this.materials, { name, percentage }];
  }

  updateMaterial(index: number, field: 'name' | 'percentage', value: string): void {
    this.materials = this.materials.map((material, idx) => {
      if (idx !== index) {
        return material;
      }

      if (field === 'name') {
        return { ...material, name: value };
      }

      const percentage = Number(value);
      return { ...material, percentage: Number.isFinite(percentage) ? percentage : 0 };
    });
  }

  removeMaterial(index: number): void {
    this.materials = this.materials.filter((_, idx) => idx !== index);
  }

  get compositionRows(): CompositionRow[] {
    return this.materials.map((material) => {
      let scu = ((material.percentage || 0) / 100) * (this.rockSize || 0);
      if (material.name.trim().toLowerCase() === 'inert material') {
        const filter = Math.min(Math.max(this.inertFilter || 0, 0), 100);
        scu *= 1 - filter / 100;
      }
      return {
        name: material.name || '—',
        percentage: material.percentage || 0,
        scu: Number.isFinite(scu) ? parseFloat(scu.toFixed(2)) : 0,
      };
    });
  }

  saveComposition(): void {
    const rows = this.compositionRows.filter((row) => row.percentage > 0);
    if (!rows.length) {
      return;
    }

    const snapshot: RockCompositionSnapshot = {
      id: crypto.randomUUID?.() ?? `${Date.now()}`,
      rockSize: this.rockSize || 0,
      inertFilter: this.inertFilter || 0,
      materials: rows.map((row) => ({ name: row.name, percentage: row.percentage })),
      savedAt: new Date().toISOString(),
    };

    this.saved.emit(snapshot);
    this.resetInputs();
  }

  removeSnapshot(id: string): void {
    this.snapshotDeleted.emit(id);
  }

  private resetInputs(): void {
    this.rockSize = 0;
    this.inertFilter = 0;
    this.materials = [];
    this.addMaterial();
    this.addMaterial('Inert Material', 0);
  }
}
