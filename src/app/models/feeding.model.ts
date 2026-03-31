export interface FeedingRecord {
  id: string;
  animalId: string;
  date: Date;
  feedType: string;
  quantity: number; // in kg
  cost: number;
  notes: string;
}
