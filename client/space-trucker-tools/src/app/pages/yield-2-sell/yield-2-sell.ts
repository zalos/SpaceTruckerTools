import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, combineLatest, Observable, of, startWith, switchMap, tap, timer } from 'rxjs';
import { JumpDataModalComponent } from '../../components/jump-data-modal/jump-data-modal';
import { RockCompositionModalComponent } from '../../components/rock-composition-modal/rock-composition-modal';
import { JumpRoute, RockCompositionSnapshot, YieldDestination, YieldItem, YieldRowState } from '../../models/yield-2-sell.models';
import { ExportService } from '../../services/export.service';
import { ItemColorService } from '../../services/item-color.service';
import { JumpDataService } from '../../services/jump-data.service';
import { Yield2SellDataService } from '../../services/yield-2-sell-data.service';
import { RockCompositionService } from '../../services/rock-composition.service';

type RowFormGroup = FormGroup<{
  yield: FormControl<number | null>;
  selectedDestination: FormControl<string | null>;
}>;

interface RowContext {
  itemName: string;
  destinations: YieldDestination[];
  color?: string;
}

type Notice = { type: 'info' | 'error'; title: string; message: string };

@Component({
  selector: 'app-yield-2-sell',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, JumpDataModalComponent, RockCompositionModalComponent],
  templateUrl: './yield-2-sell.html',
  styleUrl: './yield-2-sell.scss'
})
export class Yield2Sell implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly dataService = inject(Yield2SellDataService);
  private readonly colorService = inject(ItemColorService);
  private readonly exportService = inject(ExportService);
  private readonly jumpDataService = inject(JumpDataService);
  private readonly rockCompositionService = inject(RockCompositionService);
  private readonly priceReload$ = new Subject<void>();
  private readonly destroyRef = inject(DestroyRef);

  readonly refineryForm = this.fb.group({
    title: [''],
    refiningType: ['Ferron'],
    refiningCost: [0],
    refiningHours: [0],
    refiningMinutes: [0]
  });

  readonly rowFormGroup = this.fb.group({
    rows: this.fb.array<RowFormGroup>([])
  });

  readonly rowContexts = signal<RowContext[]>([]);
  readonly rows = signal<YieldRowState[]>([]);
  readonly grandTotal = computed(() => this.rows().reduce((sum, row) => sum + row.total, 0));
  readonly isJumpModalOpen = signal(false);
  readonly isRockModalOpen = signal(false);
  readonly rockSnapshots = signal<RockCompositionSnapshot[]>([]);
  readonly loadState = signal<'loading' | 'ready' | 'error'>('loading');
  readonly loadError = signal<string | null>(null);
  readonly jumpRoutesError = signal<string | null>(null);
  readonly notification = signal<Notice | null>(null);
  readonly jumpRoutes$: Observable<JumpRoute[]> = this.jumpDataService.getRoutes().pipe(
    catchError((error) => {
      console.error('Failed to load jump routes', error);
      this.jumpRoutesError.set('Jump route data is unavailable. Please try again later.');
      return of([]);
    })
  );

  constructor() {
    this.rockSnapshots.set(this.rockCompositionService.getSnapshots());
    this.observeRowFormChanges();
    this.setupPriceLoader();
  }

  get orderReadyAt(): string {
    const hours = Number(this.refineryForm.value.refiningHours) || 0;
    const minutes = Number(this.refineryForm.value.refiningMinutes) || 0;
    const readyDate = new Date();
    readyDate.setHours(readyDate.getHours() + hours);
    readyDate.setMinutes(readyDate.getMinutes() + minutes);
    const hh = readyDate.getHours().toString().padStart(2, '0');
    const mm = readyDate.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }

  exportTxt(): void {
    const header = this.buildHeader();
    const table = this.buildTableRows(' | ');
    const content = `${header}\n\nItem | Yield | Location | Price Per SCU | Item Total\n${table}`;
    const filename = this.exportService.formatFilename(this.headerTitle(), 'txt');
    this.exportService.downloadText(content, filename);
    this.raiseNotice('info', 'Export complete', 'TXT export downloaded successfully.');
  }

  exportCsv(): void {
    const header = this.buildCsvHeader();
    const table = this.buildTableRows(',', true);
    const content = `${header}\nItem,Yield,Location,Price Per SCU,Item Total\n${table}`;
    const filename = this.exportService.formatFilename(this.headerTitle(), 'csv');
    this.exportService.downloadCsv(content, filename);
    this.raiseNotice('info', 'Export complete', 'CSV export downloaded. Reminder: The file uses commas as delimiters.');
  }

  async copyToClipboard(): Promise<void> {
    const header = this.buildHeader();
    const table = this.buildTableRows(' | ');
    const content = `${header}\n\nItem | Yield | Location | Price Per SCU | Item Total\n${table}\n\nEstimated Total: ${this.grandTotal().toLocaleString()} aUEC`;
    await this.exportService.copyToClipboard(content);
    this.raiseNotice('info', 'Copied to clipboard', 'Export data copied to clipboard.');
  }

  openJumpModal(): void {
    this.isJumpModalOpen.set(true);
  }

  closeJumpModal(): void {
    this.isJumpModalOpen.set(false);
  }

  openRockModal(): void {
    this.isRockModalOpen.set(true);
  }

  closeRockModal(): void {
    this.isRockModalOpen.set(false);
  }

  trackByIndex(_: number, item: YieldRowState): string {
    return item.itemName;
  }

  retryLoad(): void {
    if (this.loadState() === 'loading') {
      return;
    }
    this.priceReload$.next();
  }

  handleRockSaved(snapshot: RockCompositionSnapshot): void {
    try {
      const updated = this.rockCompositionService.saveSnapshot(snapshot);
      this.rockSnapshots.set(updated);
    } catch (error) {
      console.error('Unable to store rock composition snapshot', error);
      this.raiseNotice('error', 'Save failed', 'Saving rock compositions is unavailable in this environment.');
    }
  }

  handleRockDeleted(id: string): void {
    try {
      const updated = this.rockCompositionService.deleteSnapshot(id);
      this.rockSnapshots.set(updated);
    } catch (error) {
      console.error('Unable to delete rock composition snapshot', error);
      this.raiseNotice('error', 'Delete failed', 'Deleting rock compositions is unavailable in this environment.');
    }
  }

  ngOnDestroy(): void {
    this.notification.set(null);
  }

  private headerTitle(): string {
    const title = this.refineryForm.value.title?.trim();
    return title && title.length ? title : 'Yield 2 Sell Export';
  }

  private buildHeader(): string {
    const form = this.refineryForm.value;
    return [
      `Title: ${this.headerTitle()}`,
      `Refining Type: ${form.refiningType}`,
      `Refining Cost: ${form.refiningCost || 0} aUEC`,
      `Duration: ${form.refiningHours || 0}h ${form.refiningMinutes || 0}m`,
      `Order Ready At: ${this.orderReadyAt}`
    ].join('\n');
  }

  private buildCsvHeader(): string {
    const form = this.refineryForm.value;
    return [
      `Title:,${this.headerTitle()}`,
      `Refining Type:,${form.refiningType}`,
      `Refining Cost:,${form.refiningCost || 0} aUEC`,
      `Duration:,${form.refiningHours || 0}h ${form.refiningMinutes || 0}m`,
      `Order Ready At:,${this.orderReadyAt}`
    ].join('\n');
  }

  private buildTableRows(delimiter: ' | ' | ',', quote = false): string {
    return this.rows()
      .filter((row) => row.yield > 0)
      .map((row) =>
        [
          row.itemName,
          row.yield,
          row.selectedDestination,
          row.pricePerScu.toLocaleString(),
          row.total.toLocaleString()
        ]
          .map((value) => (quote ? `"${value}"` : value))
          .join(delimiter)
      )
      .join('\n');
  }

  private recalculateRow(row: YieldRowState, updates: Partial<YieldRowState> = {}): YieldRowState {
    const merged = { ...row, ...updates };
    const destination = merged.destinations.find((dest) => dest.location === merged.selectedDestination);
    merged.pricePerScu = destination?.price ?? merged.destinations[0]?.price ?? 0;
    merged.selectedDestination = destination?.location ?? merged.destinations[0]?.location ?? '';
    merged.scu = Math.floor(merged.yield || 0);
    merged.total = merged.scu * merged.pricePerScu;
    return merged;
  }

  private observeRowFormChanges(): void {
    this.rowsFormArray.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.calculateRows());
  }

  private setupPriceLoader(): void {
    this.priceReload$
      .pipe(
        startWith(void 0),
        switchMap(() => {
          this.loadState.set('loading');
          this.loadError.set(null);
          return combineLatest([this.dataService.getItems(), this.colorService.getColorMap()]).pipe(
            tap(([items, colors]) => this.processLoadedData(items, colors)),
            tap(() => this.loadState.set('ready')),
            catchError((error) => {
              console.error('Failed to load yield price data', error);
              this.loadError.set(error?.message ?? 'Unable to load price data. Please try again.');
              this.loadState.set('error');
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  private processLoadedData(items: YieldItem[], colors: Record<string, string>): void {
    const contexts = items.map<RowContext>((item) => ({
      itemName: item.name,
      destinations: item.destinations,
      color: colors[item.name]
    }));

    this.rowContexts.set(contexts);
    this.resetRowForms(contexts);
    this.calculateRows();
  }

  private resetRowForms(contexts: RowContext[]): void {
    const formArray = this.rowsFormArray;
    const previousRows = this.rows();
    while (formArray.length) {
      formArray.removeAt(formArray.length - 1);
    }

    contexts.forEach((context) => {
      const previous = previousRows.find((row) => row.itemName === context.itemName);
      formArray.push(this.createRowForm(context, previous));
    });
  }

  private get rowsFormArray(): FormArray<RowFormGroup> {
    return this.rowFormGroup.get('rows') as FormArray<RowFormGroup>;
  }

  private createRowForm(context: RowContext, previous?: YieldRowState): RowFormGroup {
    const defaultDestination = previous?.selectedDestination ?? context.destinations[0]?.location ?? '';
    return this.fb.group({
      yield: [previous?.yield ?? 0],
      selectedDestination: [defaultDestination]
    });
  }

  private calculateRows(): void {
    const contexts = this.rowContexts();
    if (!contexts.length) {
      this.rows.set([]);
      return;
    }

    const updated = contexts.map((context, index) => {
      const form = this.rowsFormArray.at(index);
      const sanitizedYield = this.sanitizeYield(form?.value.yield);
      const fallbackDestination = context.destinations[0]?.location ?? '';
      const selectedDestination = form?.value.selectedDestination || fallbackDestination;

      if (form && (form.value.yield !== sanitizedYield || form.value.selectedDestination !== selectedDestination)) {
        form.patchValue({ yield: sanitizedYield, selectedDestination }, { emitEvent: false });
      }

      return this.recalculateRow(
        {
          itemName: context.itemName,
          destinations: context.destinations,
          yield: sanitizedYield,
          scu: 0,
          selectedDestination,
          pricePerScu: 0,
          total: 0,
          color: context.color
        }
      );
    });

    this.rows.set(updated);
  }

  private sanitizeYield(value: number | null | undefined): number {
    return Math.max(0, Math.floor(Number(value) || 0));
  }

  private raiseNotice(type: Notice['type'], title: string, message: string): void {
    this.notification.set({ type, title, message });
    timer(4000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.notification()?.message === message) {
          this.notification.set(null);
        }
      });
  }
}
