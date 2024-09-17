import { t } from '@lingui/macro';
import { Stack } from '@mantine/core';
import { fabric } from 'fabric';

import { ObjectPanelBlock, SettingBlock } from '.';
import { LabelEditorState } from '../LabelEditorContext';
import { pixelToUnit } from '../utils';
import { NameInputGroup } from './_InputGroups';

type InitializeProps = {
  left: number;
  top: number;
  state: LabelEditorState;
};

export const createFabricObject = (
  base: typeof fabric.Object,
  properties: Record<any, any> & {
    initialize?: (props: InitializeProps) => void;
  },
  customFields?: string[]
) => {
  const fields = [
    'positionUnit',
    'sizeUnit',
    'strokeWidthUnit',
    'name',
    ...(customFields || [])
  ];

  const customBase = fabric.util.createClass(base, {
    positionUnit: 'mm',
    sizeUnit: 'mm',
    stroke: '#000000',
    strokeWidth: 0,
    strokeWidthUnit: 'mm',

    initialize(...args: any[]) {
      let props: InitializeProps = args[0];
      if (typeof props !== 'object' || !('state' in props)) {
        props = args[1];
      }

      this.positionUnit = props.state.pageSettings.unit['length.unit'];
      this.sizeUnit = props.state.pageSettings.unit['length.unit'];
      this.strokeWidthUnit = props.state.pageSettings.unit['length.unit'];
      this.callSuper('initialize', ...args);
    },

    toObject() {
      return this.callSuper('toObject', fields) as Record<string, any>;
    }
  });

  const cls = fabric.util.createClass(customBase, properties);

  cls.fromObject = function (
    o: Record<string, any>,
    callback: (obj: fabric.Object) => any
  ) {
    const obj = new cls(o);

    Object.entries(o).forEach(([key, value]) => {
      obj[key] = value;
    });

    callback(obj);
  };

  return cls;
};

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
      `outline: ${c(object.strokeWidth, object.strokeWidthUnit)} solid ${
        object.stroke
      };`
    ];
  }
} satisfies Record<string, (object: Record<string, any>) => string[]>;
