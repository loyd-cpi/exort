/// <reference types="react" />
import { Component } from './component';
import * as React from 'react';
export interface BundleLoadFunction {
    (cb: Function): void;
}
export interface BundleComponentState {
    component?: React.ComponentClass;
}
export interface BundleComponentProps {
    loadingAnimation?: React.ComponentType;
    load: BundleLoadFunction;
}
export declare function renderBundleComponent(name: string, props: any, load: BundleLoadFunction): React.ComponentElement<BundleComponentProps, BundleComponent>;
export declare abstract class BundleComponent extends Component<BundleComponentProps, BundleComponentState> {
    abstract load(): void;
    componentWillMount(): void;
    render(): React.ComponentElement<{}, React.Component<{}, React.ComponentState>> | React.SFCElement<{}> | null;
}
