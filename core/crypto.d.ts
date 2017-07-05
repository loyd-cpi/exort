import { Service } from './service';
/**
 * Encryptor class
 */
export declare class Encryptor extends Service {
    /**
     * Encrypt using app configuration
     * @param  {string} str
     * @return {string}
     */
    encrypt(str: string): string;
    /**
     * Decrypt using app configuration
     * @param  {string} encryptedStr
     * @return {string}
     */
    decrypt(encryptedStr: string): string;
    /**
     * Encrypt
     * @param  {string} str
     * @param  {string} password
     * @param  {string} algo
     * @return {string}
     */
    static encrypt(str: string, password: string, algo: string): string;
    /**
     * Decrypt
     * @param  {string} encryptedStr
     * @param  {string} password
     * @param  {string} algo
     * @return {string}
     */
    static decrypt(encryptedStr: string, password: string, algo: string): string;
}
/**
 * Hash namespace
 */
export declare namespace Hash {
    /**
     * Create a hash
     * @param  {string} text
     * @param  {number = 10} saltLength
     * @return {Promise<string>}
     */
    function make(text: string, saltLength?: number): Promise<string>;
    /**
     * Check if the hashedText is equivalent to plain text
     * @param  {string} plainText
     * @param  {string} hashedText
     * @return {Promise<boolean>}
     */
    function check(plainText: string, hashedText: string): Promise<boolean>;
}
