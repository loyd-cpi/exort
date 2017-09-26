"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var types = require("prop-types");
var state_1 = require("./state");
var React = require("react");
var Component = (function (_super) {
    tslib_1.__extends(Component, _super);
    function Component(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.state = {};
        return _this;
    }
    Component.prototype.getAppState = function () {
        return this.context.$appState;
    };
    Component.contextTypes = {
        $appState: types.instanceOf(state_1.AppState)
    };
    return Component;
}(React.Component));
exports.Component = Component;
//# sourceMappingURL=component.js.map