export type ShoppingListModel = {
  id: string;
  name: string;
  items: ShoppingItemModel[] | [];
  categories: ShoppingCategoryModel[] | [];
  shareId: string | null;
};

export type ShoppingItemModel = {
  id: string;
  name: string;
  categoryId: string | null;
  checked: boolean;
};

export type ShoppingCategoryModel = {
  id: string;
  name: string;
};

// type Sheet = {
//   id: string; // シートID
//   name: string; // シート名
//   items: {
//     id: string; // アイテムID
//     name: string; // アイテム名
//     categoryId: string | null; // カテゴリID
//     checked: boolean; // チェック状態
//   }[]; // アイテム一覧
//   categories: {
//     id: string; // カテゴリID
//     name: string; // カテゴリ名
//   }[]; // カテゴリ一覧
//   shareId: string | null; // 共有ID
// };
