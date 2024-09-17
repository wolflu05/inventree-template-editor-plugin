type Unit = {
  name: string;
  toPixel: (value: number, dpi: number) => number;
  fromPixel: (value: number, dpi: number) => number;
};

export const units: Record<string, Unit> = {
  px: {
    name: 'px',
    toPixel: (value) => value,
    fromPixel: (value) => value
  },
  mm: {
    name: 'mm',
    toPixel: (value, dpi) => (value / 25.4) * dpi,
    fromPixel: (value, dpi) => (value / dpi) * 25.4
  },
  cm: {
    name: 'cm',
    toPixel: (value, dpi) => (value / 2.54) * dpi,
    fromPixel: (value, dpi) => (value / dpi) * 2.54
  },
  in: {
    name: 'in',
    toPixel: (value, dpi) => value * dpi,
    fromPixel: (value, dpi) => value / dpi
  }
};

export type UnitName = keyof typeof units;

export const unitToPixel = (value: number, unit: UnitName) => {
  const DPI = 96;

  if (!value) return 0;

  return units[unit].toPixel(value, DPI);
};

export const pixelToUnit = (value: number, unit: UnitName) => {
  const DPI = 96;

  if (!value) return 0;

  return units[unit].fromPixel(value, DPI);
};

export const convertUnit = (value: number, from: UnitName, to: UnitName) => {
  return pixelToUnit(unitToPixel(value, from), to);
};
