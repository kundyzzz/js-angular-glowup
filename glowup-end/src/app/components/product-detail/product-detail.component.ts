// product-detail.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  @Input() product: any;

  isFavorite = false;

  @Input()
  onFavoriteChange!: (product: any, status: boolean) => void;

  constructor(private favService: FavoritesService) {}

  async ngOnInit() {
    const favs = await this.favService.loadFavorites();
    this.isFavorite = favs.includes(this.product.id);
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    this.onFavoriteChange(this.product, this.isFavorite);
  }
}
