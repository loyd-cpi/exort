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
 * BundleComponent properties interface
 */
export interface BundleComponentProps {
  loadingAnimation?: React.ComponentType;
}

/**
 * BundleComponent class
 */
export abstract class BundleComponent<Props extends BundleComponentProps> extends Component<Props, BundleComponentState> {

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
