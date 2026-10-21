import { Component } from '@angular/core';

@Component({
  selector: 'app-analytics',
  standalone: true,
  template: `
    <div class="page-heading">
      <div><span class="eyebrow">PERFORMANCE CENTER</span><h1>Analytics</h1>
        <p>Understand how your content is performing.</p></div>
      <select class="filter-select"><option>Last 7 days</option><option>Last 30 days</option><option>Last 90 days</option></select>
    </div>

    <div class="stats-grid analytics-stats">
      <article class="stat-card"><div class="stat-top"><span>Total views</span><span class="stat-icon purple">◉</span></div><strong>12,840</strong><small class="positive">↑ 18.6% <span class="muted-value">vs. previous period</span></small></article>
      <article class="stat-card"><div class="stat-top"><span>Engagement rate</span><span class="stat-icon blue">♡</span></div><strong>6.8%</strong><small class="positive">↑ 1.2% <span class="muted-value">vs. previous period</span></small></article>
      <article class="stat-card"><div class="stat-top"><span>Published reels</span><span class="stat-icon green">▣</span></div><strong>18</strong><small>Across your library</small></article>
      <article class="stat-card"><div class="stat-top"><span>Avg. views per reel</span><span class="stat-icon orange">↗</span></div><strong>713</strong><small>Based on sample data</small></article>
    </div>

    <div class="analytics-layout">
      <section class="panel chart-panel">
        <div class="section-heading"><div><h2>Views over time</h2><p>Daily content reach</p></div><span class="chart-legend"><i></i> Views</span></div>
        <div class="chart">
          <div class="chart-y-labels"><span>3k</span><span>2k</span><span>1k</span><span>0</span></div>
          <div class="chart-plot">
            <div class="chart-gridline line-1"></div><div class="chart-gridline line-2"></div><div class="chart-gridline line-3"></div><div class="chart-gridline line-4"></div>
            <svg viewBox="0 0 700 220" preserveAspectRatio="none" class="chart-svg" role="img" aria-label="Illustrative line chart of daily views">
              <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#8b5cf6" stop-opacity=".24"/><stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/></linearGradient></defs>
              <path d="M0 180 L100 150 L200 165 L300 100 L400 125 L500 65 L600 85 L700 25 L700 220 L0 220 Z" fill="url(#chartFill)"/>
              <path d="M0 180 L100 150 L200 165 L300 100 L400 125 L500 65 L600 85 L700 25" fill="none" stroke="#8b5cf6" stroke-width="3" vector-effect="non-scaling-stroke"/>
              <circle cx="700" cy="25" r="5" fill="#8b5cf6"/>
            </svg>
          </div>
        </div>
        <div class="chart-x-labels"><span>Oct 15</span><span>Oct 16</span><span>Oct 17</span><span>Oct 18</span><span>Oct 19</span><span>Oct 20</span><span>Oct 21</span></div>
      </section>

      <section class="panel top-content">
        <h2>Top performing reels</h2><p>Content with the most views</p>
        <div class="top-reel"><div class="mini-thumb">01</div><div><strong>5 Habits That Change Your Life</strong><small>Lifestyle</small></div><b>2,450</b></div>
        <div class="top-reel"><div class="mini-thumb mini-blue">02</div><div><strong>A Better Morning Routine</strong><small>Wellness</small></div><b>1,820</b></div>
        <div class="top-reel"><div class="mini-thumb mini-orange">03</div><div><strong>Productivity Tips</strong><small>Education</small></div><b>980</b></div>
        <p class="demo-note">Illustrative analytics. Live metrics require connected platform data.</p>
      </section>
    </div>
  `
})
export class AnalyticsComponent {}
