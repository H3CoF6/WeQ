/**
 * ARK sample payloads — captured real-world examples kept as typed constants
 * for documentation. The actual ArkElement codec lives in `registry.ts`
 * (decode/encode is a thin field forward); the JSON shape of `arkData` is
 * described by `ArkPayload` in `types.ts`.
 *
 *   const payload = JSON.parse(el.arkData) as ArkPayload;
 *   if (payload.view === 'pubAdArkView') {
 *     const t = payload.meta.template3 as Record<string, unknown>;
 *     // ...
 *   }
 *
 * Add more sample constants here as you reverse-engineer other `view` shapes.
 */

import type { ArkPayload } from './types';

/**
 * Reference shape for `view: "pubAdArkView"` — QQ game-center ad pushed
 * into a chat. The whole document gets `JSON.stringify`'d into wire field
 * 47901.
 */
export const SAMPLE_GAME_CENTER_AD: ArkPayload = {
  app: 'com.tencent.gamecenter.mall',
  desc: 'QQ手游消息',
  meta: {
    template3: {
      __preloadFields: 'coverUrl',
      actId: 3062270,
      actTitle: 'CZN-首发活动',
      adId: '2974368',
      appid: '1112280105',
      arkType: 'pubSinglePicArk',
      buttonType: 1,
      contentText: '注册赢显卡福利',
      coverUrl: 'https://img.gamecenter.qq.com/oasis/Czn/6d879eb2a28a3e77167dc6d8d64ed5f2.jpg',
      feedId: 40350761,
      fid: 40350761,
      five_element_switch: false,
      is_colorful: false,
      styleType: 1,
      time: '1780543611',
      title: '卡厄思梦境现已上线',
      url: 'https://youxi.gamecenter.qq.com/compose-h5/mie-act/gamecenter_template_subscribe/index.html?adid=2974368&adtag=gzh_s_2974368_s_40350761&appid=1112280105&fid=40350761&oasis_actid=3062270&open_kuikly_info=%7B%22url%22%3A%22%3FFFROMSCHEMA%3D%26act_id%3D3062270_1112280105_AyvJiB%26adtag%3Dgzh_s_2974368_s_40350761%26_gen_from%3Dqga%22%2C%22page_name%22%3A%22QQGameCenterTemplateSubscribe%22%2C%22bundle_name%22%3A%22gamecenter_template_subscribe%22%2C%22kr_turbo_display%22%3A%223062270_1112280105_AyvJiB%22%2C%22kr_min_res_version%22%3A%2214240%22%7D&page_name=QQGameCenterTemplateSubscribe&pubAccountAppid=1112280105&qqplay=1&qqplayHide=1&restag=2974368',
    },
  },
  prompt: '卡厄思梦境现已上线',
  sourceName: '1112280105',
  ver: '0.0.3.67',
  view: 'pubAdArkView',
  config: {
    ctime: 1780873865,
    token: 'da8a31c3da3d28c78696dd193496ab2c',
  },
};
