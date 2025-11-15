import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { Yield2SellDataService } from './yield-2-sell-data.service';

const pricesUrl = 'assets/data/yield-2-sell-item-prices.json';

describe('Yield2SellDataService', () => {
  let service: Yield2SellDataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(Yield2SellDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('maps raw pricing data into sorted destinations', async () => {
    const promise = firstValueFrom(service.getItems());

    const req = httpMock.expectOne(pricesUrl);
    expect(req.request.method).toBe('GET');
    req.flush({
      Stileron: {
        Lorville: 500,
        Area18: 100,
      },
    });
    const items = await promise;
    expect(items.length).toBe(1);
    expect(items[0].destinations[0].price).toBe(500);
    expect(items[0].destinations[0].location).toBe('Lorville');
    expect(items[0].destinations[1].price).toBe(100);
  });

  it('emits a descriptive error when the request fails', async () => {
    vi.useFakeTimers();
    const promise = firstValueFrom(service.getItems());

    const respondWithError = async (advanceTimers: boolean) => {
      const req = httpMock.expectOne(pricesUrl);
      req.error(new ProgressEvent('error'));
      if (advanceTimers) {
        await vi.advanceTimersByTimeAsync(250);
      }
    };

    try {
      await respondWithError(true);
      await respondWithError(true);
      await respondWithError(false);

      await expect(promise).rejects.toThrow(/Unable to load Yield 2 Sell pricing data/);
    } finally {
      vi.useRealTimers();
    }
  });
});
