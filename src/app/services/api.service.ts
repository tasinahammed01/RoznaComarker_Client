import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/api'; // Update this to your backend URL

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      } else {
        errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    return throwError(() => ({ ...error, message: errorMessage }));
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}
