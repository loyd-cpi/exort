import * as React from 'react';

/**
 * Container decorator
 */
export function Container() {
  return (target: Function) => {

  };
}

/**
 * Abstract Component class
 */
export abstract class Component<Props, State> extends React.Component<Props, State> {

  /**
   * Abstract Component constructor
   */
  constructor(props: Props, context?: any) {
    super(props, context);
  }
}
