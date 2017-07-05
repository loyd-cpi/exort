import { Service } from './service';
/**
 * Encryptor class
 */
export declare class Encryptor extends Service {
    /**
     * Encrypt using app configuration
     */
    encrypt(str: string): string;
    /**
     * Decrypt using app configuration
     */
    decrypt(encryptedStr: string): string;
    /**
     * Encrypt
     */
    static encrypt(str: string, password: string, algo: string): string;
    /**
     * Decrypt
     */
    static decrypt(encryptedStr: string, password: string, algo: string): string;
}
/**
 * Hash namespace
 */
export declare namespace Hash {
    /**
     * Create a hash
     */
    function make(text: string, saltLength?: number): Promise<string>;
    /**
     * Check if the hashedText is equivalent to plain text
     */
    function check(plainText: string, hashedText: string): Promise<boolean>;
}
