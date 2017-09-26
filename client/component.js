"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var state_1 = require("./state");
var util_1 = require("./util");
var types = require("prop-types");
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
var Application = (function (_super) {
    tslib_1.__extends(Application, _super);
    function Application(props, context) {
        return _super.call(this, props, context) || this;
    }
    Application.prototype.componentWillMount = function () {
        var _this = this;
        if (typeof this.props.state == 'function') {
            this.props.state().then(function (state) {
                _this.appState = new state_1.AppState(state || {});
                _this.forceUpdate();
            });
        }
        else if (typeof this.props.state == 'object') {
            this.appState = new state_1.AppState(this.props.state || {});
        }
    };
    Application.prototype.getChildContext = function () {
        return { $appState: this.appState };
    };
    Application.prototype.render = function () {
        if (!(this.appState instanceof state_1.AppState)) {
            if (typeof this.props.preload == 'function') {
                return this.props.preload();
            }
            return null;
        }
        return React.Children.only(this.props.children);
    };
    Application.childContextTypes = {
        $appState: types.instanceOf(state_1.AppState)
    };
    return Application;
}(React.Component));
exports.Application = Application;
function AppStateListener(appStateMapper) {
    return function (target) {
        var Container = (function (_super) {
            tslib_1.__extends(Container, _super);
            function Container(props, context) {
                var _this = _super.call(this, props, context) || this;
                _this.propsFromParentChanged = false;
                _this.stateFromMapperChanged = false;
                return _this;
            }
            Container.prototype.handleStateChange = function () {
                var state = appStateMapper(this.getAppState().getState());
                if (state && (!this.state.store || !this.state.store.equals(state))) {
                    this.stateFromMapperChanged = true;
                    this.setState({ store: state });
                }
            };
            Container.prototype.shouldComponentUpdate = function () {
                return this.stateFromMapperChanged || this.propsFromParentChanged;
            };
            Container.prototype.unsubscribeToAppState = function () {
                if (this.subscription) {
                    this.subscription.unsubscribe();
                    delete this.subscription;
                }
            };
            Container.prototype.componentWillUnmount = function () {
                this.unsubscribeToAppState();
            };
            Container.prototype.componentWillMount = function () {
                this.subscribeToAppState();
                this.handleStateChange();
            };
            Container.prototype.componentWillReceiveProps = function (nextProps) {
                if (util_1.isShallowEqual(nextProps, this.props)) {
                    this.propsFromParentChanged = false;
                }
                else {
                    this.propsFromParentChanged = true;
                }
            };
            Container.prototype.subscribeToAppState = function () {
                this.unsubscribeToAppState();
                this.subscription = this.getAppState().subscribe(this.handleStateChange.bind(this));
            };
            Container.prototype.resetFlags = function () {
                this.propsFromParentChanged = false;
                this.stateFromMapperChanged = false;
            };
            Container.prototype.render = function () {
                var props = {};
                if (this.state.store && this.state.store.size) {
                    props = this.state.store.toJS();
                }
                for (var key in this.props) {
                    props[key] = this.props[key];
                }
                this.resetFlags();
                return React.createElement(target, props);
            };
            return Container;
        }(Component));
        return Container;
    };
}
exports.AppStateListener = AppStateListener;
//# sourceMappingURL=component.js.map