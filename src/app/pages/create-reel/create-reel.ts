import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { finalize, timeout } from "rxjs";

import {
  GeneratedReel,
  ReelCharacter,
  ReelScene,
  ReelService,
} from "../../services/reel";

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

  readonly loading = signal(false);
  readonly errorMessage = signal("");
  readonly generatedReel = signal<GeneratedReel | null>(null);
  readonly copied = signal(false);

  readonly narrationLoading = signal(false);
  readonly renderLoading = signal(false);

  readonly availableFootage = signal<string[]>([]);
  readonly selectedFootage = signal("");

  readonly audioUrl = signal("");
  readonly videoUrl = signal("");
  readonly workflowMessage = signal("");

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
    mode: ["standard" as "standard" | "cartoon", Validators.required],
  });

  ngOnInit(): void {
    this.loadFootage();
  }

  loadFootage(): void {
    this.reelService
      .getFootage()
      .pipe(
        timeout(15000),
        finalize(() => {
          // Footage loading is independent of script generation.
        }),
      )
      .subscribe({
        next: (response) => {
          const footage = response?.videos ?? [];
          this.availableFootage.set(footage);

          if (
            footage.length > 0 &&
            !footage.includes(this.selectedFootage())
          ) {
            this.selectedFootage.set(footage[0]);
          }

          this.workflowMessage.set(
            footage.length === 0
              ? "No footage found in backend/assets/stock-footage."
              : "",
          );
        },
        error: () => {
          this.workflowMessage.set(
            "Could not load footage. Make sure the backend is running on port 3000.",
          );
        },
      });
  }

  generateReel(): void {
    if (this.loading()) return;

    if (this.reelForm.invalid) {
      this.reelForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set("");
    this.generatedReel.set(null);
    this.copied.set(false);
    this.audioUrl.set("");
    this.videoUrl.set("");
    this.workflowMessage.set("Generating your reel script...");

    this.reelService
      .generateScript(this.reelForm.getRawValue())
      .pipe(
        timeout(120000),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          if (!response?.success || !response?.reel) {
            this.errorMessage.set(
              response?.error ||
                response?.message ||
                "Invalid API response.",
            );
            this.workflowMessage.set("");
            return;
          }

          this.generatedReel.set(response.reel);
          this.workflowMessage.set(
            "Script generated successfully. Review it below, then create your reel.",
          );
        },
        error: (error) => {
          console.error("[ReelExpert] Script request failed:", error);

          this.workflowMessage.set("");
          this.errorMessage.set(
            error?.error?.error ||
              (error?.name === "TimeoutError"
                ? "Script generation timed out. Check the backend terminal."
                : error?.message ||
                  "Script generation failed. Check the backend connection."),
          );
        },
      });
  }

  getScriptToCopy(): string {
    const reel = this.generatedReel();

    if (!reel) return "";

    const sceneNarration =
      reel.scenes
        ?.map(
          (scene) =>
            scene.voiceover ||
            scene.narration ||
            scene.dialogue ||
            "",
        )
        .filter((text) => text.trim().length > 0)
        .join("\n\n") ?? "";

    return (
      reel.script ||
      reel.voiceover ||
      sceneNarration ||
      ""
    ).trim();
  }

  async copyScript(): Promise<void> {
    const script = this.getScriptToCopy();

    if (!script) {
      this.errorMessage.set("There is no script available to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(script);
      this.copied.set(true);
      this.errorMessage.set("");
    } catch {
      this.copied.set(false);
      this.errorMessage.set(
        "Could not copy the script. Check browser clipboard permissions.",
      );
    }
  }

  generateNarrationAndRender(): void {
    const reel = this.generatedReel();
    const narration = this.getScriptToCopy();

    if (!reel || !narration) {
      this.errorMessage.set(
        "Generate a script before creating the video.",
      );
      return;
    }

    // Use the selected form mode if the script API doesn't return one.
    const mode = reel.mode ?? this.reelForm.controls.mode.value;

    if (mode === "standard" && !this.selectedFootage()) {
      this.errorMessage.set("Select a stock video first.");
      return;
    }

    if (this.narrationLoading() || this.renderLoading()) {
      return;
    }

    this.errorMessage.set("");
    this.audioUrl.set("");
    this.videoUrl.set("");
    this.narrationLoading.set(true);
    this.workflowMessage.set("Generating narration...");

    this.reelService
      .generateNarration(narration)
      .pipe(
        timeout(60000),
        finalize(() => {
          this.narrationLoading.set(false);
        }),
      )
      .subscribe({
        next: (audioResponse) => {
          if (!audioResponse?.success || !audioResponse.audio) {
            this.workflowMessage.set("");
            this.errorMessage.set(
              audioResponse?.error || "Narration generation failed.",
            );
            return;
          }

          const audioFilename = audioResponse.audio.filename;

          this.audioUrl.set(
            this.reelService.getAssetUrl(audioResponse.audio.url),
          );

          if (mode === "cartoon") {
            this.generateCartoonImagesAndRender(
              reel,
              audioFilename,
            );
          } else {
            this.renderStandardReel(audioFilename);
          }
        },
        error: (error) => {
          this.workflowMessage.set("");
          this.errorMessage.set(
            error?.error?.error ||
              (error?.name === "TimeoutError"
                ? "Narration generation timed out. Check the backend terminal."
                : "Narration generation failed. Check the backend terminal."),
          );
        },
      });
  }

  private generateCartoonImagesAndRender(
    reel: GeneratedReel,
    audioFilename: string,
  ): void {
    const scenes = (reel.scenes ?? [])
      .filter((scene) => scene.visual?.trim())
      .map((scene) => ({
        sceneNumber: scene.sceneNumber,
        visual: this.buildScenePrompt(scene),
      }));

    if (scenes.length === 0) {
      this.workflowMessage.set("");
      this.errorMessage.set(
        "This script has no scene descriptions. Generate a script with visual descriptions first.",
      );
      return;
    }

    const characters: ReelCharacter[] = reel.characters ?? [];

    this.workflowMessage.set(
      `Generating ${scenes.length} cartoon scene image(s). This may take a few minutes...`,
    );

    this.reelService
      .generateCartoonScenes(scenes, characters)
      .pipe(timeout(300000))
      .subscribe({
        next: (response) => {
          if (
            !response?.success ||
            !response.scenes?.length
          ) {
            this.workflowMessage.set("");
            this.errorMessage.set(
              response?.error || "Cartoon image generation failed.",
            );
            return;
          }

          const filenames = [...response.scenes]
            .sort((a, b) => a.sceneNumber - b.sceneNumber)
            .map((scene) => scene.filename);

          this.workflowMessage.set(
            `Generated ${filenames.length} cartoon image(s). Rendering your reel...`,
          );

          this.renderLoading.set(true);

          this.reelService
            .renderCartoonReel(audioFilename, filenames)
            .pipe(
              timeout(180000),
              finalize(() => {
                this.renderLoading.set(false);
              }),
            )
            .subscribe({
              next: (renderResponse) => {
                this.handleRenderResponse(renderResponse);
              },
              error: (error) => {
                this.handleRenderError(error);
              },
            });
        },
        error: (error) => {
          console.error(
            "[ReelExpert] Cartoon image generation failed:",
            error,
          );

          this.workflowMessage.set("");
          this.errorMessage.set(
            error?.error?.error ||
              (error?.name === "TimeoutError"
                ? "Cartoon image generation took too long. Check the backend terminal."
                : "Could not generate cartoon images. Check the Cloudflare configuration and backend terminal."),
          );
        },
      });
  }

  private buildScenePrompt(scene: ReelScene): string {
    const details = [
      scene.visual,
      scene.speaker && scene.dialogue
        ? `Story context: ${scene.speaker} says, "${scene.dialogue}".`
        : "",
      scene.onScreenText
        ? `Story context includes this on-screen text: ${scene.onScreenText}.`
        : "",
    ];

    return details.filter(Boolean).join(" ");
  }

  private renderStandardReel(audioFilename: string): void {
    this.workflowMessage.set("Rendering your vertical reel...");
    this.renderLoading.set(true);

    this.reelService
      .renderReel(this.selectedFootage(), audioFilename)
      .pipe(
        timeout(180000),
        finalize(() => {
          this.renderLoading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.handleRenderResponse(response);
        },
        error: (error) => {
          this.handleRenderError(error);
        },
      });
  }

  private handleRenderResponse(
    response: {
      success: boolean;
      error?: string;
      message?: string;
      video?: { url: string };
    },
  ): void {
    if (!response?.success || !response.video) {
      this.workflowMessage.set("");
      this.errorMessage.set(
        response?.error || response?.message || "Video rendering failed.",
      );
      return;
    }

    this.videoUrl.set(
      this.reelService.getAssetUrl(response.video.url),
    );

    this.workflowMessage.set(
      "Your reel is ready to preview and download.",
    );
    this.errorMessage.set("");
  }

  private handleRenderError(error: any): void {
    console.error("[ReelExpert] Video rendering failed:", error);

    this.workflowMessage.set("");
    this.errorMessage.set(
      error?.error?.error ||
        (error?.name === "TimeoutError"
          ? "Video rendering timed out. Check the backend terminal."
          : "Video rendering failed. Check FFmpeg and the backend terminal."),
    );
  }

  resetForm(): void {
    if (
      this.loading() ||
      this.narrationLoading() ||
      this.renderLoading()
    ) {
      return;
    }

    this.generatedReel.set(null);
    this.errorMessage.set("");
    this.copied.set(false);
    this.audioUrl.set("");
    this.videoUrl.set("");
    this.workflowMessage.set("");

    this.reelForm.reset({
      topic: "",
      audience: "General audience",
      platform: "Instagram Reels",
      language: "English",
      duration: 30,
      style: "Engaging",
      mode: "standard",
    });

    const footage = this.availableFootage();

    if (footage.length > 0) {
      this.selectedFootage.set(footage[0]);
    }
  }
}
