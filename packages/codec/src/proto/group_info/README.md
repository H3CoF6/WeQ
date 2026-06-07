# `proto/group_info/` — `group_info.db` 各表的 protobuf 列

每个 .ts 文件对应一张表（`group_list`、`group_member_list`、…）。

数据库里大量列是 BLOB，每个 BLOB 本质上是独立 protobuf。建议每个 BLOB 列
导出一个独立 schema（命名形如 `GroupListPbReserve`、`GroupListPb33`），
等你逆向出含义后再 rename 到语义名。
