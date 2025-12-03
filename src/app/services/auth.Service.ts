import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
    username: string;
    passwordHash: string;
    isAdmin?: boolean;
}

const USERS_KEY = 'app_users_v1';
const SESSION_KEY = 'app_session_v1';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private users: User[] = [];
    private currentUser = new BehaviorSubject<User | null>(null);
    readonly currentUser$ = this.currentUser.asObservable();

    constructor() {
        this.loadUsers();
        this.restoreSession();
    }

    // ---------------------------------------
    // INTERNAL HELPERS
    // ---------------------------------------

    private syncUsers() {
        localStorage.setItem(USERS_KEY, JSON.stringify(this.users));

        // Revalidate current logged user after user list changes
        const cur = this.currentUser.value;
        if (cur) {
            const found = this.users.find(u => u.username === cur.username);

            if (!found) {
                // user deleted → logout
                this.logout();
            } else {
                this.currentUser.next(found);
                localStorage.setItem(SESSION_KEY, JSON.stringify(found));
            }
        }
    }

    private hash(pw: string) {
        return btoa(pw); // offline app = simple obfuscation
    }

    private loadUsers() {
        const raw = localStorage.getItem(USERS_KEY);

        if (raw) {
            this.users = JSON.parse(raw);
        } else {
            // seed admin
            const admin: User = {
                username: 'admin',
                passwordHash: this.hash('admin123'),
                isAdmin: true
            };
            this.users = [admin];
            localStorage.setItem(USERS_KEY, JSON.stringify(this.users));
        }
    }

    private restoreSession() {
        const session = localStorage.getItem(SESSION_KEY);
        if (!session) return;

        try {
            const saved = JSON.parse(session) as User;
            const found = this.users.find(u => u.username === saved.username);

            if (found) {
                this.currentUser.next(found);
            } else {
                // session user no longer exists
                this.logout();
            }
        } catch {
            this.logout();
        }
    }

    // ---------------------------------------
    // PUBLIC API
    // ---------------------------------------

    login(username: string, password: string): boolean {
        const h = this.hash(password);

        const u = this.users.find(
            x => x.username === username && x.passwordHash === h
        );

        if (!u) return false;

        this.currentUser.next(u);
        localStorage.setItem(SESSION_KEY, JSON.stringify(u));
        return true;
    }

    logout() {
        this.currentUser.next(null);
        localStorage.removeItem(SESSION_KEY);
    }

    isLoggedIn(): boolean {
        return !!this.currentUser.value;
    }

    isAdmin(): boolean {
        return this.currentUser.value?.isAdmin === true;
    }

    getCurrent(): User | null {
        return this.currentUser.value;
    }

    addUser(username: string, password: string, isAdmin = false) {
        if (this.users.find(u => u.username === username)) {
            throw new Error('User already exists');
        }

        const newUser: User = {
            username,
            passwordHash: this.hash(password),
            isAdmin
        };

        this.users.push(newUser);
        this.syncUsers();
    }

    deleteUser(username: string) {
        this.users = this.users.filter(u => u.username !== username);
        this.syncUsers(); // handles session consistency
    }

    listUsers(): User[] {
        return [...this.users];
    }

    changePassword(username: string, newPassword: string) {
        const u = this.users.find(x => x.username === username);
        if (!u) throw new Error('User not found');

        u.passwordHash = this.hash(newPassword);
        this.syncUsers();
    }
}
