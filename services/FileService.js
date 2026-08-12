const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

class FileService {
  static UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
  static MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB
  static ALLOWED_TYPES = (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf,txt,doc,docx').split(',');

  static async ensureUploadDir() {
    try {
      await fs.access(this.UPLOAD_DIR);
    } catch {
      await fs.mkdir(this.UPLOAD_DIR, { recursive: true });
    }
  }

  static validateFile(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    const ext = path.extname(file.originalname).substring(1).toLowerCase();
    if (!this.ALLOWED_TYPES.includes(ext)) {
      throw new Error(`File type .${ext} is not allowed. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`);
    }

    return ext;
  }

  static async saveFile(file, roomId) {
    await this.ensureUploadDir();

    const ext = this.validateFile(file);
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const filepath = path.join(this.UPLOAD_DIR, filename);

    // If it's an image, optimize it
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      await sharp(file.buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .toFile(filepath);
    } else {
      await fs.writeFile(filepath, file.buffer);
    }

    return {
      filename,
      url: `/uploads/${filename}`,
      fileType: ext,
      size: file.size
    };
  }

  static async deleteFile(filename) {
    const filepath = path.join(this.UPLOAD_DIR, filename);
    try {
      await fs.unlink(filepath);
      return true;
    } catch (error) {
      console.error(`Error deleting file ${filename}:`, error);
      return false;
    }
  }
}

module.exports = FileService;
