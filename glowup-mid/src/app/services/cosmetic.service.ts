import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CosmeticService {
  private apiUrl = 'https://68f9d705ef8b2e621e7da37e.mockapi.io/products/products';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  searchProducts(term: string): Observable<any[]> {
    if (!term.trim()) {
      return this.getProducts();
    }
    return this.http.get<any[]>(`${this.apiUrl}?search=${encodeURIComponent(term)}`);
  }
}
