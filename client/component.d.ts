/// <reference types="react" />
import * as React from 'react';
export declare function Container(): (target: Function) => void;
export declare abstract class Component<Props, State> extends React.Component<Props, State> {
    constructor(props: Props, context?: any);
}
