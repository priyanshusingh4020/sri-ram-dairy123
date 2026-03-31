import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimalService } from '../../services/animal.service';
import { MilkService } from '../../services/milk.service';
import { HealthService } from '../../services/health.service';
import { FeedingService } from '../../services/feeding.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalAnimals = 0;
  totalMilkProduction = 0;
  totalHealthIssues = 0;
  totalFeedingExpense = 0;

  constructor(
    private animalService: AnimalService,
    private milkService: MilkService,
    private healthService: HealthService,
    private feedingService: FeedingService
  ) {}

  ngOnInit(): void {
    // Load data after auth confirmed
    this.animalService.loadData();
    this.milkService.loadData();
    this.healthService.loadData();
    this.feedingService.loadData();

    this.animalService.animals$.subscribe(animals => {
      this.totalAnimals = animals.length;
    });

    this.milkService.records$.subscribe(records => {
      this.totalMilkProduction = records.reduce((sum, r) => sum + r.quantity, 0);
    });

    this.healthService.records$.subscribe(records => {
      this.totalHealthIssues = records.length;
    });

    this.feedingService.records$.subscribe(records => {
      this.totalFeedingExpense = records.reduce((sum, r) => sum + r.cost, 0);
    });
  }
}
