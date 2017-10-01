import * as types from 'prop-types';
import { AppState } from './state';
import * as React from 'react';

/**
 * ComponentClass interface
 */
export interface ComponentClass<Props = {}, State = {}> {
  new(props: Props, context?: any): Component<Props, State>;
}

/**
 * Abstract Component class
 */
export abstract class Component<Props = {}, State = {}> extends React.Component<Props, State> {

  /**
   * Component context types
   */
  public static contextTypes = {
    $appState: types.instanceOf(AppState)
  };

  /**
   * Abstract component constructor
   */
  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {} as any;
  }

  /**
   * Get AppState instance
   */
  protected getAppState(): AppState {
    return this.context.$appState;
  }
}

/**
 * BindThis decorator
 * Automatically bind this to the class method
 */
export function BindThis() {
  return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {

    let boundFn: Function | null | undefined;
    const origFnValue = descriptor.value;
    if (typeof origFnValue != 'function') {
      throw new Error('Use only @BindThis to a class method');
    }

    delete descriptor.value;
    delete descriptor.writable;

    descriptor.configurable = true;
    descriptor.get = function () {
      if (!boundFn) {
        boundFn = origFnValue.bind(this);
      }
      return boundFn;
    };

    descriptor.set = function (val) {
      if (typeof val != 'function') {
        throw new Error(`Can't assign ${typeof val} to ${propertyKey}`);
      }
      boundFn = val.bind(this);
    };
  };
}
