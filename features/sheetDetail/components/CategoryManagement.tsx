'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, Ellipsis, GripVertical, Plus } from 'lucide-react';
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

import { Button } from '@/shared/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  onChageMode,
  onAdd,
  onEdit,
  onDelete,
  onUpdate,
  onSort,
}: {
  list: { id: string; name: string }[];
  onChageMode: () => void;
  onAdd: (category: ShoppingCategoryModel) => void;
  onEdit: (item: ShoppingCategoryModel) => void;
  onDelete: (id: string) => void;
  onUpdate: (items: ShoppingCategoryModel[]) => void;
  onSort: () => void;
}) {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oldIndex = list.findIndex((item) => item.id === active.id);
      const newIndex = list.findIndex((item) => item.id === over.id);
      onUpdate(arrayMove(list, oldIndex, newIndex));
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    onSort();
  }, [list, onSort]);

  const addShoppingCategory = () => {
    onAdd({ id: crypto.randomUUID(), name: value });
  };

  return (
    <>
      <div className="flex h-14 items-center justify-between bg-white px-4">
        <div className="flex items-center gap-x-2">
          <button className="text-sm underline" onClick={onChageMode}>
            <ChevronLeft />
          </button>
          <div className="font-bold">カテゴリ管理</div>
        </div>
      </div>
      <div className="px-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={list} strategy={verticalListSortingStrategy}>
            {list.map((item) => (
              <CategoryItem
                key={item.id}
                item={item}
                onEdit={onEdit}
                onDelete={() => onDelete(item.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <div className="px-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <div className="flex cursor-pointer items-center gap-x-2 rounded p-2 text-teal-400 hover:bg-teal-50">
              <Plus />
              <div className="font-bold">カテゴリを追加</div>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>カテゴリを追加</DialogTitle>
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
                  setOpen(false);
                  addShoppingCategory();
                  setValue('');
                }}
              >
                追加
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

function CategoryItem({
  item,
  onEdit,
  onDelete,
}: {
  item: { id: string; name: string };
  onEdit: (item: ShoppingCategoryModel) => void;
  onDelete: () => void;
}) {
  const { id, name } = item;
  const [value, setValue] = useState(name);
  const [isEdit, setIsEdit] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform ? { ...transform, x: 0 } : null),
    opacity: isDragging ? 0.5 : 1,
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex items-center justify-between gap-x-2 p-2">
        <div className="flex items-center gap-x-2">
          <div className="bg-neutral-100 p-1">
            <GripVertical
              {...listeners}
              size={18}
              className="cursor-grab touch-none text-neutral-400"
            />
          </div>
          <div className="text-md">{name}</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
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
