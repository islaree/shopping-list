'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { ShoppingCategoryModel, ShoppingItemModel } from '@/types/shopping-list';

const uncategorized = { id: null as string | null, name: 'カテゴリ未設定' };

export function SheetEditing({
  sheetId,
  items,
  categories,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onSetItemCategory,
  onReorderItemsInCategory,
  onClose,
}: {
  sheetId: string;
  items: ShoppingItemModel[];
  categories: ShoppingCategoryModel[];
  onAddItem: (sheetId: string, item: { name: string; categoryId: string | null }) => void;
  onEditItem: (sheetId: string, item: ShoppingItemModel) => void;
  onDeleteItem: (sheetId: string, itemId: string) => void;
  onSetItemCategory: (sheetId: string, itemId: string, categoryId: string | null) => void;
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
            categories={categories}
            onAddItem={onAddItem}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
            onSetItemCategory={onSetItemCategory}
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
  categories,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onSetItemCategory,
  onReorder,
}: {
  sheetId: string;
  categoryId: string | null;
  categoryName: string;
  items: ShoppingItemModel[];
  categories: ShoppingCategoryModel[];
  onAddItem: (sheetId: string, item: { name: string; categoryId: string | null }) => void;
  onEditItem: (sheetId: string, item: ShoppingItemModel) => void;
  onDeleteItem: (sheetId: string, itemId: string) => void;
  onSetItemCategory: (sheetId: string, itemId: string, categoryId: string | null) => void;
  onReorder: (items: ShoppingItemModel[]) => void;
}) {
  const [newItemName, setNewItemName] = useState('');
  const skipBlurCommitRef = useRef(false);

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

  const commitNewItem = (value: string) => {
    addItem(value);
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
                sheetId={sheetId}
                item={item}
                categories={categories}
                onEditItem={onEditItem}
                onSetItemCategory={onSetItemCategory}
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
            onBlur={() => {
              if (skipBlurCommitRef.current) {
                skipBlurCommitRef.current = false;
                return;
              }
              commitNewItem(newItemName);
            }}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              if (e.nativeEvent.isComposing) return;
              e.preventDefault();
              skipBlurCommitRef.current = true;
              commitNewItem(e.currentTarget.value);
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

function EditableItemRow({
  item,
  categories,
  onEditItem,
  onSetItemCategory,
  sheetId,
  onDelete,
}: {
  sheetId: string;
  item: ShoppingItemModel;
  categories: ShoppingCategoryModel[];
  onEditItem: (sheetId: string, item: ShoppingItemModel) => void;
  onSetItemCategory: (sheetId: string, itemId: string, categoryId: string | null) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const [value, setValue] = useState(item.name);
  const skipBlurCommitRef = useRef(false);

  useEffect(() => {
    setValue(item.name);
  }, [item.id, item.name]);

  const style = {
    position: 'relative' as const,
    transform: CSS.Transform.toString(transform ? { ...transform, x: 0 } : null),
    opacity: isDragging ? 1 : 1,
    transition,
    zIndex: isDragging ? 1000 : 0,
  };

  const commit = (nextValue: string) => {
    const trimmed = nextValue.trim();
    if (!trimmed) {
      setValue(item.name);
      return;
    }
    if (trimmed === item.name) return;
    onEditItem(sheetId, { ...item, name: trimmed });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex h-14 items-center justify-between gap-x-2 border-b border-neutral-100 bg-white pr-4 ${
        isDragging ? 'ring-2 ring-emerald-400' : ''
      }`}
    >
      <div className="flex h-full flex-1 items-center">
        <button {...listeners} className="h-full px-4">
          <GripVertical className="size-4 cursor-grab touch-none text-neutral-800" />
        </button>
        <input
          value={value}
          className="text-md w-full min-w-0 flex-1 bg-transparent focus-visible:outline-none"
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            if (skipBlurCommitRef.current) {
              skipBlurCommitRef.current = false;
              return;
            }
            commit(value);
          }}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            if (e.nativeEvent.isComposing) return;
            e.preventDefault();
            skipBlurCommitRef.current = true;
            commit(e.currentTarget.value);
            e.currentTarget.blur();
          }}
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded p-1 hover:bg-neutral-100">
          <Ellipsis size={20} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {categories.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>カテゴリ変更</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {categories
                    .filter((category) => category.id !== item.categoryId)
                    .map((category) => (
                      <DropdownMenuItem
                        key={category.id}
                        onSelect={() => onSetItemCategory(sheetId, item.id, category.id)}
                      >
                        {category.name}
                      </DropdownMenuItem>
                    ))}
                  <DropdownMenuItem onSelect={() => onSetItemCategory(sheetId, item.id, null)}>
                    その他（カテゴリ未設定）
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}
          <DropdownMenuItem onClick={onDelete}>削除</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
