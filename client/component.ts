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
   * Abstract Component constructor
   */
  constructor(props: Props, context?: any) {
    super(props, context);
    (this as any).state = {};
  }
}
