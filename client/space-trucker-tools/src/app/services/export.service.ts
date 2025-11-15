import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportService {
  downloadText(content: string, filename: string): void {
    this.triggerDownload(content, filename, 'text/plain;charset=utf-8');
  }

  downloadCsv(content: string, filename: string): void {
    this.triggerDownload(content, filename, 'text/csv;charset=utf-8');
  }

  async copyToClipboard(content: string): Promise<void> {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(content);
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = content;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  formatFilename(base: string, extension: string): string {
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
    const sanitized = base.trim().length > 0 ? base.trim().replace(/\s+/g, '_') : 'yield-2-sell-export';
    return `${sanitized}_${timestamp}.${extension}`;
  }

  private triggerDownload(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
