import { MIME_TYPE_EXTENSIONS } from './mime';
import * as pathlib from 'path';
import { _ } from './misc';
import * as fs from 'fs';

/**
 * File info interface
 */
export interface FileInfo {
  name: string;
  path: string;
  size: number;
  hash?: string | undefined;
  type: string;
  lastModifiedDate?: Date | undefined;
}

/**
 * File class
 */
export class File {

  /**
   * Filename
   */
  public name: string;

  /**
   * File path
   */
  public path: string;

  /**
   * File size in bytes
   */
  public size: number;

  /**
   * Hash
   */
  public hash: string | undefined;

  /**
   * File type
   */
  public type: string;

  /**
   * Last date modified
   */
  public lastModifiedDate: Date | undefined;

  /**
   * File constructor
   */
  constructor(info: FileInfo) {
    this.name = info.name;
    this.path = info.path;
    this.size = info.size;
    this.hash = info.hash;
    this.type = info.type;
    this.lastModifiedDate = info.lastModifiedDate;
  }

  /**
   * Guess file extension using mime type
   */
  public guessExtension(): string | undefined {
    return MIME_TYPE_EXTENSIONS.get(this.type);
  }

  /**
   * Create file
   */
  public static create(path: string, content: Buffer | string, mimeType: string, hash?: string): Promise<File> {
    return new Promise<File>((resolve, reject) => {

      path = pathlib.resolve(path);
      if (!hash) {
        hash = _.checksum(content, 'sha1');
      }

      if (!pathlib.extname(path) && mimeType && MIME_TYPE_EXTENSIONS.has(mimeType)) {
        path = `${path}.${MIME_TYPE_EXTENSIONS.get(mimeType)}`;
      }

      fs.writeFile(path, content, err => {

        if (err) return reject(err);

        resolve(new File({
          name: pathlib.basename(path),
          path,
          hash,
          type: mimeType,
          size: content.length,
          lastModifiedDate: new Date()
        }));
      });
    });
  }

  /**
   * Append content to file
   */
  public static append(path: string, content: Buffer | string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      fs.appendFile(path, content, err => {

        if (err) return reject(err);
        resolve(true);
      });
    });
  }

  /**
   * Read directory
   */
  public static readDirectory(path: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      fs.readdir(path, (err, files) => {

        if (err) return reject(err);
        resolve(files);
      });
    });
  }

  /**
   * Get file or directory stats
   */
  public static getStats(path: string): Promise<fs.Stats> {
    return new Promise<fs.Stats>((resolve, reject) => {
      fs.stat(path, (err, stats) => {

        if (err) return reject(err);
        resolve(stats);
      });
    });
  }

  /**
   * Check if file exists
   */
  public static async exists(path: string): Promise<boolean> {
    try {
      await this.getStats(path);
    } catch (ex) {
      if (ex.code == 'ENOENT') {
        return false;
      }
      throw ex;
    }
    return true;
  }

  /**
   * Read content from file
   */
  public static read(path: string, options?: { encoding: string; flag?: string; } | { flag?: string; }): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      fs.readFile(path, options || {}, (err, content) => {

        if (err) return reject(err);
        resolve(content.toString());
      });
    });
  }

  /**
   * Create file from base64 string
   */
  public static createFromBase64String(base64String: string, mimeType: string, path: string, name?: string): Promise<File> {
    let fileBuffer = Buffer.from(base64String, 'base64');
    let hash = _.checksum(fileBuffer, 'sha1');
    if (!name) {
      name = hash;
    }
    return File.create(pathlib.join(path, name), fileBuffer, mimeType, hash);
  }
}
