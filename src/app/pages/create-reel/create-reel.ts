import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { finalize } from 'rxjs';

import {
  GeneratedReel,
  ReelService
} from '../../services/reel';

@Component({
  selector: 'app-create-reel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-reel.html',
  styleUrl: './create-reel.css'
})
export class CreateReel {
  private readonly fb = inject(FormBuilder);
  private readonly reelService = inject(ReelService);

  loading = false;
  errorMessage = '';
  generatedReel: GeneratedReel | null = null;
  copied = false;

  readonly reelForm = this.fb.nonNullable.group({
    topic: ['', [Validators.required, Validators.maxLength(2000)]],
    audience: [
      'General audience',
      [Validators.required, Validators.maxLength(200)]
    ],
    platform: ['Instagram Reels', Validators.required],
    language: ['English', Validators.required],
    duration: [30, Validators.required],
    style: ['Engaging', Validators.required]
  });

  generateReel(): void {
    if (this.reelForm.invalid || this.loading) {
      this.reelForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.generatedReel = null;
    this.copied = false;

    this.reelService
      .generateScript(this.reelForm.getRawValue())
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (!response.success || !response.reel) {
            this.errorMessage =
              response.message || 'Unable to generate your reel.';
            return;
          }

          this.generatedReel = response.reel;
        },
        error: (error) => {
          this.errorMessage =
            error?.error?.message ||
            'Could not connect to ReelExpert AI. Check that the backend and Ollama are running.';
        }
      });
  }

  getScriptToCopy(): string {
    return (
      this.generatedReel?.script ||
      this.generatedReel?.voiceover ||
      ''
    ).trim();
  }

  async copyScript(): Promise<void> {
    const script = this.getScriptToCopy();

    if (!script) {
      this.errorMessage = 'There is no script available to copy.';
      return;
    }

    if (
      typeof navigator === 'undefined' ||
      !navigator.clipboard?.writeText
    ) {
      this.errorMessage =
        'Clipboard access is unavailable. Open the app in a supported browser context.';
      return;
    }

    try {
      await navigator.clipboard.writeText(script);
      this.copied = true;
      this.errorMessage = '';
    } catch {
      this.copied = false;
      this.errorMessage =
        'Could not copy the script. Check your browser clipboard permissions.';
    }
  }

  resetForm(): void {
    this.generatedReel = null;
    this.errorMessage = '';
    this.copied = false;

    this.reelForm.reset({
      topic: '',
      audience: 'General audience',
      platform: 'Instagram Reels',
      language: 'English',
      duration: 30,
      style: 'Engaging'
    });
  }
}
