'use client';

import { useMemo, useState } from 'react';
import { CornerDownLeft, Ellipsis, GripVertical, Plus, X } from 'lucide-react';
import {
  DndContext,
  type DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { ShoppingCategoryModel, ShoppingItemModel } from '@/types/shopping-list';

const uncategorized = { id: null as string | null, name: 'カテゴリ未設定' };

export function SheetEditing({
  sheetId,
  items,
  categories,
  onAddItem,
  onDeleteItem,
  onReorderItemsInCategory,
  onClose,
}: {
  sheetId: string;
  items: ShoppingItemModel[];
  categories: ShoppingCategoryModel[];
  onAddItem: (sheetId: string, item: { name: string; categoryId: string | null }) => void;
  onDeleteItem: (sheetId: string, itemId: string) => void;
  onReorderItemsInCategory: (
    sheetId: string,
    categoryId: string | null,
    items: ShoppingItemModel[],
  ) => void;
  onClose: () => void;
}) {
  const groups = useMemo(() => {
    const byCategory = new Map<string | null, ShoppingItemModel[]>();
    for (const item of items) {
      const key = item.categoryId ?? null;
      const current = byCategory.get(key) ?? [];
      current.push(item);
      byCategory.set(key, current);
    }

    const ordered: {
      category: ShoppingCategoryModel | typeof uncategorized;
      items: ShoppingItemModel[];
    }[] = categories.map((c) => ({ category: c, items: byCategory.get(c.id) ?? [] }));

    const uncatItems = byCategory.get(null) ?? [];
    if (categories.length === 0 || uncatItems.length > 0) {
      ordered.push({ category: uncategorized, items: uncatItems });
    }

    return ordered;
  }, [items, categories]);

  return (
    <>
      <div className="flex h-14 items-center justify-between px-4">
        <div className="font-bold">シート編集中</div>
        <button onClick={onClose}>
          <X />
        </button>
      </div>
      <div className="mb-16">
        {groups.map(({ category, items: categoryItems }) => (
          <CategorySection
            key={category.id ?? 'uncategorized'}
            sheetId={sheetId}
            categoryId={category.id}
            categoryName={category.name}
            items={categoryItems}
            onAddItem={onAddItem}
            onDeleteItem={onDeleteItem}
            onReorder={(newCategoryItems) =>
              onReorderItemsInCategory(sheetId, category.id, newCategoryItems)
            }
          />
        ))}
      </div>
    </>
  );
}

function CategorySection({
  sheetId,
  categoryId,
  categoryName,
  items,
  onAddItem,
  onDeleteItem,
  onReorder,
}: {
  sheetId: string;
  categoryId: string | null;
  categoryName: string;
  items: ShoppingItemModel[];
  onAddItem: (sheetId: string, item: { name: string; categoryId: string | null }) => void;
  onDeleteItem: (sheetId: string, itemId: string) => void;
  onReorder: (items: ShoppingItemModel[]) => void;
}) {
  const [newItemName, setNewItemName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === String(active.id));
    const newIndex = items.findIndex((i) => i.id === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  const addItem = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddItem(sheetId, { name: trimmed, categoryId });
    setNewItemName('');
  };

  return (
    <div className="">
      <div className="flex h-8 items-center gap-x-2 border-y border-neutral-200 bg-neutral-50 px-4 py-2 text-[13px] text-neutral-500">
        <span>{categoryName}</span>
      </div>
      <div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <EditableItemRow
                key={item.id}
                item={item}
                onDelete={() => onDeleteItem(sheetId, item.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
        <div className="flex h-14 items-center gap-x-2 px-4 text-neutral-300">
          <div>
            <Plus size={20} />
          </div>
          <input
            className="w-full bg-transparent text-neutral-900 placeholder:text-neutral-300 focus:outline-none"
            value={newItemName}
            placeholder="新規アイテム追加"
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              if (e.nativeEvent.isComposing) return;
              e.preventDefault();
              addItem(e.currentTarget.value);
            }}
          />
          {newItemName.trim() !== '' ? (
            <button
              type="button"
              className="rounded bg-[#EAFFF2] p-1 text-[#22C55E] hover:bg-teal-50"
              aria-label="アイテムを追加"
              onClick={() => addItem(newItemName)}
            >
              <CornerDownLeft size={20} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EditableItemRow({ item, onDelete }: { item: ShoppingItemModel; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform ? { ...transform, x: 0 } : null),
    opacity: isDragging ? 0.5 : 1,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex h-14 items-center justify-between gap-x-2 border-b border-neutral-100 bg-white px-4 ${
        isDragging ? 'ring-2 ring-teal-200' : ''
      }`}
    >
      <div className="flex items-center gap-x-3">
        <GripVertical {...listeners} className="size-4 cursor-grab touch-none text-neutral-800" />
        <div className="text-md">{item.name}</div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded p-1 hover:bg-neutral-100">
          <Ellipsis size={20} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onDelete}>削除</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
