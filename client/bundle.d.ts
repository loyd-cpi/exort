/// <reference types="react" />
import { Component } from './component';
import * as React from 'react';
export interface BundleLoadFunction {
    (cb: Function): void;
}
export interface BundleComponentClass {
    new (props: any, context: any): BundleComponent;
}
export interface BundleComponentState {
    component?: React.ComponentClass;
}
export declare function createBundleComponent(name: string, load: BundleLoadFunction): BundleComponentClass;
export declare abstract class BundleComponent extends Component<any, BundleComponentState> {
    abstract load(): void;
    componentWillMount(): void;
    render(): React.ComponentElement<{}, React.Component<{}, React.ComponentState>> | React.SFCElement<{}> | null;
}
