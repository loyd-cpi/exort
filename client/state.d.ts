import { ComponentClass } from './component';
export declare class AppState {
}
export interface AppStateListenerProps {
}
export interface AppStateListenerState {
}
export declare function AppStateListener(): (target: Function) => ComponentClass<AppStateListenerProps, AppStateListenerProps>;
