import { t } from '@lingui/macro';
import { Stack } from '@mantine/core';
import { IconCircleFilled, IconRuler2 } from '@tabler/icons-react';
import { fabric } from 'fabric';

import { LabelEditorObject } from '.';
import { useLabelEditorState } from '../LabelEditorContext';
import { InputGroup } from '../panels/Components';
import {
  GeneralSettingBlock,
  buildStyle,
  createFabricObject,
  styleHelper
} from './_BaseObject';
import {
  AngleInputGroup,
  ColorInputGroup,
  PositionInputGroup,
  useObjectInputGroupState
} from './_InputGroups';
import { useEvents } from "../../../hooks/useEvents";

const CircleRadiusInputGroup = () => {
  const circleRadius = useObjectInputGroupState({
    name: t`Radius`,
    icon: IconRuler2,
    unitKey: 'radius.unit',
    valueKeys: ['radius.value'],
    connectionUnitKey: 'radiusUnit',
    connections: [{ objAttr: 'radius', inputKey: 'radius.value' }],
    inputRows: [
      {
        key: 'radius',
        columns: [
          { key: 'value', type: 'number', label: t`Radius` },
          { key: 'unit', template: 'unit' }
        ]
      }
    ],
    triggerUpdateEvents: ['object:modified']
  });

  return <InputGroup state={circleRadius} />;
};

export const Circle: LabelEditorObject = {
  key: 'circle',
  name: t`Circle`,
  icon: IconCircleFilled,
  defaultOpen: ['general', 'layout', 'style'],
  settingBlocks: [
    GeneralSettingBlock,
    {
      key: 'layout',
      name: t`Layout`,
      component: () => (
        <Stack>
          <PositionInputGroup />
          <AngleInputGroup />
          <CircleRadiusInputGroup />
        </Stack>
      )
    },
    {
      key: 'style',
      name: t`Style`,
      component: () => (
        <Stack>
          <ColorInputGroup name={t`Background color`} />
        </Stack>
      )
    }
  ],
  fabricElement: createFabricObject(
    fabric.Circle as any,
    {
      type: 'circle',
      radiusUnit: 'mm',

      initialize(props) {
        this.width = 50;
        this.height = 50;
        this.radius = 25;

        this.callSuper('initialize', props);
      }
    },
    ['radiusUnit']
  ),
  useCanvasEvents: () => {
    const editor = useLabelEditorState((s) => s.editor);

    useEvents(
      editor?.canvas,
      (on) => {
        on('object:scaling', (e) => {
          if (e.target?.type !== 'circle') return;

          const obj = e.target as fabric.Circle;
          obj.set({ radius: (obj.width! + obj.height!) / 4 });
        });
      },
      [editor]
    );
  },
  export: {
    style: (object, id) => {
      return buildStyle(id, [
        ...styleHelper.position(object),
        ...styleHelper.size(object),
        ...styleHelper.rotation(object),
        ...styleHelper.background(object),
        ...styleHelper.border(object),
        `border-radius: 50%;`
      ]);
    },
    content: (_object, id) => `<div id="${id}"></div>`
  }
};
