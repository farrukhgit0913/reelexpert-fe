
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

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

  readonly reelForm = this.fb.nonNullable.group({
    topic: ['', [Validators.required, Validators.maxLength(2000)]],
    audience: ['General audience', Validators.required],
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

    this.reelService.generateScript(
      this.reelForm.getRawValue()
    ).subscribe({
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
          error.error?.message ||
          'Could not connect to ReelExpert AI. Check your backend and Ollama.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  copyScript(): void {
    if (!this.generatedReel) return;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.generatedReel.voiceover)
        .catch(() => {
          this.errorMessage = 'Could not copy the script.';
        });
    }
  }

  resetForm(): void {
    this.generatedReel = null;
    this.errorMessage = '';

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
