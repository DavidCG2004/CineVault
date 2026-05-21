import { Component, inject, Input, Output, EventEmitter, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  cloudUploadOutline, imageOutline, musicalNoteOutline,
  checkmarkCircleOutline, closeCircleOutline, trashOutline
} from 'ionicons/icons';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { StorageService, UploadBucket } from '../../services/storage.service';

@Component({
  selector: 'app-file-upload-field',
  standalone: true,
  imports: [CommonModule, IonIcon, IonSpinner],
  templateUrl: './file-upload-field.component.html',
  styleUrls: ['./file-upload-field.component.scss'],
})
export class FileUploadFieldComponent implements OnChanges {
  @Input() label!: string;
  @Input() bucket!: UploadBucket;
  @Input() accept!: string;
  @Input() currentUrl: string | null = null;
  @Output() fileUploaded = new EventEmitter<string>();

  #storageService = inject(StorageService);

  // ── Signals ─────────────────────────────────────────────
  isUploading = signal(false);
  progress    = signal(0);
  error       = signal<string | null>(null);
  previewUrl  = signal<string | null>(null);
  fileName    = signal<string | null>(null);

  // Computed helpers
  get isImage()  { return this.bucket === 'movie-posters'; }
  get hasFile()  { return !!this.previewUrl(); }

  constructor() {
    addIcons({
      cloudUploadOutline, imageOutline, musicalNoteOutline,
      checkmarkCircleOutline, closeCircleOutline, trashOutline
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Cargar preview si ya existe una URL (modo edición)
    if (changes['currentUrl'] && this.currentUrl) {
      this.previewUrl.set(this.currentUrl);
      this.fileName.set(this.#extractFileName(this.currentUrl));
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    this.error.set(null);
    this.isUploading.set(true);
    this.progress.set(0);
    this.fileName.set(file.name);

    // Preview local inmediato para imágenes
    if (this.isImage) {
      this.previewUrl.set(URL.createObjectURL(file));
    }

    // Simular progreso (Supabase SDK no expone progreso real)
    const progressInterval = this.#simulateProgress();

    try {
      const publicUrl = this.isImage
        ? await this.#storageService.uploadPoster(file)
        : await this.#storageService.uploadAudio(file);

      clearInterval(progressInterval);
      this.progress.set(100);
      this.previewUrl.set(this.isImage ? this.previewUrl() : publicUrl);
      this.fileUploaded.emit(publicUrl);
    } catch (err: any) {
      clearInterval(progressInterval);
      this.error.set(err.message ?? 'Error desconocido al subir el archivo');
      this.previewUrl.set(null);
      this.fileName.set(null);
    } finally {
      this.isUploading.set(false);
      // Reset input para permitir subir el mismo archivo nuevamente
      input.value = '';
    }
  }

  clearFile(): void {
    this.previewUrl.set(null);
    this.fileName.set(null);
    this.error.set(null);
    this.progress.set(0);
    this.fileUploaded.emit('');
  }

  #simulateProgress(): ReturnType<typeof setInterval> {
    return setInterval(() => {
      this.progress.update((p) => (p < 85 ? p + 15 : p));
    }, 300);
  }

  #extractFileName(url: string): string {
    return url.split('/').pop() ?? url;
  }
}