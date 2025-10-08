import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ItemPrice {
  scu: number;
  cscu: number;
  mscu: number;
}

interface LocationPrices {
  [location: string]: ItemPrice;
}

interface CategoryData {
  [itemName: string]: LocationPrices;
}

interface ItemPrices {
  [categoryName: string]: CategoryData;
}

interface ItemColors {
  [itemName: string]: string;
}

interface CargoItem {
  item: string;
  qty: number;
  location: string;
  scuType: 'scu' | 'cscu' | 'mscu';
  unitPrice: number;
  total: number;
}

interface ManifestCategory {
  category: string;
  items: CargoItem[];
}

interface SavedManifest {
  title: string;
  dateSaved: string;
  categories: ManifestCategory[];
}

interface SavedManifests {
  [key: string]: SavedManifest;
}

@Component({
  selector: 'app-cargo-manifest-writer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cargo-manifest-writer.component.html',
  styleUrls: ['./cargo-manifest-writer.component.scss'],
})
export class CargoManifestWriterComponent implements OnInit {
  manifestTitle = '';
  manifestTitleDisplay = 'Cargo Manifest Writer';
  grandTotal = 0;
  lastSaved = '';
  currentManifestKey = '';
  dataLoaded = false;

  showWorkOrdersModal = false;
  showSavedManifestsModal = false;

  // Categories with their items
  shipMiningItems: CargoItem[] = [];
  handMiningItems: CargoItem[] = [];
  salvageItems: CargoItem[] = [];
  shipPartsItems: CargoItem[] = [];

  // Data imported from original JS files
  itemPrices: ItemPrices = {};
  itemColors: ItemColors = {};

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadItemData();
  }

  private async loadItemData() {
    // Import from our data file
    try {
      const data = await import('../../data/cargo-data');
      this.itemPrices = data.ITEM_PRICES;
      this.itemColors = data.ITEM_COLORS;
      this.initializeItems();
      this.dataLoaded = true;
      // Trigger change detection to update the UI
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Failed to load item data:', error);
    }
  }

  private initializeItems() {
    // Initialize empty items for each category
    Object.keys(this.itemPrices).forEach((category) => {
      Object.keys(this.itemPrices[category]).forEach((itemName) => {
        const itemData = this.itemPrices[category][itemName];
        const locations = Object.keys(itemData);
        const firstLocation = locations[0];

        const cargoItem: CargoItem = {
          item: itemName,
          qty: 0,
          location: firstLocation,
          scuType: 'scu',
          unitPrice: itemData[firstLocation].scu,
          total: 0,
        };

        switch (category) {
          case 'Ship Mining':
            this.shipMiningItems.push(cargoItem);
            break;
          case 'Handheld and Light Ship Mining':
            this.handMiningItems.push(cargoItem);
            break;
          case 'Salvage':
            this.salvageItems.push(cargoItem);
            break;
          case 'Ship Parts':
            this.shipPartsItems.push(cargoItem);
            break;
        }
      });
    });
  }

  onTitleChange() {
    this.manifestTitleDisplay = this.manifestTitle.trim() || 'Cargo Manifest Writer';
    this.saveManifestToLocalStorage();
  }

  onItemChange(item: CargoItem, category: string) {
    this.updateItemTotals(item, category);
    this.updateGrandTotal();
    this.saveManifestToLocalStorage();
  }

  updateItemTotals(item: CargoItem, category: string) {
    const itemData = this.itemPrices[category][item.item];
    if (itemData && itemData[item.location]) {
      item.unitPrice = itemData[item.location][item.scuType];
      item.total = item.qty * item.unitPrice;
    }
  }

  updateGrandTotal() {
    this.grandTotal = 0;
    [this.shipMiningItems, this.handMiningItems, this.salvageItems, this.shipPartsItems].forEach(
      (items) => {
        items.forEach((item) => {
          this.grandTotal += item.total || 0;
        });
      }
    );
  }

  incrementQuantity(item: CargoItem, amount: number, category: string) {
    item.qty = (item.qty || 0) + amount;
    this.onItemChange(item, category);
  }

  getLocations(item: CargoItem, category: string): string[] {
    const itemData = this.itemPrices[category][item.item];
    return itemData ? Object.keys(itemData) : [];
  }

  getItemColor(itemName: string): string {
    return this.itemColors[itemName] || '#1e1e1e';
  }

  // Export functions
  exportCSV() {
    const title = this.manifestTitle || 'Cargo Manifest';
    let csv = `Title:|${title}\nUnit Type:|SCU\n\n`;

    const categories = [
      { label: 'Ship Mining', items: this.shipMiningItems },
      { label: 'Handheld and Light Ship Mining', items: this.handMiningItems },
      { label: 'Salvage', items: this.salvageItems },
      { label: 'Ship Parts', items: this.shipPartsItems },
    ];

    let grandTotal = 0;

    categories.forEach(({ label, items }) => {
      const activeItems = items.filter((item) => item.qty > 0);
      if (activeItems.length > 0) {
        csv += `Category:|${label}\n`;
        csv += `Item|Quantity|Location|Unit Price|Total\n`;

        activeItems.forEach((item) => {
          const formattedUnitPrice = item.unitPrice.toLocaleString();
          const formattedTotal = item.total.toLocaleString();
          csv += `"${item.item}"|${item.qty}|"${item.location}"|${formattedUnitPrice}|${formattedTotal}\n`;
          grandTotal += item.total;
        });
        csv += '\n';
      }
    });

    csv += `Grand Total:|${grandTotal.toLocaleString()}`;

    const filename = `${title.replace(/\s+/g, '_')}_${new Date()
      .toISOString()
      .slice(0, 16)
      .replace(/[:T]/g, '-')}.csv`;
    this.downloadFile(csv, filename);
    alert('Reminder: This CSV uses the pipe (|) character as delimiter.');
  }

  exportTXT() {
    // Similar to CSV but in text format
    const title = this.manifestTitle || 'Cargo Manifest';
    let content = `Title: ${title}\n\n`;

    const categories = [
      { label: 'Ship Mining', items: this.shipMiningItems },
      { label: 'Handheld and Light Ship Mining', items: this.handMiningItems },
      { label: 'Salvage', items: this.salvageItems },
      { label: 'Ship Parts', items: this.shipPartsItems },
    ];

    let grandTotal = 0;

    categories.forEach(({ label, items }) => {
      const activeItems = items.filter((item) => item.qty > 0);
      if (activeItems.length > 0) {
        content += `${label}:\n`;
        activeItems.forEach((item) => {
          content += `${item.item}, Qty: ${item.qty}, Location: ${
            item.location
          }, Unit Price: ${item.unitPrice.toLocaleString()}, Total: ${item.total.toLocaleString()}\n`;
          grandTotal += item.total;
        });
        content += '\n';
      }
    });

    content += `Grand Total: ${grandTotal.toLocaleString()} aUEC\n`;

    const filename = `${title.replace(/\s+/g, '_')}_${new Date()
      .toISOString()
      .slice(0, 16)
      .replace(/[:T]/g, '-')}.txt`;
    this.downloadFile(content, filename);
  }

  copyToClipboard() {
    const title = this.manifestTitle || 'Cargo Manifest';
    let textToCopy = `Title: ${title}\n\n`;

    const categories = [
      { label: 'Ship Mining', items: this.shipMiningItems },
      { label: 'Handheld and Light Ship Mining', items: this.handMiningItems },
      { label: 'Salvage', items: this.salvageItems },
      { label: 'Ship Parts', items: this.shipPartsItems },
    ];

    let grandTotal = 0;

    categories.forEach(({ label, items }) => {
      const activeItems = items.filter((item) => item.qty > 0);
      if (activeItems.length > 0) {
        textToCopy += `${label}:\n`;
        activeItems.forEach((item) => {
          textToCopy += `${item.item}, Qty: ${item.qty}, Location: ${
            item.location
          }, Unit Price: ${item.unitPrice.toLocaleString()}, Total: ${item.total.toLocaleString()}\n`;
          grandTotal += item.total;
        });
        textToCopy += '\n';
      }
    });

    textToCopy += `Grand Total: ${grandTotal.toLocaleString()} aUEC\n`;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          alert('Manifest copied to clipboard!');
        })
        .catch(() => {
          this.fallbackClipboardCopy(textToCopy);
        });
    } else {
      this.fallbackClipboardCopy(textToCopy);
    }
  }

  private fallbackClipboardCopy(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      alert(successful ? 'Manifest copied to clipboard!' : 'Copy failed. Try manually.');
    } catch (err) {
      alert('Copy failed. Try manually.');
    }

    document.body.removeChild(textArea);
  }

  private downloadFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }

  // Local Storage functions
  saveManifestToLocalStorage(startNew = false) {
    const title = this.manifestTitle.trim() || 'Untitled Manifest';
    const now = new Date();
    const dateSaved = now.toLocaleString();

    const categories = [
      { id: 'Ship Mining', items: this.shipMiningItems },
      { id: 'Handheld and Light Ship Mining', items: this.handMiningItems },
      { id: 'Salvage', items: this.salvageItems },
      { id: 'Ship Parts', items: this.shipPartsItems },
    ];

    const manifestData: SavedManifest = {
      title: title,
      dateSaved: dateSaved,
      categories: categories.map((cat) => ({
        category: cat.id,
        items: cat.items
          .filter((item) => item.qty > 0)
          .map((item) => ({
            item: item.item,
            qty: item.qty,
            location: item.location,
            scuType: item.scuType,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
      })),
    };

    const savedManifests: SavedManifests = JSON.parse(
      localStorage.getItem('cargoManifestData') || '{}'
    );

    let key = this.currentManifestKey;
    if (!key || startNew) {
      key = 'manifest_' + Date.now();
    }

    savedManifests[key] = manifestData;
    localStorage.setItem('cargoManifestData', JSON.stringify(savedManifests));
    this.currentManifestKey = key;
    this.lastSaved = `Last saved: ${dateSaved}`;

    if (startNew) {
      this.startNewManifest();
    }
  }

  startNewManifest() {
    this.manifestTitle = '';
    this.manifestTitleDisplay = 'Cargo Manifest Writer';
    this.currentManifestKey = '';

    // Reset all quantities
    [this.shipMiningItems, this.handMiningItems, this.salvageItems, this.shipPartsItems].forEach(
      (items) => {
        items.forEach((item) => {
          item.qty = 0;
          item.total = 0;
        });
      }
    );

    this.updateGrandTotal();
    localStorage.removeItem('currentManifestKey');
  }

  // Modal functions
  openWorkOrdersModal() {
    this.showWorkOrdersModal = true;
  }

  closeWorkOrdersModal() {
    this.showWorkOrdersModal = false;
  }

  openSavedManifestsModal() {
    this.showSavedManifestsModal = true;
  }

  closeSavedManifestsModal() {
    this.showSavedManifestsModal = false;
  }

  getSavedManifests(): { key: string; manifest: SavedManifest }[] {
    const savedManifests: SavedManifests = JSON.parse(
      localStorage.getItem('cargoManifestData') || '{}'
    );
    return Object.keys(savedManifests).map((key) => ({ key, manifest: savedManifests[key] }));
  }

  loadManifest(manifest: SavedManifest, key: string) {
    this.currentManifestKey = key;
    this.manifestTitle = manifest.title;
    this.manifestTitleDisplay = manifest.title;

    // Reset all items
    [this.shipMiningItems, this.handMiningItems, this.salvageItems, this.shipPartsItems].forEach(
      (items) => {
        items.forEach((item) => {
          item.qty = 0;
          item.total = 0;
        });
      }
    );

    // Load saved data
    manifest.categories.forEach((categoryData) => {
      let targetItems: CargoItem[] = [];

      switch (categoryData.category) {
        case 'Ship Mining':
          targetItems = this.shipMiningItems;
          break;
        case 'Handheld and Light Ship Mining':
          targetItems = this.handMiningItems;
          break;
        case 'Salvage':
          targetItems = this.salvageItems;
          break;
        case 'Ship Parts':
          targetItems = this.shipPartsItems;
          break;
      }

      categoryData.items.forEach((savedItem) => {
        const targetItem = targetItems.find((item) => item.item === savedItem.item);
        if (targetItem) {
          targetItem.qty = savedItem.qty;
          targetItem.location = savedItem.location;
          targetItem.scuType = savedItem.scuType;
          this.updateItemTotals(targetItem, categoryData.category);
        }
      });
    });

    this.updateGrandTotal();
    this.closeSavedManifestsModal();
  }

  deleteManifest(key: string, manifestTitle: string) {
    if (confirm(`Delete manifest "${manifestTitle}"?`)) {
      const savedManifests: SavedManifests = JSON.parse(
        localStorage.getItem('cargoManifestData') || '{}'
      );
      delete savedManifests[key];
      localStorage.setItem('cargoManifestData', JSON.stringify(savedManifests));
    }
  }
}
