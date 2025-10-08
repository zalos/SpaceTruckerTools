import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface WorkorderItem {
  item: string;
  qty: number;
  location: string;
  scuType?: string;
  unitPrice: number;
  total: number;
}

interface WorkorderCategory {
  category: string;
  items: WorkorderItem[];
}

interface Workorder {
  key: string;
  title: string;
  dateSaved?: string;
  grandTotal: number;
  categories: WorkorderCategory[];
}

@Component({
  selector: 'app-workorders-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workorders-overview.html',
  styleUrls: ['./workorders-overview.scss'],
})
export class WorkordersOverviewComponent implements OnInit {
  availableOrders: Workorder[] = [];
  activeOrders: Workorder[] = [];
  completedOrders: Workorder[] = [];
  expandedKeys: string[] = [];
  showModal = false;

  ngOnInit() {
    this.loadOrders();
  }

  toggleManifest(key: string) {
    const index = this.expandedKeys.indexOf(key);
    if (index > -1) {
      this.expandedKeys.splice(index, 1);
    } else {
      this.expandedKeys.push(key);
    }
    localStorage.setItem('expandedKeys', JSON.stringify(this.expandedKeys));
  }

  isExpanded(key: string): boolean {
    return this.expandedKeys.includes(key);
  }

  activateOrder(key: string, event: Event) {
    event.stopPropagation();
    const index = this.availableOrders.findIndex((order) => order.key === key);
    if (index > -1) {
      const order = this.availableOrders.splice(index, 1)[0];
      this.activeOrders.push(order);

      // Remove from expanded keys
      const expIndex = this.expandedKeys.indexOf(key);
      if (expIndex > -1) {
        this.expandedKeys.splice(expIndex, 1);
        localStorage.setItem('expandedKeys', JSON.stringify(this.expandedKeys));
      }

      this.saveOrders();
    }
  }

  completeOrder(key: string, event: Event) {
    event.stopPropagation();
    const index = this.activeOrders.findIndex((order) => order.key === key);
    if (index > -1) {
      const order = this.activeOrders.splice(index, 1)[0];
      this.completedOrders.push(order);

      // Remove from expanded keys
      const expIndex = this.expandedKeys.indexOf(key);
      if (expIndex > -1) {
        this.expandedKeys.splice(expIndex, 1);
        localStorage.setItem('expandedKeys', JSON.stringify(this.expandedKeys));
      }

      this.saveOrders();
    }
  }

  openProfitSplitterModal() {
    this.showModal = true;
  }

  closeProfitSplitterModal() {
    this.showModal = false;
  }

  formatNumber(num: number): string {
    return Number(num).toLocaleString();
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  }

  private saveOrders() {
    // Save available orders as object (maintaining original format)
    const availableObj: { [key: string]: Workorder } = {};
    this.availableOrders.forEach((order) => {
      availableObj[order.key] = order;
    });

    localStorage.setItem('cargoManifestData', JSON.stringify(availableObj));
    localStorage.setItem('activeOrders', JSON.stringify(this.activeOrders));
    localStorage.setItem('completedOrders', JSON.stringify(this.completedOrders));
  }

  private loadOrders() {
    // Load expanded keys
    try {
      this.expandedKeys = JSON.parse(localStorage.getItem('expandedKeys') || '[]');
    } catch {
      this.expandedKeys = [];
    }

    // Load available orders from cargoManifestData
    const raw = localStorage.getItem('cargoManifestData');
    let savedManifests: { [key: string]: Workorder } = {};

    try {
      const parsed = JSON.parse(raw || '{}');
      if (Array.isArray(parsed)) {
        // Convert array format to object format
        savedManifests = {};
        parsed.forEach((order: any) => {
          if (order && order.key) {
            savedManifests[order.key] = order;
          }
        });
      } else if (typeof parsed === 'object' && parsed !== null) {
        savedManifests = parsed;
      } else {
        savedManifests = {};
      }
    } catch (e) {
      console.error('Error parsing cargoManifestData:', e);
      savedManifests = {};
    }

    // Convert object to array with key property
    this.availableOrders = Object.keys(savedManifests).map((key) => {
      const manifest = savedManifests[key];
      return {
        ...manifest,
        key: key, // Explicitly set the key to avoid conflict
      };
    });

    // Load active orders
    try {
      this.activeOrders = JSON.parse(localStorage.getItem('activeOrders') || '[]');
    } catch (e) {
      console.error('Error parsing activeOrders:', e);
      this.activeOrders = [];
    }

    // Load completed orders
    try {
      this.completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
    } catch (e) {
      console.error('Error parsing completedOrders:', e);
      this.completedOrders = [];
    }

    console.log('Loaded Available Orders:', this.availableOrders);
    console.log('Loaded Active Orders:', this.activeOrders);
    console.log('Loaded Completed Orders:', this.completedOrders);
  }
}
