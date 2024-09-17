import { t } from '@lingui/macro';
import { Stack } from '@mantine/core';
import {
  IconAlignBoxCenterTop,
  IconAlignBoxLeftTop,
  IconAlignBoxRightTop,
  IconTextSize
} from '@tabler/icons-react';
import { fabric } from 'fabric';
import { useEffect, useRef, useState } from 'react';

import { LabelEditorObject } from '.';
import { getFonts } from '../fonts';
import { InputGroup } from '../panels/Components';
import {
  GeneralSettingBlock,
  buildStyle,
  c,
  createFabricObject,
  styleHelper
} from './_BaseObject';
import {
  AngleInputGroup,
  ColorInputGroup,
  PositionInputGroup,
  SizeInputGroup,
  useObjectInputGroupState
} from './_InputGroups';

const FontInputGroup = () => {
  const [fonts, setFonts] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    getFonts().then((fonts) =>
      setFonts([...fonts].map((x) => ({ value: x, label: x })))
    );
  }, []);

  const stateRef = useRef({
    width: 0,
    height: 0
  });

  const font = useObjectInputGroupState({
    name: t`Font`,
    icon: IconTextSize,
    unitKey: 'size.unit',
    valueKeys: ['size.value'],
    connectionUnitKey: 'fontSizeUnit',
    connections: [
      { objAttr: 'fontFamily', inputKey: 'family.value' },
      { objAttr: 'fontSize', inputKey: 'size.value' }
    ],
    beforeCanvasUpdate: (_values, obj) => {
      stateRef.current.width = obj.width as number;
      stateRef.current.height = obj.height as number;
    },
    afterCanvasUpdate: (_values, obj) => {
      obj.set({
        ...stateRef.current
      });
    },
    inputRows: [
      {
        key: 'family',
        columns: [
          {
            key: 'value',
            type: 'select',
            selectOptions: fonts
          }
        ]
      },
      {
        key: 'size',
        columns: [
          { key: 'value', type: 'number', label: t`Size` },
          { key: 'unit', template: 'unit' }
        ]
      }
    ],
    triggerUpdateEvents: ['object:modified']
  });

  return <InputGroup state={font} />;
};

const TextAlignInputGroup = () => {
  const stateRef = useRef({
    width: 0,
    height: 0
  });

  const textAlign = useObjectInputGroupState({
    name: t`Text align`,
    icon: IconTextSize,
    connections: [{ objAttr: 'textAlign', inputKey: 'horizontal.value' }],
    beforeCanvasUpdate: (_values, obj) => {
      stateRef.current.width = obj.width as number;
      stateRef.current.height = obj.height as number;
    },
    afterCanvasUpdate: (_values, obj) => {
      obj.set({
        ...stateRef.current
      });
    },
    inputRows: [
      {
        key: 'horizontal',
        columns: [
          {
            key: 'value',
            type: 'radio',
            radioOptions: [
              { value: 'left', icon: IconAlignBoxLeftTop },
              { value: 'center', icon: IconAlignBoxCenterTop },
              { value: 'right', icon: IconAlignBoxRightTop }
            ]
          }
        ]
      }
    ],
    triggerUpdateEvents: ['object:modified']
  });

  return <InputGroup state={textAlign} />;
};

export const Text: LabelEditorObject = {
  key: 'text',
  name: t`Text`,
  icon: IconTextSize,
  defaultOpen: ['general', 'layout', 'text-options', 'style'],
  settingBlocks: [
    GeneralSettingBlock,
    {
      key: 'layout',
      name: t`Layout`,
      component: () => (
        <Stack>
          <PositionInputGroup />
          <AngleInputGroup />
          <SizeInputGroup />
        </Stack>
      )
    },
    {
      key: 'text-options',
      name: t`Text options`,
      component: () => (
        <Stack>
          <FontInputGroup />
          <TextAlignInputGroup />
        </Stack>
      )
    },
    {
      key: 'style',
      name: t`Style`,
      component: () => (
        <Stack>
          <ColorInputGroup name={t`Color`} />
        </Stack>
      )
    }
  ],
  fabricElement: createFabricObject(
    fabric.IText as typeof fabric.Object,
    {
      type: 'text',
      fontSize: 20,
      fontSizeUnit: 'mm',

      initialize(props) {
        this.fontSizeUnit = props.state.pageSettings.unit['length.unit'];
        this.width = 50;
        this.height = 50;

        // lock dimensions when editing
        this.on('editing:entered', () => {
          this.tmpWidth = this.width;
          this.tmpHeight = this.height;
        });

        this.on('editing:exited', () => {
          this.width = this.tmpWidth;
          this.height = this.tmpHeight;
        });

        this.on('changed', () => {
          this.width = this.tmpWidth;
          this.height = this.tmpHeight;
        });

        this.callSuper('initialize', t`Hello world`, props);
      }
    },
    ['fontSizeUnit']
  ),
  export: {
    style: (object, id) => {
      return buildStyle(id, [
        ...styleHelper.position(object),
        ...styleHelper.size(object),
        ...styleHelper.rotation(object),
        ...styleHelper.color(object, 'fill'),
        `font-family: ${object.fontFamily};`,
        `font-size: ${c(object.fontSize, object.fontSizeUnit)};`,
        `text-align: ${object.textAlign};`
      ]);
    },
    content: (object, id) => {
      return `<div id="${id}">${object.text}</div>`;
    }
  }
};
