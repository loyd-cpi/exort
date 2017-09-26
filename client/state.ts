import { ComponentClass, Component } from './component';
import { KeyValuePair, State } from './state';
import { isShallowEqual } from './util';
import * as Immutable from 'immutable';
import * as types from 'prop-types';
import * as React from 'react';

/**
 * KeyValuePair interface
 */
export interface KeyValuePair<T> {
  [key: string]: T;
}

/**
 * AppStatePromise interface
 */
export interface AppStatePromise {
  then(cb: (content: KeyValuePair<any>) => void): any;
}

/**
 * State type
 */
export type State = Immutable.Map<string, any>;

/**
 * AppStateDispatcher interface
 */
export interface AppStateDispatcher {
  (data: State): State;
}

/**
 * AppState class
 */
export class AppState {

  /**
   * App state
   */
  private state: State;

  /**
   * AppState dispatch listeners
   */
  private subscriptions: Subscription[] = [];

  /**
   * AppState constructor
   */
  constructor(state: KeyValuePair<any>) {
    this.state = Immutable.fromJS(state);
  }

  /**
   * Get app state
   */
  public getState(): State {
    return this.state;
  }

  /**
   * Check if state is empty
   */
  public isEmpty() {
    return !this.state.size ? true : false;
  }

  /**
   * Dispatch changes
   */
  public dispatch(newStateDispatcher: AppStateDispatcher) {
    let newState = newStateDispatcher(this.state);
    if (!Immutable.is(this.state, newState)) {
      this.state = newState;
      for (let subscription of this.subscriptions) {
        subscription.notify();
      }
    }
  }

  /**
   * Listen to app state changes or updates
   */
  public subscribe(listener: () => void) {
    let subscription = new Subscription(listener, subscription => {

      let pos = this.subscriptions.indexOf(subscription);
      if (pos != -1) {
        this.subscriptions.splice(pos, 1);
      }
    });
    this.subscriptions.push(subscription);
    return subscription;
  }
}

/**
 * Subscription constructor
 */
export class Subscription {

  /**
   * Flag if already unsubscribed
   */
  private unsubscribed: boolean = false;

  /**
   * Subscription constructor
   */
  constructor(private listener: Function, private unsubscribeInstruction: (subscription: Subscription) => void) {}

  /**
   * Check if subscription is already unsubscribed
   */
  public isUnsubscribed() {
    return this.unsubscribed;
  }

  /**
   * Notify subscriber
   */
  public notify() {
    this.listener();
  }

  /**
   * Unsubscribe
   */
  public unsubscribe() {
    if (!this.unsubscribed) {
      this.unsubscribeInstruction(this);
      this.unsubscribed = true;
    }
  }
}

/**
 * ApplicationProps interface
 */
export interface ApplicationProps {
  state: KeyValuePair<any> | (() => AppStatePromise);
  preload?: () => React.ReactElement<any>;
}

/**
 * AppChildContext interface
 */
export interface AppChildContext {
  $appState: AppState;
}

/**
 * Application component class
 */
export class AppStateProvider extends React.Component<ApplicationProps, any> implements React.ChildContextProvider<AppChildContext> {

  /**
   * AppState instance
   */
  private appState: AppState;

  /**
   * Child context types
   */
  public static childContextTypes = {
    $appState: types.instanceOf(AppState)
  };

  /**
   * Application component constructor
   */
  constructor(props: ApplicationProps, context: any) {
    super(props, context);
  }

  /**
   * Component event before mount
   */
  public componentWillMount() {
    if (typeof this.props.state == 'function') {
      this.props.state().then(state => {
        this.appState = new AppState(state || {});
        this.forceUpdate();
      });
    } else if (typeof this.props.state == 'object') {
      this.appState = new AppState(this.props.state || {});
    }
  }

  /**
   * Get children context
   */
  public getChildContext() {
    return { $appState: this.appState };
  }

  /**
   * Render application
   */
  public render() {
    if (!(this.appState instanceof AppState)) {
      if (typeof this.props.preload == 'function') {
        return this.props.preload();
      }
      return null;
    }
    return React.Children.only(this.props.children);
  }
}

/**
 * Container decorator
 */
export function AppStateListener(appStateMapper: (state: State, propsFromParent?: KeyValuePair<any>) => State) {
  return (target: ComponentClass): any => {

    /**
     * ContainerState interface
     */
    interface ContainerState {
      store?: State;
    }

    /**
     * Container class wraps the passed Component to container decorator
     */
    class Container extends Component<any, ContainerState> {

      /**
       * Flag whether props received from parent changed
       */
      private propsFromParentChanged: boolean = false;

      /**
       * Flag whether state received from AppState mapper changed
       */
      private stateFromMapperChanged: boolean = false;

      /**
       * AppState change subscription
       */
      protected subscription: Subscription;

      /**
       * Container constructor
       */
      constructor(props: any, context: any) {
        super(props, context);
      }

      /**
       * Handle state change
       */
      public handleStateChange() {
        let state = appStateMapper(this.getAppState().getState());
        if (state && (!this.state.store || !this.state.store.equals(state))) {
          this.stateFromMapperChanged = true;
          this.setState({ store: state });
        }
      }

      /**
       * Check if component should update
       */
      public shouldComponentUpdate(): boolean {
        return this.stateFromMapperChanged || this.propsFromParentChanged;
      }

      /**
       * Unsubscribe to AppState
       */
      public unsubscribeToAppState() {
        if (this.subscription) {
          this.subscription.unsubscribe();
          delete this.subscription;
        }
      }

      /**
       * Component event before mount
       */
      public componentWillUnmount() {
        this.unsubscribeToAppState();
      }

      /**
       * Component event before mount
       */
      public componentWillMount() {
        this.subscribeToAppState();
        this.handleStateChange();
      }

      /**
       * Component event when receiving new props
       */
      public componentWillReceiveProps(nextProps: any) {
        if (isShallowEqual(nextProps, this.props)) {
          this.propsFromParentChanged = false;
        } else {
          this.propsFromParentChanged = true;
        }
      }

      /**
       * Set and subscribe to AppState
       */
      public subscribeToAppState() {
        this.unsubscribeToAppState();
        this.subscription = this.getAppState().subscribe(this.handleStateChange.bind(this));
      }

      /**
       * Reset flags
       */
      private resetFlags() {
        this.propsFromParentChanged = false;
        this.stateFromMapperChanged = false;
      }

      /**
       * Render the wrapped component
       */
      public render() {
        let props: KeyValuePair<any> = {};
        if (this.state.store && this.state.store.size) {
          props = this.state.store.toJS();
        }

        for (let key in this.props) {
          props[key] = this.props[key];
        }

        this.resetFlags();
        return React.createElement(target as any, props);
      }
    }

    return Container;
  };
}
