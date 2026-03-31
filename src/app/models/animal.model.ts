export interface Animal {
  id: string;
  name: string;
  type: 'cow' | 'buffalo' | 'goat';
  breed: string;
  age: number;
  weight: number;
  status: 'healthy' | 'sick' | 'inactive';
  dateAdded: Date;
}
