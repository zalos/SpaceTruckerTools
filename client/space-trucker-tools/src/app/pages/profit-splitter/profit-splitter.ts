import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Expense {
  label: string;
  value: number;
}

interface Player {
  name: string;
  splitType: 'flat' | 'percent' | 'share';
  value: number;
  taxed: boolean;
  expenses: Expense[];
}

interface CompletedOrder {
  key: string;
  title: string;
  grandTotal: number;
}

interface CalculatedEntry {
  name: string;
  type: string;
  value: number;
  expenseTotal: number;
  taxAmount: number;
  finalPayout: number;
}

@Component({
  selector: 'app-profit-splitter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profit-splitter.html',
  styleUrls: ['./profit-splitter.scss'],
})
export class ProfitSplitterComponent implements OnInit, OnDestroy {
  private originalBackground: string = '';
  splitTitle = '';
  totalProfit = 0;
  players: Player[] = [];
  completedOrders: CompletedOrder[] = [];
  selectedOrders = new Set<string>();

  // Calculated values
  postExpensesProfit = 0;
  accountingBuffer = 0;
  remainingPool = 0;
  calculatedEntries: CalculatedEntry[] = [];

  ngOnInit() {
    // Store original background and set profit splitter page background
    this.originalBackground = document.body.style.backgroundImage;
    document.body.style.backgroundImage = "url('/assets/SplittingProfitsBackground.png')";

    this.loadCompletedOrders();
    this.addPlayer();
  }

  ngOnDestroy() {
    // Restore original background
    document.body.style.backgroundImage = this.originalBackground;
  }

  addPlayer() {
    const playerNumber = this.players.length + 1;
    this.players.push({
      name: `Player ${playerNumber}`,
      splitType: 'flat',
      value: 0,
      taxed: false,
      expenses: [],
    });
    this.updateCalculations();
  }

  removePlayer(index: number) {
    if (this.players.length > 1) {
      this.players.splice(index, 1);
      this.updateCalculations();
    }
  }

  addExpense(playerIndex: number) {
    this.players[playerIndex].expenses.push({
      label: 'New Expense',
      value: 0,
    });
    this.updateCalculations();
  }

  removeExpense(playerIndex: number, expenseIndex: number) {
    this.players[playerIndex].expenses.splice(expenseIndex, 1);
    this.updateCalculations();
  }

  toggleOrder(order: CompletedOrder) {
    if (this.selectedOrders.has(order.key)) {
      // Deselect: subtract value
      this.totalProfit -= order.grandTotal;
      this.selectedOrders.delete(order.key);
    } else {
      // Select: add value
      this.totalProfit += order.grandTotal;
      this.selectedOrders.add(order.key);
    }
    this.updateCalculations();
  }

  updateCalculations() {
    const profit = this.totalProfit || 0;

    // Reset calculated values
    let totalExpenses = 0;
    let flatTotal = 0;
    let percentTotal = 0;
    let sharesTotal = 0;
    let requiredTaxBuffer = 0;
    const taxedEntries: number[] = [];

    // Calculate totals and expenses
    this.players.forEach((player) => {
      const expenseTotal = player.expenses.reduce((sum, expense) => sum + (expense.value || 0), 0);
      totalExpenses += expenseTotal;

      const value = player.value || 0;
      if (player.splitType === 'flat') flatTotal += value;
      else if (player.splitType === 'percent') percentTotal += value;
      else if (player.splitType === 'share') sharesTotal += value;
    });

    this.postExpensesProfit = profit - totalExpenses;

    // Calculate deductions with tax handling
    const flatDeductions = this.players
      .filter((p) => p.splitType === 'flat')
      .reduce((sum, player) => {
        const value = player.value || 0;
        const taxedPortion = player.taxed ? value / 0.95 : value;
        if (player.taxed) {
          taxedEntries.push(taxedPortion - value);
        }
        return sum + taxedPortion;
      }, 0);

    const percentDeductions = this.players
      .filter((p) => p.splitType === 'percent')
      .reduce((sum, player) => {
        const value = player.value || 0;
        const amount = (value / 100) * this.postExpensesProfit;
        const taxedPortion = player.taxed ? amount / 0.95 : amount;
        if (player.taxed) {
          taxedEntries.push(taxedPortion - amount);
        }
        return sum + taxedPortion;
      }, 0);

    const remainder = this.postExpensesProfit - flatDeductions - percentDeductions;
    const valuePerShare = sharesTotal > 0 ? remainder / sharesTotal : 0;

    // Handle share-based tax calculations
    this.players
      .filter((p) => p.splitType === 'share')
      .forEach((player) => {
        const raw = (player.value || 0) * valuePerShare;
        if (player.taxed) {
          const taxedPortion = raw / 0.95;
          taxedEntries.push(taxedPortion - raw);
        }
      });

    this.accountingBuffer = taxedEntries.reduce((sum, tax) => sum + tax, 0);
    this.remainingPool =
      profit - totalExpenses - flatDeductions - percentDeductions - this.accountingBuffer;

    // Generate calculated entries for the table
    this.calculatedEntries = this.players.map((player) => {
      const value = player.value || 0;
      let raw = 0;

      if (player.splitType === 'flat') {
        raw = value;
      } else if (player.splitType === 'percent') {
        raw = (value / 100) * this.postExpensesProfit;
      } else if (player.splitType === 'share') {
        raw = value * valuePerShare;
      }

      const expenseTotal = player.expenses.reduce((sum, expense) => sum + (expense.value || 0), 0);
      const taxAmount = player.taxed ? raw * 0.05 : 0;
      const finalPayout = raw - expenseTotal;

      return {
        name: player.name || `Player ${this.players.indexOf(player) + 1}`,
        type: player.splitType,
        value: value,
        expenseTotal: expenseTotal,
        taxAmount: taxAmount,
        finalPayout: finalPayout,
      };
    });
  }

  exportTable(type: 'csv' | 'txt') {
    const headers = ['Player', 'Type', 'Value', 'Expenses', 'Tax (5%)', 'Final Payout'];
    const rows = [
      headers,
      ...this.calculatedEntries.map((entry) => [
        entry.name,
        entry.type,
        entry.value.toString(),
        entry.expenseTotal.toFixed(2),
        entry.taxAmount.toFixed(2),
        entry.finalPayout.toFixed(2),
      ]),
    ];

    const content = rows.map((row) => row.join(',')).join('\n');
    const title = this.splitTitle || 'ProfitSplit';
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-');

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title}_${timestamp}.${type}`;
    link.click();
  }

  copyTable() {
    const headers = ['Player', 'Type', 'Value', 'Expenses', 'Tax (5%)', 'Final Payout'];
    const rows = [
      headers,
      ...this.calculatedEntries.map((entry) => [
        entry.name,
        entry.type,
        entry.value.toString(),
        entry.expenseTotal.toFixed(2),
        entry.taxAmount.toFixed(2),
        entry.finalPayout.toFixed(2),
      ]),
    ];

    const content = rows.map((row) => row.join('\t')).join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(content).then(() => {
        alert('Copied to clipboard!');
      });
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = content;
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

  private loadCompletedOrders() {
    try {
      const data = JSON.parse(localStorage.getItem('completedOrders') || '[]');
      this.completedOrders = data.map((order: any) => ({
        key: order.key || `${order.title}_${order.grandTotal}`,
        title: order.title || 'Untitled Order',
        grandTotal: parseFloat(order.grandTotal) || 0,
      }));
    } catch (error) {
      console.error('Error loading completed orders:', error);
      this.completedOrders = [];
    }
  }
}
