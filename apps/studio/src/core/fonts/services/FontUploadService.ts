export interface CustomFont {
  id: string;
  name: string;
  family: string;
  mimeType: string;
  uploadedAt: number;
}

export class FontUploadService {
  private storageKey = 'caption-magic-fonts';

  async uploadFont(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'File too large' };
    }

    try {
      const nameNoExt = file.name.split('.')[0] || 'font';
      const fontId = `font-${Date.now()}`;
      const customFont: CustomFont = {
        id: fontId,
        name: nameNoExt,
        family: nameNoExt,
        mimeType: file.type || 'font/ttf',
        uploadedAt: Date.now(),
      };

      const fonts = this.getAllFonts();
      fonts.push(customFont);
      localStorage.setItem(this.storageKey, JSON.stringify(fonts));

      return { success: true, font: customFont };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  getAllFonts(): CustomFont[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  deleteFont(fontId: string): boolean {
    const fonts = this.getAllFonts().filter((f) => f.id !== fontId);
    localStorage.setItem(this.storageKey, JSON.stringify(fonts));
    return true;
  }
}
