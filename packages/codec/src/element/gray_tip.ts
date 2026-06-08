/**
 * GrayTipElement codec — QQ system notification messages (灰条消息).
 *
 * subType=17: action interactions (poke, red packet, etc.)
 * More subTypes will be added as they are observed.
 */

import type { ProtoDecodeStructType, ProtoEncodeStructType } from '../core';
import { ElementWire } from '../proto/msg/common/element';
import {
  ElementType,
  type GrayTipElement,
  type ActionUser,
  type ActionAttr,
  type ElementWireField,
} from './types';

export const necessaryFields: readonly ElementWireField[] = [];

export function fromWire(wire: ProtoDecodeStructType<typeof ElementWire>): GrayTipElement {
  const actionInitiator: ActionUser = {
    uid: wire.actionInitiator?.uid ?? '',
    nickname: wire.actionInitiator?.nickname ?? '',
  };

  const actionTarget: ActionUser = {
    uid: wire.actionTarget?.uid ?? '',
    nickname: wire.actionTarget?.nickname ?? '',
  };

  const attributes: ActionAttr[] = (wire.actionAttributes ?? []).map(attr => ({
    key: attr.key ?? '',
    value: attr.value ?? '',
  }));

  return {
    kind: 'grayTip',
    elementId: wire.elementId ?? 0n,
    isSender: wire.isSender,
    subType: wire.subType,
    actionInitiator,
    actionTarget,
    actionId: wire.actionId ?? 0,
    detailedId: wire.detailedId ?? 0,
    typeFlag: wire.typeFlag ?? 0,
    xmlContent: wire.grayTipXmlContent ?? '',
    businessId: wire.businessId ?? 0,
    actionUniqueId: wire.actionUniqueId ?? 0,
    attributes,
    tipJson: wire.tipJson ?? '',
    tipType: wire.tipType ?? 0,
  };
}

export function toWire(el: GrayTipElement): ProtoEncodeStructType<typeof ElementWire> {
  return {
    elementId: el.elementId,
    elementType: ElementType.GRAY_TIP,
    isSender: el.isSender,
    subType: el.subType,
    actionInitiator: {
      uid: el.actionInitiator.uid,
      nickname: el.actionInitiator.nickname,
    },
    actionTarget: {
      uid: el.actionTarget.uid,
      nickname: el.actionTarget.nickname,
    },
    actionId: el.actionId,
    detailedId: el.detailedId,
    typeFlag: el.typeFlag,
    grayTipXmlContent: el.xmlContent,
    businessId: el.businessId,
    actionUniqueId: el.actionUniqueId,
    actionAttributes: el.attributes.map(attr => ({
      key: attr.key,
      value: attr.value,
    })),
    tipJson: el.tipJson,
    tipType: el.tipType,
  };
}
