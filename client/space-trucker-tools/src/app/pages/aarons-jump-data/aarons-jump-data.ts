import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface JumpEntry {
  from: string;
  to: string;
  range: string;
  notes?: string;
}

@Component({
  selector: 'app-aarons-jump-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aarons-jump-data.html',
  styleUrls: ['./aarons-jump-data.scss'],
})
export class AaronsJumpDataComponent {
  jumpData: JumpEntry[] = [
    {
      from: 'Arc-L1',
      to: 'Hurston',
      range: '13.6 - 13.9',
      notes: "Ideal drop-out range for Aaron's Halo entry from Arc-L1 refinery",
    },
    {
      from: 'Arc-L2',
      to: 'MicroTech',
      range: '18.2 - 18.5',
      notes: 'TBC',
    },
    {
      from: 'Crusader',
      to: 'ArcCorp',
      range: '11.0 - 11.3',
      notes: 'TBC',
    },
    {
      from: 'MicroTech',
      to: 'Hur-L4',
      range: '7.6 - 7.8',
      notes: 'Drop near belt edge',
    },
  ];

  exportToTXT() {
    let txt = "Quantum Jump Reference to Aaron's Halo\n\nFrom | To | Range (mil km) | Notes\n";
    this.jumpData.forEach((entry) => {
      txt += `${entry.from} | ${entry.to} | ${entry.range} | ${entry.notes || ''}\n`;
    });
    this.downloadFile(txt, `QuantumJumps_${this.timestamp()}.txt`);
  }

  exportToCSV() {
    let csv = 'From,To,Range (mil km),Notes\n';
    this.jumpData.forEach((entry) => {
      csv += `"${entry.from}","${entry.to}","${entry.range}","${entry.notes || ''}"\n`;
    });
    this.downloadFile(csv, `QuantumJumps_${this.timestamp()}.csv`);
  }

  copyToClipboard() {
    let text = "Quantum Jump Reference to Aaron's Halo\n\nFrom | To | Range (mil km) | Notes\n";
    this.jumpData.forEach((entry) => {
      text += `${entry.from} | ${entry.to} | ${entry.range} | ${entry.notes || ''}\n`;
    });

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Copied to clipboard!');
    }
  }

  private downloadFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }

  private timestamp(): string {
    return new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  }
}
