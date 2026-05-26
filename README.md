ディレクトリ構成

```text
app
├─ page.tsx
├─ sheets
│  └─ page.tsx
├─ share
│  └─ [id]
│     └─ page.tsx
├─ not-found.tsx
└─ api
features
├─ sheetList
│  ├─ components
│  │  └─ SheetListTitle.tsx
│  ├─ constants.ts
│  ├─ types.ts
│  └─ hooks
├─ sheetDetail
│  ├─ components
│  ├─ constants.ts
│  ├─ types.ts
│  └─ hooks
stores
├─ slices
│  └─ sheetDetailSlice.ts
└─ useBoundStore.ts
shared
├─ components
├─ hooks
└─ utils
```

URL

- / シート一覧ページ
- /sheets シート一覧ページ
- /sheets/{sheetId} シートページ
- /share/{shareId} 共有ページ
