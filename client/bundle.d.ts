/// <reference types="react" />
import { Component } from './component';
import * as React from 'react';
export declare function renderBundleComponent<Props>(name: string, props: Props, loadBundle: Function): React.ReactElement<Props>;
export interface BuildComponentClass<Props> {
    new (props?: Props, context?: any): BuildComponentClass<Props>;
}
export interface BundleComponentState {
    component?: React.ComponentClass;
}
export declare abstract class BundleComponent<Props> extends Component<Props, BundleComponentState> {
    abstract load(): void;
    componentWillMount(): void;
    render(): React.ComponentElement<{}, React.Component<{}, React.ComponentState>> | null;
}
