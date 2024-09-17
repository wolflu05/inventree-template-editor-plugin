import { t } from '@lingui/macro';
import { ActionIcon, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconArrowAutofitWidth } from '@tabler/icons-react';
import { useState } from 'react';

import { useLabelEditorState } from '../LabelEditorContext';
import { useEvents } from "../../../hooks/useEvents";

export function FooterPanel() {
  const editor = useLabelEditorState((s) => s.editor);
  const zoomToFit = useLabelEditorState((s) => s.zoomToFit);
  const [zoom, setZoom] = useState(1);

  useEvents(
    editor?.canvas,
    (on) => {
      const handler = () => {
        if (!editor) return;
        setZoom(editor.canvas.getZoom());
      };

      on('mouse:wheel', handler);
      handler();
    },
    [editor]
  );

  return (
    <Stack p={4}>
      <Group>
        <Text w={120}>Zoom: {Math.round(zoom * 1000) / 10}%</Text>
        <Tooltip label={t`Zoom to fit`} position="top">
          <ActionIcon onClick={() => zoomToFit?.()} p={2}>
            <IconArrowAutofitWidth size="1.5rem" />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Stack>
  );
}
