import {
  Operation,
  OPERATIONS,
  MovePayload,
  RemovePayload,
  AddPayload
} from './operation';
import { VdomNode } from '../renderer';
import * as DomUtil from '../../utils/dom';

type Payloads = MovePayload & RemovePayload & AddPayload<VdomNode>;

interface OperationHandler {
  [index: string]: (payload: Payloads) => void;
}

const OPERATIONS_MAP: OperationHandler = {
  move: (payload: MovePayload) => {
    const { layerDom, targetIndex, originIndex } = payload;

    DomUtil.move(layerDom, originIndex, targetIndex);
  },
  remove: (payload: RemovePayload) => {
    const { layerDom, targetIndexes } = payload;

    DomUtil.remove(layerDom, targetIndexes);
  },
  add: (payload: AddPayload<VdomNode>) => {
    const { layerDom, targetIndex, targets } = payload;

    DomUtil.add(layerDom, targetIndex, targets);
  }
};

export function patcher(operations: Operation<OPERATIONS, VdomNode>[]) {
  for (const operation of operations) {
    const { name, payload } = operation;

    // console.info(OPERATIONS_MAP[name]);
    let handler = OPERATIONS_MAP[name];

    handler(payload as Payloads);
  }
}
