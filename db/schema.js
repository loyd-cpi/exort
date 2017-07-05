"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../core/command");
const typeorm_1 = require("typeorm");
/**
 * Sync schema of the connection
 */
function syncSchema(connectionName) {
    return __awaiter(this, void 0, void 0, function* () {
        yield typeorm_1.getConnectionManager().get(connectionName).syncSchema();
    });
}
exports.syncSchema = syncSchema;
/**
 * Provide schema commands
 */
function provideSchemaCommands() {
    return (app) => __awaiter(this, void 0, void 0, function* () {
        command_1.Console.addCommand({
            command: 'sync:schema',
            desc: 'Sync models and database schema',
            params: {
                'connection': {
                    required: false
                }
            },
            handler(argv) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield syncSchema(argv.connection);
                });
            }
        });
    });
}
exports.provideSchemaCommands = provideSchemaCommands;
//# sourceMappingURL=schema.js.map