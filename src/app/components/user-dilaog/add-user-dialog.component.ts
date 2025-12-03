import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.Service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-add-user-dialog',
    standalone: true,
    imports: [
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatButtonModule,
    ],
    template: `<h2
  mat-dialog-title
  class="text-2xl font-bold text-gray-800 pb-4 border-b border-gray-200"
>
  Add User
</h2>

<mat-dialog-content class="pt-8">

  <div class="flex flex-col gap-8 w-full max-w-lg">

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Username
      </label>
      <input
        matInput
        [(ngModel)]="username"
        class="!border !border-gray-300 !rounded-2xl !px-5 !py-4 focus:!border-primary focus:!ring-2 focus:!ring-primary/30 transition-all w-full"
        placeholder="Enter username"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Password
      </label>
      <input
        matInput
        type="password"
        [(ngModel)]="password"
        class="!border !border-gray-300 !rounded-2xl !px-5 !py-4 focus:!border-primary focus:!ring-2 focus:!ring-primary/30 transition-all w-full"
        placeholder="Enter password"
      />
    </div>

    <!-- Optional Admin Checkbox -->
    <!--
    <mat-checkbox
      [(ngModel)]="isAdmin"
      class="!text-gray-700"
    >
      Administrator
    </mat-checkbox>
    -->

  </div>

</mat-dialog-content>

<mat-dialog-actions
  align="end"
  class="pt-8 mt-6 border-t border-gray-200"
>
  <button
    mat-button
    (click)="close()"
    class="!rounded-2xl !px-6 !py-3 !text-gray-600 hover:!bg-gray-200 transition"
  >
    Cancel
  </button>

  <button
    mat-flat-button
    color="primary"
    (click)="save()"
    class="!rounded-2xl !px-7 !py-3 font-medium"
  >
    Create
  </button>
</mat-dialog-actions>
`
})
export class AddUserDialogComponent {

    username = '';
    password = '';
    isAdmin = false;

    constructor(
        private auth: AuthService,
        private ref: MatDialogRef<AddUserDialogComponent>
    ) { }

    save() {
        try {
            this.auth.addUser(this.username, this.password, this.isAdmin);
            this.ref.close(true);
        } catch (err: any) {
            alert(err.message);
        }
    }

    close() {
        this.ref.close(false);
    }
}
