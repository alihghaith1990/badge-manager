import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.Service';
import { map } from 'rxjs/operators';

export const AdminGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    return auth.currentUser$.pipe(
        map(user => {
            if (user?.isAdmin) return true;
            router.navigate(['/']);
            return false;
        })
    );
};
