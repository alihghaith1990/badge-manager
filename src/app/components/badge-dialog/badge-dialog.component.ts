import { Component, Inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Exhibitor, ExtraBadge } from '../../models/exhibitor.model';
import { AuthService } from '../../services/auth.Service';
import { BadgeService } from '../../services/badge.service';
import { DataService } from '../../services/date.service';
import { BadgePreviewService } from '../../services/badge-preview.service';
import { OverlayLoaderComponent } from "../overlay-loader/overlay-loader.component";
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-badge-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatListModule, MatButtonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, OverlayLoaderComponent],
  templateUrl: './badge-dialog.component.html',
  styleUrl: './badge-dialog.component.scss'
})
export class BadgeDialogComponent {
  exhibitor?: Exhibitor;
  badges: ExtraBadge[] = [];
  mode: 'list' | 'create' = 'list';
  editing: ExtraBadge | null = null;
  form: Partial<ExtraBadge> = {};
  isLoading: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<BadgeDialogComponent>,
    private dataService: DataService,
    private badgeService: BadgeService,
    private preview: BadgePreviewService,
    public loader: LoaderService,
    private auth: AuthService
  ) {
    const ex = this.dataService.findById(this.data.exhibitorId);
    this.exhibitor = ex;
    this.badges = ex?.extrabadges ? [...ex.extrabadges] : [];
    if (this.data.action === 'create') this.mode = 'create';
  }

  startEdit(b: ExtraBadge) {
    this.editing = { ...b };
    this.form = { ...b };
    this.mode = 'create';
  }

  submit() {
    try {
      if (this.editing) {
        const updated = { ...this.editing, ...this.form } as ExtraBadge;
        this.badgeService.updateBadge(this.exhibitor!.id, updated);
      } else {
        this.badgeService.createBadge(this.exhibitor!.id, this.form);
      }
      // reload local lists
      const ex = this.dataService.findById(this.exhibitor!.id)!;
      this.exhibitor = ex;
      this.badges = ex.extrabadges ?? [];
      this.mode = 'list';
      this.editing = null;
      this.form = {};
    } catch (err: any) {
      alert(err.message || 'Error');
    }
  }

  cancel() {
    this.mode = 'list';
    this.editing = null;
    this.form = {};
  }

  remove(b: ExtraBadge) {
    if (!confirm('Delete badge?')) return;
    this.badgeService.deleteBadge(this.exhibitor!.id, b.id as string);
    const ex = this.dataService.findById(this.exhibitor!.id)!;
    this.badges = ex.extrabadges ?? [];
  }

  async print(b: ExtraBadge) {
    await this.preview.printBadge(this.exhibitor!, b);
  }

  close() {
    this.dialogRef.close(true);
  }
}
