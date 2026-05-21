import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { MiniPlayerComponent } from './components/mini-player/mini-player.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, MiniPlayerComponent],
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
      <app-mini-player></app-mini-player>
    </ion-app>
  `,
})
export class AppComponent {}