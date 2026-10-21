import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  recentReels = [
    { title: '5 Habits That Change Your Life', type: 'Lifestyle · 30 sec', status: 'Published', views: '2,450', updated: 'Today', color: 'purple' },
    { title: 'The Future of Artificial Intelligence', type: 'Technology · 45 sec', status: 'Processing', views: '—', updated: 'Today', color: 'blue' },
    { title: 'A Morning Routine That Works', type: 'Wellness · 20 sec', status: 'Published', views: '1,820', updated: 'Yesterday', color: 'orange' },
    { title: '3 Tips for Better Productivity', type: 'Education · 30 sec', status: 'Published', views: '980', updated: 'Oct 19', color: 'green' }
  ];
  
}
