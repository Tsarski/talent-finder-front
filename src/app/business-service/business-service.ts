import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {last} from 'rxjs';

// Interfaces matching your DTOs
interface PublicUserDataDto {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

interface ReviewDto {
  id: number;
  rating: number;
  description: string;
  author: string;
}

interface BusinessServiceDto {
  id: number;
  title: string;
  description: string;
  price: number;
  serviceCategory: string;
  location: string;
  user: PublicUserDataDto;
  pictures: string[];
  videos: string[];
  reviews: ReviewDto[];
}

@Component({
  selector: 'app-business-service',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDividerModule,
    HttpClientModule
  ],
  templateUrl: './business-service.html',
  styleUrl: './business-service.css'
})
export class BusinessService implements OnInit {
  service: BusinessServiceDto | null = null;
  loading = true;
  error: string | null = null;
  serviceId: string | null = null;

  // Review form
  reviewForm: FormGroup;
  submittingReview = false;

  // Image gallery
  selectedImageIndex = 0;

  private apiUrl = 'http://localhost:8080/api/services';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('id');
    if (this.serviceId) {
      this.loadService();
    } else {
      this.error = 'Invalid service ID';
      this.loading = false;
    }
  }

  loadService(): void {
    if (!this.serviceId) return;

    this.loading = true;
    this.error = null;

    this.http.get<BusinessServiceDto>(`${this.apiUrl}/get/${this.serviceId}`).subscribe({
      next: (data) => {
        this.service = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load service details. Please try again later.';
        this.loading = false;
        console.error('Error loading service:', err);
      }
    });
  }

  getFullName(user: PublicUserDataDto): string {
    return `${user.firstName} ${user.lastName}`.trim();
  }

  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < rating);
  }

  getYouTubeEmbedUrl(url: string): SafeResourceUrl {
    // Convert YouTube URL to embed URL
    let embedUrl = url;

    // Handle different YouTube URL formats
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('watch?v=')[1].split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtube.com/embed/')) {
      embedUrl = url;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder-service.jpg';
  }

  onSubmitReview(): void {
    if (this.reviewForm.valid && this.service) {
      this.submittingReview = true;

      const reviewData = {
        rating: this.reviewForm.get('rating')?.value,
        description: this.reviewForm.get('description')?.value,
        serviceId: this.service.id
      };

      // TODO: Implement review submission API call
      console.log('Submitting review:', reviewData);

      // Simulate API call
      setTimeout(() => {
        this.submittingReview = false;
        this.reviewForm.reset({ rating: 5, description: '' });
        // TODO: Refresh service data to show new review
        alert('Review submitted successfully!');
      }, 2000);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  getRatingNumbers(): number[] {
    return [1, 2, 3, 4, 5];
  }

  protected readonly last = last;
}
