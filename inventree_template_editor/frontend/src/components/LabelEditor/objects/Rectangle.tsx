import { t } from '@lingui/macro';
import { Stack } from '@mantine/core';
import { IconRectangleFilled } from '@tabler/icons-react';
import { Rect as FabricRect } from 'fabric';

import { LabelEditorObject } from '.';
import {
  GeneralSettingBlock,
  buildStyle,
  getCustomFabricBaseObject,
  styleHelper
} from './_BaseObject';
import {
  AngleInputGroup,
  BorderStyleInputGroup,
  ColorInputGroup,
  PositionInputGroup,
  SizeInputGroup
} from './_InputGroups';

class RectangleObject extends getCustomFabricBaseObject(FabricRect) {
  static type = 'rect';

  constructor(props: any) {
    super(props);

    this.width = props.width ?? 50;
    this.height = props.height ?? 50;
  }
}

export const Rectangle: LabelEditorObject = {
  key: 'rect',
  name: t`Rectangle`,
  icon: IconRectangleFilled,
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
          <SizeInputGroup />
        </Stack>
      )
    },
    {
      key: 'style',
      name: t`Style`,
      component: () => (
        <Stack>
          <ColorInputGroup name={t`Background color`} />
          <BorderStyleInputGroup />
        </Stack>
      )
    }
  ],
  fabricElement: RectangleObject,
  export: {
    style: (object, id) => {
      return buildStyle(id, [
        ...styleHelper.position(object),
        ...styleHelper.size(object),
        ...styleHelper.rotation(object),
        ...styleHelper.background(object),
        ...styleHelper.border(object)
      ]);
    },
    content: (_object, id) => {
      return `<div id="${id}"></div>`;
    }
  }
};
