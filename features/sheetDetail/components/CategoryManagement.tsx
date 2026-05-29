'use client';

import { useEffect, useState } from 'react';
import { CornerDownLeft, Ellipsis, GripVertical, Plus, X } from 'lucide-react';
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
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

import { Button } from '@/shared/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { ShoppingCategoryModel } from '@/types/shopping-list';

export function CategoryManagement({
  list,
  onAdd,
  onEdit,
  onDelete,
  onUpdate,
  onSort,
  onClose,
}: {
  list: { id: string; name: string }[];
  onAdd: (category: ShoppingCategoryModel) => void;
  onEdit: (item: ShoppingCategoryModel) => void;
  onDelete: (id: string) => void;
  onUpdate: (items: ShoppingCategoryModel[]) => void;
  onSort: () => void;
  onClose: () => void;
}) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oldIndex = list.findIndex((item) => item.id === active.id);
      const newIndex = list.findIndex((item) => item.id === over.id);
      onUpdate(arrayMove(list, oldIndex, newIndex));
    }
    setActiveId(null);
    setOverId(null);
  };

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  };

  const handleDragOver = (e: DragOverEvent) => {
    const over = e.over;
    setOverId(over ? String(over.id) : null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    onSort();
  }, [list, onSort]);

  const addShoppingCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd({ id: crypto.randomUUID(), name: trimmed });
    setNewCategoryName('');
  };

  return (
    <>
      <div className="flex h-14 items-center justify-between bg-white px-4">
        <div className="font-bold">カテゴリ編集中</div>
        <button className="text-sm underline" onClick={onClose}>
          <X />
        </button>
      </div>
      <div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={list} strategy={verticalListSortingStrategy}>
            {list.map((item) => (
              <CategoryItem
                key={item.id}
                item={item}
                activeId={activeId}
                overId={overId}
                onEdit={onEdit}
                onDelete={() => onDelete(item.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <div>
        <div className="flex h-12 items-center gap-x-2 px-4">
          <div className="text-neutral-400">
            <Plus />
          </div>
          <input
            className="w-full bg-transparent text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
            value={newCategoryName}
            placeholder="カテゴリを追加"
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              if (e.nativeEvent.isComposing) return;
              e.preventDefault();
              addShoppingCategory(e.currentTarget.value);
            }}
          />
          {newCategoryName.trim() !== '' ? (
            <button
              type="button"
              className="rounded p-1 text-teal-600 hover:bg-teal-50"
              aria-label="カテゴリを追加"
              onClick={() => addShoppingCategory(newCategoryName)}
            >
              <CornerDownLeft size={18} />
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}

function CategoryItem({
  item,
  activeId,
  overId,
  onEdit,
  onDelete,
}: {
  item: { id: string; name: string };
  activeId: string | null;
  overId: string | null;
  onEdit: (item: ShoppingCategoryModel) => void;
  onDelete: () => void;
}) {
  const { id, name } = item;
  const [value, setValue] = useState(name);
  const [isEdit, setIsEdit] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({
      id: item.id,
    });
  const style = {
    transform: CSS.Transform.toString(transform ? { ...transform, x: 0 } : null),
    opacity: isDragging ? 0.5 : 1,
    transition,
  };

  const showDropTarget = Boolean(
    activeId && overId && activeId !== id && (isOver || overId === id),
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`relative border-b border-neutral-100 bg-white ${isDragging ? 'ring-2 ring-teal-200' : ''}`}
    >
      {showDropTarget ? <DropIndicator /> : null}
      <div className="relative z-10 flex h-12 items-center justify-between gap-x-2 px-4">
        <div className="flex items-center gap-x-3">
          <GripVertical
            {...listeners}
            size={18}
            className="cursor-grab touch-none text-neutral-300"
          />
          <div className="text-[15px]">{name}</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded p-1 hover:bg-neutral-100">
            <Ellipsis />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEdit(true)}>編集</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete}>削除</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Dialog open={isEdit} onOpenChange={setIsEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>カテゴリ名を編集</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <div className="grid w-full max-w-sm items-center gap-2">
            <Label htmlFor="name">カテゴリ名</Label>
            <Input
              id="name"
              value={value}
              placeholder="カテゴリ名を入力"
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              disabled={value.trim() === ''}
              onClick={() => {
                setIsEdit(false);
                onEdit({ id, name: value });
              }}
            >
              変更を保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DropIndicator() {
  return (
    <div className="pointer-events-none absolute inset-y-1 right-2 left-2 rounded-md bg-teal-100/70 shadow-inner" />
  );
}
