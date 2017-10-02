import { Component, StateLink, BindThis } from './component';
import * as React from 'react';

/**
 * Form namespace
 */
export namespace Form {

  /**
   * TextFieldProps interface
   */
  export interface TextFieldProps<T> extends React.HTMLProps<T> {
    valueLink?: StateLink;
  }

  /**
   * TextFieldState interface
   */
  export interface TextFieldState {}

  /**
   * TextField class
   */
  export class TextField<P extends TextFieldProps<HTMLElement>> extends Component<P, TextFieldState> {

    /**
     * On change input value
     * @param {React.FormEvent} event
     */
    @BindThis()
    protected onChange(event: React.FormEvent<any>) {
      if (this.props.valueLink instanceof StateLink) {
        this.props.valueLink.onChange(event);
      }
      if (typeof this.props.onChange == 'function') {
        this.props.onChange(event);
      }
    }

    /**
     * Get input value
     */
    protected getValue(): string {
      let val: string | undefined;
      if (this.props.valueLink instanceof StateLink) {
        val = this.props.valueLink.value;
      }
      return val || '';
    }

    /**
     * Get computed properties
     * @return {P}
     */
    protected getComputedProps(): P {
      let props: any = {};
      for (let i in this.props) {
        props[i] = (this.props as any)[i];
      }

      props.value = this.getValue();
      props.onChange = this.onChange;
      delete props.valueLink;

      return props;
    }
  }

  /**
   * InputProps interface
   */
  export interface InputProps extends TextFieldProps<HTMLInputElement> {}

  /**
   * Input class
   */
  export class Input extends TextField<InputProps> {

    /**
     * Render element
     * @return {React.DOMElement}
     */
    public render() {
      return React.createElement('input', this.getComputedProps());
    }
  }

  /**
   * TextAreaProps interface
   */
  export interface TextAreaProps extends TextFieldProps<HTMLTextAreaElement> {}

  /**
   * TextArea class
   */
  export class TextArea extends TextField<TextAreaProps> {

    /**
     * Render element
     * @return {React.DOMElement}
     */
    public render() {
      return React.createElement('textarea', this.getComputedProps());
    }
  }
}
