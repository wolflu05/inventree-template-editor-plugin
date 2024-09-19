import { Canvas } from "fabric";
import { useEffect, useMemo, useRef, useState } from "react";

export interface Props {
  className?: string;
  onReady?: (canvas: Canvas) => void;
}

export const FabricJSCanvas = ({ className, onReady }: Props) => {
  const canvasEl = useRef();
  const canvasElParent = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = new Canvas(canvasEl.current);
    const setCurrentDimensions = () => {
      canvas.setDimensions({
        width: canvasElParent.current?.clientWidth || 0,
        height: canvasElParent.current?.clientHeight || 0,
      });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={canvasElParent} className={className}>
      <canvas ref={canvasEl as any} />
    </div>
  );
};

export const useFabricJSEditor = (): FabricJSEditorHook => {
  const [canvas, setCanvas] = useState<null | Canvas>(null);

  const editor = useMemo(() => (canvas ? { canvas } : undefined), [canvas]);

  return {
    onReady: (canvasReady: Canvas): void => {
      setCanvas(canvasReady);
    },
    editor,
  };
};

export interface FabricJSEditor {
  canvas: Canvas;
}

export interface FabricJSEditorHook {
  editor?: FabricJSEditor;
  onReady: (canvas: Canvas) => void;
}
