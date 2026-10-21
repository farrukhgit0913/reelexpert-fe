import { Component } from '@angular/core';

@Component({
  selector: 'app-reels',
  standalone: true,
  template: `
    <div class="page-heading">
      <div><span class="eyebrow">CONTENT LIBRARY</span><h1>My Reels</h1>
        <p>Manage and organize your short-form content.</p></div>
      <a href="/create" class="btn-primary">＋ Create reel</a>
    </div>

    <div class="library-toolbar">
      <input class="search-input" placeholder="⌕  Search your reels..." [value]="search"
        (input)="search = $any($event.target).value" />
      <select class="filter-select" [value]="filter"
        (change)="filter = $any($event.target).value">
        <option value="All">All statuses</option>
        <option value="Published">Published</option>
        <option value="Processing">Processing</option>
        <option value="Draft">Draft</option>
      </select>
    </div>

    <div class="reels-grid">
      @for (reel of filteredReels; track reel.title) {
        <article class="reel-card">
          <div class="reel-cover" [class.thumb-blue]="reel.color === 'blue'"
            [class.thumb-orange]="reel.color === 'orange'"
            [class.thumb-green]="reel.color === 'green'">
            <span class="cover-symbol">✦</span><span class="cover-play">▶</span>
            <span class="cover-duration">{{ reel.duration }}</span>
          </div>
          <div class="reel-card-body">
            <span class="status-pill" [class.pill-green]="reel.status === 'Published'"
              [class.pill-yellow]="reel.status === 'Processing'"
              [class.pill-gray]="reel.status === 'Draft'">{{ reel.status }}</span>
            <h3>{{ reel.title }}</h3>
            <p>{{ reel.category }}</p>
            <div class="reel-card-footer"><span>◉ {{ reel.views }} views</span><span>{{ reel.date }}</span></div>
          </div>
        </article>
      } @empty {
        <div class="empty-state"><span>▣</span><h3>No reels found</h3>
          <p>Try another search or status filter.</p></div>
      }
    </div>
    <p class="demo-note">Sample content · Connect your reels API to load real videos.</p>
  `
})
export class ReelsComponent {
  search = '';
  filter = 'All';

  reels = [
    { title: '5 Habits That Change Your Life', category: 'Lifestyle · Cinematic', status: 'Published', views: '2,450', date: 'Oct 21', duration: '0:30', color: 'purple' },
    { title: 'The Future of AI', category: 'Technology · Explainer', status: 'Processing', views: '—', date: 'Oct 21', duration: '0:45', color: 'blue' },
    { title: 'A Better Morning Routine', category: 'Wellness · Storytelling', status: 'Published', views: '1,820', date: 'Oct 20', duration: '0:20', color: 'orange' },
    { title: 'Productivity Tips', category: 'Education · Short', status: 'Draft', views: '—', date: 'Oct 19', duration: '0:30', color: 'green' },
    { title: 'Build Your Personal Brand', category: 'Business · Motivational', status: 'Published', views: '980', date: 'Oct 18', duration: '0:45', color: 'blue' },
    { title: 'Small Steps, Big Results', category: 'Lifestyle · Inspirational', status: 'Draft', views: '—', date: 'Oct 17', duration: '0:15', color: 'orange' }
  ];

  get filteredReels() {
    return this.reels.filter(reel =>
      (this.filter === 'All' || reel.status === this.filter) &&
      reel.title.toLowerCase().includes(this.search.toLowerCase())
    );
  }
}
