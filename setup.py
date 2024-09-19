# -*- coding: utf-8 -*-

import setuptools

from inventree_template_editor.version import TEMPLATE_EDITOR_PLUGIN_VERSION

with open('README.md', encoding='utf-8') as f:
    long_description = f.read()


setuptools.setup(
    name="inventree-template-editor-plugin",

    version=TEMPLATE_EDITOR_PLUGIN_VERSION,

    author="wolflu05",

    author_email="76838159+wolflu05@users.noreply.github.com",

    description="A visual editor to build InvenTree label templates.",

    long_description=long_description,

    long_description_content_type='text/markdown',

    keywords="inventree template editor label",

    url="https://github.com/wolflu05/inventree-template-editor-plugin",

    license="GPL3+",

    packages=setuptools.find_packages(),

    install_requires=[],

    setup_requires=[
        "wheel",
        "twine",
    ],

    python_requires=">=3.9",

    entry_points={
        "inventree_plugins": [
            "InvenTreeTemplateEditorPlugin = inventree_template_editor.InvenTreeTemplateEditorPlugin:InvenTreeTemplateEditorPlugin"
        ]
    },

    include_package_data=True,
)
