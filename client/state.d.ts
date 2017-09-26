import * as Immutable from 'immutable';
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
