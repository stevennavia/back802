export const MAP = {
  width: 4,
  depth: 28,
  height: 3,
};

export const BOUNDS = {
  left: -2,
  right: 2,
  top: -14,
  bottom: 14,
};

export const DOOR = {
  width: 1.3,
  height: 2.4,
  thickness: 0.05,
  frameDepth: 0.1,
  frameWidth: 0.08,
};

export const ELEVATOR = {
  width: 1.4,
  height: 2.5,
  thickness: 0.05,
};

export const LEFT_DOORS = {
  810: -12.2,
  809: -9.3,
  808: -4.3,
  807: 0.6,
  806: 3.4,
  805: 7.2,
  804: 10.0,
};

export const RIGHT_OFFICE_DOORS = {
  802: 12.8,
  801: 10.0,
  812: -11.8,
};

export const ELECTRICAL_Z = {
  upper: -8.4,
  lower: 7.2,
};

export const TOP_DOOR = { num: 811, x: -0.5, z: -14 };
export const BOTTOM_DOOR = { num: 803, x: -0.5, z: 14 };

export const ELEVATOR_CORE = {
  openingZMin: -5.5,
  openingZMax: 5.5,
  farX: 3,
  nearX: 2,
  elements: {
    escapeTop: -4.5,
    elevator1: -2.2,
    elevator2: 0.0,
    elevator3: 2.2,
    escapeBottom: 4.5,
  },
};

export const ELEVATOR_CABIN = {
  depth: 1.5,
  height: 2.5,
};

export const COLORS = {
  wall: 0xf0f0f0,
  wallTrim: 0xe8e8e8,
  floor: 0xa8a098,
  ceiling: 0xe0ddd8,
  doorFrame: 0xc0c0c0,
  doorGlass: 0xadd8e6,
  handle: 0x999999,
  elevatorDoor: 0x3a3a3a,
  elevatorFrame: 0x2a2a2a,
  elevatorIndent: 0x1a1a1a,
  lightFixture: 0xcccccc,
  lightEmissive: 0xd8e8ff,
  exitSign: 0x00cc66,
  electricalDoor: 0xccaa22,
  electricalSign: 0xccaa22,
  escapeDoor: 0x882222,
  officeGreen: 0x2d6a4f,
  office802Highlight: 0x40916c,
  camBody: 0x555555,
  camLens: 0x111111,
  detector: 0xeeeeee,
};

export const PLAYER = {
  height: 1.7,
  radius: 0.25,
  walkSpeed: 3.0,
  runSpeed: 5.0,
  mouseSensitivity: 0.001,
};

export const PUZZLE = {
  colors: [null, 0xcc3333, 0x3355cc, 0xccaa33],
  solution: {
    810: 3,
    809: 0,
    808: 0,
    807: 1,
    806: 0,
    805: 0,
    804: 1,
    812: 1,
    electrical_upper: 1,
    escape_top: 0,
    escape_bottom: 3,
    electrical_lower: 0,
    801: 1,
    802: 3,
  },
};

export const LIGHTS_OUT_DURATION = 15;
export const DIZZY_DURATION = 20;
