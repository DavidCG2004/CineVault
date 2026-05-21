import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
  standalone: true,
  imports: [CommonModule, IonContent],
})
export class SplashScreenComponent implements OnInit {
  #router = inject(Router);

  holes = Array(12);              // 👈 esto faltaba
  isVisible = signal(false);
  isLeaving = signal(false);

  ngOnInit(): void {
    setTimeout(() => this.isVisible.set(true), 100);
    setTimeout(() => this.isLeaving.set(true), 2800);
    setTimeout(() => this.#router.navigate(['/movies'], { replaceUrl: true }), 3400);
  }
}