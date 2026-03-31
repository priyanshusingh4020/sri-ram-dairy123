import { Injectable } from '@angular/core';
import { AnimalService } from './animal.service';
import { MilkService } from './milk.service';
import { HealthService } from './health.service';
import { FeedingService } from './feeding.service';

@Injectable({
  providedIn: 'root'
})
export class DemoDataService {
  constructor(
    private animalService: AnimalService,
    private milkService: MilkService,
    private healthService: HealthService,
    private feedingService: FeedingService
  ) {}

  loadDemoData(): void {
    // Demo Animals
    const demoAnimals = [
      {
        id: 'animal_1',
        name: 'Bessie',
        type: 'cow' as const,
        breed: 'Holstein',
        age: 3,
        weight: 650,
        status: 'healthy' as const,
        dateAdded: new Date('2024-01-15')
      },
      {
        id: 'animal_2',
        name: 'Daisy',
        type: 'cow' as const,
        breed: 'Jersey',
        age: 2,
        weight: 450,
        status: 'healthy' as const,
        dateAdded: new Date('2024-02-20')
      },
      {
        id: 'animal_3',
        name: 'Molly',
        type: 'buffalo' as const,
        breed: 'Murrah',
        age: 4,
        weight: 700,
        status: 'healthy' as const,
        dateAdded: new Date('2023-06 Asc 10')
      },
      {
        id: 'animal_4',
        name: 'Luna',
        type: 'goat' as const,
        breed: 'Alpine',
        age: 1,
        weight: 70,
        status: 'healthy' as const,
        dateAdded: new Date('2024-01-05')
      }
    ];

    // Demo Milk Records (Recent dates)
    const demoMilkRecords = [
      {
        id: 'milk_1',
        animalId: 'animal_1',
        date: new Date('2024-10-25'),
        quantity: 28.5,
        quality: 'high' as const,
        temperature: 37.2
      },
      {
        id: 'milk_2',
        animalId: 'animal_1',
        date: new Date('2024-10-26'),
        quantity: 27.8,
        quality: 'high' as const,
        temperature: 37.1
      },
      {
        id: 'milk_3',
        animalId: 'animal_2',
        date: new Date('2024-10-25'),
        quantity: 22.3,
        quality: 'high' as const,
        temperature: 37.0
      },
      {
        id: 'milk_4',
        animalId: 'animal_2',
        date: new Date('2024-10-26'),
        quantity: 23.1,
        quality: 'medium' as const,
        temperature: 37.3
      },
      {
        id: 'milk_5',
        animalId: 'animal_3',
        date: new Date('2024-10-25'),
        quantity: 35.0,
        quality: 'high' as const,
        temperature: 37.5
      }
    ];

    // Demo Health Records (Recent dates)
    const demoHealthRecords = [
      {
        id: 'health_1',
        animalId: 'animal_1',
        date: new Date('2024-10-10'),
        illness: 'Minor Fever',
        treatment: 'Antibiotics and rest',
        veterinarian: 'Dr. Sharma',
        cost: 1500,
        status: 'treated' as const,
        vaccination: false
      },
      {
        id: 'health_2',
        animalId: 'animal_3',
        date: new Date('2024-09-20'),
        illness: 'Mastitis',
        treatment: 'Milking hygiene and medication',
        veterinarian: 'Dr. Patel',
        cost: 2500,
        status: 'treated' as const,
        vaccination: false
      },
      {
        id: 'health_3',
        animalId: 'animal_4',
        date: new Date('2024-10-15'),
        illness: 'Routine Checkup',
        treatment: 'Vaccination',
        veterinarian: 'Dr. Sharma',
        cost: 800,
        status: 'treated' as const,
        vaccination: true
      }
    ];

    // Demo Feeding Records (Recent dates)
    const demoFeedingRecords = [
      {
        id: 'feed_1',
        animalId: 'animal_1',
        date: new Date('2024-10-25'),
        feedType: 'Premium Hay',
        quantity: 15,
        cost: 450,
        notes: 'Morning feeding'
      },
      {
        id: 'feed_2',
        animalId: 'animal_1',
        date: new Date('2024-10-25'),
        feedType: 'Grain Mix',
        quantity: 8,
        cost: 320,
        notes: 'Evening supplement'
      },
      {
        id: 'feed_3',
        animalId: 'animal_2',
        date: new Date('2024-10-25'),
        feedType: 'Silage',
        quantity: 12,
        cost: 280,
        notes: 'Daily ration'
      },
      {
        id: 'feed_4',
        animalId: 'animal_3',
        date: new Date('2024-10-25'),
        feedType: 'Premium Hay',
        quantity: 18,
        cost: 540,
        notes: 'High quality for milk production'
      },
      {
        id: 'feed_5',
        animalId: 'animal_4',
        date: new Date('2024-10-25'),
        feedType: 'Grass & Clover',
        quantity: 5,
        cost: 150,
        notes: 'Grazing'
      },
      {
        id: 'feed_6',
        animalId: 'animal_1',
        date: new Date('2024-10-26'),
        feedType: 'Premium Hay',
        quantity: 15,
        cost: 450,
        notes: 'Morning feeding'
      },
      {
        id: 'feed_7',
        animalId: 'animal_2',
        date: new Date('2024-10-26'),
        feedType: 'Grain Mix',
        quantity: 7,
        cost: 280,
        notes: 'Evening supplement'
      }
    ];

    // Add all demo data
    demoAnimals.forEach(animal => this.animalService.addAnimal(animal));
    demoMilkRecords.forEach(record => this.milkService.addRecord(record));
    demoHealthRecords.forEach(record => this.healthService.addRecord(record));
    demoFeedingRecords.forEach(record => this.feedingService.addRecord(record));

    console.log('Demo data loaded successfully!');
  }
}
