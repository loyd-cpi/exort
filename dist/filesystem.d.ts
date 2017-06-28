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
     * @type {string}
     */
    name: string;
    /**
     * File path
     * @type {string}
     */
    path: string;
    /**
     * File size in bytes
     * @type {number}
     */
    size: number;
    /**
     * Hash
     * @type {string}
     */
    hash: string | undefined;
    /**
     * File type
     * @type {string}
     */
    type: string;
    /**
     * Last date modified
     * @type {Date}
     */
    lastModifiedDate: Date | undefined;
    /**
     * File constructor
     * @param {FileInfo} info
     */
    constructor(info: FileInfo);
    /**
     * Guess file extension using mime type
     * @return {string}
     */
    guessExtension(): string | undefined;
    /**
     * Create file
     * @param  {string} path
     * @param  {Buffer | string} content
     * @param  {string} mimeType
     * @param  {string} hash
     * @return {Promise<File>}
     */
    static create(path: string, content: Buffer | string, mimeType: string, hash?: string): Promise<File>;
    /**
     * Append content to file
     * @param  {string} path
     * @param  {Buffer | string} content
     * @return {Promise<boolean>}
     */
    static append(path: string, content: Buffer | string): Promise<boolean>;
    /**
     * Read directory
     * @param  {string} path
     * @return {Promise<string[]>}
     */
    static readDirectory(path: string): Promise<string[]>;
    /**
     * Get file or directory stats
     * @param  {string} path
     * @return {Promise<fs.Stats>}
     */
    static getStats(path: string): Promise<fs.Stats>;
    /**
     * Check if file exists
     * @param  {string} path
     * @return {Promise<boolean>}
     */
    static exists(path: string): Promise<boolean>;
    /**
     * Read content from file
     * @param  {string} path
     * @param  {{ encoding: string; flag?: string; } | { flag?: string; } | string} options
     * @return {Promise<string>}
     */
    static read(path: string, options?: {
        encoding: string;
        flag?: string;
    } | {
        flag?: string;
    }): Promise<string>;
    /**
     * Create file from base64 string
     * @param  {string} base64String
     * @param  {string} mimeType
     * @param  {string} path
     * @param  {string} name
     * @return {Promise<File>}
     */
    static createFromBase64String(base64String: string, mimeType: string, path: string, name?: string): Promise<File>;
}
