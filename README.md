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
- /sheets/{sheetId} シート詳細ページ（閲覧・チェック状態の更新）
- /sheets/{sheetId}/edit シート編集ページ（アイテムCRUD・カテゴリ変更・並び替え）
- /sheets/{sheetId}/categories カテゴリ管理ページ（カテゴリCRUD・並び替え）
- /share/{shareId} 共有ページ

シートの編集とカテゴリ管理は詳細ページとは別ルートです。編集用のD&Dコードは各編集ルートでのみ読み込むため、詳細ページの初期表示に編集機能の依存を含めません。
