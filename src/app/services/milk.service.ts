import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MilkRecord } from '../models/milk.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class MilkService {
  private records = new BehaviorSubject<MilkRecord[]>([]);
  public records$ = this.records.asObservable();

  public loadData() {
    this.loadRecords();
  }
  
  constructor(private apiService: ApiService) {
    // Load deferred until authenticated
  }

  private loadRecords(): void {
    this.apiService.getMilkRecords().subscribe({
      next: (data) => this.records.next(data),
      error: (err) => {
        console.error('Error loading milk records:', err);
        this.records.next([]);
      }
    });
  }

  getRecords(): Observable<MilkRecord[]> {
    return this.records$;
  }

  addRecord(record: MilkRecord): void {
    this.apiService.addMilkRecord(record).subscribe({
      next: (newRecord) => {
        const current = this.records.value;
        current.push(newRecord);
        this.records.next([...current]);
      },
      error: (err) => console.error('Error adding milk record:', err)
    });
  }

  updateRecord(id: string, updates: Partial<MilkRecord>): void {
    this.apiService.updateMilkRecord(id, updates).subscribe({
      next: () => {
        const current = this.records.value;
        const index = current.findIndex(r => r.id === id);
        if (index > -1) {
          current[index] = { ...current[index], ...updates };
          this.records.next([...current]);
        }
      },
      error: (err) => console.error('Error updating milk record:', err)
    });
  }

  deleteRecord(id: string): void {
    this.apiService.deleteMilkRecord(id).subscribe({
      next: () => {
        const current = this.records.value.filter(r => r.id !== id);
        this.records.next(current);
      },
      error: (err) => console.error('Error deleting milk record:', err)
    });
  }

  getTotalMilkProduction(): Observable<number> {
    return new Observable(observer => {
      this.records$.subscribe(records => {
        const total = records.reduce((sum, r) => sum + r.quantity, 0);
        observer.next(total);
      });
    });
  }
}
