import { Component, ComponentClass } from './component';

/**
 * Application state. You may also call it global state
 */
export class AppState {

}

/**
 * AppStateListenerProps interface
 */
export interface AppStateListenerProps {}

/**
 * AppStateListenerState interface
 */
export interface AppStateListenerState {}

/**
 * AppStateListener decorator
 */
export function AppStateListener() {
  return (target: Function): ComponentClass<AppStateListenerProps, AppStateListenerProps> => {

    /**
     * Dynamically created class for listening state changes
     */
    class ListenerComponent extends Component<AppStateListenerProps, AppStateListenerProps> {

    }

    return ListenerComponent;
  };
}
