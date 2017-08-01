"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("../core/service");
const supertest = require("supertest");
/**
 * Abstract TestService class
 */
class TestService extends service_1.Service {
    /**
     * Create and get supertest instance
     */
    createHttpTest() {
        if (!this.supertestInstance) {
            this.supertestInstance = supertest(this.app.server);
        }
        return this.supertestInstance;
    }
}
exports.TestService = TestService;
//# sourceMappingURL=service.js.map