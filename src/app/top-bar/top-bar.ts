import { Component } from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {Router, RouterModule} from '@angular/router';
import {UserService} from '../services/user.service';
import {CommonModule} from '@angular/common';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-top-bar',
  standalone: true,
    imports: [MatToolbarModule, MatButtonModule, RouterModule, CommonModule, MatIcon],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css'
})
export class TopBar {


  constructor(private userService: UserService,
              private router: Router,
              private snackBar: MatSnackBar) {
  }

  isLogged(){
    return this.userService.getToken() != null;
  }

  logout(): void {
    this.userService.logout();
    this.snackBar.open('You have been logged out successfully', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
    this.router.navigate(['/login']);
  }
}
