import { Component } from './component';
import * as React from 'react';

/**
 * Bundle load function
 */
export interface BundleLoadFunction {
  (cb: Function): void;
}

/**
 * BundleComponentClass interface
 */
export interface BundleComponentClass {
  new(props: any, context: any): BundleComponent;
}

/**
 * BundleComponent state interface
 */
export interface BundleComponentState {
  component?: React.ComponentClass;
}

/**
 * Render bundle component
 */
export function createBundleComponent(name: string, load: BundleLoadFunction): BundleComponentClass {

  /**
   * Dynamically created bundle class
   */
  class Bundle extends BundleComponent {

    /**
     * Load bundle
     */
    public load() {
      load((bundle: any) => {
        if (bundle && typeof bundle == 'object') {
          if (typeof bundle[name] == 'function' && bundle[name].prototype instanceof React.Component) {
            this.setState({ component: bundle[name] });
          } else {
            console.error(`There's no exported ${name} component`);
          }
        }
      });
    }
  }

  return Bundle;
}

/**
 * BundleComponent class
 */
export abstract class BundleComponent extends Component<any, BundleComponentState> {

  /**
   * Abstract load method
   */
  public abstract load(): void;

  /**
   * ComponentWillMount event
   */
  public componentWillMount() {
    this.load();
  }

  /**
   * Render loaded or default html
   */
  public render() {
    if (this.state.component) {
      return React.createElement(this.state.component, this.props);
    }

    if (this.props.loadingAnimation) {
      return React.createElement(this.props.loadingAnimation as React.StatelessComponent);
    }

    return null;
  }
}
