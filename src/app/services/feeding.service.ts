import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FeedingRecord } from '../models/feeding.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class FeedingService {
  private records = new BehaviorSubject<FeedingRecord[]>([]);
  public records$ = this.records.asObservable();

  public loadData() {
    this.loadRecords();
  }
  
  constructor(private apiService: ApiService) {
    // Load deferred until authenticated
  }

  private loadRecords(): void {
    this.apiService.getFeedingRecords().subscribe({
      next: (data) => this.records.next(data),
      error: (err) => {
        console.error('Error loading feeding records:', err);
        this.records.next([]);
      }
    });
  }

  getRecords(): Observable<FeedingRecord[]> {
    return this.records$;
  }

  addRecord(record: FeedingRecord): void {
    this.apiService.addFeedingRecord(record).subscribe({
      next: (newRecord) => {
        const current = this.records.value;
        current.push(newRecord);
        this.records.next([...current]);
      },
      error: (err) => console.error('Error adding feeding record:', err)
    });
  }

  updateRecord(id: string, updates: Partial<FeedingRecord>): void {
    this.apiService.updateFeedingRecord(id, updates).subscribe({
      next: () => {
        const current = this.records.value;
        const index = current.findIndex(r => r.id === id);
        if (index > -1) {
          current[index] = { ...current[index], ...updates };
          this.records.next([...current]);
        }
      },
      error: (err) => console.error('Error updating feeding record:', err)
    });
  }

  deleteRecord(id: string): void {
    this.apiService.deleteFeedingRecord(id).subscribe({
      next: () => {
        const current = this.records.value.filter(r => r.id !== id);
        this.records.next(current);
      },
      error: (err) => console.error('Error deleting feeding record:', err)
    });
  }
}
