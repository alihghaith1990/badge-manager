import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from './services/auth.Service';
import { ToastContainerComponent } from "./components/toast-container/toast-container.component";
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { LogService } from './services/log.service';
import { OverlayLoaderComponent } from "./components/overlay-loader/overlay-loader.component";
import { LoaderService } from './services/loader.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    RouterModule,
    ToastContainerComponent,
    RouterOutlet,
    OverlayLoaderComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  banners = ['fa-banner.jpg', 'pp-banner.jpg'];
  currentIndex = 0;
  intervalId: any;

  currentRoute = '';

  constructor(public loader: LoaderService, public auth: AuthService, private logService: LogService, private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });
  }

  ngOnInit(): void {
    // this.intervalId = setInterval(() => {
    //   this.currentIndex = (this.currentIndex + 1) % this.banners.length;
    // }, 5000);
  }

  exportLogs() {
    this.logService.exportExcel();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    // clearInterval(this.intervalId);
  }
}
