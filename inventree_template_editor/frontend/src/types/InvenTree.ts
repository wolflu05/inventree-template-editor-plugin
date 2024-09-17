// These types are currently copied from the InvenTree source code until they are moved to a shared package.

export type TemplateI = {
  width: number;
  height: number;
};

type EditorProps = {
  template: TemplateI;
};
type GetAndSetCodeHandlers = {
  setCode: (code: string) => void | Promise<void>;
  getCode: () => (string | undefined) | Promise<string | undefined>;
};
export type EditorRef = GetAndSetCodeHandlers;
export type EditorComponent = React.ForwardRefExoticComponent<
  EditorProps & React.RefAttributes<EditorRef>
>;

export type TemplateEditorRenderContextType = {
  registerHandlers: (params: GetAndSetCodeHandlers) => void;
  template: TemplateI;
};
