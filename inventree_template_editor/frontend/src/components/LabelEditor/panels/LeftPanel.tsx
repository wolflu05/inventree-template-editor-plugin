import { ActionIcon, Stack, Tooltip } from "@mantine/core";
import { FabricObject } from "fabric";
import { useCallback } from "react";

import { useLabelEditorState, useLabelEditorStore } from "../LabelEditorContext";
import { LabelEditorObject, LabelEditorObjects } from "../objects";
import { CustomFabricObject } from "../objects/_BaseObject";
import { snapGrid } from "../utils";

export function LeftPanel() {
  const editor = useLabelEditorState((s) => s.editor);
  const labelEditorStore = useLabelEditorStore();

  const addComponent = useCallback(
    (component: LabelEditorObject) => () => {
      if (!editor) return;

      const state = labelEditorStore.getState();

      const snap = (n: number) => {
        return snapGrid(n, state.pageSettings.grid["size.size"], state.pageSettings.grid["size.unit"]);
      };

      const width = snap(component.initialWidth ?? 50);
      const height = snap(component.initialHeight ?? 50);

      const obj = new component.fabricElement({
        left: snap((state.pageWidth - width) / 2),
        top: snap((state.pageHeight - height) / 2),
        width,
        height,
        state,
      });

      editor.canvas.add(obj);

      // get the next name for the object
      let nextNum = 0;
      editor.canvas.getObjects().forEach((o: FabricObject) => {
        if (o.type === obj.type) {
          // calculate the next free number for this element
          const num = ((o as unknown as CustomFabricObject).name || "").match(/\((\d+)\)/);
          if (num) {
            nextNum = Math.max(nextNum, parseInt(num[1], 10) + 1);
          }
        }
      });

      obj.name = `${obj.type} (${nextNum})`;
      editor.canvas.fire("object:modified", { target: obj });

      editor.canvas.setActiveObject(obj);
      state.setRightPanel?.("object-options");
    },
    [editor],
  );

  return (
    <Stack p={4}>
      {LabelEditorObjects.map((component) => (
        <Tooltip label={component.name()} key={component.key} position="right">
          <ActionIcon onClick={addComponent(component)} variant="light">
            <component.icon size={"1.25rem"} />
          </ActionIcon>
        </Tooltip>
      ))}
    </Stack>
  );
}
