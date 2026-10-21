import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <aside class="sidebar" [class.sidebar-open]="menuOpen">
        <a routerLink="/dashboard" class="brand" (click)="closeMenu()">
          <span class="brand-icon">R</span>
          <span>ReelExpert <b>AI</b></span>
        </a>

        <p class="nav-label">WORKSPACE</p>

        <nav class="main-nav">
          <a routerLink="/dashboard" routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: true }" (click)="closeMenu()">
            <span class="nav-icon">⌂</span> Dashboard
          </a>
          <a routerLink="/create" routerLinkActive="active" (click)="closeMenu()">
            <span class="nav-icon">✦</span> Create Reel
          </a>
          <a routerLink="/reels" routerLinkActive="active" (click)="closeMenu()">
            <span class="nav-icon">▣</span> My Reels
          </a>
          <a routerLink="/analytics" routerLinkActive="active" (click)="closeMenu()">
            <span class="nav-icon">↗</span> Analytics
          </a>
        </nav>

        <div class="sidebar-bottom">
          <div class="upgrade">
            <span class="upgrade-icon">✦</span>
            <h3>Create something amazing</h3>
            <p>Turn your next idea into engaging short-form content.</p>
            <a routerLink="/create" class="upgrade-link" (click)="closeMenu()">
              Start creating →
            </a>
          </div>

          <a routerLink="/settings" routerLinkActive="active" (click)="closeMenu()">
            <span class="nav-icon">⚙</span> Settings
          </a>

          <div class="user-profile">
            <div class="avatar">FS</div>
            <div class="user-details">
              <strong>My Workspace</strong>
              <small>Creator account</small>
            </div>
          </div>
        </div>
      </aside>

      @if (menuOpen) {
        <button class="mobile-overlay" aria-label="Close navigation"
                (click)="closeMenu()"></button>
      }

      <main class="main-area">
        <header class="topbar">
          <div class="header-left">
            <button class="menu-toggle" aria-label="Toggle navigation"
                    [attr.aria-expanded]="menuOpen"
                    (click)="toggleMenu()">☰</button>
            <div class="breadcrumbs">
              <span>Workspace</span>
              <span class="breadcrumb-separator">/</span>
              <strong>ReelExpert AI</strong>
            </div>
          </div>

          <div class="topbar-right">
            <span class="connection-indicator"></span>
            <span class="status-text">Creator Studio</span>
            <div class="avatar header-avatar">FS</div>
          </div>
        </header>

        <section class="page-container">
          <router-outlet />
        </section>
      </main>
    </div>
  `
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