import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { nonAuthGuard } from './core/guards/non-auth.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
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
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => 
      import('./features/dashboard/components/dashboard-layout/dashboard-layout.component')
        .then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: 'home',
        loadComponent: () => 
          import('./features/dashboard/dashboard-home/dashboard-home.component')
            .then(m => m.DashboardHomeComponent)
      },
      {
        path: 'collections',
        loadComponent: () => 
          import('./features/dashboard/pages/collections/collections.component')
            .then(m => m.CollectionsComponent)
      },
      {
        path: 'collections/new',
        loadComponent: () => 
          import('./features/dashboard/pages/collections/collection-form/collection-form.component')
            .then(m => m.CollectionFormComponent)
      },
      {
        path: 'collections/edit/:id',
        loadComponent: () => 
          import('./features/dashboard/pages/collections/collection-form/collection-form.component')
            .then(m => m.CollectionFormComponent)
      },
      // {
      //   path: 'profile',
      //   loadComponent: () => 
      //     import('./features/dashboard/pages/profile/profile.component')
      //       .then(m => m.ProfileComponent)
      // },
      // {
      //   path: 'points',
      //   loadComponent: () => 
      //     import('./features/dashboard/pages/points/points.component')
      //       .then(m => m.PointsComponent)
      // },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];