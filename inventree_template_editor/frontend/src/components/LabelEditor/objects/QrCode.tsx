import { t } from "@lingui/macro";
import { Stack } from "@mantine/core";
import { IconBoxMargin, IconDimensions, IconQrcode } from "@tabler/icons-react";
import { FabricObject, util } from "fabric";
import QRCodeSVG from "qrcode-svg";

import { PageSettingsType } from "../LabelEditorContext";
import { InputGroup } from "../panels/Components";
import { unitToPixel } from "../utils";
import { GeneralSettingBlock, buildStyle, getCustomFabricBaseObject, styleHelper } from "./_BaseObject";
import { AngleInputGroup, ColorInputGroup, PositionInputGroup, useObjectInputGroupState } from "./_InputGroups";

import { LabelEditorObject } from ".";

const QrSizeInputGroup = () => {
  const size = useObjectInputGroupState({
    name: t`Size`,
    icon: IconDimensions,
    unitKey: "size.unit",
    valueKeys: ["size.value"],
    connectionUnitKey: "sizeUnit",
    connections: [{ objAttr: "size", inputKey: "size.value" }],
    inputRows: [
      {
        key: "size",
        columns: [
          { key: "value", label: t`Size`, type: "number" },
          { key: "unit", template: "unit" },
        ],
      },
    ],
    triggerUpdateEvents: ["object:scaling", "object:added", "object:modified"],
  });

  return <InputGroup state={size} />;
};

const QrCodeDataInputGroup = () => {
  const circleRadius = useObjectInputGroupState({
    name: t`QR Data`,
    icon: IconQrcode,
    connections: [{ objAttr: "data", inputKey: "data.value" }],
    inputRows: [
      {
        key: "data",
        columns: [
          {
            key: "value",
            type: "text",
            tooltip: t`'qr_data' will be replaced with the qr data for the label item.`,
          },
        ],
      },
    ],
    triggerUpdateEvents: ["object:modified"],
  });

  return <InputGroup state={circleRadius} />;
};

const QrCodeBorderInputGroup = () => {
  const border = useObjectInputGroupState({
    name: t`Border`,
    icon: IconBoxMargin,
    connections: [{ objAttr: "border", inputKey: "border.value" }],
    inputRows: [
      {
        key: "border",
        columns: [
          {
            key: "value",
            label: t`Border`,
            type: "number",
            tooltip: t`The border around the QR code in blocks`,
          },
        ],
      },
    ],
    triggerUpdateEvents: ["object:scaling", "object:added", "object:modified"],
  });

  return <InputGroup state={border} />;
};

// inspired by https://medium.com/@andras.tovishati/how-to-create-qr-code-object-type-in-fabric-js-e99b84e8d6c5
class QrCodeObject extends getCustomFabricBaseObject(FabricObject, ["data", "border", "box_size"]) {
  static type = "qrcode";

  data: string;
  size: number;
  strokeWidth: number;
  stroke: string;
  fill: string;
  border: number;
  box_size: number;

  private path: any[] = [];

  constructor(props: any) {
    super(props);

    this.data = props.data ?? "qr_data";
    this.size = props.size ?? 40;
    this.strokeWidth = props.strokeWidth ?? 0;
    this.stroke = props.stroke ?? "#000000";
    this.fill = props.fill ?? "#ffffff";
    this.border = props.border ?? 0;
    this.box_size = props.box_size ?? 20;
    this.width = this.size;
    this.height = this.size;

    // scaling to the right does not work properly
    this.setControlsVisibility({
      ml: false,
      mr: false,
      mt: false,
      mb: false,
    });

    this._createPathData();
  }

  // limit scaling so that the qr code is always a multiple of the QR grid size
  getGridSize(settings: PageSettingsType) {
    const gridSize = unitToPixel(settings.grid["size.size"], settings.grid["size.unit"]) * (21 + this.border * 2);

    return gridSize;
  }

  _createPathData() {
    const qr = new QRCodeSVG({
      content: this.data ?? "A",
      padding: this.border ?? 0,
      width: this.size ?? 40,
      height: this.size ?? 40,
      color: this.stroke ?? "#000000",
      background: this.fill ?? "#ffffff",
      ecl: "L",
      join: true,
    });
    const svg = qr.svg();
    const match = svg.match(/<path[^>]*?d=(["'])?((?:.(?!\1|>))*.?)\1?/);
    const path = match ? match[2] : "";
    this.path = util.makePathSimpler(util.parsePath(path));
    this.dirty = true;
    return this;
  }

  _set(key: string, value: any) {
    super._set(key, value);
    switch (key) {
      case "data":
      case "border":
        this._createPathData();
        break;
      case "size":
        if (value <= 0) value = 1;
        this.set({
          width: value,
          height: value,
        });
        this._createPathData();
        break;
      case "width":
        if (value <= 0) value = 1;
        this.height = value;
        this.size = value;
        this._createPathData();
        break;
      case "height":
        if (value <= 0) value = 1;
        this.size = value;
        this.width = value;
        this._createPathData();
        break;
      default:
        break;
    }
    return this;
  }

  _renderQRCode(ctx: CanvasRenderingContext2D) {
    let current,
      i,
      x = 0,
      y = 0;
    const w2 = this.width / 2,
      h2 = this.height / 2;
    ctx.beginPath();
    for (i = 0; i < this.path.length; i++) {
      current = this.path[i];
      x = current[1];
      y = current[2];
      switch (current[0]) {
        case "M":
          ctx.moveTo(x - w2, y - h2);
          break;
        case "L":
          ctx.lineTo(x - w2, y - h2);
          break;
        case "Z":
          ctx.closePath();
          break;
        default:
          break;
      }
    }
    ctx.save();
    ctx.fillStyle = this.stroke;
    ctx.fill();
    ctx.restore();
  }

  _renderBackground(ctx: CanvasRenderingContext2D) {
    const w = this.width;
    const h = this.height;
    const x = -(w / 2);
    const y = -(h / 2);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.save();
    ctx.fillStyle = this.fill;
    ctx.fill();
    ctx.restore();
  }

  _render(ctx: CanvasRenderingContext2D) {
    this._renderBackground(ctx);
    this._renderQRCode(ctx);
  }
}

export const QrCode: LabelEditorObject = {
  key: "qrcode",
  name: () => t`QR Code`,
  icon: IconQrcode,
  defaultOpen: ["general", "layout", "qr", "style"],
  settingBlocks: [
    GeneralSettingBlock,
    {
      key: "layout",
      name: () => t`Layout`,
      component: () => (
        <Stack>
          <PositionInputGroup />
          <AngleInputGroup />
          <QrSizeInputGroup />
        </Stack>
      ),
    },
    {
      key: "qr",
      name: () => t`QR options`,
      component: () => (
        <Stack>
          <QrCodeDataInputGroup />
          <QrCodeBorderInputGroup />
        </Stack>
      ),
    },
    {
      key: "style",
      name: () => t`Style`,
      component: () => (
        <Stack>
          <ColorInputGroup name={t`Fill color`} attr="stroke" />
          <ColorInputGroup name={t`Background color`} attr="fill" />
        </Stack>
      ),
    },
  ],
  fabricElement: QrCodeObject,
  export: {
    style: (object, id) => {
      return buildStyle(id, [
        ...styleHelper.position(object),
        ...styleHelper.size(object),
        ...styleHelper.rotation(object),
      ]);
    },
    content: (object, id) => {
      const attributes = {
        fill_color: `'${object.stroke}'`,
        back_color: `'${object.fill}'`,
        box_size: object.box_size,
        border: object.border,
      };
      const argsStr = Object.entries(attributes)
        .map(([key, value]) => `${key}=${value}`)
        .join(" ");

      return `<img id="${id}" src='{% qrcode ${object.data} ${argsStr} %}' />`;
    },
  },
};
