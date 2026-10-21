import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header';
import { SidebarComponent } from './layout/sidebar/sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="app-shell">
      @if (menuOpen) {
        <button
          class="mobile-overlay"
          aria-label="Close navigation"
          (click)="closeMenu()">
        </button>
      }

      <aside
        class="sidebar-container"
        [class.sidebar-open]="menuOpen">
        <app-sidebar (navigate)="closeMenu()" />
      </aside>

      <div class="main-area">
        <app-header (menuToggle)="toggleMenu()" />

        <main class="page-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
