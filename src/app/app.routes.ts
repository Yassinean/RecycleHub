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
            .then(m => m.DashboardHomeComponent),
        title: 'Accueil - RecycleHub'
      },
      {
        path: 'collections',
        loadComponent: () => 
          import('./features/dashboard/pages/collections/collections.component')
            .then(m => m.CollectionsComponent),
        title: 'Mes collectes - RecycleHub'
      },
      {
        path: 'collections/new',
        loadComponent: () => 
          import('./features/dashboard/pages/collections/collection-form/collection-form.component')
            .then(m => m.CollectionFormComponent),
        title: 'Nouvelle collecte - RecycleHub'
      },
      {
        path: 'collections/edit/:id',
        loadComponent: () => 
          import('./features/dashboard/pages/collections/collection-form/collection-form.component')
            .then(m => m.CollectionFormComponent),
        title: 'Modifier une collecte - RecycleHub'
      },
      {
        path: 'collections/detail/:id',
        loadComponent: () => 
          import('./features/dashboard/pages/collections/collection-detail/collection-detail.component')
            .then(m => m.CollectionDetailComponent),
        title: 'Détails de la collecte - RecycleHub'
      },
      {
        path: 'collections/validate/:id',
        loadComponent: () => 
          import('./features/dashboard/pages/collections/collection-validate/collection-validate.component')
            .then(m => m.CollectionValidateComponent),
        title: 'Valider la collecte - RecycleHub'
      },
      // {
      //   path: 'profile',
      //   loadComponent: () => 
      //     import('./features/dashboard/pages/profile/profile.component')
      //       .then(m => m.ProfileComponent)
      // },
      {
        path: 'points',
        loadComponent: () => 
          import('./features/dashboard/pages/points/points.component')
            .then(m => m.PointsComponent),
        title: 'Mes points - RecycleHub'
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];