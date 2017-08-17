"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var component_1 = require("./component");
var React = require("react");
function renderBundleComponent(name, props, loadBundle) {
    var Bundle = (function (_super) {
        tslib_1.__extends(Bundle, _super);
        function Bundle() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Bundle.prototype.load = function () {
            var _this = this;
            loadBundle(function (bundle) {
                if (bundle && typeof bundle == 'object') {
                    if (typeof bundle[name] == 'function' && bundle[name].prototype instanceof React.Component) {
                        _this.setState({ component: bundle[name] });
                    }
                    else {
                        console.error("There's no exported " + name + " component");
                    }
                }
            });
        };
        return Bundle;
    }(BundleComponent));
    return React.createElement(Bundle, props);
}
exports.renderBundleComponent = renderBundleComponent;
var BundleComponent = (function (_super) {
    tslib_1.__extends(BundleComponent, _super);
    function BundleComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BundleComponent.prototype.componentWillMount = function () {
        this.load();
    };
    BundleComponent.prototype.render = function () {
        if (this.state.component) {
            return React.createElement(this.state.component, this.props);
        }
        if (this.props.loadingAnimation) {
            return React.createElement(this.props.loadingAnimation);
        }
        return null;
    };
    return BundleComponent;
}(component_1.Component));
exports.BundleComponent = BundleComponent;
//# sourceMappingURL=bundle.js.map