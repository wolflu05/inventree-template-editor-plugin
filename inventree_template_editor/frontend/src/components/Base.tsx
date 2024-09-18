import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { MantineProvider } from "@mantine/core";
import { GetFeatureFunctionParams } from "../types/InvenTree";
i18n.activate("en");

export const Base = ({ children, params }: { children: React.ReactElement, params: GetFeatureFunctionParams }) => {
  return (
    <I18nProvider i18n={i18n}>
      <MantineProvider theme={params.inventreeContext.theme} forceColorScheme={params.inventreeContext.colorScheme} getRootElement={() => params.featureContext.ref}>
        {children}
      </MantineProvider>
    </I18nProvider>
  )
}