import { render as preact_render } from 'preact'
import { LabelEditorComponentE } from "../components/LabelEditor";
import { Base } from "../components/Base";
import { useEffect, useRef } from "preact/hooks";
import { GetAndSetCodeHandlers, PluginUIGetFeatureType, TemplateEditorUIFeature } from "../types/InvenTree";

const App = ({ featureContext }: { featureContext: TemplateEditorUIFeature['featureContext'] }) => {
  const { template, registerHandlers } = featureContext;
  const editorRef = useRef<GetAndSetCodeHandlers>();
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

export const getFeature: PluginUIGetFeatureType<TemplateEditorUIFeature> = ({ featureContext }) => {
  preact_render(<App featureContext={featureContext} />, featureContext.ref);
}
