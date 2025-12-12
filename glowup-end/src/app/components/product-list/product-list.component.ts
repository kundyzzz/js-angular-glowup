import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { CosmeticService } from '../../services/cosmetic.service';
import { ProductDetailComponent } from '../product-detail/product-detail.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductDetailComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: any[] = [];
  filteredProducts: any[] = [];
  brands: string[] = [];
  searchQuery: string = '';
  selectedBrand: string = 'All';
  favoritesCount = 0;

  currentPage = 1;
  itemsPerPage = 8;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private cosmeticService: CosmeticService) {}

  ngOnInit(): void {
    // Получение продуктов
    this.cosmeticService.getProducts().subscribe({
      next: data => {
        this.products = data;
        this.filteredProducts = [...data];

        this.brands = Array.from(new Set(data.map(p => p.brand)));
        this.brands.unshift('All');
      },
      error: err => console.error('Error', err)
    });

    // RxJS search + filter
    this.searchSubject.pipe(
      debounceTime(500),
      switchMap((term: string) => {
        const filtered = this.products.filter(p =>
          (p.name.toLowerCase().includes(term.toLowerCase()) || 
           p.brand.toLowerCase().includes(term.toLowerCase())) &&
          (this.selectedBrand === 'All' || p.brand === this.selectedBrand)
        );
        return of(filtered);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: any[]) => {
        this.filteredProducts = data;
        this.currentPage = 1; // сброс на первую страницу при новом фильтре
      }
    });
  }

  onSearchChange(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchQuery = term;
    this.searchSubject.next(term);
  }

  filterByBrand(brand: string): void {
    this.selectedBrand = brand;
    this.searchSubject.next(this.searchQuery);
  }

  handleFavoriteChange(product: any, status: boolean) {
    if (status) this.favoritesCount++;
    else this.favoritesCount--;
  }

  // --- Pagination ---
  paginatedProducts(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
