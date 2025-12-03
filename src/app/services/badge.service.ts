import { Injectable } from '@angular/core';
import { LogService } from './log.service';
import { ExtraBadge, Exhibitor } from '../models/exhibitor.model';
import { DataService } from './date.service';
import { AuthService } from './auth.Service';
import { LoaderService } from './loader.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class BadgeService {
    constructor(
        private data: DataService,
        private logs: LogService,
        private auth: AuthService,
        private loader: LoaderService,
        private toast: ToastService
    ) { }

    private getMax(space: number | null): number {
        if (!space) return 0;
        switch (true) {
            case (space <= 12): return 5;
            case (space >= 13 && space <= 18): return 8;
            case (space >= 19 && space <= 24): return 10;
            case (space >= 25 && space <= 36): return 12;
            case (space >= 37 && space <= 42): return 15;
            case (space >= 43 && space <= 54): return 18;
            case (space >= 55): return 20;
            default: return 0;
        }
    }

    getMaxForExhibitor(ex: Exhibitor): number {
        const s = ex.space ? parseInt(ex.space as string, 10) : null;
        return this.getMax(s);
    }

    listBadges(exhibitorId: string): ExtraBadge[] {
        const ex = this.data.findById(exhibitorId);
        return ex?.extrabadges ? [...ex.extrabadges] : [];
    }

    async createBadge(exhibitorId: string, payload: Partial<ExtraBadge>): Promise<ExtraBadge> {
        this.loader.show();
        try {
            const ex = this.data.findById(exhibitorId);
            if (!ex) {
                // this.toast.error('Exhibitor not found');
                throw new Error('Exhibitor not found');
            }

            const current = ex.extrabadges ?? [];
            const max = this.getMaxForExhibitor(ex);

            if (current.length >= max) {
                // this.toast.error(`Maximum ${max} badges allowed for this exhibitor`);
                throw new Error(`Max badges reached`);
            }

            // numeric incremental ID
            let maxId = 0;
            this.data.exhibitors$.subscribe(list => {
                list.forEach(e => {
                    (e.extrabadges ?? []).forEach(b => {
                        const numId = parseInt(b.id.replace(/\D/g, ''), 10);
                        if (!isNaN(numId) && numId > maxId) maxId = numId;
                    });
                });
            }).unsubscribe();

            const id = (maxId + 1).toString();

            const badge: ExtraBadge = {
                id,
                firstname: payload.firstname || '',
                lastname: payload.lastname || '',
                position: payload.position || '',
                is_extra: payload.is_extra ?? '1',
                email: payload.email,
                phone: payload.phone,
                createdAt: new Date().toISOString()
            };

            current.push(badge);
            this.data.persistBadges(exhibitorId, current);

            this.logs.log({
                timestamp: new Date().toISOString(),
                user: this.auth.getCurrent()?.username ?? null,
                action: 'ADD_BADGE',
                exhibitorId,
                badgeId: badge.id
            });

            this.toast.success('Badge added successfully');
            return badge;

        } catch (err: any) {
            this.toast.error(err.message || 'Error creating badge');
            throw err;
        } finally {
            this.loader.hide();
        }
    }

    async updateBadge(exhibitorId: string, badge: ExtraBadge) {
        this.loader.show();
        try {
            const ex = this.data.findById(exhibitorId);
            if (!ex) {
                // this.toast.error('Exhibitor not found');
                throw new Error('Exhibitor not found');
            }

            const idx = (ex.extrabadges ?? []).findIndex(b => b.id === badge.id);
            if (idx === -1) {
                // this.toast.error('Badge not found');
                throw new Error('Badge not found');
            }

            ex.extrabadges![idx] = { ...badge };
            this.data.updateExhibitor(ex);

            this.logs.log({
                timestamp: new Date().toISOString(),
                user: this.auth.getCurrent()?.username ?? null,
                action: 'EDIT_BADGE',
                exhibitorId,
                badgeId: badge.id
            });

            this.toast.success('Badge updated successfully');

        } catch (err: any) {
            this.toast.error(err.message || 'Error updating badge');
            throw err;
        } finally {
            this.loader.hide();
        }
    }

    async deleteBadge(exhibitorId: string, badgeId: string) {
        this.loader.show();
        try {
            const ex = this.data.findById(exhibitorId);
            if (!ex) {
                // this.toast.error('Exhibitor not found');
                throw new Error('Exhibitor not found');
            }

            ex.extrabadges = (ex.extrabadges ?? []).filter(b => b.id !== badgeId);
            this.data.updateExhibitor(ex);

            this.logs.log({
                timestamp: new Date().toISOString(),
                user: this.auth.getCurrent()?.username ?? null,
                action: 'DELETE_BADGE',
                exhibitorId,
                badgeId
            });

            this.toast.success('Badge deleted successfully');

        } catch (err: any) {
            this.toast.error(err.message || 'Error deleting badge');
            throw err;
        } finally {
            this.loader.hide();
        }
    }
}
