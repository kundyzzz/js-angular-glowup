import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent {
  @Input() product: any;
  
  isFavorite = false;

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    if (this.onFavoriteChange) {
      this.onFavoriteChange(this.product, this.isFavorite);
    }
  }

  @Input()
  onFavoriteChange!: (product: any, status: boolean) => void;
}
