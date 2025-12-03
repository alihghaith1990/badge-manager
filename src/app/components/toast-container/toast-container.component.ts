import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-toast-container',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      <div *ngFor="let t of toasts()"
           class="px-4 py-2 rounded-lg shadow text-white text-sm animate-slide-left"
           [ngClass]="{
              'bg-green-600': t.type === 'success',
              'bg-red-600': t.type === 'error',
              'bg-blue-600': t.type === 'info',
              'bg-yellow-600 text-black': t.type === 'warning'
           }">
        {{ t.text }}
      </div>
    </div>
  `,
    styles: [`
    .animate-slide-left {
      animation: slide-left 0.25s ease-out;
    }
    @keyframes slide-left {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class ToastContainerComponent {
    toasts = computed(() => this.toastService.toasts());
    constructor(private toastService: ToastService) { }
}
