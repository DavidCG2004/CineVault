import { Injectable, signal, computed } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

// 1. Interfaz estricta basada en nuestra tabla de Supabase
export interface Movie {
  id?: string;
  title: string;
  director: string;
  release_year: number;
  genre: string;
  synopsis?: string;
  poster_url?: string;
  rating?: number;
  trailer_url?: string;
  audio_url?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  // 2. Cliente de Supabase privado
  #supabase: SupabaseClient;

  // 3. Manejo de Estado Moderno usando Signals (Privados para escritura, Públicos para lectura)
  #movies = signal<Movie[]>([]);
  #isLoading = signal<boolean>(false);
  #error = signal<string | null>(null);

  // Exponemos estados de solo lectura para los componentes
  public movies = this.#movies.asReadonly();
  public isLoading = this.#isLoading.asReadonly();
  public error = this.#error.asReadonly();

  constructor() {
    this.#supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  // --- MÉTODOS CRUD ---

  /**
   * Obtiene todas las películas y actualiza el Signal.
   */
  async loadMovies(): Promise<void> {
    try {
      this.#setLoading(true);
      const { data, error } = await this.#supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      this.#movies.set(data as Movie[]);
    } catch (err) {
      this.#handleError('Error al cargar las películas', err);
    } finally {
      this.#setLoading(false);
    }
  }

  /**
   * Obtiene una película por su ID (Ideal para la vista de detalles o formulario de edición)
   */
  async getMovieById(id: string): Promise<Movie | null> {
    try {
      this.#setLoading(true);
      const { data, error } = await this.#supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Movie;
    } catch (err) {
      this.#handleError(`Error al obtener la película con ID ${id}`, err);
      return null;
    } finally {
      this.#setLoading(false);
    }
  }

  /**
   * Crea una nueva película y la añade al estado local optimísticamente
   */
  async createMovie(movie: Partial<Movie>): Promise<void> {
    try {
      this.#setLoading(true);
      const { data, error } = await this.#supabase
        .from('movies')
        .insert(movie)
        .select()
        .single();

      if (error) throw error;

      // Actualizamos el estado local agregando la nueva película al inicio
      this.#movies.update((currentMovies) => [data as Movie, ...currentMovies]);
    } catch (err) {
      this.#handleError('Error al crear la película', err);
      throw err; // Relanzamos para que el formulario sepa que falló
    } finally {
      this.#setLoading(false);
    }
  }

  /**
   * Actualiza una película existente
   */
  async updateMovie(id: string, movieUpdate: Partial<Movie>): Promise<void> {
    try {
      this.#setLoading(true);
      const { data, error } = await this.#supabase
        .from('movies')
        .update(movieUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Actualizamos el estado local reemplazando la película modificada
      this.#movies.update((currentMovies) =>
        currentMovies.map((m) => (m.id === id ? (data as Movie) : m))
      );
    } catch (err) {
      this.#handleError('Error al actualizar la película', err);
      throw err;
    } finally {
      this.#setLoading(false);
    }
  }

  /**
   * Elimina una película por su ID
   */
  async deleteMovie(id: string): Promise<void> {
    try {
      this.#setLoading(true);
      const { error } = await this.#supabase
        .from('movies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Removemos la película del estado local
      this.#movies.update((currentMovies) =>
        currentMovies.filter((m) => m.id !== id)
      );
    } catch (err) {
      this.#handleError('Error al eliminar la película', err);
      throw err;
    } finally {
      this.#setLoading(false);
    }
  }

  // --- MÉTODOS PRIVADOS DE UTILIDAD (Clean Code) ---

  #setLoading(status: boolean): void {
    this.#isLoading.set(status);
    if (status) this.#error.set(null); // Limpiamos errores si iniciamos nueva carga
  }

  #handleError(message: string, error: any): void {
    console.error(message, error);
    // Extraemos el mensaje de Supabase si existe
    const errorMessage = error?.message || 'Ha ocurrido un error inesperado.';
    this.#error.set(`${message}: ${errorMessage}`);
  }
}