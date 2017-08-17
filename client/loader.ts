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

    const requireModuleName = loaderUtils.stringifyRequest(this, '!!' + remainingRequest);
    const className = this.resourcePath.substr(0, this.resourcePath.lastIndexOf('.')).split(/(\\|\/)/g).pop();
    if (!className) {
      throw new Error(`No extension name for ${this.resourcePath}`);
    }

    let name = this.resourcePath.replace(`${this.options.context.replace(/\/+$/, '')}/`, '');
    name = name.substr(0, name.lastIndexOf('.')) || name;

    const chunkNameParam = JSON.stringify(loaderUtils.interpolateName(this, name, { context: this.options.context }));

    return `module.exports = function(props) {
  return require('exort/client').renderBundleComponent('${className}', props, function(cb) {
    require.ensure([], function(require) {
      cb(require(${requireModuleName}));
    }, ${chunkNameParam});
  });
};`;
  }
}

module.exports = Loader;
