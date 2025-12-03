import { Component, Input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overlay-loader',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatProgressSpinnerModule],
  template: `
    <div *ngIf="loading"
         class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40">

      <!-- TOP PROGRESS BAR (forced on top with z-index) -->
      <mat-progress-bar mode="indeterminate"
                        color="accent"
                        class="w-full mb-4 overlay-top-bar"></mat-progress-bar>

      <!-- Circular spinner -->
      <mat-progress-spinner mode="indeterminate"
                            color="accent"
                            diameter="50"></mat-progress-spinner>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Force the progress bar to always appear on top */
    .overlay-top-bar {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 100;
    }
  `]
})
export class OverlayLoaderComponent {
  @Input() loading = false;
}