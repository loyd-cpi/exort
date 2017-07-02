"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("./service");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
/**
 * Encryptor class
 */
let Encryptor = Encryptor_1 = class Encryptor extends service_1.Service {
    /**
     * Encrypt using app configuration
     * @param  {string} str
     * @return {string}
     */
    encrypt(str) {
        let conf = this.context.app.config.get('app', {});
        return Encryptor_1.encrypt(str, conf.key, conf.cipher);
    }
    /**
     * Decrypt using app configuration
     * @param  {string} encryptedStr
     * @return {string}
     */
    decrypt(encryptedStr) {
        let conf = this.context.app.config.get('app', {});
        return Encryptor_1.decrypt(encryptedStr, conf.key, conf.cipher);
    }
    /**
     * Encrypt
     * @param  {string} str
     * @param  {string} password
     * @param  {string} algo
     * @return {string}
     */
    static encrypt(str, password, algo) {
        let cipher = crypto.createCipher(algo, password);
        let crypted = cipher.update(str, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    }
    /**
     * Decrypt
     * @param  {string} encryptedStr
     * @param  {string} password
     * @param  {string} algo
     * @return {string}
     */
    static decrypt(encryptedStr, password, algo) {
        let decipher = crypto.createDecipher(algo, password);
        let dec = decipher.update(encryptedStr, 'hex', 'utf8');
        dec += decipher.final('utf8');
        return dec;
    }
};
Encryptor = Encryptor_1 = __decorate([
    service_1.Injectable()
], Encryptor);
exports.Encryptor = Encryptor;
/**
 * Hash namespace
 */
var Hash;
(function (Hash) {
    /**
     * Create a hash
     * @param  {string} text
     * @param  {number = 10} saltLength
     * @return {Promise<string>}
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
     * @param  {string} plainText
     * @param  {string} hashedText
     * @return {Promise<boolean>}
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
var Encryptor_1;
//# sourceMappingURL=crypto.js.map