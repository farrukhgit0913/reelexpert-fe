import { CommonModule } from '@angular/common';
import { Component, OnDestroy, signal } from '@angular/core';

type StudioMode =
  | 'photo-cartoon'
  | 'sketch-image'
  | 'background-restyle'
  | 'character-designer'
  | 'thumbnail'
  | 'story-scenes'
  | 'product-studio'
  | 'character-variations';
type ImageStyle = '3d' | 'anime' | 'ghibli' | 'comic' | 'clay' | 'realistic' | 'fantasy' | 'product';

interface GeneratedAsset {
  filename: string;
  url: string;
  prompt: string;
  mode: StudioMode;
  sceneNumber?: number;
}

@Component({
  selector: 'app-image-to-cartoon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-to-cartoon.html',
  styleUrl: './image-to-cartoon.css'
})
export class ImageToCartoon implements OnDestroy {
  readonly apiBase = 'http://localhost:3000';
  readonly selectedMode = signal<StudioMode>('photo-cartoon');
  readonly selectedStyle = signal<ImageStyle>('3d');
  readonly prompt = signal('');
  readonly storyScript = signal('');
  readonly aspectRatio = signal('portrait');
  readonly originalPreview = signal<string | null>(null);
  readonly fileName = signal('');
  readonly selectedFile = signal<File | null>(null);
  readonly errorMessage = signal('');
  readonly statusMessage = signal('');
  readonly isProcessing = signal(false);
  readonly resultImages = signal<GeneratedAsset[]>([]);
  private taskId = 0;
  private previewUrl: string | null = null;

  readonly modes: { id: StudioMode; name: string; description: string; icon: string; needsImage: boolean }[] = [
    { id: 'photo-cartoon', name: 'Photo to Cartoon', description: 'Turn photos into animated artwork', icon: '✧', needsImage: true },
    { id: 'sketch-image', name: 'Sketch to Image', description: 'Develop drawings into polished art', icon: '✎', needsImage: true },
    { id: 'background-restyle', name: 'Background Restyling', description: 'Reimagine the scene around your subject', icon: '◫', needsImage: true },
    { id: 'character-designer', name: 'Character Designer', description: 'Create a character from a description', icon: '♙', needsImage: false },
    { id: 'thumbnail', name: 'Thumbnail Creator', description: 'Create artwork for social videos', icon: '▣', needsImage: false },
    { id: 'story-scenes', name: 'Story Scene Generator', description: 'Generate up to four scene images', icon: '▤', needsImage: false },
    { id: 'product-studio', name: 'Product Image Studio', description: 'Restyle product photography', icon: '◇', needsImage: true },
    { id: 'character-variations', name: 'Character Variations', description: 'Explore outfits, poses and expressions', icon: '♧', needsImage: true }
  ];

  readonly styles: { id: ImageStyle; name: string; description: string }[] = [
    { id: '3d', name: 'Stylized 3D', description: 'Rounded forms and cinematic light' },
    { id: 'anime', name: 'Anime', description: 'Expressive features and vivid colors' },
    { id: 'ghibli', name: 'Storybook', description: 'Soft, painterly illustration' },
    { id: 'comic', name: 'Comic book', description: 'Bold outlines and dramatic shading' },
    { id: 'clay', name: 'Clay animation', description: 'Handcrafted miniature look' },
    { id: 'realistic', name: 'Photorealistic', description: 'Natural details and studio lighting' },
    { id: 'fantasy', name: 'Fantasy art', description: 'Atmospheric, imaginative worlds' },
    { id: 'product', name: 'Product studio', description: 'Clean commercial photography' }
  ];

  modeNeedsImage(): boolean {
    return this.modes.find(mode => mode.id === this.selectedMode())?.needsImage ?? false;
  }

  modeName(): string {
    return this.modes.find(mode => mode.id === this.selectedMode())?.name ?? 'AI Image Studio';
  }

  selectMode(id: StudioMode): void {
    this.selectedMode.set(id);
    this.errorMessage.set('');
    this.statusMessage.set('');
    this.resultImages.set([]);
    if (id === 'product-studio') this.selectedStyle.set('product');
    else if (id === 'character-designer' || id === 'character-variations' || id === 'photo-cartoon') this.selectedStyle.set('3d');
    else if (id === 'sketch-image') this.selectedStyle.set('fantasy');
    else if (id === 'thumbnail') this.selectedStyle.set('realistic');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.errorMessage.set('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.errorMessage.set('Choose a JPG, PNG, or WebP image.'); input.value = ''; return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage.set('Choose an image smaller than 10 MB.'); input.value = ''; return;
    }
    this.cancelProcessing();
    this.clearPreviewUrl();
    this.previewUrl = URL.createObjectURL(file);
    this.originalPreview.set(this.previewUrl);
    this.selectedFile.set(file);
    this.fileName.set(file.name);
    this.resultImages.set([]);
    this.statusMessage.set('');
  }

  selectStyle(id: string): void {
    if (this.styles.some(style => style.id === id)) {
      this.selectedStyle.set(id as ImageStyle);
      this.resultImages.set([]);
    }
  }

  async generate(): Promise<void> {
    if (this.isProcessing()) return;
    const mode = this.selectedMode();
    if (this.modeNeedsImage() && !this.selectedFile()) {
      this.errorMessage.set('Upload an image for this feature first.'); return;
    }
    if (mode === 'story-scenes') {
      const scenes = this.storyScript().split(/\n+/).map(line => line.trim()).filter(Boolean);
      if (!scenes.length) { this.errorMessage.set('Enter one scene description per line.'); return; }
      if (scenes.length > 4) { this.errorMessage.set('For local performance, generate up to 4 scenes per batch.'); return; }
      await this.generateStoryScenes(scenes);
      return;
    }
    if (!this.prompt().trim() && !this.selectedFile()) {
      this.errorMessage.set('Enter a description or upload an image.'); return;
    }
    await this.generateOne(mode, this.prompt().trim());
  }

  private async generateStoryScenes(scenes: string[]): Promise<void> {
    const task = ++this.taskId;
    this.isProcessing.set(true);
    this.resultImages.set([]);
    this.errorMessage.set('');
    const completed: GeneratedAsset[] = [];
    try {
      for (let index = 0; index < scenes.length; index++) {
        if (task !== this.taskId) return;
        this.statusMessage.set(`Generating scene ${index + 1} of ${scenes.length}. On this Mac, each image may take around a minute or longer.`);
        const asset = await this.requestImage('story-scenes', `${scenes[index]}. Create one polished, family-friendly story scene. Use a clear composition and no text, subtitles, logos or watermarks.`, index + 1);
        completed.push(asset);
        this.resultImages.set([...completed]);
      }
      this.statusMessage.set(`Finished ${completed.length} scene${completed.length === 1 ? '' : 's'}.`);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Story scene generation failed.');
      this.statusMessage.set(completed.length ? `Generated ${completed.length} scene(s) before the error.` : '');
    } finally {
      if (task === this.taskId) this.isProcessing.set(false);
    }
  }

  private async generateOne(mode: StudioMode, prompt: string): Promise<void> {
    const task = ++this.taskId;
    this.isProcessing.set(true);
    this.resultImages.set([]);
    this.errorMessage.set('');
    this.statusMessage.set('Sending request to your local FLUX.2 Klein service…');
    try {
      const asset = await this.requestImage(mode, prompt);
      if (task !== this.taskId) return;
      this.resultImages.set([asset]);
      this.statusMessage.set('Image generated successfully.');
    } catch (error) {
      if (task === this.taskId) this.errorMessage.set(error instanceof Error ? error.message : 'Image generation failed.');
    } finally {
      if (task === this.taskId) this.isProcessing.set(false);
    }
  }

  private async requestImage(mode: StudioMode, prompt: string, sceneNumber?: number): Promise<GeneratedAsset> {
    const form = new FormData();
    const file = this.selectedFile();
    if (file) form.append('image', file, file.name);
    form.append('mode', mode);
    form.append('style', this.selectedStyle());
    form.append('prompt', prompt.slice(0, 1500));
    form.append('aspectRatio', this.aspectRatio());
    if (sceneNumber) form.append('sceneNumber', String(sceneNumber));

    const response = await fetch(`${this.apiBase}/api/image-to-cartoon/generate`, {
      method: 'POST', body: form
    });
    const data = await response.json().catch(() => ({})) as { success?: boolean; message?: string; asset?: GeneratedAsset };
    if (!response.ok || !data.success || !data.asset) {
      throw new Error(data.message || `Generation failed (HTTP ${response.status}).`);
    }
    return { ...data.asset, url: data.asset.url.startsWith('http') ? data.asset.url : `${this.apiBase}${data.asset.url}` };
  }

  download(asset: GeneratedAsset): void {
    const link = document.createElement('a');
    link.href = asset.url;
    link.download = asset.filename;
    link.target = '_blank';
    link.click();
  }

  clearImage(): void {
    this.cancelProcessing();
    this.clearPreviewUrl();
    this.originalPreview.set(null);
    this.selectedFile.set(null);
    this.fileName.set('');
    this.resultImages.set([]);
    this.errorMessage.set('');
    this.statusMessage.set('');
  }

  private cancelProcessing(): void {
    ++this.taskId;
    this.isProcessing.set(false);
  }

  private clearPreviewUrl(): void {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = null;
  }

  ngOnDestroy(): void {
    this.cancelProcessing();
    this.clearPreviewUrl();
  }
}
