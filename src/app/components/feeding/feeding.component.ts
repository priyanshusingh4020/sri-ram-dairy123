import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedingService } from '../../services/feeding.service';
import { AnimalService } from '../../services/animal.service';
import { FeedingRecord } from '../../models/feeding.model';
import { Animal } from '../../models/animal.model';

@Component({
  selector: 'app-feeding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feeding.component.html',
  styleUrls: ['./feeding.component.css']
})
export class FeedingComponent implements OnInit {
  records: FeedingRecord[] = [];
  animals: Animal[] = [];
  showForm = false;
  editingId: string | null = null;

  form = {
    id: '',
    animalId: '',
    date: new Date(),
    feedType: '',
    quantity: 0,
    cost: 0,
    notes: ''
  };

  constructor(
    private feedingService: FeedingService,
    private animalService: AnimalService
  ) {}

  ngOnInit(): void {
    this.feedingService.records$.subscribe(records => {
      this.records = records;
    });

    this.animalService.animals$.subscribe(animals => {
      this.animals = animals;
    });
  }

  openForm(record?: FeedingRecord): void {
    if (record) {
      this.editingId = record.id;
      this.form = { ...record };
    } else {
      this.form = {
        id: Date.now().toString(),
        animalId: '',
        date: new Date(),
        feedType: '',
        quantity: 0,
        cost: 0,
        notes: ''
      };
    }
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  saveRecord(): void {
    if (!this.form.animalId || !this.form.feedType || !this.form.quantity) {
      alert('Please fill in all required fields');
      return;
    }
    const recordData: any = {
      ...this.form,
      date: new Date(this.form.date).toISOString()
    };
    if (this.editingId) {
      this.feedingService.updateRecord(this.editingId, recordData);
      console.log('Feeding record updated:', recordData);
    } else {
      recordData.id = Date.now().toString();
      this.feedingService.addRecord(recordData);
      console.log('Feeding record added:', recordData);
    }
    this.closeForm();
  }

  deleteRecord(id: string): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.feedingService.deleteRecord(id);
    }
  }

  getAnimalName(animalId: string): string {
    return this.animals.find(a => a.id === animalId)?.name || 'Unknown';
  }

  getTotalCost(): number {
    return this.records.reduce((sum, r) => sum + r.cost, 0);
  }
}
