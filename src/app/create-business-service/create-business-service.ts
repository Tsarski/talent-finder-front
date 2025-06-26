import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

// DTOs for form structure
interface CategoryDto {
  id: number;
  name: string;
}

interface LocationDto {
  id: number;
  locationName: string;
}

interface CreateBusinessServiceDto {
  title: string;
  description: string;
  price: number;
  serviceCategory: string;
  location: string;
  username: string;
  images: File[];
  videoLinks: string[];
}

@Component({
  selector: 'app-create-business-service',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    HttpClientModule
  ],
  templateUrl: './create-business-service.html',
  styleUrl: './create-business-service.css'
})
export class CreateBusinessService implements OnInit {

  serviceForm: FormGroup;
  categories: CategoryDto[] = [];
  locations: LocationDto[] = [];
  loading = false;
  submitting = false;
  error: string | null = null;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];

  private metadataApiUrl = 'http://localhost:8080/api/metadata';
  private servicesApiUrl = 'http://localhost:8080/api/services';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private userService: UserService
  ) {
    this.serviceForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      serviceCategory: ['', Validators.required],
      location: ['', Validators.required],
      videoLinks: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.addVideoLinkField(); // Add initial video link field
  }

  loadInitialData(): void {
    this.loading = true;
    Promise.all([
      this.loadCategories(),
      this.loadLocations()
    ]).finally(() => {
      this.loading = false;
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
          this.error = 'Failed to load categories';
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
          this.error = 'Failed to load locations';
          reject(err);
        }
      });
    });
  }

  get videoLinksArray(): FormArray {
    return this.serviceForm.get('videoLinks') as FormArray;
  }

  addVideoLinkField(): void {
    const videoLinkControl = this.fb.control('', [
      Validators.pattern(/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+(&[\w=]*)?$/)
    ]);
    this.videoLinksArray.push(videoLinkControl);
  }

  removeVideoLinkField(index: number): void {
    if (this.videoLinksArray.length > 1) {
      this.videoLinksArray.removeAt(index);
    }
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;

    if (files && files.length > 0) {
      // Limit to 5 images
      const maxFiles = 5;
      const selectedFiles = Array.from(files).slice(0, maxFiles);

      // Validate file types and sizes
      const validFiles: File[] = [];
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      for (const file of selectedFiles) {
        if (!validTypes.includes(file.type)) {
          this.error = 'Only JPEG, PNG, and JPG files are allowed';
          continue;
        }
        if (file.size > maxSize) {
          this.error = 'File size must be less than 5MB';
          continue;
        }
        validFiles.push(file);
      }

      this.selectedFiles = validFiles;
      this.generatePreviews();
    }
  }

  generatePreviews(): void {
    this.previewUrls = [];

    this.selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrls.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  onSubmit(): void {
    if (this.serviceForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    if (!this.userService.isLoggedIn()) {
      this.error = 'You must be logged in to create a service';
      this.router.navigate(['/login']);
      return;
    }

    if (this.selectedFiles.length === 0) {
      this.error = 'Please select at least one image';
      return;
    }

    this.submitting = true;
    this.error = null;

    const formData = new FormData();
    const formValues = this.serviceForm.value;

    // Add form fields
    formData.append('title', formValues.title);
    formData.append('description', formValues.description);
    formData.append('price', formValues.price.toString());
    formData.append('serviceCategory', formValues.serviceCategory);
    formData.append('location', formValues.location);
    formData.append('username', this.userService.getUsername() || '');

    // Add images
    this.selectedFiles.forEach((file, index) => {
      formData.append('images', file, file.name);
    });

    // Add video links (filter out empty ones)
    const videoLinks = formValues.videoLinks.filter((link: string) => link.trim() !== '');
    videoLinks.forEach((link: string, index: number) => {
      formData.append('videoLinks', link);
    });

    console.log('Submitting service data to create endpoint...');

    // This POST request is only made when the user clicks "Create Service" button
    this.http.post(`${this.servicesApiUrl}/create`, formData).subscribe({
      next: (response) => {
        console.log('Service created successfully:', response);
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error creating service:', err);
        this.error = 'Failed to create service. Please try again.';
        this.submitting = false;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.serviceForm.controls).forEach(key => {
      const control = this.serviceForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          arrayControl.markAsTouched();
        });
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.serviceForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${fieldName} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `${fieldName} must be greater than ${field.errors['min'].min}`;
      }
      if (field.errors['pattern']) {
        return 'Please enter a valid YouTube URL';
      }
    }
    return '';
  }

  getVideoLinkError(index: number): string {
    const control = this.videoLinksArray.at(index);
    if (control?.errors && control.touched) {
      if (control.errors['pattern']) {
        return 'Please enter a valid YouTube URL';
      }
    }
    return '';
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }
}
