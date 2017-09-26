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
