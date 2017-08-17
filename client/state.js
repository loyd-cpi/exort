"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var component_1 = require("./component");
var AppState = (function () {
    function AppState() {
    }
    return AppState;
}());
exports.AppState = AppState;
function AppStateListener() {
    return function (target) {
        var ListenerComponent = (function (_super) {
            tslib_1.__extends(ListenerComponent, _super);
            function ListenerComponent() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return ListenerComponent;
        }(component_1.Component));
        return ListenerComponent;
    };
}
exports.AppStateListener = AppStateListener;
//# sourceMappingURL=state.js.map