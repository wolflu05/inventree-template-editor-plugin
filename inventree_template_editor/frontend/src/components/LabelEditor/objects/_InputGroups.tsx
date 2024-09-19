import { t } from "@lingui/macro";
import {
  IconAngle,
  IconArrowsRightDown,
  IconBorderOuter,
  IconDimensions,
  IconPalette,
  IconTag,
} from "@tabler/icons-react";
import { FabricObject, CanvasEvents } from "fabric";
import { useEffect, useMemo } from "react";

import { useEvents } from "../../../hooks/useEvents";
import { useLabelEditorState } from "../LabelEditorContext";
import { InputGroup, UseInputGroupProps, unitInputGroupBlur, useInputGroupState } from "../panels/Components";
import { pixelToUnit, unitToPixel } from "../utils";

type UseObjectInputGroupStateProps<T extends any[]> = {
  unitKey?: string;
  valueKeys?: string[];
  connectionUnitKey?: string;
  connections: {
    objAttr: string;
    inputKey: string;
  }[];
  triggerUpdateEvents?: (keyof CanvasEvents)[];
  beforeCanvasUpdate?: (values: Record<string, any>, obj: FabricObject) => void;
  afterCanvasUpdate?: (values: Record<string, any>, obj: FabricObject) => void;
} & UseInputGroupProps<T>;

export const useObjectInputGroupState = <T extends any[]>(props: UseObjectInputGroupStateProps<T>) => {
  const [selectedObjects, editor] = useLabelEditorState((s) => [s.selectedObjects, s.editor]);

  const onBlur = useMemo(() => {
    if (props.unitKey) {
      return unitInputGroupBlur({
        unitKey: props.unitKey,
        valueKeys: props.valueKeys || [],
      });
    }
    return undefined;
  }, [props.unitKey, props.valueKeys]);

  const inputState = useInputGroupState({
    ...props,
    onBlur,
    updateCanvas: (values) => {
      if (selectedObjects?.length !== 1) return;
      const obj = selectedObjects[0];

      props.beforeCanvasUpdate?.(values, obj);

      for (const { objAttr, inputKey } of props.connections) {
        let value = values[inputKey];
        if (props.unitKey && props.valueKeys && props.valueKeys.includes(inputKey)) {
          value = unitToPixel(value, values[props.unitKey]);
        }

        obj.set({ [objAttr]: value });
      }

      if (props.unitKey && props.connectionUnitKey) {
        // @ts-expect-error - this is fine
        obj[props.connectionUnitKey] = values[props.unitKey];
      }

      props.afterCanvasUpdate?.(values, obj);

      editor?.canvas.fire("object:modified", { target: obj });
      editor?.canvas.requestRenderAll();
    },
    updateInputs: (obj: FabricObject) => {
      // @ts-expect-error - this is fine
      const unit = obj[props.connectionUnitKey];

      for (const { objAttr, inputKey } of props.connections) {
        // @ts-expect-error - this is fine
        let value = obj[objAttr];
        if (props.unitKey && props.valueKeys && props.valueKeys.includes(inputKey) && unit) {
          value = pixelToUnit(value || 0, unit);
        }

        inputState.setValue(inputKey, value);
      }

      if (props.unitKey && unit) {
        inputState.setValue(props.unitKey, unit);
      }
    },
  });

  useEvents(
    editor?.canvas,
    (on) => {
      for (const event of props.triggerUpdateEvents || []) {
        on(event, (e) => inputState.triggerUpdate((e as any).target as FabricObject));
      }
    },
    [editor],
  );

  useEffect(() => {
    if (selectedObjects?.length === 1) {
      inputState.triggerUpdate(selectedObjects[0]);
    }
  }, [selectedObjects]);

  return inputState;
};

export const NameInputGroup = () => {
  const name = useObjectInputGroupState({
    name: t`Name`,
    icon: IconTag,
    connections: [{ objAttr: "name", inputKey: "name.name" }],
    inputRows: [
      {
        key: "name",
        columns: [{ key: "name", type: "text" }],
      },
    ],
    triggerUpdateEvents: ["object:modified"],
  });

  return <InputGroup state={name} />;
};

export const PositionInputGroup = () => {
  const position = useObjectInputGroupState({
    name: t`Position`,
    icon: IconArrowsRightDown,
    unitKey: "position.unit",
    valueKeys: ["position.x", "position.y"],
    connectionUnitKey: "positionUnit",
    connections: [
      { objAttr: "left", inputKey: "position.x" },
      { objAttr: "top", inputKey: "position.y" },
    ],
    inputRows: [
      {
        key: "position",
        columns: [
          { key: "x", label: "X", type: "number" },
          { key: "y", label: "Y", type: "number" },
          { key: "unit", template: "unit" },
        ],
      },
    ],
    triggerUpdateEvents: ["object:moving", "object:added", "object:scaling"],
  });

  return <InputGroup state={position} />;
};

export const SizeInputGroup = () => {
  const size = useObjectInputGroupState({
    name: t`Size`,
    icon: IconDimensions,
    unitKey: "size.unit",
    valueKeys: ["size.width", "size.height"],
    connectionUnitKey: "sizeUnit",
    connections: [
      { objAttr: "width", inputKey: "size.width" },
      { objAttr: "height", inputKey: "size.height" },
    ],
    inputRows: [
      {
        key: "size",
        columns: [
          { key: "width", label: t`Width`, type: "number" },
          { key: "height", label: t`Height`, type: "number" },
          { key: "unit", template: "unit" },
        ],
      },
    ],
    triggerUpdateEvents: ["object:scaling", "object:added", "object:modified"],
  });

  return <InputGroup state={size} />;
};

export const AngleInputGroup = () => {
  const angle = useObjectInputGroupState({
    name: t`Angle`,
    icon: IconAngle,
    connections: [{ objAttr: "angle", inputKey: "angle.value" }],
    inputRows: [
      {
        key: "angle",
        columns: [{ key: "value", label: t`Angle [°]`, type: "number" }],
      },
    ],
    triggerUpdateEvents: ["object:rotating", "object:added"],
  });

  return <InputGroup state={angle} />;
};

export const ColorInputGroup = ({ name, attr }: { name?: string; attr?: string }) => {
  const backgroundColor = useObjectInputGroupState({
    name: name ?? t`Color`,
    icon: IconPalette,
    connections: [{ objAttr: attr ?? "fill", inputKey: "color.value" }],
    inputRows: [
      {
        key: "color",
        columns: [{ key: "value", type: "color" }],
      },
    ],
    triggerUpdateEvents: ["object:modified"],
  });

  return <InputGroup state={backgroundColor} />;
};

export const BorderStyleInputGroup = ({ name }: { name?: string }) => {
  const borderStyle = useObjectInputGroupState({
    name: name ?? t`Border Style`,
    icon: IconBorderOuter,
    unitKey: "width.unit",
    valueKeys: ["width.value"],
    connectionUnitKey: "strokeWidthUnit",
    connections: [
      { objAttr: "stroke", inputKey: "color.value" },
      { objAttr: "strokeWidth", inputKey: "width.value" },
    ],
    inputRows: [
      {
        key: "color",
        columns: [{ key: "value", type: "color", defaultValue: "#000000" }],
      },
      {
        key: "width",
        columns: [
          { key: "value", type: "number", label: t`Width`, defaultValue: 1 },
          { key: "unit", template: "unit" },
        ],
      },
    ],
    triggerUpdateEvents: ["object:modified"],
  });

  return <InputGroup state={borderStyle} />;
};
