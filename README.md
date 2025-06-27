# inventree-template-editor-plugin

[![License: GPL3](https://img.shields.io/badge/License-GPLv3-yellow.svg)](https://opensource.org/license/gpl-3-0)
![CI](https://github.com/wolflu05/inventree-template-editor-plugin/actions/workflows/ci.yml/badge.svg)

A visual editor to quickly build InvenTree label templates.

![screenshot](https://github.com/user-attachments/assets/2879e1ac-7fd5-4008-a740-34438620fb2b)

## ⚙️ Installation

Install this plugin as follows:

1. Goto the Admin Center > Plugins > Plugin Settings and make sure to enable the "Enable interface integration" switch.

2. Click on "Install Plugin" at the top of the Plugins table on that page and enter `inventree-template-editor-plugin` as package name. Enable the "Confirm plugin installation" switch and click "Install".

3. Search for the plugin in the table and activate it

> [!IMPORTANT]
> At least InvenTree v0.18 is required to use this plugin.

## 🏃 Usage

Goto the Admin Center > Label Templates and create a new Label template. Click on it in the table and select the "Label Designer". Click on the shapes on the left bar to add them to the label canvas.

## 🧑‍💻 Development

1. Install as editable install to your inventree installation via `pip install -e /path/to/inventree-template-editor-plugin`
2. Enable the plugin
3. Install js dependencies via `cd inventree_template_editor/frontend && npm ci`
4. Enable the dev mode for the plugin to use the vite dev server (that you need to start via `npm run dev`) by setting the `INVENTREE_TEMPLATE_EDITOR_DEV=True` variable when running the inventree server.
5. Restart InvenTree and start vite dev server via `npm run dev`
