export interface CustomFont {
  id: string;
  name: string;
  family: string;
  fontData: ArrayBuffer;
  mimeType: 'font/ttf' | 'font/otf' | 'font/woff' | 'font/woff2';
  uploadedAt: number;
  preview?: string;
}

export interface FontUploadResult {
  success: boolean;
  font?: CustomFont;
  error?: string;
}

export class FontUploadService {
  private storageKey = 'caption-magic-custom-fonts';
  private maxFontSize = 10 * 1024 * 1024; // 10MB
  private allowedMimeTypes = ['font/ttf', 'font/otf', 'font/woff', 'font/woff2'];

  // Upload and store custom font
  async uploadFont(file: File): Promise<FontUploadResult> {
    // Validate file size
    if (file.size > this.maxFontSize) {
      return {
        success: false,
        error: `Font size exceeds 10MB limit. Current: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      };
    }

    // Validate MIME type
    const mimeType = file.type as any;
    if (!this.allowedMimeTypes.includes(mimeType)) {
      return {
        success: false,
        error: `Unsupported font format. Allowed: TTF, OTF, WOFF, WOFF2. Got: ${file.type}`,
      };
    }

    try {
      const fontData = await file.arrayBuffer();
      const fontId = `font-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const customFont: CustomFont = {
        id: fontId,
        name: file.name.split('.')[0],
        family: file.name.split('.')[0],
        fontData,
        mimeType,
        uploadedAt: Date.now(),
      };

      // Store in localStorage
      await this.storeFontLocally(customFont);

      return {
        success: true,
        font: customFont,
      };
    } catch (error) {
      return {
        success: false,
        error: `Font upload failed: ${error}`,
      };
    }
  }

  // Store font in localStorage
  private async storeFontLocally(font: CustomFont): Promise<void> {
    const fonts = this.getAllFonts();
    fonts.push(font);

    // Convert ArrayBuffer to base64 for storage
    const base64FontData = this.arrayBufferToBase64(font.fontData);
    const storableFont = {
      ...font,
      fontData: base64FontData,
    };

    try {
      localStorage.setItem(this.storageKey, JSON.stringify([...fonts, storableFont]));
    } catch (error) {
      throw new Error(`Failed to store font in localStorage: ${error}`);
    }
  }

  // Get all stored fonts
  getAllFonts(): CustomFont[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];

      const fonts = JSON.parse(stored);
      return fonts.map((font: any) => ({
        ...font,
        fontData: this.base64ToArrayBuffer(font.fontData),
      }));
    } catch (error) {
      console.error('Failed to retrieve fonts:', error);
      return [];
    }
  }

  // Get font by ID
  getFontById(fontId: string): CustomFont | null {
    const fonts = this.getAllFonts();
    return fonts.find((f) => f.id === fontId) || null;
  }

  // Delete font
  deleteFont(fontId: string): boolean {
    try {
      const fonts = this.getAllFonts().filter((f) => f.id !== fontId);
      localStorage.setItem(this.storageKey, JSON.stringify(fonts));
      return true;
    } catch (error) {
      console.error('Failed to delete font:', error);
      return false;
    }
  }

  // Generate CSS for font face
  generateFontFaceCSS(font: CustomFont): string {
    const base64Data = this.arrayBufferToBase64(font.fontData);
    const dataUrl = `data:${font.mimeType};base64,${base64Data}`;

    return `
      @font-face {
        font-family: '${font.family}';
        src: url('${dataUrl}') format('${this.getMimeTypeFormat(font.mimeType)}');
      }
    `;
  }

  // Apply font to captions
  applyFontToCaption(captionElement: HTMLElement, fontId: string): boolean {
    const font = this.getFontById(fontId);
    if (!font) return false;

    // Inject font face CSS
    const style = document.createElement('style');
    style.textContent = this.generateFontFaceCSS(font);
    document.head.appendChild(style);

    // Apply font family to element
    captionElement.style.fontFamily = font.family;
    return true;
  }

  // Helper: Convert MIME type to CSS format
  private getMimeTypeFormat(mimeType: stri
