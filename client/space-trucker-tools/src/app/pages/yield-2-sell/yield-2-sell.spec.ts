import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator/vitest';
import { FormArray } from '@angular/forms';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Yield2Sell } from './yield-2-sell';
import { Yield2SellDataService } from '../../services/yield-2-sell-data.service';
import { ItemColorService } from '../../services/item-color.service';
import { ExportService } from '../../services/export.service';
import { JumpDataService } from '../../services/jump-data.service';
import { RockCompositionService } from '../../services/rock-composition.service';
import { JumpRoute, YieldItem } from '../../models/yield-2-sell.models';

const mockItems: YieldItem[] = [
  {
    name: 'Stileron',
    destinations: [
      { location: 'Area18', price: 28_447 },
      { location: 'Lorville', price: 26_000 },
    ],
  },
];

const mockRoutes: JumpRoute[] = [{ from: 'ArcCorp', to: 'MicroTech', range: '46.21' }];

describe('Yield2Sell Component', () => {
  let spectator: Spectator<Yield2Sell>;

  const createComponent = createComponentFactory({
    component: Yield2Sell,
    providers: [
      mockProvider(Yield2SellDataService, {
        getItems: () => of(mockItems),
      }),
      mockProvider(ItemColorService, {
        getColorMap: () => of({ Stileron: '#fefefe' }),
      }),
      mockProvider(JumpDataService, {
        getRoutes: () => of(mockRoutes),
      }),
      mockProvider(ExportService, {
        formatFilename: () => 'export.txt',
        downloadText: vi.fn(),
        downloadCsv: vi.fn(),
        copyToClipboard: vi.fn().mockResolvedValue(undefined),
      }),
      mockProvider(RockCompositionService, {
        getSnapshots: () => [],
        saveSnapshot: vi.fn(),
        deleteSnapshot: vi.fn(),
      }),
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('calculates item totals using the entered yield as SCU', () => {
    const rowsFormArray = spectator.component.rowFormGroup.get('rows') as FormArray;
    rowsFormArray.at(0).get('yield')!.setValue(2);
    spectator.detectChanges();

    const firstRow = spectator.component.rows()[0];
    expect(firstRow.total).toBe(2 * mockItems[0].destinations[0].price);
    expect(spectator.component.grandTotal()).toBe(firstRow.total);
    const totalCell = spectator.query('.row-total');
    expect(totalCell?.textContent?.trim()).toBe(firstRow.total.toLocaleString());
  });

  it('raises a non-blocking notice after exporting TXT', () => {
    vi.useFakeTimers();
    spectator.component.exportTxt();
    spectator.detectChanges();
    expect(spectator.component.notification()).toEqual(
      expect.objectContaining({ title: 'Export complete', type: 'info' })
    );

    vi.advanceTimersByTime(4000);
    spectator.detectChanges();
    expect(spectator.component.notification()).toBeNull();
    vi.useRealTimers();
  });
});
