import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MilkService } from '../../services/milk.service';
import { AnimalService } from '../../services/animal.service';
import { MilkRecord } from '../../models/milk.model';
import { Animal } from '../../models/animal.model';

@Component({
  selector: 'app-milk',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './milk.component.html',
  styleUrls: ['./milk.component.css']
})
export class MilkComponent implements OnInit {
  records: MilkRecord[] = [];
  animals: Animal[] = [];
  showForm = false;
  editingId: string | null = null;

  form = {
    id: '',
    animalId: '',
    date: new Date(),
    quantity: 0,
    quality: 'high' as 'high' | 'medium' | 'low',
    temperature: 37
  };

  constructor(
    private milkService: MilkService,
    private animalService: AnimalService
  ) {}

  ngOnInit(): void {
    this.milkService.records$.subscribe(records => {
      this.records = records;
    });

    this.animalService.animals$.subscribe(animals => {
      this.animals = animals;
    });
  }

  openForm(record?: MilkRecord): void {
    if (record) {
      this.editingId = record.id;
      this.form = { ...record };
    } else {
      this.form = {
        id: Date.now().toString(),
        animalId: '',
        date: new Date(),
        quantity: 0,
        quality: 'high',
        temperature: 37
      };
    }
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  saveRecord(): void {
    if (!this.form.animalId || !this.form.quantity) {
      alert('Please fill in all required fields');
      return;
    }
    const recordData: any = {
      ...this.form,
      date: new Date(this.form.date).toISOString()
    };
    if (this.editingId) {
      this.milkService.updateRecord(this.editingId, recordData);
      console.log('Milk record updated:', recordData);
    } else {
      recordData.id = Date.now().toString();
      this.milkService.addRecord(recordData);
      console.log('Milk record added:', recordData);
    }
    this.closeForm();
  }

  deleteRecord(id: string): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.milkService.deleteRecord(id);
    }
  }

  getAnimalName(animalId: string): string {
    return this.animals.find(a => a.id === animalId)?.name || 'Unknown';
  }

  getQualityColor(quality: string): string {
    switch(quality) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#6b7280';
    }
  }

  toggleQuality(record: MilkRecord): void {
    const qualities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
    const currentIndex = qualities.indexOf(record.quality);
    const nextIndex = (currentIndex + 1) % qualities.length;
    this.milkService.updateRecord(record.id, { quality: qualities[nextIndex] });
  }
}
