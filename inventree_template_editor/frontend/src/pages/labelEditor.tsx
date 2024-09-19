import { render as preact_render } from "preact";
import { useEffect, useRef } from "preact/hooks";

import { Base } from "../components/Base";
import { LabelEditorComponentE } from "../components/LabelEditor";
import { GetAndSetCodeHandlers, GetFeatureFunctionParams, GetFeatureFunctionType } from "../types/InvenTree";

const App = ({ params }: { params: GetFeatureFunctionParams }) => {
  const {
    featureContext: { template, registerHandlers },
  } = params;
  const editorRef = useRef<GetAndSetCodeHandlers>();
  const hasRegisteredRef = useRef(false);

  useEffect(() => {
    if (editorRef.current === undefined || hasRegisteredRef.current) return;

    registerHandlers({
      setCode: (code: string) => {
        editorRef.current!.setCode(code);
      },
      getCode: () => editorRef.current!.getCode(),
    });
    hasRegisteredRef.current = true;
  }, [editorRef.current]);

  return (
    <Base params={params}>
      <LabelEditorComponentE template={template} ref={editorRef as any} />
    </Base>
  );
};

export const getFeature: GetFeatureFunctionType = (params) => {
  preact_render(<App params={params} />, params.featureContext.ref);
};
