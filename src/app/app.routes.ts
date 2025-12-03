import { Routes } from '@angular/router';
import { UsersComponent } from './components/users/users.component';
import { LoginComponent } from './components/login/login.component';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';
import { ExhibitorsListComponent } from './components/exhibitors-list/exhibitors-list.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: 'admin/users',
        component: UsersComponent,
        canActivate: [AdminGuard]
    },
    { path: '', component: ExhibitorsListComponent, canActivate: [AuthGuard] },
];
