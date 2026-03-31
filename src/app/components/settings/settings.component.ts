import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseService } from '../../services/database.service';
import { DemoDataService } from '../../services/demo-data.service';
import { AnimalService } from '../../services/animal.service';
import { MilkService } from '../../services/milk.service';
import { HealthService } from '../../services/health.service';
import { FeedingService } from '../../services/feeding.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  totalAnimals = 0;
  totalMilkRecords = 0;
  totalHealthRecords = 0;
  totalFeedingRecords = 0;
  databaseStatus = 'Connected';
  showConfirmDialog = false;
  confirmMessage = '';
  confirmAction: (() => void) | null = null;

  constructor(
    private databaseService: DatabaseService,
    private demoDataService: DemoDataService,
    private animalService: AnimalService,
    private milkService: MilkService,
    private healthService: HealthService,
    private feedingService: FeedingService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.animalService.animals$.subscribe(animals => {
      this.totalAnimals = animals.length;
    });

    this.milkService.records$.subscribe(records => {
      this.totalMilkRecords = records.length;
    });

    this.healthService.records$.subscribe(records => {
      this.totalHealthRecords = records.length;
    });

    this.feedingService.records$.subscribe(records => {
      this.totalFeedingRecords = records.length;
    });
  }

  exportData(): void {
    this.databaseService.exportData().subscribe({
      next: (data) => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dairy-farm-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        alert('Data exported successfully!');
      },
      error: (err) => {
        console.error('Export error:', err);
        alert('Error exporting data');
      }
    });
  }

  backupDatabase(): void {
    this.confirmMessage = 'Create a backup of the database?';
    this.confirmAction = () => {
      this.databaseService.backupDatabase().subscribe({
        next: () => {
          alert('Database backed up successfully!');
          this.showConfirmDialog = false;
        },
        error: (err) => {
          console.error('Backup error:', err);
          alert('Error backing up database');
        }
      });
    };
    this.showConfirmDialog = true;
  }

  clearAllData(): void {
    this.confirmMessage = 'WARNING: This will delete ALL farm data permanently! Are you sure?';
    this.confirmAction = () => {
      this.databaseService.clearAllData().subscribe({
        next: () => {
          alert('All data cleared successfully!');
          location.reload();
        },
        error: (err) => {
          console.error('Clear error:', err);
          alert('Error clearing data');
        }
      });
    };
    this.showConfirmDialog = true;
  }

  confirmAction_execute(): void {
    if (this.confirmAction) {
      this.confirmAction();
    }
  }

  cancelConfirm(): void {
    this.showConfirmDialog = false;
    this.confirmAction = null;
  }

  refreshDatabase(): void {
    location.reload();
  }

  loadDemoData(): void {
    this.confirmMessage = 'Load demo/sample data? This will add 4 animals, milk records, health records, and feeding data.';
    this.confirmAction = () => {
      this.demoDataService.loadDemoData();
      setTimeout(() => {
        alert('Demo data loaded successfully! Refresh the page to see the data.');
        location.reload();
      }, 500);
    };
    this.showConfirmDialog = true;
  }
}
