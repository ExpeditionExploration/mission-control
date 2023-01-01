import React from 'react';
export type ModuleType = 'widget' | 'window';

export default abstract class Module extends React.Component{
    static type: 'widget' | 'window' = 'widget';
}