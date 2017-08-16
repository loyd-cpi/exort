import { Component } from './component';
import * as React from 'react';

/**
 * Render bundle component
 */
export function renderBundleComponent<Props>(name: string, props: Props, loadBundle: Function): React.ReactElement<Props> {

  /**
   * Dynamic bundle class creation
   */
  class Bundle extends BundleComponent<Props> {

    /**
     * Bundle constructor
     */
    constructor(props: Props, context?: any) {
      super(props, context);
      this.state = {};
    }

    /**
     * Load bundle
     */
    public load() {
      loadBundle((bundle: any) => {

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

  return React.createElement(Bundle, props);
}

/**
 * BuildComponent constructor interface
 */
export interface BuildComponentClass<Props> {
  new(props?: Props, context?: any): BuildComponentClass<Props>;
}

/**
 * BundleComponent state interface
 */
export interface BundleComponentState {
  component?: React.ComponentClass;
}

/**
 * BundleComponent class
 */
export abstract class BundleComponent<Props> extends Component<Props, BundleComponentState> {

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
    if (!this.state.component) return null;
    return React.createElement(this.state.component, this.props);
  }
}
