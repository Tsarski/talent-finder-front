import { Component } from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {AuthenticationRequestDto, UserService} from '../services/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(private userService: UserService,
              private router: Router,
              private snackBar: MatSnackBar) {
  }
  onLogin(): void {
    if (!this.username || !this.password) {
      this.showError('Please enter both username and password');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials: AuthenticationRequestDto = {
      username: this.username,
      password: this.password
    }

    this.userService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful');

        // Save the JWT token
        this.userService.saveToken(response.jwt);

        // Show success message
        this.snackBar.open('Login successful!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        // Navigate to dashboard or home page
        this.router.navigate(['']);

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.isLoading = false;

        let errorMsg = 'Login failed. Please try again.';

        if (error.status === 401) {
          errorMsg = 'Invalid username or password';
        } else if (error.status === 0) {
          errorMsg = 'Connection error. Please check your internet connection.';
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        }

        this.showError(errorMsg);
      }
    });
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  goToRegister(): void {
    this.router.navigate(['/sign-up']);
  }
}
