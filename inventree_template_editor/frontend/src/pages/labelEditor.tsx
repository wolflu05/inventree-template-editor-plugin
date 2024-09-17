import { render as preact_render } from 'preact'
import { LabelEditorComponentE } from "../components/LabelEditor";
import { Base } from "../components/Base";
import { useEffect, useRef } from "preact/hooks";
import { EditorRef, TemplateEditorRenderContextType } from "../types/InvenTree";

const App = ({ renderContext }: { renderContext: TemplateEditorRenderContextType }) => {
  const { template, registerHandlers } = renderContext;
  const editorRef = useRef<EditorRef>();
  const hasRegisteredRef = useRef(false);

  useEffect(() => {
    if (editorRef.current === undefined || hasRegisteredRef.current) return;

    registerHandlers({
      setCode: (code: string) => {
        editorRef.current!.setCode(code);
      },
      getCode: () => editorRef.current!.getCode()
    });
    hasRegisteredRef.current = true;
  }, [editorRef.current]);

  return (
    <Base>
      <LabelEditorComponentE template={template} ref={editorRef as any} />
    </Base>
  )
}

export const getFeature = (ref: HTMLDivElement, { renderContext }: { renderContext: TemplateEditorRenderContextType }) => {
  preact_render(<App renderContext={renderContext} />, ref);
}
