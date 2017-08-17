"use strict";
var loaderUtils = require('loader-utils');
var Loader = (function () {
    function Loader() {
    }
    Loader.pitch = function (remainingRequest) {
        this.cacheable && this.cacheable();
        var requireModuleName = loaderUtils.stringifyRequest(this, '!!' + remainingRequest);
        var className = this.resourcePath.substr(0, this.resourcePath.lastIndexOf('.')).split(/(\\|\/)/g).pop();
        if (!className) {
            throw new Error("No extension name for " + this.resourcePath);
        }
        var query = loaderUtils.getOptions(this) || {};
        if (!query.name) {
            query.name = this.resourcePath.replace(this.options.context.replace(/\/+$/, '') + "/", '');
            query.name = query.name.substr(0, query.name.lastIndexOf('.')) || query.name;
        }
        var chunkNameParam = JSON.stringify(loaderUtils.interpolateName(this, query.name, { context: this.options.context }));
        return "module.exports = function(props) {\n  return require('exort/client').renderBundleComponent('" + className + "', props, function(cb) {\n    require.ensure([], function(require) {\n      cb(require(" + requireModuleName + "));\n    }, " + chunkNameParam + ");\n  });\n};";
    };
    return Loader;
}());
module.exports = Loader;
//# sourceMappingURL=loader.js.map