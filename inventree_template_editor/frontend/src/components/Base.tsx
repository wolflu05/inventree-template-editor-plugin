import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
i18n.activate("en");

export const Base = ({ children }: { children: React.ReactElement }) => {
  return (
    <I18nProvider i18n={i18n}>
      {children}
    </I18nProvider>
  )
}