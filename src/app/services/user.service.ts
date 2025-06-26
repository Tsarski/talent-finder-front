import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface UserProfileDto {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
}

export interface AuthenticationRequestDto {
  username: string;
  password: string;
}

export interface AuthenticationResponse {
  jwt: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/auth';
  constructor(private http: HttpClient) { }

  register(user: UserProfileDto): Observable<any>{
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(credentials: AuthenticationRequestDto): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.apiUrl}/login`, credentials);
  }

  saveToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  }

  saveUsername(username: string): void {
    localStorage.setItem('username', username);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  getUsername() : string | null {
    return localStorage.getItem('username');
  }

  removeToken(): void {
    localStorage.removeItem('jwt_token');
  }

  removeUsername(): void {
    localStorage.removeItem('username');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Check if token is expired (optional - requires jwt decoding)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  logout(): void {
    this.removeToken();
    this.removeUsername();
  }
}
