import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'splash', pathMatch: 'full' },
  {
    path: 'splash',
    loadComponent: () => import('./components/splash-screen/splash-screen.component').then((m) => m.SplashScreenComponent),
  },
  {
    path: 'movies',
    loadComponent: () => import('./pages/movies/movies.page').then((m) => m.MoviesPage),
  },
  {
    path: 'movie-form',
    loadComponent: () => import('./pages/movies-form/movies-form.page').then((m) => m.MoviesFormPage),
  },
  {
    path: 'movie-form/:id',
    loadComponent: () => import('./pages/movies-form/movies-form.page').then((m) => m.MoviesFormPage),
  },
];
