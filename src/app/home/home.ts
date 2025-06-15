import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatChipsModule} from '@angular/material/chips';
import {HttpClient, HttpClientModule} from '@angular/common/http';

// Interface matching your DTOs
interface PublicUserDataDto {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

interface BusinessServicePreviewDto {
  id: number;
  title: string;
  price: number;
  serviceCategory: string;
  user: PublicUserDataDto;
  mainPicture: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    HttpClientModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  services: BusinessServicePreviewDto[] = [];
  loading = true;
  error: string | null = null;

  private apiUrl = 'http://localhost:8080/api/services/getAll'

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading = true;
    this.error = null;

    this.http.get<BusinessServicePreviewDto[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.services = data;
        console.log(this.services, '------------------')
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load services. Please try again later.';
        this.loading = false;
        console.error('Error loading services:', err);
      }
    });
  }

  getFullName(user: PublicUserDataDto): string {
    return `${user.firstName} ${user.lastName}`.trim();
  }

  onServiceClick(service: BusinessServicePreviewDto): void {
    // Handle service click - navigate to detail page or show more info
    console.log('Service clicked:', service);
  }

  onImageError(event: any): void {
    // Handle image load error with placeholder
    // event.target.src = 'assets/images/placeholder-service.jpg';
  }

  getCols(): number {
    // Responsive grid columns based on screen width
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 600) return 1;      // Mobile
      if (width < 960) return 2;      // Tablet
      if (width < 1200) return 3;     // Small desktop
      return 4;                       // Large desktop
    }
    return 4; // Default fallback
  }
}
