import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AnimalComponent } from './components/animal/animal.component';
import { MilkComponent } from './components/milk/milk.component';
import { HealthComponent } from './components/health/health.component';
import { FeedingComponent } from './components/feeding/feeding.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Default route - redirect to login if not authenticated, dashboard if authenticated
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Auth routes (no guard required)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Protected routes (require authentication)
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'animal', component: AnimalComponent, canActivate: [AuthGuard] },
  { path: 'milk', component: MilkComponent, canActivate: [AuthGuard] },
  { path: 'health', component: HealthComponent, canActivate: [AuthGuard] },
  { path: 'feeding', component: FeedingComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] }
];