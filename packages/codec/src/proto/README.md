# `proto/` — protobuf schemas, organized by source

The split is by **where the bytes live**, not by message type:

```
proto/
├── msg/
│   ├── group/         ← nt_msg.db / group_msg_table
│   ├── c2c/           ← nt_msg.db / c2c_msg_table
│   └── elements.ts    ← shared MsgBody element schemas
├── group_info/        ← group_info.db tables
└── user_info/         ← profile_info.db / friend_info tables
```

## Why split this way

Reverse-engineering happens table-by-table. Keeping schemas physically near
their source table makes it easy to:

1. add a new BLOB column → drop a new schema file next to its siblings
2. tell at a glance which tag-layout knowledge has been confirmed vs guessed
3. avoid one big `proto/` dump where everything cross-references everything

## Naming convention

- file name = table name in `snake_case` (`group_msg.ts`, `friend_info.ts`)
- one schema constant per BLOB column on that table (`GroupMsgBody`,
  `GroupMsgPbReserve`, …)
- placeholder field names use `unknown_<tag>` so round-trip serialization
  preserves the bytes even before semantics are figured out

## Asymmetric reverse engineering

The plan is to ship **decoding first** (DB → element for the UI) and add
encoding (element → DB for round-trip writes) later. Schemas declare *all*
fields you've seen on the wire — including ones that are stripped during the
DB→element projection — so when we eventually do the reverse direction, we
can re-emit them with their default values rather than leaving holes.
