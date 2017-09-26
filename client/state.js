"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Immutable = require("immutable");
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
//# sourceMappingURL=state.js.map