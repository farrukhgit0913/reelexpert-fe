
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface ReelScene {
  sceneNumber: number;
  duration: number;
  visual: string;
  narration: string;
  onScreenText: string;
}

export interface GeneratedReel {
  title: string;
  hook: string;
  script: string;
  voiceover: string;
  captions: string[];
  scenes: ReelScene[];
  hashtags: string[];
  status?: string;
  createdAt?: string;
}

export interface GenerateReelRequest {
  topic: string;
  audience: string;
  platform: string;
  language: string;
  duration: number;
  style: string;
}

export interface GenerateReelResponse {
  success: boolean;
  reel: GeneratedReel;
  message?: string;
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
  };
}

export interface FootageResponse {
  success: boolean;
  videos: string[];
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
    return this.http.post<TtsResponse>(`${this.apiUrl}/tts`, {
      text,
      voice,
    });
  }

  getFootage(): Observable<FootageResponse> {
    return this.http.get<FootageResponse>(
      `${this.apiUrl}/footage`,
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

  getAssetUrl(url: string): string {
    return new URL(url, `${this.apiUrl}/`).toString();
  }
}
