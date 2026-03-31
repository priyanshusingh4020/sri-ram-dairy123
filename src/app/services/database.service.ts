import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  // Get database statistics
  getDbStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/db-stats`);
  }

  // Export all data
  exportData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/export-data`);
  }

  // Backup database
  backupDatabase(): Observable<any> {
    return this.http.get(`${this.apiUrl}/backup-db`);
  }

  // Clear all data
  clearAllData(): Observable<any> {
    return this.http.post(`${this.apiUrl}/clear-all-data`, {});
  }
}
