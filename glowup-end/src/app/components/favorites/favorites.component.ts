import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { FavoritesService } from '../../services/favorites.service';
import { CosmeticService } from '../../services/cosmetic.service';
import { Subscription, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, ProductDetailComponent],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit, OnDestroy {
  favorites: any[] = [];
  private sub!: Subscription;

  constructor(
    private favService: FavoritesService,
    private cosmeticService: CosmeticService
  ) {}

  ngOnInit() {
    this.sub = this.favService.favorites$
      .pipe(
        switchMap((ids: string[]) => {
          if (!ids.length) return of([]); // если пусто
          const requests = ids.map(id => this.cosmeticService.getProduct(Number(id)));
          return forkJoin(requests);
        })
      )
      .subscribe((products: any[]) => {
        this.favorites = products;
      });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  async handleFavoriteChange(product: any, status: boolean) {
    await this.favService.toggleFavorite(product.id.toString(), status);
  }
}
