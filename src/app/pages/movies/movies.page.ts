import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { addOutline, star, trashOutline, createOutline } from 'ionicons/icons';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
  IonButton, IonIcon, IonSpinner, AlertController, ModalController
} from '@ionic/angular/standalone';
import { MovieService, Movie } from '../../services/movie.service';
import { MovieDetailModal } from './movie-detail/movie-detail.modal';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.page.html',
  styleUrls: ['./movies.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonButton, IonIcon, IonSpinner,
  ]
})
export class MoviesPage implements OnInit {
  public movieService = inject(MovieService);
  #router = inject(Router);
  #alertController = inject(AlertController);
  #modalController = inject(ModalController);

  constructor() {
    addIcons({ addOutline, star, trashOutline, createOutline });
  }

  ngOnInit() {
    this.movieService.loadMovies();
  }

  async openDetail(movie: Movie) {
    const modal = await this.#modalController.create({
      component: MovieDetailModal,
      componentProps: { movie },
      // Estilo tipo sheet desde abajo
      breakpoints: [0, 1],
      initialBreakpoint: 1,
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.action === 'edit' && data.id) {
      this.#router.navigate(['/movie-form', data.id]);
    }
  }

  goToForm(id?: string) {
    id
      ? this.#router.navigate(['/movie-form', id])
      : this.#router.navigate(['/movie-form']);
  }

  async confirmDelete(movie: Movie) {
    const alert = await this.#alertController.create({
      header: 'Eliminar película',
      message: `¿Estás seguro que deseas eliminar <strong>${movie.title}</strong>? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            if (movie.id) this.movieService.deleteMovie(movie.id);
          },
        },
      ],
    });
    await alert.present();
  }

  getYear(dateStr: string | number): string {
    return dateStr.toString();
  }
}