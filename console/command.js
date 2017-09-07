"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Abstract Command class
 */
class Command {
    /**
     * Command constructor
     */
    constructor(app, input) {
        this.app = app;
        this.input = input;
        this.context = app.context;
    }
    /**
     * Finish the command and generate result
     */
    preventExit() {
        return false;
    }
}
exports.Command = Command;
//# sourceMappingURL=command.js.map