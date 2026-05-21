import { Injectable, signal, computed, effect } from '@angular/core';
import { Movie } from './movie.service';

export interface AudioState {
  movie: Movie | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class AudioService {
  #audio: HTMLAudioElement | null = null;

  // ── Signals privados ────────────────────────────────────
  #currentMovie = signal<Movie | null>(null);
  #isPlaying    = signal<boolean>(false);
  #currentTime  = signal<number>(0);
  #duration     = signal<number>(0);
  #isLoading    = signal<boolean>(false);
  #error        = signal<string | null>(null);

  // ── Signals públicos (readonly) ─────────────────────────
  public currentMovie = this.#currentMovie.asReadonly();
  public isPlaying    = this.#isPlaying.asReadonly();
  public currentTime  = this.#currentTime.asReadonly();
  public duration     = this.#duration.asReadonly();
  public isLoading    = this.#isLoading.asReadonly();
  public error        = this.#error.asReadonly();

  // ── Computed ────────────────────────────────────────────
  public hasActiveAudio = computed(() => this.#currentMovie() !== null);
  public progress = computed(() => {
    const duration = this.#duration();
    return duration > 0 ? (this.#currentTime() / duration) * 100 : 0;
  });

  public formattedCurrentTime = computed(() => this.#formatTime(this.#currentTime()));
  public formattedDuration    = computed(() => this.#formatTime(this.#duration()));

  // ── API pública ─────────────────────────────────────────

  async play(movie: Movie): Promise<void> {
    if (!movie.audio_url) {
      this.#error.set('Esta película no tiene audio disponible');
      return;
    }

    // Si es la misma película, solo toggle play/pause
    if (this.#currentMovie()?.id === movie.id) {
      this.#togglePlayPause();
      return;
    }

    // Nueva película: destruir audio anterior y cargar nuevo
    this.#destroyAudio();
    this.#currentMovie.set(movie);
    this.#isLoading.set(true);
    this.#error.set(null);

    try {
      this.#audio = new Audio(movie.audio_url);
      this.#bindEvents(this.#audio);
      await this.#audio.play();
      this.#isPlaying.set(true);
    } catch (err: any) {
      this.#error.set('No se pudo reproducir el audio');
      this.#isPlaying.set(false);
    } finally {
      this.#isLoading.set(false);
    }
  }

  pause(): void {
    this.#audio?.pause();
    this.#isPlaying.set(false);
  }

  resume(): void {
    this.#audio?.play();
    this.#isPlaying.set(true);
  }

  stop(): void {
    this.#destroyAudio();
    this.#currentMovie.set(null);
    this.#isPlaying.set(false);
    this.#currentTime.set(0);
    this.#duration.set(0);
    this.#error.set(null);
  }

  seekTo(percent: number): void {
    if (!this.#audio || !this.#duration()) return;
    const clampedPercent  = Math.min(100, Math.max(0, percent));
    this.#audio.currentTime = (clampedPercent / 100) * this.#duration();
  }

  // ── Métodos privados ────────────────────────────────────

  #togglePlayPause(): void {
    this.#isPlaying() ? this.pause() : this.resume();
  }

  #bindEvents(audio: HTMLAudioElement): void {
    audio.ontimeupdate  = () => this.#currentTime.set(audio.currentTime);
    audio.ondurationchange = () => this.#duration.set(audio.duration);
    audio.onended       = () => { this.#isPlaying.set(false); this.#currentTime.set(0); };
    audio.onerror       = () => { this.#error.set('Error al cargar el audio'); this.#isPlaying.set(false); };
    audio.oncanplay     = () => this.#isLoading.set(false);
  }

  #destroyAudio(): void {
    if (!this.#audio) return;
    this.#audio.pause();
    this.#audio.ontimeupdate     = null;
    this.#audio.ondurationchange = null;
    this.#audio.onended          = null;
    this.#audio.onerror          = null;
    this.#audio.oncanplay        = null;
    this.#audio.src = '';
    this.#audio = null;
  }

  #formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}