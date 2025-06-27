import os

from rest_framework.request import Request

from plugin import InvenTreePlugin
from plugin.mixins import UserInterfaceMixin

from .version import TEMPLATE_EDITOR_PLUGIN_VERSION


class InvenTreeTemplateEditorPlugin(InvenTreePlugin, UserInterfaceMixin):
    AUTHOR = "wolflu05"
    DESCRIPTION = "InvenTree template editor plugin"
    VERSION = TEMPLATE_EDITOR_PLUGIN_VERSION

    # UI Plugins were added with inventree 0.17.0
    # Interface was updated in 0.18.0
    MIN_VERSION = "0.18.0"

    TITLE = "InvenTree Template Editor Plugin"
    SLUG = "inventree-template-editor-plugin"
    NAME = "InvenTreeTemplateEditorPlugin"

    def get_ui_template_editors(self, request: Request, context, **kwargs):
        if context.get('template_type') != 'labeltemplate':
            return []

        return [
            {
                "key": "label-designer",
                "title": "Label Designer",
                "icon": "ti:tools:outline",
                "source": self.plugin_static_file(
                    "labelEditor.dev.js" if os.environ.get('INVENTREE_TEMPLATE_EDITOR_DEV', False) else "dist/labelEditor.js"
                ),
            }
        ]
