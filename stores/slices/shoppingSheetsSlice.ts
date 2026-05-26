import { SliceCreator } from '@/stores/useBoundStore';
import { ShoppingCategoryModel, ShoppingItemModel } from '@/types/shopping-list';

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
  editSheet: (sheet: { id: string; name: string }) => void;
  deleteSheet: (id: string) => void;
  issueShareId: (sheetId: string) => string | null;
  addItem: (sheetId: string, item: { name: string; categoryId: string | null }) => void;
  editItem: (sheetId: string, item: ShoppingItemModel) => void;
  deleteItem: (sheetId: string, itemId: string) => void;
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
  const categoryOrderMap = new Map(categories.map((category, index) => [category.id, index]));
  return [...items].sort((a, b) => {
    const aOrder = categoryOrderMap.get(a.categoryId ?? '') ?? Infinity;
    const bOrder = categoryOrderMap.get(b.categoryId ?? '') ?? Infinity;
    return aOrder - bOrder;
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
  issueShareId: (sheetId: string) => {
    const current = get().sheets.find((s) => s.id === sheetId);
    if (!current) return null;
    if (current.shareId) return current.shareId;
    const shareId = createId();
    set((state) => {
      const target = state.sheets.find((s) => s.id === sheetId);
      if (!target) return;
      target.shareId = shareId;
    });
    return shareId;
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
