'use client';

import { Check, CornerDownLeft, Ellipsis, StickyNote } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import Link from 'next/link';
import { useState } from 'react';
import { ShoppingListModel } from '@/types/shopping-list';

type Props = {
  sheet: ShoppingListModel;
  name: string;
  href: string;
  count: number;
  isEmpty: boolean;
  isAllChecked: boolean;
  onDelete: () => void;
  onEdit: (name: string) => void;
  onOpen: () => void;
};

export function SheetListItem({
  sheet,
  name,
  count,
  href,
  isEmpty,
  isAllChecked,
  onDelete,
  onEdit,
  onOpen,
}: Props) {
  const [isEdit, setIsEdit] = useState(false);
  const [value, setValue] = useState(name);

  console.log(sheet);

  return (
    <div className={`flex h-14 items-center gap-x-2 px-4 ${isEdit ? 'bg-white' : 'bg-white'}`}>
      {isEdit ? (
        <div className="flex h-full w-full items-center gap-x-2">
          <div className="relative">
            <StickyNote className="size-5 text-[#DFDFDF]" />
            {!isEmpty && isAllChecked && (
              <div className="absolute -top-2 -left-2 flex size-4 items-center justify-center rounded-[6px] bg-emerald-400 text-[10px] leading-none font-bold text-white">
                <Check className="size-3 stroke-4" />
              </div>
            )}
            {!isEmpty && !isAllChecked && (
              <div className="absolute -top-2 -left-2 flex size-4 items-center justify-center rounded-[6px] bg-[#C2C2C2] text-[10px] leading-none font-bold text-white">
                {count}
              </div>
            )}
          </div>
          <input
            autoFocus
            value={value}
            className="h-full flex-1 focus-visible:outline-none"
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => {
              setIsEdit(false);
              onEdit(value);
            }}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              if (e.nativeEvent.isComposing) return;
              e.preventDefault();
              setIsEdit(false);
              onEdit(value);
            }}
          />
        </div>
      ) : (
        <Link href={href} className="flex h-full min-w-0 flex-1 items-center gap-x-2">
          <div className="relative shrink-0">
            <StickyNote className="size-5 text-[#DFDFDF]" />
            {!isEmpty && isAllChecked && (
              <div className="absolute -top-2 -left-2 flex size-4 items-center justify-center rounded-[6px] bg-emerald-400 text-[10px] leading-none font-bold text-white">
                <Check className="size-3 stroke-4" />
              </div>
            )}
            {!isEmpty && !isAllChecked && (
              <div className="absolute -top-2 -left-2 flex size-4 items-center justify-center rounded-[6px] bg-[#C2C2C2] text-[10px] leading-none font-bold text-white">
                {count}
              </div>
            )}
          </div>
          <div className="flex h-full min-w-0 flex-1 items-center">
            <span className="truncate">{name}</span>
          </div>
        </Link>
      )}
      {isEdit ? (
        <button
          type="button"
          className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[8px] bg-emerald-400"
          onClick={() => {
            setIsEdit(false);
            onEdit(value);
          }}
        >
          <CornerDownLeft className="size-3 stroke-4 text-white" />
        </button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger className="shrink-0 cursor-pointer rounded hover:bg-neutral-200">
            <Ellipsis className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setIsEdit(true)}>リスト名を編集</DropdownMenuItem>
            <DropdownMenuItem onSelect={onOpen}>シートを共有</DropdownMenuItem>
            <DropdownMenuItem className="" onSelect={onDelete}>
              リストを削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
