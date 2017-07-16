"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("./service");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
/**
 * Encryptor class
 */
class Encryptor extends service_1.Service {
    /**
     * Encrypt using app configuration
     */
    encrypt(str) {
        let conf = this.context.app.config.get('app', {});
        return Encryptor.encrypt(str, conf.key, conf.cipher);
    }
    /**
     * Decrypt using app configuration
     */
    decrypt(encryptedStr) {
        let conf = this.context.app.config.get('app', {});
        return Encryptor.decrypt(encryptedStr, conf.key, conf.cipher);
    }
    /**
     * Encrypt
     */
    static encrypt(str, password, algo) {
        let cipher = crypto.createCipher(algo, password);
        let crypted = cipher.update(str, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    }
    /**
     * Decrypt
     */
    static decrypt(encryptedStr, password, algo) {
        let decipher = crypto.createDecipher(algo, password);
        let dec = decipher.update(encryptedStr, 'hex', 'utf8');
        dec += decipher.final('utf8');
        return dec;
    }
}
exports.Encryptor = Encryptor;
/**
 * Hash namespace
 */
var Hash;
(function (Hash) {
    /**
     * Create a hash
     */
    function make(text, saltLength = 10) {
        return new Promise((resolve, reject) => {
            bcrypt.genSalt(saltLength, (err, salt) => {
                if (err)
                    return reject(err);
                bcrypt.hash(text, salt, (error, hash) => {
                    if (error)
                        return reject(error);
                    return resolve(hash);
                });
            });
        });
    }
    Hash.make = make;
    /**
     * Check if the hashedText is equivalent to plain text
     */
    function check(plainText, hashedText) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(plainText, hashedText, (err, res) => {
                if (err)
                    return reject(err);
                return resolve(res);
            });
        });
    }
    Hash.check = check;
})(Hash = exports.Hash || (exports.Hash = {}));
//# sourceMappingURL=crypto.js.map