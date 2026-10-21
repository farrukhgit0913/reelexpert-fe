import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div class="page-heading">
      <div><span class="eyebrow">PREFERENCES</span><h1>Settings</h1>
        <p>Customize your ReelExpert AI workspace.</p></div>
    </div>

    <div class="settings-layout">
      <nav class="settings-nav">
        <a class="settings-nav-active">◉ General</a>
        <a>✦ AI preferences</a>
        <a>⌘ Integrations</a>
        <a>♧ Account</a>
      </nav>

      <section class="panel settings-panel">
        <div class="panel-heading"><div><h2>Workspace profile</h2><p>Basic details for your creator workspace.</p></div></div>
        <label for="workspace">Workspace name</label>
        <input id="workspace" value="My Creator Workspace"/>
        <label for="email">Email address</label>
        <input id="email" type="email" value="creator@example.com"/>
        <div class="settings-divider"></div>

        <div class="panel-heading"><div><h2>AI creation defaults</h2><p>Choose the defaults for new reels.</p></div></div>
        <label for="default-style">Default content style</label>
        <select id="default-style"><option>Cinematic</option><option>Educational</option><option>Motivational</option><option>Storytelling</option></select>
        <label for="default-format">Default video format</label>
        <select id="default-format"><option>Vertical · 9:16</option><option>Square · 1:1</option><option>Landscape · 16:9</option></select>

        <div class="settings-divider"></div>
        <div class="setting-toggle"><div><strong>Auto captions</strong><p>Include captions in new reel projects by default.</p></div><input type="checkbox" checked aria-label="Auto captions"/></div>
        <div class="setting-toggle"><div><strong>Creation notifications</strong><p>Show notifications when a reel is ready.</p></div><input type="checkbox" checked aria-label="Creation notifications"/></div>

        <button class="btn-primary save-btn" (click)="save()">Save preferences</button>
        @if (saved) { <p class="save-message">Preferences demo saved for this screen. Connect your settings API for persistence.</p> }
      </section>
    </div>
  `
})
export class SettingsComponent {
  saved = false;
  save() { this.saved = true; }
}
