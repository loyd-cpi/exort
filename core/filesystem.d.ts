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
export declare class File {
    /**
     * Filename
     */
    name: string;
    /**
     * File path
     */
    path: string;
    /**
     * File size in bytes
     */
    size: number;
    /**
     * Hash
     */
    hash: string | undefined;
    /**
     * File type
     */
    type: string;
    /**
     * Last date modified
     */
    lastModifiedDate: Date | undefined;
    /**
     * File constructor
     */
    constructor(info: FileInfo);
    /**
     * Guess file extension using mime type
     */
    guessExtension(): string | undefined;
    /**
     * Create file
     */
    static create(path: string, content: Buffer | string, mimeType: string, hash?: string): Promise<File>;
    /**
     * Append content to file
     */
    static append(path: string, content: Buffer | string): Promise<boolean>;
    /**
     * Read directory
     */
    static readDirectory(path: string): Promise<string[]>;
    /**
     * Get file or directory stats
     */
    static getStats(path: string): Promise<fs.Stats>;
    /**
     * Check if file exists
     */
    static exists(path: string): Promise<boolean>;
    /**
     * Read content from file
     */
    static read(path: string, options?: {
        encoding: string;
        flag?: string;
    } | {
        flag?: string;
    }): Promise<string>;
    /**
     * Create file from base64 string
     */
    static createFromBase64String(base64String: string, mimeType: string, path: string, name?: string): Promise<File>;
}
