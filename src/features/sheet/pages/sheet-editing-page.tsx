'use client';

import { SheetEditing } from '@/features/sheet/components/SheetEditing';
import { useBoundStore } from '@/stores/use-bound-store';
import { ShoppingItemModel } from '@/types/shopping-list';
import { notFound, useRouter } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';

type Props = {
  id: string;
};

export function SheetEditingPage({ id }: Props) {
  const router = useRouter();
  const { sheet, addItem, editItem, deleteItem, setItems, setItemCategory } = useBoundStore(
    useShallow((state) => ({
      sheet: state.sheets.find((current) => current.id === id),
      addItem: state.addItem,
      editItem: state.editItem,
      deleteItem: state.deleteItem,
      setItems: state.setItems,
      setItemCategory: state.setItemCategory,
    })),
  );

  if (!sheet) {
    notFound();
  }

  const handleReorderItemsInCategory = (
    categoryId: string | null,
    newCategoryItems: ShoppingItemModel[],
  ) => {
    const byCategory = new Map<string | null, ShoppingItemModel[]>();
    for (const item of sheet.items) {
      const key = item.categoryId ?? null;
      const current = byCategory.get(key) ?? [];
      current.push(item);
      byCategory.set(key, current);
    }
    byCategory.set(categoryId, newCategoryItems);

    const next: ShoppingItemModel[] = [];
    for (const category of sheet.categories) {
      next.push(...(byCategory.get(category.id) ?? []));
    }
    next.push(...(byCategory.get(null) ?? []));
    setItems(id, next);
  };

  return (
    <SheetEditing
      sheetId={sheet.id}
      items={sheet.items}
      categories={sheet.categories}
      onAddItem={addItem}
      onEditItem={editItem}
      onDeleteItem={deleteItem}
      onSetItemCategory={setItemCategory}
      onReorderItemsInCategory={(_sheetId, categoryId, items) =>
        handleReorderItemsInCategory(categoryId, items)
      }
      onClose={() => router.push(`/sheets/${id}`)}
    />
  );
}
