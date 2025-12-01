import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Exhibitor } from '../models/exhibitor.model';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

const STORE_KEY = 'exhibitors_store_v1';

@Injectable({ providedIn: 'root' })
export class DataService {
    private http = inject(HttpClient);
    private _exhibitors$ = new BehaviorSubject<Exhibitor[]>([]);
    public exhibitors$ = this._exhibitors$.asObservable();

    constructor() {
        this.init();
    }

    private async init() {
        const stored = localStorage.getItem(STORE_KEY);
        if (stored) {
            this._exhibitors$.next(JSON.parse(stored) as Exhibitor[]);
            return;
        }
        try {
            const list = await firstValueFrom(this.http.get<Exhibitor[]>('exhibitors.json'));
            // ensure extrabadges array exists for each
            const normalized = list.map(e => ({ ...e, extrabadges: e.extrabadges ?? [] }));
            this._exhibitors$.next(normalized);
            localStorage.setItem(STORE_KEY, JSON.stringify(normalized));
        } catch (err) {
            console.error('Failed to load exhibitors.json', err);
            this._exhibitors$.next([]);
        }
    }

    getAll(): Exhibitor[] {
        return JSON.parse(JSON.stringify(this._exhibitors$.value));
    }

    saveAll(list: Exhibitor[]) {
        this._exhibitors$.next(list);
        localStorage.setItem(STORE_KEY, JSON.stringify(list));
    }

    updateExhibitor(updated: Exhibitor) {
        const list = this.getAll();
        const idx = list.findIndex(x => x.id === updated.id);
        if (idx >= 0) list[idx] = JSON.parse(JSON.stringify(updated));
        else list.push(JSON.parse(JSON.stringify(updated)));
        this.saveAll(list);
    }

    persistBadges(exhibitorId: string, badges: any[]) {
        const list = this.getAll();
        const idx = list.findIndex(x => x.id === exhibitorId);
        if (idx === -1) return;
        list[idx].extrabadges = badges;
        this.saveAll(list);
    }

    findById(id: string): Exhibitor | undefined {
        return this.getAll().find(x => x.id === id);
    }
}
