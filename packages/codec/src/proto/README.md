# `proto/` — protobuf wire schemas, organized by source

Layer 1 of the codec stack. Files here describe **physical wire shape only**:
tag numbers, scalar types, repeats, optional, and `default` values for
round-trip serialization. They do not know what an Element or Message is —
that's the job of `../element/` and `../domain/`.

```
proto/
├── msg/
│   ├── common/        ← shared between c2c and group
│   │   ├── element.ts ← single Element envelope (40010, 45001..45102, …)
│   │   └── body.ts    ← 40800 repeated container
│   ├── group/
│   │   └── row.ts     ← group row's other BLOB columns (40050, 40027, …)
│   └── c2c/
│       └── row.ts     ← c2c row's other BLOB columns
├── group_info/        ← group_info.db tables
└── user_info/         ← profile_info.db / friend_info tables
```

## Conventions

- One schema constant per BLOB column (`MsgBody`, `GroupRowPb40050`, …).
- Use `unknown_<tag>` for fields whose meaning isn't yet RE'd — round-trip
  still preserves the value.
- `default` is set ONLY when QQ requires the field on the wire even if the
  upper layers ignore it. Truly optional fields get no default — they're
  just dropped on serialize.
- `inElement` is gone — Layer 1 doesn't know what an element is. The
  element codec in `../element/` decides what to lift.

## Asymmetric reverse engineering

Decoding ships first (DB → element for the UI); encoding (element → DB) is
added later. Schemas declare **all** observed fields so that when the
encode path arrives, every byte can be re-emitted with sensible defaults
rather than left as a hole.
