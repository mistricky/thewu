import { Dict } from '../typings/utils';
import { StateListeners } from './compiler';

type ComponentScopeGlobalData = Dict<unknown | Function>;

export type GlobalData = Dict<ComponentScopeGlobalData>;

export const globalStateListeners: Dict<StateListeners> = {};

export const globalData: GlobalData = {};
