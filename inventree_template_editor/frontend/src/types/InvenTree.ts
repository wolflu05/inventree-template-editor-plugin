// These types are currently copied from the InvenTree source code until they are moved to a shared package.

export type TemplateI = {
  width: number;
  height: number;
};

export type GetAndSetCodeHandlers = {
  setCode: (code: string) => void;
  getCode: () => string;
};

export type BaseUIFeature = {
  featureType: string;
  requestContext: Record<string, any>;
  responseOptions: Record<string, any>;
  featureContext: Record<string, any>;
  renderReturnType: any;
};

export type PluginUIGetFeatureType<T extends BaseUIFeature> = (params: {
  featureContext: T["featureContext"];
  inventreeContext: any;
}) => T["renderReturnType"];

export type TemplateEditorUIFeature = {
  featureType: "template_editor";
  requestContext: {
    template_type: string;
    template_model: string;
  };
  responseOptions: {
    key: string;
    title: string;
    icon: string;
  };
  featureContext: {
    ref: HTMLDivElement;
    registerHandlers: (handlers: { setCode: (code: string) => void; getCode: () => string }) => void;
    template: TemplateI;
  };
  renderReturnType: void;
};

export type GetFeatureFunctionType = PluginUIGetFeatureType<TemplateEditorUIFeature>;
export type GetFeatureFunctionParams = Parameters<PluginUIGetFeatureType<BaseUIFeature>>[0];

type EditorProps = {
  template: TemplateI;
};
type EditorRef = {
  setCode: (code: string) => void | Promise<void>;
  getCode: () => (string | undefined) | Promise<string | undefined>;
};
export type EditorComponent = React.ForwardRefExoticComponent<EditorProps & React.RefAttributes<EditorRef>>;
