import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createShoppingSheetsSlice, ShoppingSheetsSlice } from './slices/shopping-sheets-slice';

export type SliceCreator<T> = StateCreator<T, [['zustand/immer', never]], [], T>;

type Store = ShoppingSheetsSlice;

const createId = () => globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 11);

const useBoundStore = create<Store>()(
  persist(
    immer((...a) => ({
      ...createShoppingSheetsSlice(...a),
    })),
    {
      name: 'app-storage',
      partialize: (state) => ({ sheets: state.sheets }),
      version: 1,
      migrate: (persistedState) => {
        const raw = persistedState as { sheets?: unknown };
        const rawSheets = Array.isArray(raw?.sheets) ? raw.sheets : [];

        const sheets = rawSheets
          .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object')
          .map((s) => {
            const rawCategories = Array.isArray(s.categories) ? s.categories : [];
            const categories = rawCategories
              .map((c) => {
                if (typeof c === 'string') return { id: createId(), name: c };
                if (!c || typeof c !== 'object') return null;
                const maybe = c as Record<string, unknown>;
                return {
                  id: typeof maybe.id === 'string' ? maybe.id : createId(),
                  name: typeof maybe.name === 'string' ? maybe.name : '',
                };
              })
              .filter((c): c is { id: string; name: string } => c !== null);

            const rawItems = Array.isArray(s.items) ? s.items : [];
            const items = rawItems
              .map((i) => {
                if (typeof i === 'string') {
                  return { id: createId(), name: i, categoryId: null, checked: false };
                }
                if (!i || typeof i !== 'object') return null;
                const maybe = i as Record<string, unknown>;
                return {
                  id: typeof maybe.id === 'string' ? maybe.id : createId(),
                  name: typeof maybe.name === 'string' ? maybe.name : '',
                  categoryId: typeof maybe.categoryId === 'string' ? maybe.categoryId : null,
                  checked: typeof maybe.checked === 'boolean' ? maybe.checked : false,
                };
              })
              .filter(
                (
                  i,
                ): i is { id: string; name: string; categoryId: string | null; checked: boolean } =>
                  i !== null,
              );

            return {
              id: typeof s.id === 'string' ? s.id : createId(),
              name: typeof s.name === 'string' ? s.name : '',
              shareId: typeof s.shareId === 'string' ? s.shareId : null,
              categories,
              items,
            };
          });

        return { sheets } as unknown as Store;
      },
    },
  ),
);

export { useBoundStore };
