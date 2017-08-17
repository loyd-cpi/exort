import { Component } from './component';
import * as React from 'react';

/**
 * Bundle load function
 */
export interface BundleLoadFunction {
  (cb: Function): void;
}

/**
 * BundleComponent state interface
 */
export interface BundleComponentState {
  component?: React.ComponentClass;
}

/**
 * BundleComponent properties interface
 */
export interface BundleComponentProps {
  loadingAnimation?: React.ComponentType;
  load: BundleLoadFunction;
}

/**
 * Render bundle component
 */
export function renderBundleComponent(name: string, props: any, load: BundleLoadFunction) {

  /**
   * Dynamic bundle class creation
   */
  class Bundle extends BundleComponent {

    /**
     * Load bundle
     */
    public load() {
      this.props.load((bundle: any) => {

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

  return React.createElement(Bundle, { ...props, load }) as React.ComponentElement<BundleComponentProps, BundleComponent>;
}

/**
 * BundleComponent class
 */
export abstract class BundleComponent extends Component<BundleComponentProps, BundleComponentState> {

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
