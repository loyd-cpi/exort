/// <reference types="react" />
import * as React from 'react';
export interface ComponentClass<Props = {}, State = {}> {
    new (props: Props, context?: any): Component<Props, State>;
}
export declare abstract class Component<Props = {}, State = {}> extends React.Component<Props, State> {
    constructor(props: Props, context?: any);
}
