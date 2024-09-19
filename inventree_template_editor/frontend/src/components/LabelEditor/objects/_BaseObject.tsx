import { t } from '@lingui/macro';
import { Stack } from '@mantine/core';

import { ObjectPanelBlock, SettingBlock } from '.';
import { LabelEditorState } from '../LabelEditorContext';
import { pixelToUnit } from '../utils';
import { NameInputGroup } from './_InputGroups';
import { FabricObject } from "fabric";

type InitializeProps = {
  left: number;
  top: number;
  state: LabelEditorState;
};

export const getCustomFabricBaseObject = <T extends new (...args: any[]) => {}>(Base: T, customFields?: string[]) => {
  const fields = [
    'positionUnit',
    'sizeUnit',
    'strokeWidthUnit',
    'name',
    ...(customFields || [])
  ];

  return class CustomFabricObject extends Base {
    positionUnit: string;
    sizeUnit: string;
    strokeWidthUnit: string;
    name: string;
    stroke: string;
    strokeWidth: number;

    constructor(...args: any[]) {
      let props: InitializeProps = args[0];
      if (typeof props !== 'object' || !('state' in props)) {
        props = args[1];
      }

      super(...args);

      this.positionUnit = (props as any).positionUnit ?? props.state.pageSettings.unit['length.unit'] ?? 'mm';
      this.sizeUnit = (props as any).sizeUnit ?? props.state.pageSettings.unit['length.unit'] ?? 'mm';
      this.strokeWidthUnit = (props as any).strokeWidthUnit ?? props.state.pageSettings.unit['length.unit'] ?? 'mm';
      this.stroke = (props as any).stroke ?? '#000000';
      this.strokeWidth = (props as any).strokeWidth ?? 0;
      this.name = (props as any).name;
    }

    toObject() {
      // @ts-expect-error this method exists on a fabricjs object
      return super.toObject(fields) as Record<string, any>;
    }
  }
}

export type CustomFabricObject = ReturnType<typeof getCustomFabricBaseObject<typeof FabricObject>>;

const GeneralPanelBlock: ObjectPanelBlock = () => {
  return (
    <Stack>
      <NameInputGroup />
    </Stack>
  );
};

export const GeneralSettingBlock: SettingBlock = {
  key: 'general',
  name: t`General`,
  component: GeneralPanelBlock
};

export const buildStyle = (id: string, style: string[]) => `#${id} {
${style
    .filter((x) => !!x)
    .map((x) => '  ' + x.trimStart())
    .join('\n')}
}`;

export const c = (n: number, u: string) =>
  Math.round((pixelToUnit(n, u) + Number.EPSILON) * 10 ** 15) / 10 ** 15 + u;

export const styleHelper = {
  position: (object) => [
    'position: absolute;',
    `top: ${c(object.top, object.positionUnit)};`,
    `left: ${c(object.left, object.positionUnit)};`
  ],
  size: (object) => [
    `width: ${c(object.width, object.sizeUnit)};`,
    `height: ${c(object.height, object.sizeUnit)};`
  ],
  rotation: (object) =>
    object.angle !== 0
      ? [
        'transform-origin: top left;',
        `transform: rotate(${object.angle}deg);`
      ]
      : [],
  background: (object, attr = 'fill') => {
    if (!object[attr]) return [];
    return [`background-color: ${object[attr]};`];
  },
  color: (object, attr = 'fill') => {
    if (!object[attr]) return [];
    return [`color: ${object[attr]};`];
  },
  border: (object) => {
    if (object.strokeWidth === 0) return [];
    return [
      `outline: ${c(object.strokeWidth, object.strokeWidthUnit)} solid ${object.stroke};`
    ];
  }
} satisfies Record<string, (object: Record<string, any>) => string[]>;
