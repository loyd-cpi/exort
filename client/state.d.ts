/// <reference types="react" />
import { ComponentClass } from './component';
import { KeyValuePair, State } from './state';
import * as Immutable from 'immutable';
import * as types from 'prop-types';
import * as React from 'react';
export interface KeyValuePair<T> {
    [key: string]: T;
}
export interface AppStatePromise {
    then(cb: (content: KeyValuePair<any>) => void): any;
}
export declare type State = Immutable.Map<string, any>;
export interface AppStateDispatcher {
    (data: State): State;
}
export declare class AppState {
    private state;
    private subscriptions;
    constructor(state: KeyValuePair<any>);
    getState(): State;
    isEmpty(): boolean;
    dispatch(newStateDispatcher: AppStateDispatcher): void;
    subscribe(listener: () => void): Subscription;
}
export declare class Subscription {
    private listener;
    private unsubscribeInstruction;
    private unsubscribed;
    constructor(listener: Function, unsubscribeInstruction: (subscription: Subscription) => void);
    isUnsubscribed(): boolean;
    notify(): void;
    unsubscribe(): void;
}
export interface ApplicationProps {
    state: KeyValuePair<any> | (() => AppStatePromise);
    preload?: () => React.ReactElement<any>;
}
export interface AppChildContext {
    $appState: AppState;
}
export declare class AppStateProvider extends React.Component<ApplicationProps, any> implements React.ChildContextProvider<AppChildContext> {
    private appState;
    static childContextTypes: {
        $appState: types.Requireable<any>;
    };
    constructor(props: ApplicationProps, context: any);
    componentWillMount(): void;
    getChildContext(): {
        $appState: AppState;
    };
    render(): React.ReactElement<any> | null;
}
export declare function AppStateListener(appStateMapper: (state: State, propsFromParent?: KeyValuePair<any>) => State): (target: ComponentClass<{}, {}>) => any;
