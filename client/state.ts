import * as Immutable from 'immutable';

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
