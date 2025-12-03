import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth.Service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  username = '';
  password = '';
  error = '';
  showPassword = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  submit() {
    this.error = '';

    const ok = this.auth.login(this.username, this.password);

    if (!ok) {
      this.error = 'Invalid credentials';
      return;
    }

    // ✔ redirect instantly after login
    this.router.navigate(['/']);
  }
}