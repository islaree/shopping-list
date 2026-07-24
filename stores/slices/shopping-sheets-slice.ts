import { SliceCreator } from '@/stores/use-bound-store';
import { ShoppingCategoryModel, ShoppingItemModel, ShoppingListModel } from '@/types/shopping-list';

type ShoppingSheet = {
  id: string;
  name: string;
  shareId: string | null;
  categories: ShoppingCategoryModel[];
  items: ShoppingItemModel[];
};

type State = {
  sheets: ShoppingSheet[];
};

type Action = {
  addSheet: (name: string) => void;
  importSheet: (sheet: ShoppingListModel) => void;
  editSheet: (sheet: { id: string; name: string }) => void;
  deleteSheet: (id: string) => void;
  setShareId: (sheetId: string, shareId: string | null) => void;
  issueShareId: (sheetId: string) => string | null;
  addItem: (sheetId: string, item: { name: string; categoryId: string | null }) => void;
  editItem: (sheetId: string, item: ShoppingItemModel) => void;
  deleteItem: (sheetId: string, itemId: string) => void;
  setItems: (sheetId: string, items: ShoppingItemModel[]) => void;
  setItemCategory: (sheetId: string, itemId: string, categoryId: string | null) => void;
  addCategory: (sheetId: string, category: ShoppingCategoryModel) => void;
  editCategory: (sheetId: string, category: ShoppingCategoryModel) => void;
  deleteCategory: (sheetId: string, categoryId: string) => void;
  setCategories: (sheetId: string, categories: ShoppingCategoryModel[]) => void;
};

export type ShoppingSheetsSlice = State & Action;

const initialState: State = {
  sheets: [],
};

const createId = () => globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 11);

const sortItemsByCategory = (
  items: ShoppingItemModel[],
  categories: ShoppingCategoryModel[],
): ShoppingItemModel[] => {
  const indexMap = new Map(items.map((item, index) => [item.id, index]));
  const categoryOrderMap = new Map(categories.map((category, index) => [category.id, index]));
  return [...items].sort((a, b) => {
    const aOrder = categoryOrderMap.get(a.categoryId ?? '') ?? Infinity;
    const bOrder = categoryOrderMap.get(b.categoryId ?? '') ?? Infinity;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (indexMap.get(a.id) ?? 0) - (indexMap.get(b.id) ?? 0);
  });
};

export const createShoppingSheetsSlice: SliceCreator<ShoppingSheetsSlice> = (set, get) => ({
  ...initialState,
  addSheet: (name: string) => {
    const newSheet: ShoppingSheet = {
      id: createId(),
      name,
      shareId: null,
      categories: [],
      items: [],
    };
    set((state) => {
      state.sheets.push(newSheet);
    });
  },
  importSheet: (sheet: ShoppingListModel) => {
    set((state) => {
      const target = state.sheets.find((current) => current.id === sheet.id);
      const nextSheet: ShoppingSheet = {
        id: sheet.id,
        name: sheet.name,
        shareId: sheet.shareId,
        categories: [...(sheet.categories ?? [])],
        items: sortItemsByCategory([...(sheet.items ?? [])], [...(sheet.categories ?? [])]),
      };

      if (!target) {
        state.sheets.push(nextSheet);
        return;
      }

      target.name = nextSheet.name;
      target.shareId = nextSheet.shareId;
      target.categories = nextSheet.categories;
      target.items = nextSheet.items;
    });
  },
  editSheet: ({ id, name }: { id: string; name: string }) => {
    set((state) => {
      const target = state.sheets.find((sheet) => sheet.id === id);
      if (!target) return;
      target.name = name;
    });
  },
  deleteSheet: (id: string) => {
    set((state) => {
      state.sheets = state.sheets.filter((sheet) => sheet.id !== id);
    });
  },
  setShareId: (sheetId: string, shareId: string | null) => {
    set((state) => {
      const target = state.sheets.find((s) => s.id === sheetId);
      if (!target) return;
      target.shareId = shareId;
    });
  },
  issueShareId: (sheetId: string) => {
    const current = get().sheets.find((s) => s.id === sheetId);
    if (!current) return null;
    return current.shareId;
  },
  addItem: (sheetId: string, item: { name: string; categoryId: string | null }) => {
    set((state) => {
      const target = state.sheets.find((s) => s.id === sheetId);
      if (!target) return;
      target.items.push({
        id: createId(),
        name: item.name,
        categoryId: item.categoryId,
        checked: false,
      });
      target.items = sortItemsByCategory(target.items, target.categories);
    });
  },
  editItem: (sheetId: string, item: ShoppingItemModel) => {
    set((state) => {
      const target = state.sheets.find((s) => s.id === sheetId);
      if (!target) return;
      target.items = target.items.map((i) => (i.id === item.id ? item : i));
      target.items = sortItemsByCategory(target.items, target.categories);
    });
  },
  deleteItem: (sheetId: string, itemId: string) => {
    set((state) => {
      const target = state.sheets.find((s) => s.id === sheetId);
      if (!target) return;
      target.items = target.items.filter((i) => i.id !== itemId);
    });
  },
  setItems: (sheetId: string, items: ShoppingItemModel[]) => {
    set((state) => {
      const target = state.sheets.find((s) => s.id === sheetId);
      if (!target) return;
      target.items = sortItemsByCategory(items, target.categories);
    });
  },
  setItemCategory: (sheetId: string, itemId: string, categoryId: string | null) => {
    set((state) => {
      const target = state.sheets.find((s) => s.id === sheetId);
      if (!target) return;
      target.items = target.items.map((i) => (i.id === itemId ? { ...i, categoryId } : i));
      target.items = sortItemsByCategory(target.items, target.categories);
    });
  },
  addCategory: (sheetId: string, category: ShoppingCategoryModel) => {
    set((state) => {
      const target = state.sheets.find((s) => s.id === sheetId);
      if (!target) return;
      target.categories.push(category);
      target.items = sortItemsByCategory(target.items, target.categories);
    });
  },
  editCategory: (sheetId: string, category: ShoppingCategoryModel) => {
    set((state) => {
      const target = state.sheets.find((s) => s.id === sheetId);
      if (!target) return;
      target.categories = target.categories.map((c) => (c.id === category.id ? category : c));
    });
  },
  deleteCategory: (sheetId: string, categoryId: string) => {
    set((state) => {
      const target = state.sheets.find((s) => s.id === sheetId);
      if (!target) return;
      target.items = target.items.map((i) =>
        i.categoryId === categoryId ? { ...i, categoryId: null } : i,
      );
      target.categories = target.categories.filter((c) => c.id !== categoryId);
      target.items = sortItemsByCategory(target.items, target.categories);
    });
  },
  setCategories: (sheetId: string, categories: ShoppingCategoryModel[]) => {
    set((state) => {
      const target = state.sheets.find((s) => s.id === sheetId);
      if (!target) return;
      target.categories = categories;
      target.items = sortItemsByCategory(target.items, target.categories);
    });
  },
});
