// import { OPERATION } from './operation';
// import { isString } from './utils';

// interface Patch {
//   type: number;
//   content?: unknown;
//   index?: number;
// }

// interface Attrs {
//   [index: string]: unknown;
// }

// export function diff(oldVdom: any, newVdom: any) {
//   let patches = {};
//   let index = 0;

//   walk(oldVdom, newVdom, index, patches);

//   return patches;
// }

// function walk(oldVdomNode: any, newVdomNode: any, index: number, patches: any) {
//   let currentPatches: Patch[] = [];

//   // 新节点没有了 说明被移除
//   if (!newVdomNode) {
//     currentPatches.push({
//       type: OPERATION.REMOVE,
//       index
//     });
//   } else if (
//     isString(oldVdomNode) &&
//     isString(newVdomNode) &&
//     oldVdomNode != newVdomNode
//   ) {
//     // 字符串
//     currentPatches.push({
//       type: OPERATION.TEXT_CHANGE,
//       content: newVdomNode
//     });
//   } else if (oldVdomNode.tagName === newVdomNode.tagName) {
//     // 为相同类型的元素
//     // 属性差异
//     let diffAttrs = attrsDiff(oldVdomNode.attrs, newVdomNode.attrs);

//     if (Object.keys(diffAttrs).length) {
//       currentPatches.push({
//         type: OPERATION.ATTR_CHANGE,
//         content: diffAttrs
//       });
//     }

//     childrenDiff(oldVdomNode.children, newVdomNode.children, index, patches);
//   } else {
//     // 为不同元素
//     currentPatches.push({
//       type: OPERATION.REPLACE,
//       content: newVdomNode
//     });
//   }

//   // 收集 patches
//   if (currentPatches.length > 0) {
//     patches[index] = currentPatches;
//   }
// }

// function childrenDiff(
//   oldVdomChildren: any,
//   newVdomChildren: any,
//   index: number,
//   patches: any
// ) {
//   for (let i of Object.keys(oldVdomChildren)) {
//     walk(oldVdomChildren[i], newVdomChildren[i], ++index, patches);
//   }
// }

// function attrsDiff(oldAttrs: Attrs, newAttrs: Attrs): Attrs {
//   let union = { ...oldAttrs, ...newAttrs };
//   let diffAttrs: Attrs = {};

//   for (let attr of Object.keys(union)) {
//     if (
//       !oldAttrs.hasOwnProperty(attr) ||
//       !newAttrs.hasOwnProperty(attr) ||
//       oldAttrs[attr] !== newAttrs[attr]
//     ) {
//       diffAttrs[attr] = union[attr];
//     }
//   }

//   return diffAttrs;
// }
