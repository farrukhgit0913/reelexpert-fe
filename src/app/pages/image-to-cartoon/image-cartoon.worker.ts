
type CartoonStyle = 'anime' | 'ghibli' | '3d' | 'comic';

interface ProcessRequest {
  width: number;
  height: number;
  pixels: ArrayBuffer;
  style: CartoonStyle;
}

interface ProcessResponse {
  pixels?: ArrayBuffer;
  error?: string;
}

self.onmessage = (event: MessageEvent<ProcessRequest>): void => {
  try {
    const { width, height, pixels, style } = event.data;

    if (
      !Number.isInteger(width) ||
      !Number.isInteger(height) ||
      width < 1 ||
      height < 1 ||
      width * height > 1_000_000 ||
      pixels.byteLength !== width * height * 4
    ) {
      throw new Error('Invalid image dimensions or pixel data.');
    }

    const settings = {
      anime: { levels: 6, edge: 0.24, threshold: 42, saturation: 1.12 },
      ghibli: { levels: 9, edge: 0.12, threshold: 55, saturation: 1.08 },
      '3d': { levels: 8, edge: 0.08, threshold: 48, saturation: 1.18 },
      comic: { levels: 4, edge: 0.62, threshold: 30, saturation: 1.25 }
    }[style];

    if (!settings) {
      throw new Error('Unsupported cartoon style.');
    }

    const source = new Uint8ClampedArray(pixels);
    const output = new Uint8ClampedArray(source.length);
    const luminance = new Float32Array(width * height);

    // Calculate brightness for edge detection.
    for (let i = 0, p = 0; i < source.length; i += 4, p++) {
      luminance[p] =
        0.299 * source[i] +
        0.587 * source[i + 1] +
        0.114 * source[i + 2];
    }

    const quantize = (value: number, levels: number): number =>
      Math.round(
        (Math.min(255, Math.max(0, value)) / 255) * (levels - 1)
      ) * (255 / (levels - 1));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const p = y * width + x;
        const i = p * 4;

        let edgeStrength = 0;

        if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
          const a = luminance[(y - 1) * width + x - 1];
          const b = luminance[(y - 1) * width + x];
          const c = luminance[(y - 1) * width + x + 1];
          const d = luminance[y * width + x - 1];
          const f = luminance[y * width + x + 1];
          const g = luminance[(y + 1) * width + x - 1];
          const h = luminance[(y + 1) * width + x];
          const j = luminance[(y + 1) * width + x + 1];

          const gx = -a + c - 2 * d + 2 * f - g + j;
          const gy = -a - 2 * b - c + g + 2 * h + j;

          edgeStrength = Math.sqrt(gx * gx + gy * gy) / 4;
        }

        const edge =
          edgeStrength > settings.threshold ? settings.edge : 0;

        const r = source[i];
        const g = source[i + 1];
        const b = source[i + 2];
        const average = (r + g + b) / 3;

        const stylize = (channel: number): number => {
          const saturated =
            average + (channel - average) * settings.saturation;

          return quantize(
            saturated * (1 - edge),
            settings.levels
          );
        };

        output[i] = stylize(r);
        output[i + 1] = stylize(g);
        output[i + 2] = stylize(b);
        output[i + 3] = source[i + 3];
      }
    }

    const response: ProcessResponse = {
      pixels: output.buffer
    };

    (self as unknown as any).postMessage(
  response,
  [output.buffer]
);
  } catch (error) {
    const response: ProcessResponse = {
      error:
        error instanceof Error
          ? error.message
          : 'Image processing failed.'
    };

    (self as unknown as any).postMessage(response);
  }
};

export {};
