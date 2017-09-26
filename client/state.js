"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var component_1 = require("./component");
var util_1 = require("./util");
var Immutable = require("immutable");
var types = require("prop-types");
var React = require("react");
var AppState = (function () {
    function AppState(state) {
        this.subscriptions = [];
        this.state = Immutable.fromJS(state);
    }
    AppState.prototype.getState = function () {
        return this.state;
    };
    AppState.prototype.isEmpty = function () {
        return !this.state.size ? true : false;
    };
    AppState.prototype.dispatch = function (newStateDispatcher) {
        var newState = newStateDispatcher(this.state);
        if (!Immutable.is(this.state, newState)) {
            this.state = newState;
            for (var _i = 0, _a = this.subscriptions; _i < _a.length; _i++) {
                var subscription = _a[_i];
                subscription.notify();
            }
        }
    };
    AppState.prototype.subscribe = function (listener) {
        var _this = this;
        var subscription = new Subscription(listener, function (subscription) {
            var pos = _this.subscriptions.indexOf(subscription);
            if (pos != -1) {
                _this.subscriptions.splice(pos, 1);
            }
        });
        this.subscriptions.push(subscription);
        return subscription;
    };
    return AppState;
}());
exports.AppState = AppState;
var Subscription = (function () {
    function Subscription(listener, unsubscribeInstruction) {
        this.listener = listener;
        this.unsubscribeInstruction = unsubscribeInstruction;
        this.unsubscribed = false;
    }
    Subscription.prototype.isUnsubscribed = function () {
        return this.unsubscribed;
    };
    Subscription.prototype.notify = function () {
        this.listener();
    };
    Subscription.prototype.unsubscribe = function () {
        if (!this.unsubscribed) {
            this.unsubscribeInstruction(this);
            this.unsubscribed = true;
        }
    };
    return Subscription;
}());
exports.Subscription = Subscription;
var AppStateProvider = (function (_super) {
    tslib_1.__extends(AppStateProvider, _super);
    function AppStateProvider(props, context) {
        return _super.call(this, props, context) || this;
    }
    AppStateProvider.prototype.componentWillMount = function () {
        var _this = this;
        if (typeof this.props.state == 'function') {
            this.props.state().then(function (state) {
                _this.appState = new AppState(state || {});
                _this.forceUpdate();
            });
        }
        else if (typeof this.props.state == 'object') {
            this.appState = new AppState(this.props.state || {});
        }
    };
    AppStateProvider.prototype.getChildContext = function () {
        return { $appState: this.appState };
    };
    AppStateProvider.prototype.render = function () {
        if (!(this.appState instanceof AppState)) {
            if (typeof this.props.preload == 'function') {
                return this.props.preload();
            }
            return null;
        }
        return React.Children.only(this.props.children);
    };
    AppStateProvider.childContextTypes = {
        $appState: types.instanceOf(AppState)
    };
    return AppStateProvider;
}(React.Component));
exports.AppStateProvider = AppStateProvider;
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
        }(component_1.Component));
        return Container;
    };
}
exports.AppStateListener = AppStateListener;
//# sourceMappingURL=state.js.map