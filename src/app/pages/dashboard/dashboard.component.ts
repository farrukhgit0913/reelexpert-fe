import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-heading">
      <div>
        <span class="eyebrow">YOUR CREATOR STUDIO</span>
        <h1>Welcome to your workspace <span>✦</span></h1>
        <p>Turn your ideas into scroll-stopping content.</p>
      </div>
      <a routerLink="/create" class="btn-primary">＋ Create new reel</a>
    </div>

    <div class="hero-banner">
      <div class="hero-copy">
        <span class="hero-badge">✦ AI-POWERED CREATION</span>
        <h2>Your next viral reel<br>starts with an idea.</h2>
        <p>Create engaging short-form videos with an AI-assisted workflow.</p>
        <a routerLink="/create" class="btn-light">Start creating <span>→</span></a>
      </div>
      <div class="hero-art">
        <div class="orbit orbit-one"></div>
        <div class="orbit orbit-two"></div>
        <div class="play-card"><span>▶</span></div>
        <span class="spark spark-one">✦</span>
        <span class="spark spark-two">✧</span>
      </div>
    </div>

    <div class="section-heading">
      <div><h2>Overview</h2><p>Your content at a glance</p></div>
    </div>

    <div class="stats-grid">
      <article class="stat-card">
        <div class="stat-top"><span>Total reels</span><span class="stat-icon purple">▣</span></div>
        <strong>24</strong><small>Content pieces created</small>
      </article>
      <article class="stat-card">
        <div class="stat-top"><span>Total views</span><span class="stat-icon blue">◉</span></div>
        <strong>12.8K</strong><small>Across your content</small>
      </article>
      <article class="stat-card">
        <div class="stat-top"><span>In progress</span><span class="stat-icon orange">◷</span></div>
        <strong>03</strong><small>Reels being prepared</small>
      </article>
      <article class="stat-card">
        <div class="stat-top"><span>Published</span><span class="stat-icon green">✓</span></div>
        <strong>18</strong><small>Ready to share</small>
      </article>
    </div>

    <div class="section-heading recent-heading">
      <div><h2>Recent reels</h2><p>Pick up where you left off</p></div>
      <a routerLink="/reels" class="text-link">View all reels →</a>
    </div>

    <div class="table-card">
      <div class="reel-row reel-header">
        <span>CONTENT</span><span>STATUS</span><span>VIEWS</span><span>UPDATED</span>
      </div>
      @for (reel of recentReels; track reel.title) {
        <div class="reel-row">
          <div class="reel-info">
            <div class="video-thumb" [class.thumb-blue]="reel.color === 'blue'"
              [class.thumb-orange]="reel.color === 'orange'"
              [class.thumb-green]="reel.color === 'green'">
              <span>▶</span>
            </div>
            <div><strong>{{ reel.title }}</strong><small>{{ reel.type }}</small></div>
          </div>
          <span><span class="status-pill" [class.pill-green]="reel.status === 'Published'"
            [class.pill-yellow]="reel.status === 'Processing'">{{ reel.status }}</span></span>
          <span class="muted-value">{{ reel.views }}</span>
          <span class="muted-value">{{ reel.updated }}</span>
        </div>
      }
    </div>
    <p class="demo-note">Sample dashboard data · Connect your backend to display live metrics.</p>
  `
})
export class DashboardComponent {
  recentReels = [
    { title: '5 Habits That Change Your Life', type: 'Lifestyle · 30 sec', status: 'Published', views: '2,450', updated: 'Today', color: 'purple' },
    { title: 'The Future of Artificial Intelligence', type: 'Technology · 45 sec', status: 'Processing', views: '—', updated: 'Today', color: 'blue' },
    { title: 'A Morning Routine That Works', type: 'Wellness · 20 sec', status: 'Published', views: '1,820', updated: 'Yesterday', color: 'orange' },
    { title: '3 Tips for Better Productivity', type: 'Education · 30 sec', status: 'Published', views: '980', updated: 'Oct 19', color: 'green' }
  ];
}
