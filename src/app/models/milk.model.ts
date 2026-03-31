export interface MilkRecord {
  id: string;
  animalId: string;
  date: Date;
  quantity: number; // in liters
  quality: 'high' | 'medium' | 'low';
  temperature: number; // in Celsius
}
