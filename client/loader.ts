const loaderUtils = require('loader-utils');

/**
 * Webpack Loader
 */
class Loader {

  /**
   * Pitch hook
   */
  public static pitch(this: any, remainingRequest: any) {
    this.cacheable && this.cacheable();

    let chunkNameParam: string;
    const query = loaderUtils.getOptions(this) || {};
    if (query.name) {

      const options = {
        context: query.context || this.options.context,
        regExp: query.regExp
      };

      chunkNameParam = `, ${JSON.stringify(loaderUtils.interpolateName(this, query.name, options))}`;
    } else {
      chunkNameParam = '';
    }

    const requireModuleName = loaderUtils.stringifyRequest(this, '!!' + remainingRequest);
    let className = requireModuleName.replace(new RegExp("[\'\"]+$"), "").split(/(\\|\/)/g).pop();
    className = className.substr(0, className.lastIndexOf('.')) || className;

    return `module.exports = function(props) {
  return require('exort/client').renderBundleComponent('${className}', props, function(cb) {
    require.ensure([], function(require) {
      cb(require(${requireModuleName}));
    }${chunkNameParam});
  });
};`;
  }
}

module.exports = Loader;
