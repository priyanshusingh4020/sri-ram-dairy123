import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnimalService } from '../../services/animal.service';
import { Animal } from '../../models/animal.model';

@Component({
  selector: 'app-animal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './animal.component.html',
  styleUrls: ['./animal.component.css']
})
export class AnimalComponent implements OnInit {
  animals: Animal[] = [];
  showForm = false;
  editingId: string | null = null;

  form = {
    id: '',
    name: '',
    type: 'cow' as 'cow' | 'buffalo' | 'goat',
    breed: '',
    age: 0,
    weight: 0,
    status: 'healthy' as 'healthy' | 'sick' | 'inactive',
    dateAdded: new Date()
  };

  constructor(private animalService: AnimalService) {}

  ngOnInit(): void {
    this.animalService.animals$.subscribe(animals => {
      this.animals = animals;
    });
  }

  openForm(animal?: Animal): void {
    if (animal) {
      this.editingId = animal.id;
      this.form = { ...animal };
    } else {
      this.form = {
        id: Date.now().toString(),
        name: '',
        type: 'cow',
        breed: '',
        age: 0,
        weight: 0,
        status: 'healthy',
        dateAdded: new Date()
      };
    }
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  saveAnimal(): void {
    if (!this.form.name || !this.form.breed) {
      alert('Please fill in all required fields');
      return;
    }
    const animalData: any = {
      ...this.form,
      dateAdded: new Date(this.form.dateAdded).toISOString()
    };
    if (this.editingId) {
      this.animalService.updateAnimal(this.editingId, animalData);
      console.log('Animal updated:', animalData);
    } else {
      animalData.id = Date.now().toString();
      this.animalService.addAnimal(animalData);
      console.log('Animal added:', animalData);
    }
    this.closeForm();
  }

  deleteAnimal(id: string): void {
    if (confirm('Are you sure you want to delete this animal?')) {
      this.animalService.deleteAnimal(id);
    }
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'healthy': return '#10b981';
      case 'sick': return '#ef4444';
      case 'inactive': return '#6b7280';
      default: return '#6b7280';
    }
  }

  toggleStatus(animal: Animal): void {
    const statuses: Array<'healthy' | 'sick' | 'inactive'> = ['healthy', 'sick', 'inactive'];
    const currentIndex = statuses.indexOf(animal.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    this.animalService.updateAnimal(animal.id, { status: statuses[nextIndex] });
  }
}
