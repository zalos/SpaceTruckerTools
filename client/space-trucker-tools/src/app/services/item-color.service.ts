import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, retry, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ItemColorService {
  private readonly http = inject(HttpClient);
  private readonly colorsUrl = 'assets/data/item-colors.json';

  getColorMap(): Observable<Record<string, string>> {
    return this.http.get<Record<string, string>>(this.colorsUrl).pipe(
      retry({ count: 2, delay: 250 }),
      catchError((error) => {
        console.error('Failed to load item colors', error);
        return throwError(() => new Error('Unable to load item colors.'));
      })
    );
  }

  getColorFor(itemName: string): Observable<string | undefined> {
    return this.getColorMap().pipe(map((colors) => colors[itemName]));
  }
}
