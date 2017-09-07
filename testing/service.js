"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("../core/service");
/**
 * Abstract TestService class
 */
class TestService extends service_1.Service {
    /**
     * TestService constructor
     */
    constructor(context, httpClient) {
        super(context);
        this.httpClient = httpClient;
    }
}
exports.TestService = TestService;
//# sourceMappingURL=service.js.map