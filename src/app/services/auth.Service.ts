import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppUser {
    username: string;
    passwordHash: string;
    isAdmin?: boolean;
}

const USERS_KEY = 'app_users_v1';
const SESSION_KEY = 'app_session_v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private users: AppUser[] = [];
    private currentUser = new BehaviorSubject<AppUser | null>(null);
    readonly currentUser$ = this.currentUser.asObservable();

    constructor() {
        const raw = localStorage.getItem(USERS_KEY);
        if (raw) {
            this.users = JSON.parse(raw) as AppUser[];
        } else {
            const seed: AppUser = {
                username: 'admin',
                passwordHash: this.hash('admin123'),
                isAdmin: true
            };
            this.users = [seed];
            localStorage.setItem(USERS_KEY, JSON.stringify(this.users));
        }
        const session = localStorage.getItem(SESSION_KEY);
        if (session) {
            const u = JSON.parse(session) as AppUser;
            const found = this.users.find(x => x.username === u.username);
            if (found) this.currentUser.next(found);
        }
    }

    private hash(pw: string) {
        // base64 simple offline hash (not secure on shared devices)
        return btoa(pw);
    }

    login(username: string, password: string): boolean {
        const h = this.hash(password);
        const u = this.users.find(x => x.username === username && x.passwordHash === h);
        if (u) {
            this.currentUser.next(u);
            localStorage.setItem(SESSION_KEY, JSON.stringify(u));
            return true;
        }
        return false;
    }

    logout() {
        this.currentUser.next(null);
        localStorage.removeItem(SESSION_KEY);
    }

    isLoggedIn(): boolean {
        return this.currentUser.value !== null;
    }

    getCurrent() {
        return this.currentUser.value;
    }

    addUser(username: string, password: string, isAdmin = false) {
        if (this.users.find(u => u.username === username)) throw new Error('User exists');
        const u: AppUser = { username, passwordHash: this.hash(password), isAdmin };
        this.users.push(u);
        localStorage.setItem(USERS_KEY, JSON.stringify(this.users));
    }

    listUsers(): AppUser[] {
        return [...this.users];
    }

    changePassword(username: string, newPassword: string) {
        const u = this.users.find(x => x.username === username);
        if (!u) throw new Error('User not found');
        u.passwordHash = this.hash(newPassword);
        localStorage.setItem(USERS_KEY, JSON.stringify(this.users));
    }
}
