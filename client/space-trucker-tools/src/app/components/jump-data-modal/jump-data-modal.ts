import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { JumpRoute } from '../../models/yield-2-sell.models';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-jump-data-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jump-data-modal.html',
  styleUrl: './jump-data-modal.scss',
})
export class JumpDataModalComponent {
  @Input() open = false;
  @Input() routes: JumpRoute[] | null = [];
  @Output() closed = new EventEmitter<void>();

  constructor(private readonly exportService: ExportService) {}

  close(): void {
    this.closed.emit();
  }

  exportTxt(): void {
    if (!this.routes?.length) {
      return;
    }

    const header = 'From | To | Range (mil km) | Notes';
    const body = this.routes
      .map((route) => `${route.from} | ${route.to} | ${route.range} | ${route.notes ?? ''}`)
      .join('\n');
    const content = `Quantum Jump Reference to Aaron's Halo\n\n${header}\n${body}`;
    const filename = this.exportService.formatFilename('AaronJumpData', 'txt');
    this.exportService.downloadText(content, filename);
  }

  exportCsv(): void {
    if (!this.routes?.length) {
      return;
    }

    const header = 'From,To,Range (mil km),Notes';
    const body = this.routes
      .map((route) => `"${route.from}","${route.to}","${route.range}","${route.notes ?? ''}"`)
      .join('\n');
    const content = `${header}\n${body}`;
    const filename = this.exportService.formatFilename('AaronJumpData', 'csv');
    this.exportService.downloadCsv(content, filename);
  }

  async copyToClipboard(): Promise<void> {
    if (!this.routes?.length) {
      return;
    }

    const header = 'From | To | Range (mil km) | Notes';
    const body = this.routes
      .map((route) => `${route.from} | ${route.to} | ${route.range} | ${route.notes ?? ''}`)
      .join('\n');
    const content = `Quantum Jump Reference to Aaron's Halo\n\n${header}\n${body}`;
    await this.exportService.copyToClipboard(content);
    alert('Copied Jump Data to clipboard!');
  }
}
