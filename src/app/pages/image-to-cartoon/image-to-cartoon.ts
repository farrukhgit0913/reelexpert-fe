
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, signal } from '@angular/core';

type CartoonStyle = 'anime' | 'ghibli' | '3d' | 'comic';

interface CartoonWorkerResponse {
  pixels?: ArrayBuffer;
  error?: string;
}

@Component({
  selector: 'app-image-to-cartoon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-to-cartoon.html',
  styleUrl: './image-to-cartoon.css'
})
export class ImageToCartoon implements OnDestroy {
  readonly selectedStyle = signal<CartoonStyle>('anime');
  readonly prompt = signal('');
  readonly originalPreview = signal<string | null>(null);
  readonly resultPreview = signal<string | null>(null);
  readonly fileName = signal('');
  readonly errorMessage = signal('');
  readonly isProcessing = signal(false);
  readonly resultReady = signal(false);

  private worker: Worker | null = null;
  private workerReject: ((reason?: unknown) => void) | null = null;
  private taskId = 0;
  private previewUrl: string | null = null;

  readonly styles: {
    id: CartoonStyle;
    name: string;
    description: string;
  }[] = [
    {
      id: 'anime',
      name: 'Anime',
      description: 'Smooth colors and crisp outlines'
    },
    {
      id: 'ghibli',
      name: 'Ghibli-inspired',
      description: 'Soft, painterly storybook colors'
    },
    {
      id: '3d',
      name: '3D Cartoon',
      description: 'Vivid colors and smooth shading'
    },
    {
      id: 'comic',
      name: 'Comic',
      description: 'Bold edges and high contrast'
    }
  ];

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.errorMessage.set('');

    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.errorMessage.set('Choose a JPG, PNG, or WebP image.');
      input.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage.set('Choose an image smaller than 10 MB.');
      input.value = '';
      return;
    }

    this.cancelProcessing();
    this.clearPreviewUrl();

    this.previewUrl = URL.createObjectURL(file);
    this.originalPreview.set(this.previewUrl);
    this.fileName.set(file.name);
    this.resultPreview.set(null);
    this.resultReady.set(false);
    this.errorMessage.set('');
  }

  selectStyle(id: string): void {
    if (!['anime', 'ghibli', '3d', 'comic'].includes(id)) {
      return;
    }

    this.selectedStyle.set(id as CartoonStyle);
    this.resultPreview.set(null);
    this.resultReady.set(false);
  }

  async transformImage(): Promise<void> {
    const source = this.originalPreview();

    if (!source || this.isProcessing()) return;

    const currentTask = ++this.taskId;

    this.isProcessing.set(true);
    this.errorMessage.set("Connecting to local FLUX.2 Klein...");
    this.resultReady.set(false);
    this.resultPreview.set(null);

    try {
      const imageResponse = await fetch(source);
      if (!imageResponse.ok) {
        throw new Error("Could not read the selected image.");
      }

      const originalBlob = await imageResponse.blob();
      const form = new FormData();
      form.append("image", originalBlob, this.fileName() || "upload.png");
      form.append("style", this.selectedStyle());
      form.append("prompt", this.prompt().trim());

      if (currentTask !== this.taskId) return;

      this.errorMessage.set(
        "Generating with FLUX.2 Klein. This may take several minutes..."
      );

      const response = await fetch(
        "http://localhost:3000/api/image-to-cartoon/transform",
        {
          method: "POST",
          body: form
        }
      );

      if (!response.ok) {
        let message = `Image generation failed (${response.status}).`;
        try {
          const data = await response.json();
          if (data.message) message = data.message;
        } catch {
          // Keep the fallback message.
        }
        throw new Error(message);
      }

      const resultBlob = await response.blob();

      if (!resultBlob.type.startsWith("image/")) {
        throw new Error("The AI service did not return an image.");
      }

      const resultDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") resolve(reader.result);
          else reject(new Error("Could not preview the generated image."));
        };
        reader.onerror = () => reject(new Error("Could not read the generated image."));
        reader.readAsDataURL(resultBlob);
      });

      if (currentTask !== this.taskId) return;

      this.resultPreview.set(resultDataUrl);
      this.resultReady.set(true);
      this.errorMessage.set("");
    } catch (error) {
      if (currentTask === this.taskId) {
        console.error("FLUX image transformation failed:", error);
        this.errorMessage.set(
          error instanceof Error
            ? error.message
            : "Transformation failed. Please try again."
        );
      }
    } finally {
      if (currentTask === this.taskId) {
        this.isProcessing.set(false);
      }
    }
  }

  downloadResult(): void {
    const result = this.resultPreview();

    if (!result) return;

    const baseName =
      this.fileName().replace(/\.[^.]+$/, '') || 'image';

    const link = document.createElement('a');
    link.href = result;
    link.download = `${baseName}-${this.selectedStyle()}-cartoon.png`;
    link.click();
  }

  clearImage(): void {
    this.cancelProcessing();
    this.clearPreviewUrl();

    this.originalPreview.set(null);
    this.resultPreview.set(null);
    this.fileName.set('');
    this.errorMessage.set('');
    this.resultReady.set(false);
  }

  private cancelProcessing(): void {
    // Invalidate any asynchronous work already in progress.
    ++this.taskId;

    this.stopWorker();
    this.isProcessing.set(false);
  }

  private stopWorker(): void {
    const worker = this.worker;
    this.worker = null;

    // Termination stops the worker's computation immediately.
    worker?.terminate();

    const reject = this.workerReject;
    this.workerReject = null;

    // Settle a pending promise if the worker was cancelled.
    reject?.(
      new DOMException('Image processing cancelled.', 'AbortError')
    );
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => resolve(image);
      image.onerror = () => {
        reject(new Error('Unable to read the selected image.'));
      };

      image.src = src;
    });
  }

  private clearPreviewUrl(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.previewUrl = null;
  }

  ngOnDestroy(): void {
    this.cancelProcessing();
    this.clearPreviewUrl();
  }
}
