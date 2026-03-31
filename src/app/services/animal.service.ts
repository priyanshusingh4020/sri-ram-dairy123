import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Animal } from '../models/animal.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AnimalService {
  private animals = new BehaviorSubject<Animal[]>([]);
  public animals$ = this.animals.asObservable();

  public loadData() {
    this.loadAnimals();
  }
  
  constructor(private apiService: ApiService) {
    // Load deferred until authenticated
  }

  private loadAnimals(): void {
    this.apiService.getAnimals().subscribe({
      next: (data) => this.animals.next(data),
      error: (err) => {
        console.error('Error loading animals:', err);
        this.animals.next([]);
      }
    });
  }

  getAnimals(): Observable<Animal[]> {
    return this.animals$;
  }

  addAnimal(animal: Animal): void {
    this.apiService.addAnimal(animal).subscribe({
      next: (newAnimal) => {
        const current = this.animals.value;
        current.push(newAnimal);
        this.animals.next([...current]);
      },
      error: (err) => console.error('Error adding animal:', err)
    });
  }

  updateAnimal(id: string, updates: Partial<Animal>): void {
    this.apiService.updateAnimal(id, updates).subscribe({
      next: () => {
        const current = this.animals.value;
        const index = current.findIndex(a => a.id === id);
        if (index > -1) {
          current[index] = { ...current[index], ...updates };
          this.animals.next([...current]);
        }
      },
      error: (err) => console.error('Error updating animal:', err)
    });
  }

  deleteAnimal(id: string): void {
    this.apiService.deleteAnimal(id).subscribe({
      next: () => {
        const current = this.animals.value.filter(a => a.id !== id);
        this.animals.next(current);
      },
      error: (err) => console.error('Error deleting animal:', err)
    });
  }
}
