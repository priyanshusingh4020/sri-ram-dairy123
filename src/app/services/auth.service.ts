import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, map, catchError, shareReplay } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  private currentUser$ = new BehaviorSubject<User | null>(null);
  private isAuthenticated$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string | null>(null);
  private token: string | null = null;

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  // Load user from localStorage on init
  private loadUserFromStorage(): void {
    try {
      const storedUser = localStorage.getItem('currentUser');
      const storedToken = localStorage.getItem('authToken');
      
      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser);
        this.currentUser$.next(user);
        this.token = storedToken;
        this.isAuthenticated$.next(true);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.logout();
    }
  }

  // Register new user
  register(email: string, password: string, name: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
      email,
      password,
      name
    }).pipe(
      tap(response => {
        this.setUser(response.user, response.token);
        this.error$.next(null);
      }),
      catchError(error => this.handleError(error)),
      shareReplay(1)
    );
  }

  // Login user
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        this.setUser(response.user, response.token);
        this.error$.next(null);
      }),
      catchError(error => this.handleError(error)),
      shareReplay(1)
    );
  }

  // Logout user
  logout(): void {
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    
    this.currentUser$.next(null);
    this.token = null;
    this.isAuthenticated$.next(false);
    this.error$.next(null);
  }

  // Set user and token
  private setUser(user: User, token: string): void {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
    
    this.currentUser$.next(user);
    this.token = token;
    this.isAuthenticated$.next(true);
  }

  // Handle HTTP errors
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (typeof error.error === 'object' && error.error !== null) {
      errorMessage = error.error.message || error.error.error || `Server Error: ${error.status}`;
    } else {
      errorMessage = `Server Error: ${error.status}`;
    }

    this.error$.next(errorMessage);
    return throwError(() => ({ ...error, error: { ...error.error, message: errorMessage } }));
  }

  // Get current user observable
  getCurrentUser(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  // Get authentication status observable
  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$.asObservable();
  }

  // Get error observable
  getError(): Observable<string | null> {
    return this.error$.asObservable();
  }

  // Get current user value
  getCurrentUserValue(): User | null {
    return this.currentUser$.value;
  }

  // Get auth token
  getToken(): string | null {
    return this.token;
  }
}