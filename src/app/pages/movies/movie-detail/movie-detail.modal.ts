import { Component, inject, Input, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { closeOutline, createOutline, star, playCircleOutline, musicalNotesOutline, pauseCircle } from 'ionicons/icons';
import { AudioService } from '../../../services/audio.service';


import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonIcon, IonContent, IonSpinner, ModalController
} from '@ionic/angular/standalone';
import { Movie } from '../../../services/movie.service';
import { SafeTrailerPipe } from '../../../pipes/safe-trailer.pipe';

@Component({
  selector: 'app-movie-detail-modal',
  standalone: true,
  imports: [
    CommonModule, SafeTrailerPipe,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonIcon, IonContent, IonSpinner,
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="dismiss()" color="dark">
            <ion-icon slot="icon-only" name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title class="fw-bold">{{ movie.title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="goToEdit()" color="dark">
            <ion-icon slot="icon-only" name="create-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Trailer o Poster -->
      <div class="media-container">
        @if (movie.trailer_url | safeTrailer; as safeUrl) {
          @if (!iframeLoaded()) {
            <div class="iframe-skeleton">
              <ion-spinner name="crescent" color="light"></ion-spinner>
            </div>
          }
          <iframe
            [src]="safeUrl"
            frameborder="0"
            allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            (load)="iframeLoaded.set(true)"
            [class.hidden]="!iframeLoaded()"
          ></iframe>
        } @else {
          <!-- Fallback: poster grande -->
          <div class="poster-fallback">
            @if (movie.poster_url) {
              <img [src]="movie.poster_url" [alt]="movie.title" />
            } @else {
              <div class="no-poster">
                <ion-icon name="play-circle-outline"></ion-icon>
                <span>Sin trailer disponible</span>
              </div>
            }
          </div>
        }
      </div>

      <!-- Metadata -->
      <div class="detail-body">
        <div class="meta-row">
        <!-- Botón soundtrack -->
          @if (movie.audio_url) {
            <button class="soundtrack-btn" (click)="playSoundtrack()">
              <ion-icon [name]="isThisPlaying() ? 'pause-circle' : 'musical-notes-outline'"></ion-icon>
              {{ isThisPlaying() ? 'Pausar Soundtrack' : 'Escuchar Soundtrack' }}
            </button>
          }
          <span class="genre-badge">{{ movie.genre }}</span>
          <span class="year">{{ movie.release_year }}</span>
          @if (movie.rating) {
            <span class="rating">
              <ion-icon name="star"></ion-icon>
              {{ movie.rating | number:'1.1-1' }}
            </span>
          }
        </div>

        <h1 class="movie-title">{{ movie.title }}</h1>
        <p class="director">Dirigida por <strong>{{ movie.director }}</strong></p>

        @if (movie.synopsis) {
          <p class="synopsis">{{ movie.synopsis }}</p>
        }
      </div>
    </ion-content>
  `,
  styleUrls: ['./movie-detail.modal.scss'],
})
export class MovieDetailModal implements OnInit {
  @Input() movie!: Movie;
  @Input() onEdit!: (id: string) => void;

  #modalCtrl = inject(ModalController);
  iframeLoaded = signal(false);


#audioService = inject(AudioService);

// Computed: saber si ESTA película está sonando
isThisPlaying = computed(() =>
  this.#audioService.currentMovie()?.id === this.movie.id &&
  this.#audioService.isPlaying()
);

playSoundtrack(): void {
  this.#audioService.play(this.movie);
}

  constructor() {
    addIcons({ closeOutline, createOutline, star, playCircleOutline, musicalNotesOutline, pauseCircle });
  }

  ngOnInit() {
    // Reset al abrir el modal por si se reutiliza
    this.iframeLoaded.set(false);
  }

  dismiss() {
    this.#modalCtrl.dismiss();
  }

  goToEdit() {
    this.#modalCtrl.dismiss({ action: 'edit', id: this.movie.id });
  }
}