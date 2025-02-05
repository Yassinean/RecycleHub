import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { nonAuthGuard } from './core/guards/non-auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [nonAuthGuard],
    children: [
      {
        path: 'login',
        component: LoginComponent,
        title: 'Login - RecycleHub'
      },
      {
        path: 'register',
        component: RegisterComponent,
        title: 'Register - RecycleHub'
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  // {
  //   path: 'home',
  //   loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  // },
  // {
  //   path: 'dashboard',
  //   loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
  //   canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)]
  // }
];