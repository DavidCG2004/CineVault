import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export type UploadBucket = 'movie-posters' | 'movie-audio';

const MAX_SIZES: Record<UploadBucket, number> = {
  'movie-posters': 5 * 1024 * 1024,   // 5MB
  'movie-audio':   20 * 1024 * 1024,  // 20MB
};

const ALLOWED_TYPES: Record<UploadBucket, string[]> = {
  'movie-posters': ['image/jpeg', 'image/png', 'image/webp'],
  'movie-audio':   ['audio/mpeg', 'audio/ogg', 'audio/wav'],
};

@Injectable({ providedIn: 'root' })
export class StorageService {
  #supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

  async uploadPoster(file: File): Promise<string> {
    return this.#uploadFile('movie-posters', file);
  }

  async uploadAudio(file: File): Promise<string> {
    return this.#uploadFile('movie-audio', file);
  }

  async #uploadFile(bucket: UploadBucket, file: File): Promise<string> {
    this.#validateFile(bucket, file);

    const ext      = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;

    const { error } = await this.#supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: false, contentType: file.type });

    if (error) throw new Error(`Error al subir archivo: ${error.message}`);

    const { data } = this.#supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  #validateFile(bucket: UploadBucket, file: File): void {
    const allowedTypes = ALLOWED_TYPES[bucket];
    const maxSize      = MAX_SIZES[bucket];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}`
      );
    }

    if (file.size > maxSize) {
      const maxMB = maxSize / (1024 * 1024);
      throw new Error(`El archivo supera el tamaño máximo de ${maxMB}MB`);
    }
  }
}