"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var component_1 = require("./component");
var React = require("react");
var Form;
(function (Form) {
    var TextField = (function (_super) {
        tslib_1.__extends(TextField, _super);
        function TextField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TextField.prototype.onChange = function (event) {
            if (this.props.valueLink instanceof component_1.StateLink) {
                this.props.valueLink.onChange(event);
            }
            if (typeof this.props.onChange == 'function') {
                this.props.onChange(event);
            }
        };
        TextField.prototype.getValue = function () {
            var val;
            if (this.props.valueLink instanceof component_1.StateLink) {
                val = this.props.valueLink.value;
            }
            return val || '';
        };
        TextField.prototype.getComputedProps = function () {
            var props = {};
            for (var i in this.props) {
                props[i] = this.props[i];
            }
            props.value = this.getValue();
            props.onChange = this.onChange;
            delete props.valueLink;
            return props;
        };
        tslib_1.__decorate([
            component_1.BindThis(),
            tslib_1.__metadata("design:type", Function),
            tslib_1.__metadata("design:paramtypes", [Object]),
            tslib_1.__metadata("design:returntype", void 0)
        ], TextField.prototype, "onChange", null);
        return TextField;
    }(component_1.Component));
    Form.TextField = TextField;
    var Input = (function (_super) {
        tslib_1.__extends(Input, _super);
        function Input() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Input.prototype.render = function () {
            return React.createElement('input', this.getComputedProps());
        };
        return Input;
    }(TextField));
    Form.Input = Input;
    var TextArea = (function (_super) {
        tslib_1.__extends(TextArea, _super);
        function TextArea() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TextArea.prototype.render = function () {
            return React.createElement('textarea', this.getComputedProps());
        };
        return TextArea;
    }(TextField));
    Form.TextArea = TextArea;
})(Form = exports.Form || (exports.Form = {}));
//# sourceMappingURL=form.js.map