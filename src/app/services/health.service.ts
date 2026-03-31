import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HealthRecord } from '../models/health.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  private records = new BehaviorSubject<HealthRecord[]>([]);
  public records$ = this.records.asObservable();

  public loadData() {
    this.loadRecords();
  }
  
  constructor(private apiService: ApiService) {
    // Load deferred until authenticated
  }

  private loadRecords(): void {
    this.apiService.getHealthRecords().subscribe({
      next: (data) => this.records.next(data),
      error: (err) => {
        console.error('Error loading health records:', err);
        this.records.next([]);
      }
    });
  }

  getRecords(): Observable<HealthRecord[]> {
    return this.records$;
  }

  addRecord(record: HealthRecord): void {
    this.apiService.addHealthRecord(record).subscribe({
      next: (newRecord) => {
        const current = this.records.value;
        current.push(newRecord);
        this.records.next([...current]);
      },
      error: (err) => console.error('Error adding health record:', err)
    });
  }

  updateRecord(id: string, updates: Partial<HealthRecord>): void {
    this.apiService.updateHealthRecord(id, updates).subscribe({
      next: () => {
        const current = this.records.value;
        const index = current.findIndex(r => r.id === id);
        if (index > -1) {
          current[index] = { ...current[index], ...updates };
          this.records.next([...current]);
        }
      },
      error: (err) => console.error('Error updating health record:', err)
    });
  }

  deleteRecord(id: string): void {
    this.apiService.deleteHealthRecord(id).subscribe({
      next: () => {
        const current = this.records.value.filter(r => r.id !== id);
        this.records.next(current);
      },
      error: (err) => console.error('Error deleting health record:', err)
    });
  }
}
