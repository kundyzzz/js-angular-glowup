import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CosmeticService } from '../../services/cosmetic.service';

@Component({
  selector: 'app-product-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-view.component.html',
  styleUrls: ['./product-view.component.css']
})
export class ProductViewComponent implements OnInit {

  product: any;
  id!: number;
  rating: number = 0;

  constructor(
    private route: ActivatedRoute,
    private cosmeticService: CosmeticService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = Number(params.get('id'));
      this.loadProduct(this.id);

      this.rating = Number((3.0 + Math.random() * 1.5).toFixed(1));
    });
  }

  loadProduct(id: number) {
    this.cosmeticService.getProduct(id).subscribe(product => {
      this.product = product;
    });
  }
}
