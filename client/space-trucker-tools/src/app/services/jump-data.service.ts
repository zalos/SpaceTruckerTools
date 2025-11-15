import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { JumpRoute } from '../models/yield-2-sell.models';

@Injectable({ providedIn: 'root' })
export class JumpDataService {
  private readonly http = inject(HttpClient);
  private readonly jumpDataUrl = 'assets/data/jump-data.json';

  getRoutes(): Observable<JumpRoute[]> {
    return this.http.get<JumpRoute[]>(this.jumpDataUrl).pipe(
      retry({ count: 2, delay: 250 }),
      catchError((error) => {
        console.error('Failed to load jump route data', error);
        return throwError(() => new Error('Unable to load jump route data.'));
      })
    );
  }
}
