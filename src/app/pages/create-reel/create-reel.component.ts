import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-reel',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-heading">
      <div><span class="eyebrow">AI CONTENT STUDIO</span><h1>Create a reel</h1>
        <p>Bring your idea to life with an AI-assisted workflow.</p></div>
    </div>

    <div class="creator-layout">
      <section class="panel creator-form">
        <div class="panel-heading"><span class="step-number">01</span><div><h2>Describe your idea</h2><p>Tell us what your reel should be about.</p></div></div>
        <label for="topic">Topic or prompt</label>
        <textarea id="topic" rows="5" [(ngModel)]="topic"
          placeholder="e.g. Create an engaging reel about 5 habits for a more productive morning..."></textarea>
        <div class="field-hint">Be specific for better results.</div>

        <div class="form-grid">
          <div><label for="style">Content style</label>
            <select id="style" [(ngModel)]="style">
              <option value="Cinematic">Cinematic</option><option value="Educational">Educational</option>
              <option value="Motivational">Motivational</option><option value="Storytelling">Storytelling</option>
              <option value="Promotional">Promotional</option>
            </select>
          </div>
          <div><label for="platform">Platform format</label>
            <select id="platform" [(ngModel)]="platform">
              <option value="9:16">Vertical · 9:16</option><option value="1:1">Square · 1:1</option>
              <option value="16:9">Landscape · 16:9</option>
            </select>
          </div>
          <div><label for="duration">Duration</label>
            <select id="duration" [(ngModel)]="duration">
              <option value="15 seconds">15 seconds</option><option value="30 seconds">30 seconds</option>
              <option value="45 seconds">45 seconds</option><option value="60 seconds">60 seconds</option>
            </select>
          </div>
          <div><label for="captions">Captions</label>
            <select id="captions" [(ngModel)]="captions">
              <option value="On">Include captions</option><option value="Off">No captions</option>
            </select>
          </div>
        </div>

        <button class="btn-primary generate-btn" (click)="generate()">✦ Generate reel concept</button>
        @if (message) { <div class="inline-notice">{{ message }}</div> }
      </section>

      <aside class="panel preview-panel">
        <span class="eyebrow">LIVE PREVIEW</span>
        <div class="preview-frame">
          <div class="preview-glow"></div>
          <div class="preview-content"><span class="preview-logo">✦ REELEXPERT AI</span>
            <span class="preview-play">▶</span><strong>Your next great<br>story starts here.</strong>
            <small>AI-POWERED CONTENT</small></div>
        </div>
        <h3>Your creative canvas</h3>
        <p>Your reel preview and generated script can appear here when the AI service is connected.</p>
        <div class="preview-meta"><span>Format</span><strong>{{ platform }}</strong></div>
        <div class="preview-meta"><span>Duration</span><strong>{{ duration }}</strong></div>
        <div class="preview-meta"><span>Captions</span><strong>{{ captions }}</strong></div>
      </aside>
    </div>
  `
})
export class CreateReelComponent {
  topic = '';
  style = 'Cinematic';
  platform = '9:16';
  duration = '30 seconds';
  captions = 'On';
  message = '';

  generate() {
    this.message = this.topic.trim()
      ? 'Your concept settings are ready. Connect your existing AI generation API to create the reel.'
      : 'Please enter a topic or prompt first.';
  }
}
