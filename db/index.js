"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("../common");
tslib_1.__exportStar(require("./connection"), exports);
tslib_1.__exportStar(require("./model"), exports);
tslib_1.__exportStar(require("./schema"), exports);
tslib_1.__exportStar(require("./service"), exports);
tslib_1.__exportStar(require("typeorm"), exports);
var connection_1 = require("./connection");
exports.getConnection = connection_1.getConnection;
//# sourceMappingURL=index.js.map