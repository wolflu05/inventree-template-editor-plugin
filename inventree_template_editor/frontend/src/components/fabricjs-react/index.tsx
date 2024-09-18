import { useEffect, useMemo, useRef, useState } from "react";
import { fabric } from "fabric";

export interface Props {
  className?: string;
  onReady?: (canvas: fabric.Canvas) => void;
}

export const FabricJSCanvas = ({ className, onReady }: Props) => {
  const canvasEl = useRef(null);
  const canvasElParent = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasEl.current);
    const setCurrentDimensions = () => {
      canvas.setHeight(canvasElParent.current?.clientHeight || 0);
      canvas.setWidth(canvasElParent.current?.clientWidth || 0);
      canvas.renderAll();
    };
    const resizeCanvas = () => {
      setCurrentDimensions();
    };
    setCurrentDimensions();

    window.addEventListener("resize", resizeCanvas, false);

    if (onReady) {
      onReady(canvas);
    }

    return () => {
      canvas.dispose();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div ref={canvasElParent} className={className}>
      <canvas ref={canvasEl} />
    </div>
  );
};

export const useFabricJSEditor = (): FabricJSEditorHook => {
  const [canvas, setCanvas] = useState<null | fabric.Canvas>(null);

  const editor = useMemo(
    () => canvas ? { canvas } : undefined,
    [canvas]
  );

  return {
    onReady: (canvasReady: fabric.Canvas): void => {
      setCanvas(canvasReady)
    },
    editor
  }
}

export interface FabricJSEditor {
  canvas: fabric.Canvas
}

export interface FabricJSEditorHook {
  editor?: FabricJSEditor;
  onReady: (canvas: fabric.Canvas) => void
}
