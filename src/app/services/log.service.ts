import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

export interface AppLog {
    timestamp: string;
    user: string | null;
    action: string;
    exhibitorId?: string;
    badgeId?: string;
    details?: any;
}

const LOG_KEY = 'app_logs_v1';

@Injectable({ providedIn: 'root' })
export class LogService {
    private logs: AppLog[] = [];

    constructor() {
        const raw = localStorage.getItem(LOG_KEY);
        this.logs = raw ? JSON.parse(raw) : [];
    }

    log(entry: AppLog) {
        this.logs.unshift(entry);
        localStorage.setItem(LOG_KEY, JSON.stringify(this.logs));
    }

    list(): AppLog[] {
        return [...this.logs];
    }

    clear() {
        this.logs = [];
        localStorage.removeItem(LOG_KEY);
    }

    exportExcel(filename = 'logs.xlsx') {
        const ws = XLSX.utils.json_to_sheet(this.logs);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Logs');
        XLSX.writeFile(wb, filename);
    }
}
