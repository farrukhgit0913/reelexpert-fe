
import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { concatMap, finalize, from, map, timeout, toArray } from "rxjs";

import {
  GeneratedReel,
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
  readonly selectedVoice = signal("Samantha");

  readonly audioUrl = signal("");
  readonly videoUrl = signal("");
  readonly workflowMessage = signal("");

  readonly selectedCharacterVoices = signal<Record<string, string>>({});

readonly availableVoices = [
  { value: "Ayaan", label: "Ayaan (AI cartoon boy)" },
  { value: "Mina", label: "Mina (AI cartoon girl)" },
  { value: "Samantha", label: "Samantha (macOS)" },
  { value: "Alex", label: "Alex (macOS)" },
  { value: "Victoria", label: "Victoria (macOS)" },
  { value: "Daniel", label: "Daniel (macOS)" },
  { value: "Karen", label: "Karen (macOS)" },
  { value: "Moira", label: "Moira (macOS)" },
  { value: "Tessa", label: "Tessa (macOS)" },
];

characterVoice(name: string, index: number): string {
  return this.selectedCharacterVoices()[name] ??
    (index === 0 ? "Ayaan" : index === 1 ? "Mina" : this.selectedVoice());
}

setCharacterVoice(name: string, voice: string): void {
  this.selectedCharacterVoices.update((current) => ({
    ...current,
    [name]: voice,
  }));
}

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
            const firstFootage = footage[0];

            if (firstFootage) {
              this.selectedFootage.set(firstFootage);
            }
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
    if (this.loading()) {
      return;
    }

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

    if (!reel) {
      return "";
    }

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

    if (!reel) {
      this.errorMessage.set("Generate a script before creating the video.");
      return;
    }

    const mode = reel.mode ?? this.reelForm.controls.mode.value;

    if (mode === "standard" && !this.selectedFootage()) {
      this.errorMessage.set("Select a stock video first.");
      return;
    }

    if (this.narrationLoading() || this.renderLoading()) {
      return;
    }

    const dialogueLines = (reel.scenes ?? [])
      .filter((scene) => scene.speaker?.trim() && scene.dialogue?.trim())
      .sort((a, b) => a.sceneNumber - b.sceneNumber)
      .map((scene) => ({
        speaker: scene.speaker!.trim(),
        text: scene.dialogue!.trim(),
      }));

    const narration = this.getScriptToCopy();

    if (mode === "cartoon" && dialogueLines.length === 0) {
      this.errorMessage.set(
        "This cartoon script has no speaker dialogue. Generate a new cartoon script first.",
      );
      return;
    }

    if (mode === "standard" && !narration) {
      this.errorMessage.set("The script has no narration to generate.");
      return;
    }

    this.errorMessage.set("");
    this.audioUrl.set("");
    this.videoUrl.set("");
    this.narrationLoading.set(true);

    this.workflowMessage.set(
      mode === "cartoon"
        ? `Generating dialogue audio for ${dialogueLines.length} line(s)...`
        : "Generating narration...",
    );

    const audioRequest =
      mode === "cartoon"
        ? this.reelService.generateDialogue(
            dialogueLines,
            this.selectedVoice(),
            Object.fromEntries(
              (reel.characters ?? []).map((character, index) => [
                character.name,
                this.characterVoice(character.name, index),
              ]),
            ),
          )
        : this.reelService.generateNarration(
            narration,
            this.selectedVoice(),
          );

    audioRequest
      .pipe(
        timeout(mode === "cartoon" ? 600000 : 60000),
        finalize(() => {
          this.narrationLoading.set(false);
        }),
      )
      .subscribe({
        next: (audioResponse) => {
          if (!audioResponse?.success || !audioResponse.audio) {
            this.workflowMessage.set("");
            this.errorMessage.set(
              audioResponse?.error || "Audio generation failed.",
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
              audioResponse.audio.lines,
            );
          } else {
            this.renderStandardReel(audioFilename);
          }
        },
        error: (error) => {
          console.error("[ReelExpert] Audio generation failed:", error);

          this.workflowMessage.set("");
          this.errorMessage.set(
            error?.error?.error ||
              (error?.name === "TimeoutError"
                ? "Audio generation timed out. Check the backend and Qwen3-TTS terminals."
                : "Audio generation failed. Check the backend terminal."),
          );
        },
      });
  }

  private generateCartoonImagesAndRender(
    reel: GeneratedReel,
    audioFilename: string,
    dialogueTimeline?: Array<{
      speaker: string;
      text: string;
      durationSeconds: number;
      startSeconds: number;
      endSeconds: number;
    }>,
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

    this.workflowMessage.set(
      `Generating ${scenes.length} cartoon scene image(s)...`,
    );

    this.reelService
      .generateCartoonScenes(scenes, reel.characters ?? [])
      .pipe(timeout(300000))
      .subscribe({
        next: (response) => {
          if (!response?.success || !response.scenes?.length) {
            this.workflowMessage.set("");
            this.errorMessage.set(
              response?.error || "Cartoon image generation failed.",
            );
            return;
          }

          const orderedScenes = [...response.scenes].sort(
            (a, b) => a.sceneNumber - b.sceneNumber,
          );

          this.renderLoading.set(true);

          from(orderedScenes)
            .pipe(
              concatMap((scene, index) => {
                this.workflowMessage.set(
                  `Animating scene ${index + 1} of ${orderedScenes.length} with Wan 2.2...`,
                );

                const animationPrompt = [
                  scene.prompt,
                  "Animate this scene with subtle natural character movement and gentle camera motion.",
                  "Preserve the characters' identity, clothing, colors, and scene composition.",
                  "Keep the motion smooth and family-friendly. Do not add text, subtitles, logos, or new characters.",
                ].join(" ");

                return this.reelService
                  .animateCartoonScene(
                    scene.filename,
                    animationPrompt,
                    3,
                  )
                  .pipe(
                    timeout(600000),
                    map((animationResponse) => {
                      if (
                        !animationResponse?.success ||
                        !animationResponse.clip?.filename
                      ) {
                        throw new Error(
                          animationResponse?.error ||
                            `Animation failed for scene ${scene.sceneNumber}.`,
                        );
                      }

                      return animationResponse.clip.filename;
                    }),
                  );
              }),
              toArray(),
            )
            .subscribe({
              next: (animatedClipFilenames) => {
                if (animatedClipFilenames.length === 0) {
                  this.renderLoading.set(false);
                  this.workflowMessage.set("");
                  this.errorMessage.set(
                    "No animated clips were generated.",
                  );
                  return;
                }

                this.workflowMessage.set(
                  `Animated ${animatedClipFilenames.length} scene(s). Rendering your reel with dialogue audio...`,
                );

                const dialogueScenes = (reel.scenes ?? [])
                  .filter(
                    (item) =>
                      item.speaker?.trim() && item.dialogue?.trim(),
                  )
                  .sort((a, b) => a.sceneNumber - b.sceneNumber);

                const canAlignDialogue =
                  !!dialogueTimeline &&
                  dialogueTimeline.length > 0 &&
                  dialogueTimeline.length === dialogueScenes.length &&
                  orderedScenes.length === dialogueScenes.length &&
                  orderedScenes.every(
                    (scene, index) =>
                      scene.sceneNumber === dialogueScenes[index].sceneNumber,
                  );

                const sceneDurations = canAlignDialogue
                  ? dialogueTimeline!.map((line, index) => {
                      const nextLine = dialogueTimeline![index + 1];
                      const slotEnd = nextLine
                        ? nextLine.startSeconds
                        : line.endSeconds;

                      return Number(
                        (slotEnd - line.startSeconds).toFixed(3),
                      );
                    })
                  : undefined;

                this.reelService
                  .renderAnimatedCartoonReel(
                    audioFilename,
                    animatedClipFilenames,
                    sceneDurations,
                  )
                  .pipe(
                    timeout(300000),
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
                  "[ReelExpert] Cartoon animation failed:",
                  error,
                );

                this.renderLoading.set(false);
                this.workflowMessage.set("");
                this.errorMessage.set(
                  error?.error?.error ||
                    error?.message ||
                    (error?.name === "TimeoutError"
                      ? "Cartoon animation timed out. Check the backend and Wan 2.2 service."
                      : "Could not animate the cartoon scenes. Check the backend terminal."),
                );
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
                ? "Cartoon image generation timed out. Check the backend terminal."
                : "Could not generate cartoon images. Check the backend terminal."),
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
    this.selectedVoice.set("Samantha");

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
    const firstFootage = footage[0];

    if (firstFootage) {
      this.selectedFootage.set(firstFootage);
    } else {
      this.selectedFootage.set("");
    }
  }
}
