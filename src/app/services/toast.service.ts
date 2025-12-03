import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
    id: number;
    type: 'success' | 'error' | 'info' | 'warning';
    text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {

    private counter = 0;
    toasts = signal<ToastMessage[]>([]);

    show(type: ToastMessage['type'], text: string, timeout = 3000) {
        const id = ++this.counter;

        this.toasts.update(list => [...list, { id, type, text }]);

        setTimeout(() => this.remove(id), timeout);
    }

    success(text: string) { this.show('success', text); }
    error(text: string) { this.show('error', text); }
    info(text: string) { this.show('info', text); }
    warning(text: string) { this.show('warning', text); }

    remove(id: number) {
        this.toasts.update(list => list.filter(t => t.id !== id));
    }
}
