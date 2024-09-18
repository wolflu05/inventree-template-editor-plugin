import { Trans, t } from '@lingui/macro';
import {
  Accordion,
  Container,
  Divider,
  List,
  Stack,
  Tabs,
  Text,
  Title,
  Tooltip
} from '@mantine/core';
import {
  IconAngle,
  IconDimensions,
  IconFileBarcode,
  IconGrid4x4,
  IconLayoutCards,
  IconLock,
  IconMagnet,
  IconResize,
  IconScale,
  IconStack2,
} from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  PageSettingsType,
  useLabelEditorState,
  useLabelEditorStore
} from '../LabelEditorContext';
import { LabelEditorObjectsMap } from '../objects';
import { convertUnit } from '../utils';
import {
  InputGroup,
  UseInputGroupProps,
  unitInputGroupBlur,
  useInputGroupState
} from './Components';
import { TablerIconType } from "../../../types";

type RightPanelComponent = (props: {}) => React.ReactElement;

type RightPanelNameComponent = (props: {}) => React.ReactElement;

type RightPanelType = {
  key: string;
  name: string | RightPanelNameComponent;
  icon: TablerIconType;
  panel: RightPanelComponent;
  header?: RightPanelComponent;
  requiresSelection?: boolean;
};

type UsePageSettingsInputGroupStateProps<T extends any[]> = {
  unitKey?: string;
  valueKeys?: string[];
  pageSettingsKey: keyof PageSettingsType;
} & UseInputGroupProps<T>;

const usePageSettingsInputGroupState = <T extends any[]>(
  props: UsePageSettingsInputGroupStateProps<T>
) => {
  const labelEditorStore = useLabelEditorStore();

  const onBlur = useMemo(() => {
    if (props.unitKey) {
      return unitInputGroupBlur({
        unitKey: props.unitKey,
        valueKeys: props.valueKeys || []
      });
    } else {
      return props.onBlur as any;
    }
  }, [props.unitKey, props.valueKeys, props.onBlur]);

  const inputState = useInputGroupState({
    ...props,
    onBlur,
    updateCanvas: (values) => {
      labelEditorStore.setState((s) => ({
        pageSettings: { ...s.pageSettings, [props.pageSettingsKey]: values }
      }));
    },
    updateInputs: (values) => {
      for (const [key, value] of Object.entries(values)) {
        inputState.setValue(key, value);
      }
    }
  });

  useEffect(() => {
    inputState.triggerUpdate(
      labelEditorStore.getState().pageSettings[props.pageSettingsKey]
    );
    return labelEditorStore.subscribe((s, ps) => {
      if (
        s.pageSettings[props.pageSettingsKey] ===
        ps.pageSettings[props.pageSettingsKey]
      )
        return;
      inputState.triggerUpdate(s.pageSettings[props.pageSettingsKey]);
    });
  }, []);

  return inputState;
};

const DocumentRightPanel: RightPanelComponent = () => {
  const template = useLabelEditorState((s) => s.template);

  const dimensions = useInputGroupState({
    name: t`Dimensions`,
    icon: IconDimensions,
    inputRows: [
      {
        key: 'dimensions',
        columns: [
          {
            key: 'width',
            label: t`Width`,
            type: 'number',
            defaultValue: template?.width,
            disabled: true
          },
          {
            key: 'height',
            label: t`Height`,
            type: 'number',
            defaultValue: template?.height,
            disabled: true
          },
          { key: 'unit', template: 'unit', disabled: true }
        ]
      }
    ]
  });

  const unit = usePageSettingsInputGroupState({
    name: t`Default units`,
    icon: IconScale,
    pageSettingsKey: 'unit',
    inputRows: [
      {
        key: 'length',
        columns: [
          {
            key: 'unit',
            label: t`Length`,
            template: 'unit'
          }
        ]
      }
    ]
  });

  const grid = usePageSettingsInputGroupState({
    name: t`Grid`,
    icon: IconGrid4x4,
    onBlur: (key, value, values, oldState, state) => {
      if (key === 'size.size') {
        const v = 1 / convertUnit(value, values['size.unit'], 'in');
        state.setValue('dpi.value', v);
        values['dpi.value'] = v;
      }

      if (key === 'dpi.value') {
        const v = convertUnit(1 / value, 'in', values['size.unit']);
        state.setValue('size.size', v);
        values['size.size'] = v;
      }

      unitInputGroupBlur({
        unitKey: 'size.unit',
        valueKeys: ['size.size']
      })(key, value, values, oldState, state);
    },
    pageSettingsKey: 'grid',
    inputRows: [
      {
        key: 'size',
        columns: [
          { key: 'size', label: t`Size`, type: 'number' },
          { key: 'unit', template: 'unit' }
        ]
      },
      {
        key: 'dpi',
        columns: [
          {
            key: 'value',
            label: t`DPI`,
            type: 'number'
          }
        ]
      }
    ]
  });

  const snap = usePageSettingsInputGroupState({
    name: t`Snapping`,
    icon: IconMagnet,
    pageSettingsKey: 'snap',
    inputRows: [
      {
        key: 'grid',
        columns: [
          {
            key: 'enable',
            label: t`Grid snap`,
            type: 'checkbox',
            icon: IconGrid4x4
          }
        ]
      },
      {
        key: 'angle',
        columns: [
          {
            key: 'enable',
            type: 'checkbox',
            icon: IconAngle,
            tooltip: t`Alt key to modify`
          },
          { key: 'value', label: t`Angle [°]`, type: 'number' }
        ]
      }
    ]
  });

  const scale = usePageSettingsInputGroupState({
    name: t`Scale`,
    icon: IconResize,
    pageSettingsKey: 'scale',
    inputRows: [
      {
        key: 'uniform',
        columns: [
          {
            key: 'enable',
            label: t`Uniform scaling`,
            type: 'checkbox',
            icon: IconLock,
            tooltip: t`Alt key to modify`
          }
        ]
      }
    ]
  });

  return (
    <Stack p={10} spacing="lg">
      <InputGroup state={dimensions} />
      <InputGroup state={unit} />
      <InputGroup state={grid} />
      <InputGroup state={snap} />
      <InputGroup state={scale} />
    </Stack>
  );
};

const ObjectsRightPanel: RightPanelComponent = () => {
  const objects = useLabelEditorState((s) => s.objects);
  const editor = useLabelEditorState((s) => s.editor);
  const selectedObjects = useLabelEditorState((s) => s.selectedObjects);
  const selectedObjectsList = useMemo(
    () => selectedObjects.flatMap((o) => [o, ...(o.group?._objects || [])]),
    [selectedObjects]
  );

  const stackRef = useRef<HTMLDivElement>(null);

  return (
    <Stack
      p={10}
      style={{ flex: 1, height: '100%' }}
      onClick={(e) => {
        if (e.target === stackRef.current) {
          editor?.canvas.discardActiveObject();
          editor?.canvas.requestRenderAll();
        }
      }}
      ref={stackRef}
    >
      <List withPadding>
        {objects.map((object, index) => (
          <List.Item key={index}>
            <Text
              onClick={() => {
                editor?.canvas.setActiveObject(object);
                editor?.canvas.renderAll();
              }}
              style={{
                cursor: 'pointer',
                fontWeight: selectedObjectsList.includes(object) ? 600 : 400
              }}
            >
              {object.name}
            </Text>
          </List.Item>
        ))}
      </List>
      {objects.length === 0 && (
        <Text italic align="center" mt={-10}>
          <Trans>No objects</Trans>
        </Text>
      )}
    </Stack>
  );
};

const ObjectOptionsRightPanelName: RightPanelNameComponent = () => {
  const selectedObjects = useLabelEditorState((s) => s.selectedObjects);
  if (!selectedObjects) return <></>;

  if (selectedObjects.length === 0) {
    return <Trans>Object options</Trans>;
  }

  if (selectedObjects.length > 1 || 'group' in (selectedObjects[0] || {})) {
    return <Trans>Object options</Trans>;
  }

  const object = selectedObjects[0];
  const component = LabelEditorObjectsMap[object.type as string];

  return (
    <>
      {component.name} <Trans>options</Trans>
    </>
  );
};

const ObjectOptionsRightPanel: RightPanelComponent = () => {
  const selectedObjects = useLabelEditorState((s) => s.selectedObjects);
  const [activePanels, setActivePanels] = useState<string[]>([]);

  const component = useMemo(() => {
    if (selectedObjects?.length !== 1) return null;
    if ('group' in selectedObjects[0]) return null;

    const object = selectedObjects[0];
    return LabelEditorObjectsMap[object.type as string];
  }, [selectedObjects]);

  useEffect(() => {
    if (!component) return;
    setActivePanels([]); // fix bug where the first panel is not opened sometimes
    setActivePanels(component.defaultOpen);
  }, [component]);

  let error = null;
  if (!selectedObjects) return <></>;

  if (selectedObjects.length === 0) {
    error = <Trans>No objects selected</Trans>;
  }

  if (selectedObjects.length > 1 || 'group' in (selectedObjects[0] || {})) {
    error = (
      <Trans>Multiple objects selected, which is not supported currently</Trans>
    );
  }

  if (error || component === null) {
    return (
      <Container mt={10}>
        <Text italic>{error}</Text>
      </Container>
    );
  }

  return (
    <Stack>
      <Accordion
        value={activePanels}
        onChange={setActivePanels}
        styles={{
          control: {
            paddingLeft: 10
          },
          label: {
            paddingTop: '8px',
            paddingBottom: '8px',
            fontWeight: 600,
            fontSize: 18
          },
          content: {
            paddingLeft: 10,
            paddingRight: 10
          }
        }}
        multiple
      >
        {component.settingBlocks.map((block) => (
          <Accordion.Item key={block.key} value={block.key}>
            <Accordion.Control>{block.name}</Accordion.Control>
            <Accordion.Panel pb={10}>
              <block.component />
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Stack>
  );
};

const panels: RightPanelType[] = [
  {
    key: 'document',
    name: t`Document`,
    icon: IconFileBarcode,
    panel: DocumentRightPanel
  },
  {
    key: 'objects',
    name: t`Objects`,
    icon: IconStack2,
    panel: ObjectsRightPanel
  },
  {
    key: 'object-options',
    name: ObjectOptionsRightPanelName,
    icon: IconLayoutCards,
    panel: ObjectOptionsRightPanel,
    requiresSelection: true,
  }
];
export type RightPanelKeyType = 'document' | 'objects' | 'object-options';

export function RightPanel() {
  const [activePanel, setActivePanel] = useState<RightPanelKeyType>(
    panels[0].key as RightPanelKeyType
  );
  const labelEditorStore = useLabelEditorStore();
  const selectedObjects = useLabelEditorState((s) => s.selectedObjects.length);

  useEffect(() => {
    labelEditorStore.setState({ setRightPanel: setActivePanel });
  }, [setActivePanel]);

  return (
    <div style={{ width: '300px', minWidth: '300px', display: 'flex' }}>
      <Tabs
        orientation="vertical"
        value={activePanel}
        onTabChange={setActivePanel as (panel: string) => void}
        placement="right"
        style={{ flex: 1, display: 'flex' }}
        styles={(theme) => ({
          tab: {
            '&[data-object-specific]': {
              backgroundColor: theme.colors.blue[0],
            },
          }
        })}
      >
        <Tabs.List>
          {panels.filter(panel => panel.requiresSelection ? selectedObjects > 0 : true).map((panel) => (
            <Tooltip
              label={
                typeof panel.name === 'function' ? <panel.name /> : panel.name
              }
              key={panel.key}
              position="left"
            >
              <Tabs.Tab
                key={panel.key}
                value={panel.key}
                icon={<panel.icon size="1.25rem" style={{ margin: '-4px' }} />}
                data-object-specific={panel.requiresSelection}
              />
            </Tooltip>
          ))}
        </Tabs.List>

        {panels.filter(panel => panel.requiresSelection ? selectedObjects > 0 : true).map((panel) => (
          <Tabs.Panel
            key={panel.key}
            value={panel.key}
            style={
              activePanel === panel.key
                ? {
                  display: 'flex',
                  flex: '1',
                  flexDirection: 'column',
                  width: '100%',
                  height: '100%'
                }
                : {}
            }
          >
            <Title order={3} pl={10} pt={7}>
              {typeof panel.name === 'function' ? <panel.name /> : panel.name}
            </Title>
            <Divider mt={2} />
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  overflowY: 'auto',
                  height: '100%',
                  width: '100%'
                }}
              >
                <panel.panel />
              </div>
            </div>
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}
