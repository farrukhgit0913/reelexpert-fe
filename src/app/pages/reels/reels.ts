import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-reels',
  styleUrl: './reels.css',
  templateUrl: './reels.html',
})
export class Reels {
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
