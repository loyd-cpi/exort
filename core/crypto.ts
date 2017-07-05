import { Service, Injectable } from './service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

/**
 * Encryptor class
 */
@Injectable()
export class Encryptor extends Service {

  /**
   * Encrypt using app configuration
   */
  public encrypt(str: string): string {
    let conf = this.context.app.config.get('app', {});
    return Encryptor.encrypt(str, conf.key, conf.cipher);
  }

  /**
   * Decrypt using app configuration
   */
  public decrypt(encryptedStr: string): string {
    let conf = this.context.app.config.get('app', {});
    return Encryptor.decrypt(encryptedStr, conf.key, conf.cipher);
  }

  /**
   * Encrypt
   */
  public static encrypt(str: string, password: string, algo: string): string {
    let cipher = crypto.createCipher(algo, password);
    let crypted = cipher.update(str, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  }

  /**
   * Decrypt
   */
  public static decrypt(encryptedStr: string, password: string, algo: string): string {
    let decipher = crypto.createDecipher(algo, password);
    let dec = decipher.update(encryptedStr, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  }
}

/**
 * Hash namespace
 */
export namespace Hash {

  /**
   * Create a hash
   */
  export function make(text: string, saltLength: number = 10): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      bcrypt.genSalt(saltLength, (err, salt) => {

        if (err) return reject(err);
        bcrypt.hash(text, salt, (error, hash) => {

          if (error) return reject(error);
          return resolve(hash);
        });
      });
    });
  }

  /**
   * Check if the hashedText is equivalent to plain text
   */
  export function check(plainText: string, hashedText: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      bcrypt.compare(plainText, hashedText, (err, res) => {

        if (err) return reject(err);
        return resolve(res);
      });
    });
  }
}
