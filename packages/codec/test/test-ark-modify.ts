/**
 * 验证脚本:读取指定 ARK 元素,修改昵称,写回数据库
 *
 * 用法: pnpm tsx packages/codec/scripts/test-ark-modify.ts
 */

import { ProtoMsg } from '../src/core';
import { MsgBody } from '../src/proto/msg/common/body';
import { decodeElement, encodeElement } from '../src/element';
import type { ArkElement } from '../src/element';
import { loadNative } from '../../native/src/index';
import { QqDb } from '../../db/src/qq_db';

const DB_PATH = 'C:\\Users\\17078\\Documents\\Tencent Files\\1707889225\\nt_qq\\nt_db\\nt_msg.db';
const DB_KEY = '^;<kXZ;RI[@]yTD<';
const TABLE = 'c2c_msg_table';
const ROWID = '7650278907287505401';
const NEW_NICKNAME = '测试昵称改写';

const bodyCodec = new ProtoMsg(MsgBody);

async function main() {
  console.log('加载原生绑定...');
  const nt = loadNative().ntHelper;
  const db = new QqDb(nt, { dbPath: DB_PATH, key: DB_KEY });

  // 先查一下这行存不存在
  console.log('查询行是否存在...');
  const checkRows = await db.query(`SELECT rowid, "40001", "40800" FROM ${TABLE} WHERE rowid = ?`, [BigInt(ROWID)]);
  console.log(`查询结果: ${checkRows.length} 行`);
  if (checkRows.length > 0) {
    console.log('行内容:', checkRows[0]);
    console.log('40800 列:', checkRows[0]![2] ? `存在,${(checkRows[0]![2] as Uint8Array).length} 字节` : '为空');
  }

  if (checkRows.length === 0 || !checkRows[0]![2]) {
    throw new Error(`未找到 rowid=${ROWID} 或 40800 列为空`);
  }

  const blob = checkRows[0]![2] as Uint8Array;
  console.log(`读取到 ${blob.length} 字节`);

  // 解码 MsgBody → elements
  const decoded = bodyCodec.decode(blob);
  const elements = (decoded.elements ?? []).map(decodeElement);
  console.log(`解析到 ${elements.length} 个元素`);

  // 找到 ARK 元素
  const arkEl = elements.find(e => e.kind === 'ark') as ArkElement | undefined;
  if (!arkEl) {
    throw new Error('未找到 ARK 元素');
  }

  console.log('找到 ARK 元素');
  // const arkData = JSON.parse(arkEl.arkData);
  // const oldNickname = arkData.meta?.contact?.nickname;
  // console.log(`原昵称: "${oldNickname}"`);
  //
  // // 修改昵称
  // arkData.meta.contact.nickname = NEW_NICKNAME;
  // console.log(`新昵称: "${NEW_NICKNAME}"`);
  //
  // // 重新编码
  // arkEl.arkData = JSON.stringify(arkData);
  // console.log(arkEl.arkData);

  const writeData = {
    "app":"com.tencent.contact.lua",
    "desc":"",
    "view":"contact",
    "bizsrc":"cardshare.cardshare",
    "ver":"0.0.0.1",
    "prompt":"小南娘",
    "appID":"",
    "sourceName":"",
    "actionData":"",
    "actionData_A":"",
    "sourceUrl":"",
    "meta":{
      "contact":{
        "avatar":"http://thirdqq.qlogo.cn/g?b=oidb&k=xcA1qcMe28XF0WPMfGHI3A&kti=aitAHRHhVOA&s=140",
        "nickname":"小南娘",
        "contact":"账号：2890888215",
        "tag":"这是小南娘",
        "tagIcon":null,
        "jumpUrl":"mqqapi://card/show_pslcard?src_type=internal&source=sharecard&version=1&uin=2890888215"}
    },
    "config":{
      "autosize":0,
      "collect":1,
      "ctime":1781219357,
      "forward":0,
      "height":225,
      "reply":1,
      "round":1,
      "token":"25b9cb1629ef4fd41e025b68405d1095",
      "type":"normal",
      "width":526
    },
    "text":"",
    "extraApps":[],
    "sourceAd":"",
    "extra":""
  }

  arkEl.arkData = JSON.stringify(writeData);

  const newBodyBytes = bodyCodec.encode({ elements: elements.map(encodeElement) });

  console.log(`重新编码完成,新 BLOB ${newBodyBytes.length} 字节`);

  // 写回数据库
  console.log('写回数据库...');
  await db.write(`UPDATE ${TABLE} SET "40800" = ? WHERE rowid = ?`, [newBodyBytes, BigInt(ROWID)]);

  console.log('✅ 修改成功!验证回读...');

  // 验证:重新读取
  const verifyRows = await db.query(`SELECT "40800" FROM ${TABLE} WHERE rowid = ?`, [BigInt(ROWID)]);
  const verifyBlob = verifyRows[0]![0] as Uint8Array;
  console.log(`验证读取到 ${verifyBlob.length} 字节`);
  const verifyDecoded = bodyCodec.decode(verifyBlob);
  const verifyElements = (verifyDecoded.elements ?? []).map(decodeElement);
  const verifyArk = verifyElements.find(e => e.kind === 'ark') as ArkElement;
  const verifyData = JSON.parse(verifyArk.arkData);

  console.log(verifyData);

  db.close();
}

main().catch(console.error);
