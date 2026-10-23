
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface ReelScene {
  sceneNumber: number;
  duration: number;
  visual: string;
  narration?: string;
  voiceover?: string;
  textOverlay?: string;
  onScreenText?: string;
  speaker?: string;
  dialogue?: string;
}

export interface ReelCharacter {
  name: string;
  appearance: string;
  personality: string;
  voiceDescription: string;
}

export interface GeneratedReel {
  title: string;
  hook: string;
  description?: string;
  script?: string;
  voiceover?: string;
  captions?: string[];
  scenes: ReelScene[];
  hashtags: string[];
  callToAction?: string;
  status?: string;
  createdAt?: string;
  mode?: "standard" | "cartoon";
  characters?: ReelCharacter[];
}

export interface GenerateReelRequest {
  topic: string;
  audience: string;
  platform: string;
  language: string;
  duration: number;
  style: string;
  mode: "standard" | "cartoon";
}

export interface GenerateReelResponse {
  success: boolean;
  reel: GeneratedReel;
  message?: string;
  error?: string;
}

export interface DialogueTimingLine {
  speaker: string;
  text: string;
  durationSeconds: number;
  startSeconds: number;
  endSeconds: number;
}

export interface TtsResponse {
  success: boolean;
  message?: string;
  error?: string;
  audio?: {
    filename: string;
    url: string;
    format: string;
    voice: string;
    lines?: DialogueTimingLine[];
  };
}

export interface FootageResponse {
  success: boolean;
  videos: string[];
  error?: string;
}

export interface CartoonSceneImage {
  sceneNumber: number;
  filename: string;
  path: string;
  prompt: string;
}

export interface CartoonScenesResponse {
  success: boolean;
  count: number;
  scenes: CartoonSceneImage[];
  error?: string;
}
export interface AnimateCartoonResponse {
  success: boolean;
  message?: string;
  clip?: {
    filename: string;
    url: string;
    durationSeconds: number;
    sizeBytes: number;
    provider: string;
  };
  error?: string;
}

export interface RenderResponse {
  success: boolean;
  message?: string;
  error?: string;
  video?: {
    filename: string;
    url: string;
    format: string;
    width: number;
    height: number;
    durationSeconds?: number;
    scenes?: number;
    mode?: "standard" | "cartoon";
    sizeBytes: number;
  };
}

@Injectable({
  providedIn: "root",
})
export class ReelService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = "http://localhost:3000/api";

  generateScript(
    request: GenerateReelRequest,
  ): Observable<GenerateReelResponse> {
    return this.http.post<GenerateReelResponse>(
      `${this.apiUrl}/scripts`,
      request,
    );
  }

  generateNarration(
    text: string,
    voice = "Samantha",
  ): Observable<TtsResponse> {
    return this.http.post<TtsResponse>(
      `${this.apiUrl}/tts`,
      { text, voice },
    );
  }

  generateDialogue(
  lines: Array<{ speaker: string; text: string }>,
  fallbackVoice = "Samantha",
  characterVoices: Record<string, string> = {},
): Observable<TtsResponse> {
  return this.http.post<TtsResponse>(
    `${this.apiUrl}/tts/dialogue`,
    { lines, fallbackVoice, characterVoices },
  );
}

  getFootage(): Observable<FootageResponse> {
    return this.http.get<FootageResponse>(
      `${this.apiUrl}/footage`,
    );
  }

  generateCartoonScenes(
    scenes: Array<{ sceneNumber: number; visual: string }>,
    characters: ReelCharacter[] = [],
  ): Observable<CartoonScenesResponse> {
    return this.http.post<CartoonScenesResponse>(
      `${this.apiUrl}/cartoon/scenes`,
      { scenes, characters },
    );
  }

  renderReel(
    videoFilename: string,
    audioFilename: string,
  ): Observable<RenderResponse> {
    return this.http.post<RenderResponse>(
      `${this.apiUrl}/render`,
      { videoFilename, audioFilename },
    );
  }

  renderCartoonReel(
    audioFilename: string,
    cartoonSceneFilenames: string[],
  ): Observable<RenderResponse> {
    return this.http.post<RenderResponse>(
      `${this.apiUrl}/render`,
      {
        audioFilename,
        cartoonSceneFilenames,
      },
    );
  }

  animateCartoonScene(
    imageFilename: string,
    prompt: string,
    durationSeconds = 3,
  ): Observable<AnimateCartoonResponse> {
    return this.http.post<AnimateCartoonResponse>(
      `${this.apiUrl}/cartoon/animate`,
      { imageFilename, prompt, durationSeconds },
    );
  }

  renderAnimatedCartoonReel(
    audioFilename: string,
    animatedClipFilenames: string[],
    sceneDurations?: number[],
  ): Observable<RenderResponse> {
    return this.http.post<RenderResponse>(
      `${this.apiUrl}/render`,
      { audioFilename, animatedClipFilenames, sceneDurations },
    );
  }

  getAssetUrl(url: string): string {
    return new URL(url, `${this.apiUrl}/`).toString();
  }
}
