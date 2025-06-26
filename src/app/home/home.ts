import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatChipsModule} from '@angular/material/chips';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

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

interface CategoryDto {
  id: number;
  name: string;
}

interface LocationDto {
  id: number;
  locationName: string;
}

interface FilterDto {
  categoryName?: string;
  location?: string;
  username?: string;
  serviceName?: string;
  maxPrice?: number;
  minPrice?: number;
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
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatExpansionModule,
    MatIconModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  services: BusinessServicePreviewDto[] = [];
  categories: CategoryDto[] = [];
  locations: LocationDto[] = [];
  loading = true;
  error: string | null = null;
  filterForm: FormGroup;

  private servicesApiUrl = 'http://localhost:8080/api/services';
  private metadataApiUrl = 'http://localhost:8080/api/metadata';

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      serviceName: [''],
      username: [''],
      categoryName: [''],
      location: [''],
      minPrice: ['', [Validators.min(0)]],
      maxPrice: ['', [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    // Load all services and metadata in parallel
    Promise.all([
      this.loadServices(),
      this.loadCategories(),
      this.loadLocations()
    ]).catch(err => {
      console.error('Error loading initial data:', err);
    });
  }

  loadServices(): Promise<void> {
    this.loading = true;
    this.error = null;

    return new Promise((resolve, reject) => {
      this.http.get<BusinessServicePreviewDto[]>(`${this.servicesApiUrl}/getAll`).subscribe({
        next: (data) => {
          this.services = data;
          console.log(this.services, '------------------');
          this.loading = false;
          resolve();
        },
        error: (err) => {
          this.error = 'Failed to load services. Please try again later.';
          this.loading = false;
          console.error('Error loading services:', err);
          reject(err);
        }
      });
    });
  }

  loadCategories(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<CategoryDto[]>(`${this.metadataApiUrl}/categories`).subscribe({
        next: (data) => {
          this.categories = data;
          console.log('Categories loaded:', this.categories);
          resolve();
        },
        error: (err) => {
          console.error('Error loading categories:', err);
          reject(err);
        }
      });
    });
  }

  loadLocations(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<LocationDto[]>(`${this.metadataApiUrl}/locations`).subscribe({
        next: (data) => {
          this.locations = data;
          console.log('Locations loaded:', this.locations);
          resolve();
        },
        error: (err) => {
          console.error('Error loading locations:', err);
          reject(err);
        }
      });
    });
  }

  onSearch(): void {
    if (this.filterForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const minPrice = this.filterForm.get('minPrice')?.value;
    const maxPrice = this.filterForm.get('maxPrice')?.value;

    if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
      this.error = 'Minimum price cannot be greater than maximum price.';
      return;
    }

    this.loading = true;
    this.error = null;

    const formValues = this.filterForm.value;
    const filterDto: FilterDto = {};

    if (formValues.serviceName?.trim()) {
      filterDto.serviceName = formValues.serviceName.trim();
    }
    if (formValues.username?.trim()) {
      filterDto.username = formValues.username.trim();
    }
    if (formValues.categoryName) {
      filterDto.categoryName = formValues.categoryName;
    }
    if (formValues.location) {
      filterDto.location = formValues.location;
    }
    if (formValues.minPrice) {
      filterDto.minPrice = parseFloat(formValues.minPrice);
    }
    if (formValues.maxPrice) {
      filterDto.maxPrice = parseFloat(formValues.maxPrice);
    }

    console.log('Searching with filters:', filterDto);

    this.http.post<BusinessServicePreviewDto[]>(`${this.servicesApiUrl}/getByCriteria`, filterDto).subscribe({
      next: (data) => {
        this.services = data;
        this.loading = false;
        console.log('Filtered services:', this.services);
      },
      error: (err) => {
        this.error = 'Failed to search services. Please try again later.';
        this.loading = false;
        console.error('Error searching services:', err);
      }
    });
  }

  onClear(): void {
    this.filterForm.reset();
    this.error = null;
    this.loadServices();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.filterForm.controls).forEach(key => {
      const control = this.filterForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.filterForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['min']) {
        return `${fieldName} must be greater than or equal to 0`;
      }
    }
    return '';
  }

  getFullName(user: PublicUserDataDto): string {
    return `${user.firstName} ${user.lastName}`.trim();
  }

  onServiceClick(service: BusinessServicePreviewDto): void {
    console.log("clicked on service ---->", service.id);
    this.router.navigate(['/service', service.id]);
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
