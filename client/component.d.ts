/// <reference types="react" />
import * as types from 'prop-types';
import { AppState } from './state';
import * as React from 'react';
export interface ComponentClass<Props = {}, State = {}> {
    new (props: Props, context?: any): Component<Props, State>;
}
export declare abstract class Component<Props = {}, State = {}> extends React.Component<Props, State> {
    static contextTypes: {
        $appState: types.Requireable<any>;
    };
    constructor(props: Props, context: any);
    protected getAppState(): AppState;
    protected linkState(stateKey: string): StateLink;
}
export declare class StateLink {
    value: any;
    onChange: (event: React.FormEvent<any>) => void;
    constructor(value: any, onChange: (event: React.FormEvent<any>) => void);
}
export declare function BindThis(): (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => void;
