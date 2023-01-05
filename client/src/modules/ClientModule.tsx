import React from 'react';
export type ModuleLocation = 'left' | 'right' | 'window' | 'menu';

export default abstract class Module extends React.Component {
    static location: ModuleLocation = 'left';

    constructor(props: any) {
        super(props);
    }
}