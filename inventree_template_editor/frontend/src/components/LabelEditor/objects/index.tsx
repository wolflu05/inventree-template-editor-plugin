import { classRegistry } from "fabric";
import { Circle } from './Circle';
import { QrCode } from './QrCode';
import { Rectangle } from './Rectangle';
import { Text } from './Text';
import { TablerIconType } from "../../../types";
import { CustomFabricObject } from "./_BaseObject";

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
  fabricElement: CustomFabricObject;
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

// register all objects in fabric class registry
Object.entries(LabelEditorObjectsMap).forEach(([key, value]) => classRegistry.setClass(
  value.fabricElement,
  key,
));
