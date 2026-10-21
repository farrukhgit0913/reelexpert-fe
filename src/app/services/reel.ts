
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class ReelService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:3000/api';

  generateScript(
    request: GenerateReelRequest
  ): Observable<GenerateReelResponse> {
    return this.http.post<GenerateReelResponse>(
      `${this.apiUrl}/scripts`,
      request
    );
  }
}
