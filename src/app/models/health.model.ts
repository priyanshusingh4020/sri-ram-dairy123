export interface HealthRecord {
  id: string;
  animalId: string;
  date: Date;
  illness: string;
  treatment: string;
  veterinarian: string;
  cost: number;
  status: 'recovering' | 'treated' | 'ongoing';
  vaccination: boolean;
}

