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
    Component.prototype.linkState = function (stateKey) {
        var _this = this;
        return new StateLink(this.state[stateKey], function (event) {
            var val = event.target.value;
            if (_this.state[stateKey] !== val) {
                _this.setState((_a = {}, _a[stateKey] = val, _a));
            }
            var _a;
        });
    };
    Component.contextTypes = {
        $appState: types.instanceOf(state_1.AppState)
    };
    return Component;
}(React.Component));
exports.Component = Component;
var StateLink = (function () {
    function StateLink(value, onChange) {
        this.value = value;
        this.onChange = onChange;
    }
    return StateLink;
}());
exports.StateLink = StateLink;
function BindThis() {
    return function (target, propertyKey, descriptor) {
        var boundFn;
        var origFnValue = descriptor.value;
        if (typeof origFnValue != 'function') {
            throw new Error('Use only @BindThis to a class method');
        }
        delete descriptor.value;
        delete descriptor.writable;
        descriptor.configurable = true;
        descriptor.get = function () {
            if (!boundFn) {
                boundFn = origFnValue.bind(this);
            }
            return boundFn;
        };
        descriptor.set = function (val) {
            if (typeof val != 'function') {
                throw new Error("Can't assign " + typeof val + " to " + propertyKey);
            }
            boundFn = val.bind(this);
        };
    };
}
exports.BindThis = BindThis;
//# sourceMappingURL=component.js.map