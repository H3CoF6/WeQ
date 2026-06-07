# `proto/msg/c2c/` — 私聊消息 protobuf schema

每个 .ts 文件对应一个 C2C 表。当前主要是 `c2c_msg_table`，未来可能有
`c2c_at_me_table`、`c2c_tmp_msg_table` 等扩展。

约定参见 `../group/README.md`。注意：C2C 和 Group 的 element 部分高度
相似，但**外层 envelope 不同**，不要互相替换 schema。
