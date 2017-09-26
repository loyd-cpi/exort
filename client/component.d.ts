/// <reference types="react" />
import { KeyValuePair, AppStatePromise, State, AppState } from './state';
import * as types from 'prop-types';
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
}
export interface ApplicationProps {
    state: KeyValuePair<any> | (() => AppStatePromise);
    preload?: () => React.ReactElement<any>;
}
export interface AppChildContext {
    $appState: AppState;
}
export declare class Application extends React.Component<ApplicationProps, any> implements React.ChildContextProvider<AppChildContext> {
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
export declare function AppStateListener(appStateMapper: (state: State, propsFromParent?: KeyValuePair<any>) => State): (target: typeof Component) => any;
