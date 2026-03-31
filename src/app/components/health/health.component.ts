import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HealthService } from '../../services/health.service';
import { AnimalService } from '../../services/animal.service';
import { HealthRecord } from '../../models/health.model';
import { Animal } from '../../models/animal.model';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './health.component.html',
  styleUrls: ['./health.component.css']
})
export class HealthComponent implements OnInit {
  records: HealthRecord[] = [];
  animals: Animal[] = [];
  showForm = false;
  editingId: string | null = null;

  form = {
    id: '',
    animalId: '',
    date: new Date(),
    illness: '',
    treatment: '',
    veterinarian: '',
    cost: 0,
    vaccination: false,
    status: 'recovering' as 'recovering' | 'treated' | 'ongoing'
  };

  constructor(
    private healthService: HealthService,
    private animalService: AnimalService
  ) {}

  ngOnInit(): void {
    this.healthService.records$.subscribe(records => {
      this.records = records;
    });

    this.animalService.animals$.subscribe(animals => {
      this.animals = animals;
    });
  }

  openForm(record?: HealthRecord): void {
    if (record) {
      this.editingId = record.id;
      this.form = { ...record };
    } else {
      this.form = {
        id: Date.now().toString(),
        animalId: '',
        date: new Date(),
        illness: '',
        treatment: '',
        veterinarian: '',
        cost: 0,
        vaccination: false,
        status: 'recovering'
      };
    }
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  saveRecord(): void {
    if (!this.form.animalId || !this.form.illness || !this.form.treatment) {
      alert('Please fill in all required fields');
      return;
    }
    const recordData: any = {
      ...this.form,
      date: new Date(this.form.date).toISOString()
    };
    if (this.editingId) {
      this.healthService.updateRecord(this.editingId, recordData);
      console.log('Health record updated:', recordData);
    } else {
      recordData.id = Date.now().toString();
      this.healthService.addRecord(recordData);
      console.log('Health record added:', recordData);
    }
    this.closeForm();
  }

  deleteRecord(id: string): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.healthService.deleteRecord(id);
    }
  }

  getAnimalName(animalId: string): string {
    return this.animals.find(a => a.id === animalId)?.name || 'Unknown';
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'treated': return '#10b981';
      case 'recovering': return '#f59e0b';
      case 'ongoing': return '#ef4444';
      default: return '#6b7280';
    }
  }

  toggleStatus(record: HealthRecord): void {
    const statuses: Array<'recovering' | 'treated' | 'ongoing'> = ['recovering', 'treated', 'ongoing'];
    const currentIndex = statuses.indexOf(record.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    this.healthService.updateRecord(record.id, { status: statuses[nextIndex] });
  }
}

