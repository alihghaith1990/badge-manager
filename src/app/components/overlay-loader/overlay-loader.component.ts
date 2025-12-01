import { Component, Input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overlay-loader',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatProgressSpinnerModule],
  template: `
    <div *ngIf="loading" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40">

      <!-- Top progress bar -->
      <mat-progress-bar mode="indeterminate" color="accent" class="w-full mb-4"></mat-progress-bar>

      <!-- Circular spinner -->
      <mat-progress-spinner mode="indeterminate" color="accent" diameter="50"></mat-progress-spinner>

      <!-- <div class="mt-2 text-white font-semibold">Loading...</div> -->
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class OverlayLoaderComponent {
  @Input() loading = false;
}
