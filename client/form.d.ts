/// <reference types="react" />
import { Component, StateLink } from './component';
import * as React from 'react';
export declare namespace Form {
    interface TextFieldProps<T> extends React.HTMLProps<T> {
        valueLink?: StateLink;
    }
    interface TextFieldState {
    }
    class TextField<P extends TextFieldProps<HTMLElement>> extends Component<P, TextFieldState> {
        protected onChange(event: React.FormEvent<any>): void;
        protected getValue(): string;
        protected getComputedProps(): P;
    }
    interface InputProps extends TextFieldProps<HTMLInputElement> {
    }
    class Input extends TextField<InputProps> {
        render(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    }
    interface TextAreaProps extends TextFieldProps<HTMLTextAreaElement> {
    }
    class TextArea extends TextField<TextAreaProps> {
        render(): React.DetailedReactHTMLElement<TextAreaProps, HTMLTextAreaElement>;
    }
}
