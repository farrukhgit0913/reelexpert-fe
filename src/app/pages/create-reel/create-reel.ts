
import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { finalize } from "rxjs";

import { GeneratedReel, ReelService } from "../../services/reel";

@Component({
  selector: "app-create-reel",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: "./create-reel.html",
  styleUrl: "./create-reel.css",
})
export class CreateReel implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reelService = inject(ReelService);

  loading = false;
  errorMessage = "";
  generatedReel: GeneratedReel | null = null;
  copied = false;

  narrationLoading = false;
  renderLoading = false;

  availableFootage: string[] = [];
  selectedFootage = "";

  audioUrl = "";
  videoUrl = "";
  workflowMessage = "";

  readonly reelForm = this.fb.nonNullable.group({
    topic: ["", [Validators.required, Validators.maxLength(2000)]],
    audience: [
      "General audience",
      [Validators.required, Validators.maxLength(200)],
    ],
    platform: ["Instagram Reels", Validators.required],
    language: ["English", Validators.required],
    duration: [30, Validators.required],
    style: ["Engaging", Validators.required],
  });

  ngOnInit(): void {
    this.loadFootage();
  }

  loadFootage(): void {
    this.reelService.getFootage().subscribe({
      next: (response) => {
        this.availableFootage = response.videos ?? [];

        if (
          this.availableFootage.length > 0 &&
          !this.availableFootage.includes(this.selectedFootage)
        ) {
          this.selectedFootage = this.availableFootage[0];
        }

        if (this.availableFootage.length === 0) {
          this.workflowMessage =
            "No stock footage found. Add an MP4, MOV, or M4V file to backend/assets/stock-footage.";
        }
      },
      error: (error) => {
        this.workflowMessage =
          error?.error?.error || "Could not load stock footage.";
      },
    });
  }

  generateReel(): void {
    if (this.reelForm.invalid || this.loading) {
      this.reelForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = "";
    this.generatedReel = null;
    this.copied = false;
    this.audioUrl = "";
    this.videoUrl = "";
    this.workflowMessage = "";

    this.reelService
      .generateScript(this.reelForm.getRawValue())
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.reel) {
            this.errorMessage =
              response.message || "Unable to generate your reel.";
            return;
          }

          this.generatedReel = response.reel;
        },
        error: (error) => {
          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            "Could not connect to ReelExpert AI. Check that the backend and Ollama are running.";
        },
      });
  }

  getScriptToCopy(): string {
    return (
      this.generatedReel?.script ||
      this.generatedReel?.voiceover ||
      ""
    ).trim();
  }

  async copyScript(): Promise<void> {
    const script = this.getScriptToCopy();

    if (!script) {
      this.errorMessage = "There is no script available to copy.";
      return;
    }

    if (
      typeof navigator === "undefined" ||
      !navigator.clipboard?.writeText
    ) {
      this.errorMessage =
        "Clipboard access is unavailable. Open the app in a supported browser context.";
      return;
    }

    try {
      await navigator.clipboard.writeText(script);
      this.copied = true;
      this.errorMessage = "";
    } catch {
      this.copied = false;
      this.errorMessage =
        "Could not copy the script. Check your browser clipboard permissions.";
    }
  }

  generateNarrationAndRender(): void {
    const narration = (
      this.generatedReel?.voiceover ||
      this.generatedReel?.script ||
      ""
    ).trim();

    if (!this.generatedReel || !narration) {
      this.errorMessage = "Generate a script before creating the video.";
      return;
    }

    if (!this.selectedFootage) {
      this.errorMessage = "Select a stock video first.";
      return;
    }

    if (this.narrationLoading || this.renderLoading) {
      return;
    }

    this.errorMessage = "";
    this.audioUrl = "";
    this.videoUrl = "";
    this.workflowMessage = "Generating narration...";
    this.narrationLoading = true;

    this.reelService
      .generateNarration(narration)
      .pipe(finalize(() => (this.narrationLoading = false)))
      .subscribe({
        next: (audioResponse) => {
          if (!audioResponse.success || !audioResponse.audio) {
            this.workflowMessage = "";
            this.errorMessage =
              audioResponse.error || "Narration generation failed.";
            return;
          }

          this.audioUrl = this.reelService.getAssetUrl(
            audioResponse.audio.url,
          );

          this.workflowMessage = "Rendering your vertical reel...";
          this.renderLoading = true;

          this.reelService
            .renderReel(
              this.selectedFootage,
              audioResponse.audio.filename,
            )
            .pipe(finalize(() => (this.renderLoading = false)))
            .subscribe({
              next: (renderResponse) => {
                if (
                  !renderResponse.success ||
                  !renderResponse.video
                ) {
                  this.workflowMessage = "";
                  this.errorMessage =
                    renderResponse.error || "Video rendering failed.";
                  return;
                }

                this.videoUrl = this.reelService.getAssetUrl(
                  renderResponse.video.url,
                );

                this.workflowMessage =
                  "Your reel is ready to preview and download.";
              },
              error: (error) => {
                this.workflowMessage = "";
                this.errorMessage =
                  error?.error?.error ||
                  "Video rendering failed. Check FFmpeg and stock footage.";
              },
            });
        },
        error: (error) => {
          this.workflowMessage = "";
          this.errorMessage =
            error?.error?.error ||
            "Narration generation failed. Check macOS speech and FFmpeg.";
        },
      });
  }

  resetForm(): void {
    this.generatedReel = null;
    this.errorMessage = "";
    this.copied = false;

    this.narrationLoading = false;
    this.renderLoading = false;

    this.audioUrl = "";
    this.videoUrl = "";
    this.workflowMessage = "";

    this.reelForm.reset({
      topic: "",
      audience: "General audience",
      platform: "Instagram Reels",
      language: "English",
      duration: 30,
      style: "Engaging",
    });

    if (this.availableFootage.length > 0) {
      this.selectedFootage = this.availableFootage[0];
    }
  }
}
