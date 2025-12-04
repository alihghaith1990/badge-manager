import { CommonModule } from '@angular/common';
import { Component, signal, ViewChild, AfterViewInit, HostListener, ElementRef } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { Exhibitor } from '../../models/exhibitor.model';
import { DataService } from '../../services/date.service';
import { LogService } from '../../services/log.service';
import { AuthService } from '../../services/auth.Service';
import { BadgeDialogComponent } from '../badge-dialog/badge-dialog.component';
import { BadgePreviewService } from '../../services/badge-preview.service';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-exhibitors-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatTooltipModule,
    MatSelectModule,
    MatPaginatorModule
  ],
  templateUrl: './exhibitors-list.component.html',
  styleUrls: ['./exhibitors-list.component.scss']
})
export class ExhibitorsListComponent implements AfterViewInit {
  exhibitors = signal<Exhibitor[]>([]);
  filtered = signal<Exhibitor[]>([]);
  q = '';
  showFilter = signal<string>(''); // selected show
  columns = ['company', 'stand', 'nbOfBadges', 'filled', 'available', 'actions'];

  readonly shows = [
    { id: 'foodafricacairo2025', name: 'Food Africa Cairo 2025' },
    { id: 'pacprocessmea2025', name: 'PacProcess MEA 2025' }
  ];

  dataSource = new MatTableDataSource<Exhibitor>([]);
  private barcodeBuffer: string = '';
  private barcodeTimer: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private data: DataService,
    private dialog: MatDialog,
    private preview: BadgePreviewService,
    private logService: LogService,
    public loader: LoaderService,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    this.loader.show();

    this.data.exhibitors$.subscribe(list => {
      const enriched = list.map(e => ({
        ...e,
        max: this.preview.getMaxForExhibitor(e)
      }));

      this.exhibitors.set(enriched);
      this.applyFilter();

      this.loader.hide();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter() {
    const t = (this.q || '').toLowerCase().trim();
    const showId = (this.showFilter() || '').toLowerCase();
    let filteredList = this.exhibitors();

    // filter by show
    if (showId) {
      filteredList = filteredList.filter(e => (e.mshowid ?? '').toLowerCase() === showId);
    }

    // text search
    if (t) {
      filteredList = filteredList.filter(e =>
        e.companyname.toLowerCase().includes(t) ||
        (e.standnumber || '').toLowerCase().includes(t) ||
        (e.id || '').toLowerCase().includes(t)
      );
    }

    this.filtered.set(filteredList);
    this.dataSource.data = filteredList; // update table datasource
  }

  available(e: Exhibitor) {
    const filled = (e.extrabadges || []).length;
    return Math.max(0, (e.max ?? 0) - filled);
  }

  openList(e: Exhibitor) {
    this.dialog.open(BadgeDialogComponent, {
      data: { exhibitorId: e.id },
      width: '720px'
    });
  }

  openAdd(e: Exhibitor) {
    this.dialog.open(BadgeDialogComponent, {
      data: { exhibitorId: e.id, action: 'create' },
      width: '420px'
    });
  }

  async printAll(e: Exhibitor) {
    this.loader.show(); // show global loader

    try {
      await this.preview.printAllBadgesForExhibitor(e);

      this.logService.log({
        timestamp: new Date().toISOString(),
        user: this.auth.getCurrent()?.username ?? null,
        action: 'PRINT_ALL',
        exhibitorId: e.id
      });

    } finally {
      this.loader.hide(); // hide loader even if PDF fails
    }
  }

  // Barcode scanner input handling
  @HostListener('document:keydown', ['$event'])
  handleBarcode(event: KeyboardEvent) {
    if (this.barcodeTimer) clearTimeout(this.barcodeTimer);

    if (event.key === 'Enter') {
      // On Enter, treat buffer as full barcode
      if (this.barcodeBuffer) {
        this.q = this.barcodeBuffer;
        this.applyFilter();
        this.barcodeBuffer = '';
      }
      return;
    }

    // accumulate keys
    if (event.key.length === 1) { // letters/numbers
      this.barcodeBuffer += event.key;
    }

    // reset buffer after short delay (scans are fast)
    this.barcodeTimer = setTimeout(() => this.barcodeBuffer = '', 50);
  }
}
