import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
  IonBackButton, IonButton, IonIcon, IonInput, IonTextarea,
  IonSpinner, IonGrid, IonRow, IonCol
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline } from 'ionicons/icons';
import { MovieService, Movie } from '../../services/movie.service';
import { FileUploadFieldComponent } from '../../components/file-upload-field/file-upload-field.component';

@Component({
  selector: 'app-movies-form',
  templateUrl: './movies-form.page.html',
  styleUrls: ['./movies-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FileUploadFieldComponent,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
    IonBackButton, IonButton, IonIcon, IonInput, IonTextarea,
    IonSpinner, IonGrid, IonRow, IonCol,
  ],
})
export class MoviesFormPage implements OnInit {
  #fb           = inject(FormBuilder);
  #movieService = inject(MovieService);
  #route        = inject(ActivatedRoute);
  #navCtrl      = inject(NavController);

  movieId       = signal<string | null>(null);
  isLoadingData = signal<boolean>(false);
  isSaving      = signal<boolean>(false);

  movieForm: FormGroup = this.#fb.group({
    title:        ['', [Validators.required]],
    director:     ['', [Validators.required]],
    release_year: [new Date().getFullYear(), [Validators.required]],
    genre:        ['', [Validators.required]],
    synopsis:     [''],
    poster_url:   [''],
    audio_url:    [''],
    rating:       [0, [Validators.required, Validators.min(0), Validators.max(10)]],
    trailer_url:  ['', [Validators.pattern(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/|tiktok\.com\/@[\w.-]+\/video\/)[\w-]+/
    )]],
  });

  constructor() { addIcons({ saveOutline }); }

  async ngOnInit(): Promise<void> {
    const id = this.#route.snapshot.paramMap.get('id');
    if (!id) return;

    this.movieId.set(id);
    this.isLoadingData.set(true);
    const movie = await this.#movieService.getMovieById(id);
    if (movie) this.movieForm.patchValue(movie);
    this.isLoadingData.set(false);
  }

  onPosterUploaded(url: string): void {
    this.movieForm.patchValue({ poster_url: url });
  }

  onAudioUploaded(url: string): void {
    this.movieForm.patchValue({ audio_url: url });
  }

  async save(): Promise<void> {
    if (this.movieForm.invalid) { this.movieForm.markAllAsTouched(); return; }

    this.isSaving.set(true);
    const formValues = this.movieForm.value;
    const movieData: Partial<Movie> = {
      ...formValues,
      release_year: Number(formValues.release_year),
      rating:       Number(formValues.rating),
    };

    try {
      this.movieId()
        ? await this.#movieService.updateMovie(this.movieId()!, movieData)
        : await this.#movieService.createMovie(movieData);
      this.#navCtrl.back();
    } catch (error) {
      console.error(error);
    } finally {
      this.isSaving.set(false);
    }
  }
}