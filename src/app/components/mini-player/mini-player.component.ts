import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { playOutline, pauseOutline, closeOutline, musicalNoteOutline } from 'ionicons/icons';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-mini-player',
  standalone: true,
  imports: [CommonModule, IonIcon, IonSpinner],
  template: `
    @if (audio.hasActiveAudio()) {
      <div class="mini-player" [class.visible]="audio.hasActiveAudio()">

        <!-- Barra de progreso (top) -->
        <div class="progress-track" (click)="onSeek($event)">
          <div class="progress-fill" [style.width.%]="audio.progress()"></div>
        </div>

        <div class="player-body">
          <!-- Poster -->
          <div class="player-poster">
            @if (audio.currentMovie()?.poster_url) {
              <img [src]="audio.currentMovie()!.poster_url" [alt]="audio.currentMovie()!.title" />
            } @else {
              <div class="poster-placeholder">
                <ion-icon name="musical-note-outline"></ion-icon>
              </div>
            }
          </div>

          <!-- Info -->
          <div class="player-info">
            <span class="player-title">{{ audio.currentMovie()?.title }}</span>
            <span class="player-time">
              {{ audio.formattedCurrentTime() }} / {{ audio.formattedDuration() }}
            </span>
          </div>

          <!-- Controles -->
          <div class="player-controls">
            @if (audio.isLoading()) {
              <ion-spinner name="crescent" class="ctrl-spinner"></ion-spinner>
            } @else {
              <button class="ctrl-btn play-pause" (click)="togglePlay()">
                <ion-icon [name]="audio.isPlaying() ? 'pause-outline' : 'play-outline'"></ion-icon>
              </button>
            }
            <button class="ctrl-btn close" (click)="audio.stop()">
              <ion-icon name="close-outline"></ion-icon>
            </button>
          </div>
        </div>

      </div>
    }
  `,
  styleUrls: ['./mini-player.component.scss'],
})
export class MiniPlayerComponent {
  public audio = inject(AudioService);

  constructor() {
    addIcons({ playOutline, pauseOutline, closeOutline, musicalNoteOutline });
  }

  togglePlay(): void {
    this.audio.isPlaying() ? this.audio.pause() : this.audio.resume();
  }

  onSeek(event: MouseEvent): void {
    const bar = event.currentTarget as HTMLElement;
    const percent = (event.offsetX / bar.clientWidth) * 100;
    this.audio.seekTo(percent);
  }
}