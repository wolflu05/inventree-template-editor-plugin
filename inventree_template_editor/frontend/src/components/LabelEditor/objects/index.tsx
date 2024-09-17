import { fabric } from 'fabric';

import { Circle } from './Circle';
import { QrCode } from './QrCode';
import { Rectangle } from './Rectangle';
import { Text } from './Text';
import { TablerIconType } from "../../../types";

export type ObjectPanelBlock = (props: {}) => React.JSX.Element;

export type SettingBlock = {
  key: string;
  name: string;
  component: ObjectPanelBlock;
};

export type LabelEditorObject = {
  key: string;
  name: string;
  icon: TablerIconType;
  settingBlocks: SettingBlock[];
  fabricElement: any;
  useCanvasEvents?: () => void;
  defaultOpen: string[];
  export: {
    style?: (object: Record<string, any>, id: string) => string;
    content?: (object: Record<string, any>, id: string) => string;
  };
};

export const LabelEditorObjects: LabelEditorObject[] = [
  Rectangle,
  Circle,
  Text,
  QrCode
];

export const LabelEditorObjectsMap: Record<string, LabelEditorObject> =
  Object.fromEntries(LabelEditorObjects.map((object) => [object.key, object]));

// @ts-ignore
fabric.Custom = Object.fromEntries(
  Object.entries(LabelEditorObjectsMap).map(([key, value]) => [
    key[0].toUpperCase() + key.slice(1),
    value.fabricElement
  ])
);
