/**
 * Shared protobuf element schemas — the small bricks that messages compose from.
 *
 * Every message-body schema (group / c2c) ends up referencing these. Field tag
 * numbers come from the QQ NT wire format (cross-referenced with NapCat).
 *
 * Add new element types here, then plug them into MsgBodyElem below.
 *
 * Convention:
 *  - All fields are `optional: true` unless you've confirmed they're always
 *    present in real data. QQ frequently omits "0" defaults.
 *  - Unknown fields you've seen but don't understand should still be declared
 *    with a placeholder name like `unknown_<tag>` so round-tripping preserves
 *    them. Mark them `inElement: false` plus a `default` value so serialize
 *    can fill them back. See ../../README.md for the rationale.
 */

import { ProtoField, ScalarType } from '../../core';

export const Text = {
  str: ProtoField(1, ScalarType.STRING, { optional: true }),
  link: ProtoField(2, ScalarType.STRING, { optional: true }),
  attr6Buf: ProtoField(3, ScalarType.BYTES, { optional: true }),
  attr7Buf: ProtoField(4, ScalarType.BYTES, { optional: true }),
  buf: ProtoField(11, ScalarType.BYTES, { optional: true }),
  pbReserve: ProtoField(12, ScalarType.BYTES, { optional: true }),
};

export const Face = {
  index: ProtoField(1, ScalarType.INT32, { optional: true }),
  old: ProtoField(2, ScalarType.BYTES, { optional: true }),
  buf: ProtoField(11, ScalarType.BYTES, { optional: true }),
};

export const NotOnlineImage = {
  filePath: ProtoField(1, ScalarType.STRING, { optional: true }),
  fileLen: ProtoField(2, ScalarType.UINT32, { optional: true }),
  downloadPath: ProtoField(3, ScalarType.STRING, { optional: true }),
  oldVerSendFile: ProtoField(4, ScalarType.BYTES, { optional: true }),
  imgType: ProtoField(5, ScalarType.INT32, { optional: true }),
  picMd5: ProtoField(7, ScalarType.BYTES, { optional: true }),
  picHeight: ProtoField(8, ScalarType.UINT32, { optional: true }),
  picWidth: ProtoField(9, ScalarType.UINT32, { optional: true }),
  resId: ProtoField(10, ScalarType.STRING, { optional: true }),
  origUrl: ProtoField(15, ScalarType.STRING, { optional: true }),
  bizType: ProtoField(16, ScalarType.INT32, { optional: true }),
  bigUrl: ProtoField(14, ScalarType.STRING, { optional: true }),
};

/**
 * MsgBody element variant — exactly one of these fields is set per Elem.
 * Add new variants here as you reverse-engineer them.
 */
export const Elem = {
  text: ProtoField(1, () => Text, { optional: true }),
  face: ProtoField(2, () => Face, { optional: true }),
  notOnlineImage: ProtoField(4, () => NotOnlineImage, { optional: true }),
  // TODO(reverse-engineering):
  //   - tag 6  marketFace
  //   - tag 8  customFace
  //   - tag 19 videoFile
  //   - tag 51 lightAppElem
  //   - tag 53 commonElem
};
