import { ActionIcon, Stack, Tooltip } from '@mantine/core';
import { useCallback } from 'react';

import {
  useLabelEditorState,
  useLabelEditorStore
} from '../LabelEditorContext';
import { LabelEditorObject, LabelEditorObjects } from '../objects';

export function LeftPanel() {
  const editor = useLabelEditorState((s) => s.editor);
  const labelEditorStore = useLabelEditorStore();

  const addComponent = useCallback(
    (component: LabelEditorObject) => () => {
      if (!editor) return;

      const state = labelEditorStore.getState();
      const obj = new component.fabricElement({
        left: 10,
        top: 10,
        state
      });

      editor.canvas.add(obj);

      // get the next name for the object
      let nextNum = 0;
      editor.canvas.getObjects().forEach((o: fabric.Object) => {
        if (o.type === obj.type) {
          // calculate the next free number for this element
          const num = (o.name || '').match(/\((\d+)\)/);
          if (num) {
            nextNum = Math.max(nextNum, parseInt(num[1], 10) + 1);
          }
        }
      });

      obj.name = `${obj.type} (${nextNum})`;
      editor.canvas.fire('object:modified', { target: obj });

      editor.canvas.setActiveObject(obj);
      state.setRightPanel?.('object-options');
    },
    [editor]
  );

  return (
    <Stack p={4}>
      {LabelEditorObjects.map((component) => (
        <Tooltip label={component.name} key={component.key} position="right">
          <ActionIcon onClick={addComponent(component)}>
            <component.icon size={'1.25rem'} />
          </ActionIcon>
        </Tooltip>
      ))}
    </Stack>
  );
}
