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

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private cosmeticService: CosmeticService) {}

  ngOnInit(): void {
    this.cosmeticService.getProducts().subscribe({
      next: data => {
        this.products = data;
        this.filteredProducts = [...data];

        this.brands = Array.from(new Set(data.map(p => p.brand)));
        this.brands.unshift('All');
      },
      error: err => console.error('Error', err)
    });

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
      next: (data: any[]) => this.filteredProducts = data
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleFavoriteChange(product: any, status: boolean) {
    if (status) {
      this.favoritesCount++;
    } else {
      this.favoritesCount--;
    }
  }
}
