import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, retry, throwError } from 'rxjs';
import { YieldDestination, YieldItem } from '../models/yield-2-sell.models';

type RawYieldData = Record<string, Record<string, number>>;

@Injectable({ providedIn: 'root' })
export class Yield2SellDataService {
  private readonly http = inject(HttpClient);
  private readonly pricesUrl = 'assets/data/yield-2-sell-item-prices.json';

  getItems(): Observable<YieldItem[]> {
    return this.http.get<RawYieldData>(this.pricesUrl).pipe(
      retry({ count: 2, delay: 250 }),
      map((data) => this.mapItems(data)),
      catchError((error) => {
        console.error('Failed to load Yield 2 Sell pricing data', error);
        return throwError(() => new Error('Unable to load Yield 2 Sell pricing data.'));
      })
    );
  }

  private mapItems(raw: RawYieldData): YieldItem[] {
    return Object.entries(raw).map(([itemName, destinations]) => ({
      name: itemName,
      destinations: this.mapDestinations(destinations),
    }));
  }

  private mapDestinations(destinations: Record<string, number>): YieldDestination[] {
    return Object.entries(destinations)
      .map(([location, price]) => ({ location, price }))
      .sort((a, b) => b.price - a.price);
  }
}
