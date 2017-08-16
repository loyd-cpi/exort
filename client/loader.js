"use strict";
var loaderUtils = require('loader-utils');
var Loader = (function () {
    function Loader() {
    }
    Loader.pitch = function (remainingRequest) {
        this.cacheable && this.cacheable();
        var chunkNameParam;
        var query = loaderUtils.getOptions(this) || {};
        if (query.name) {
            var options = {
                context: query.context || this.options.context,
                regExp: query.regExp
            };
            chunkNameParam = ", " + JSON.stringify(loaderUtils.interpolateName(this, query.name, options));
        }
        else {
            chunkNameParam = '';
        }
        var requireModuleName = loaderUtils.stringifyRequest(this, '!!' + remainingRequest);
        var className = requireModuleName.replace(new RegExp("[\'\"]+$"), "").split(/(\\|\/)/g).pop();
        className = className.substr(0, className.lastIndexOf('.')) || className;
        return "module.exports = function(props) {\n  return require('exort/client').renderBundleComponent('" + className + "', props, function(cb) {\n    require.ensure([], function(require) {\n      cb(require(" + requireModuleName + "));\n    }" + chunkNameParam + ");\n  });\n};";
    };
    return Loader;
}());
module.exports = Loader;
//# sourceMappingURL=loader.js.map