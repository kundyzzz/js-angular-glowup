import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  email = '';
  password = '';
  repeatPassword = '';
  errorMsg = '';

  constructor(private auth: AuthService, private router: Router) {}

  async signup() {
    this.errorMsg = '';

    if (this.password !== this.repeatPassword) {
      this.errorMsg = 'Passwords do not match';
      return;
    }

    try {
      await this.auth.signup(this.email, this.password);
      this.router.navigate(['/profile']);
    } catch (err: any) {
      this.errorMsg = err.message;
    }
  }
}
