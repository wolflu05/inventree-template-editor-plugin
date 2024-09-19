from django.conf import settings
from django.utils.translation import gettext_lazy as _
from rest_framework.request import Request

from plugin import InvenTreePlugin
from plugin.mixins import UserInterfaceMixin
from plugin.base.ui.mixins import FeatureType, UIFeature
from plugin.templatetags.plugin_extras import plugin_static

from .version import TEMPLATE_EDITOR_PLUGIN_VERSION


class InvenTreeTemplateEditorPlugin(InvenTreePlugin, UserInterfaceMixin):
    AUTHOR = "wolflu05"
    DESCRIPTION = "InvenTree template editor plugin"
    VERSION = TEMPLATE_EDITOR_PLUGIN_VERSION

    # UI Plugins were added with inventree 0.17.0
    MIN_VERSION = "0.17.0"

    TITLE = "InvenTree Template Editor Plugin"
    SLUG = "inventree-template-editor-plugin"
    NAME = "InvenTreeTemplateEditorPlugin"

    def get_ui_features(self, feature_type: FeatureType, context: dict, request: Request) -> list[UIFeature]:
        if feature_type != "template_editor" or context.get("template_type", None) != "labeltemplate":
            return []

        is_dev = settings.CUSTOMIZE.get("inventree_template_editor_plugin_dev", False)

        return [
            {
                "feature_type": "template_editor",
                "options": {
                    "key": "label-designer",
                    "title": _("Label Designer"),
                    "icon": "build"
                },
                "source": plugin_static({}, "labelEditor.dev.js" if is_dev else "dist/labelEditor.js", plugin="inventree-template-editor-plugin"),
            }
        ]
