import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  // ===== ANIMALS =====
  getAnimals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/animals`);
  }

  addAnimal(animal: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/animals`, animal);
  }

  updateAnimal(id: string, animal: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/animals/${id}`, animal);
  }

  deleteAnimal(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/animals/${id}`);
  }

  // ===== MILK RECORDS =====
  getMilkRecords(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/milk-records`);
  }

  addMilkRecord(record: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/milk-records`, record);
  }

  updateMilkRecord(id: string, record: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/milk-records/${id}`, record);
  }

  deleteMilkRecord(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/milk-records/${id}`);
  }

  // ===== HEALTH RECORDS =====
  getHealthRecords(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/health-records`);
  }

  addHealthRecord(record: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/health-records`, record);
  }

  updateHealthRecord(id: string, record: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/health-records/${id}`, record);
  }

  deleteHealthRecord(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/health-records/${id}`);
  }

  // ===== FEEDING RECORDS =====
  getFeedingRecords(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/feeding-records`);
  }

  addFeedingRecord(record: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/feeding-records`, record);
  }

  updateFeedingRecord(id: string, record: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/feeding-records/${id}`, record);
  }

  deleteFeedingRecord(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/feeding-records/${id}`);
  }
}
