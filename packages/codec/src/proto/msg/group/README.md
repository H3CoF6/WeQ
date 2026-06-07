# `proto/msg/group/` — 群消息 protobuf schema

每个 .ts 文件对应 **一个表** 或 **同一表上的一个 protobuf 列**，文件名直接
取表名（snake_case）。

例：
- `group_msg.ts` — `nt_msg.db` 的 `group_msg_table` 表
- 一个表里如果有多个 BLOB 列各承载一个独立的 protobuf，就在同一个文件里
  导出多个 `*Schema` 常量（例如 `GroupMsgBody` 和 `GroupMsgPbReserve`）

约定：
- 所有字段默认 `optional: true`，除非你已经在真实数据里确认它必出
- 暂时看不懂的字段也要声明，用 `unknown_<tag>` 命名，方便后续 round-trip
  序列化按默认值写回（参见仓库根 README 关于反/序列化对称的说明）
