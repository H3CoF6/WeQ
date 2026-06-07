# WeQ

> [!note] 
> QQ NT 本地聊天记录解密 · 导出 · 浏览 · 数据分析 · 年度报告
>
> **正在高速Vibe开发中**

---

## RoadMap

- [x] QQ数据库密钥获取

  - [x] 通过已登录的QQ实例获取
  - [x] 本地有未过期凭据，快速登陆获取
  - [x] 获取QQ二维码，扫描登陆获取
  - [ ] Lagrange 方案，纯协议获取，避免SIP等限制

- [ ] Protobuf解析工作 （in process）

  - [ ] c2c_msg
  - [ ] group_msg
  - [ ] profile
  - [ ] meida_info
  - [ ] group_info

  ...............

- [ ] Electron 实现

  > 主程序实现

  - [ ] 密钥获取界面
  - [ ] 消息查看界面
  - [ ] 新消息监听（扫描wal方案+recv方案）
  - [ ] 消息修改
  - [ ] 数据库导出
  - [ ] 数据库导出api
  - [ ] 年度报告

- [ ] LiteLoader 实现

  > QQ本体内部实现功能

  - [x] 注入任意JS实现
  - [ ] load 模块完成send/recv hook
  - [ ] 数据库导出页面
  - [ ] 年度报告页面

- [ ] Web/CLI 实现

  > 服务于无图形化界面的定时任务

  - [ ] 数据库导出api
  - [ ] 消息查看
  - [ ] 年度报告

## 致谢

[NapNeko 团队](https://github.com/NapNeko) : 大量实现参考

[SnowLuma 团队](https://github.com/SnowLuma): 部分实现参考

[LiteLoader](https://github.com/LiteLoaderQQNT/LiteLoaderQQNT) : QQ内部页面实现参考

[WeFlow](https://github.com/hicccc77/WeFlow) ： 优秀的聊天记录导出软件

