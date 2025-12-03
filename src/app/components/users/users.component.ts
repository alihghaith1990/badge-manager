import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, User } from '../../services/auth.Service';
import { AddUserDialogComponent } from '../user-dilaog/add-user-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {

  displayedColumns = ['username', 'role', 'actions'];
  pagedUsers: User[] = [];

  allUsers: User[] = [];

  pageSize = 50;
  pageIndex = 0;

  constructor(
    public auth: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.allUsers = this.auth.listUsers();
    this.updatePage();
  }

  updatePage() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pagedUsers = this.allUsers.slice(start, end);
  }

  onPage(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePage();
  }

  openAdd() {
    this.dialog.open(AddUserDialogComponent, {
      panelClass: 'custom-dialog'
    }).afterClosed().subscribe(ok => {
      if (ok) this.load();
    });
  }


  deleteUser(u: User) {
    if (u.username === 'admin') return alert('You cannot delete the default admin.');
    if (confirm(`Delete user "${u.username}"?`)) {
      this.auth.deleteUser(u.username);
      this.load();
    }
  }

  changePassword(u: User) {
    const newPass = prompt(`Enter new password for ${u.username}:`);
    if (!newPass) return;
    this.auth.changePassword(u.username, newPass);
    alert('Password updated.');
  }
}
