'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { useBoundStore } from '@/stores/use-bound-store';
import { Bookmark, ChevronLeft, Ellipsis } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';

import { SheetDetailItem } from '../components/sheet-detail-item';

type Props = {
  id: string;
};

export function SheetDetailPage({ id }: Props) {
  const { sheet, editItem } = useBoundStore(
    useShallow((state) => ({
      sheet: state.sheets.find((current) => current.id === id),
      editItem: state.editItem,
    })),
  );

  if (!sheet) {
    notFound();
  }

  const groupedItems = sheet.categories
    .map((category) => ({
      category,
      items: sheet.items.filter((item) => item.categoryId === category.id),
    }))
    .filter((group) => group.items.length > 0);

  const uncategorizedItems = sheet.items.filter(
    (item) =>
      !item.categoryId || !sheet.categories.some((category) => category.id === item.categoryId),
  );

  const shouldShowOtherLabel = groupedItems.length > 0 && uncategorizedItems.length > 0;
  const displayGroups = [
    ...groupedItems,
    ...(shouldShowOtherLabel
      ? [
          {
            category: { id: 'uncategorized', name: 'その他' },
            items: uncategorizedItems,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      <div className="flex h-14 items-center gap-x-2 px-4">
        <Link href="/sheets">
          <ChevronLeft className="size-5 stroke-2" />
          <span className="sr-only">シート一覧へ戻る</span>
        </Link>
        <div className="flex-1">
          <span className="text-md font-bold">{sheet.name}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="shrink-0 cursor-pointer rounded hover:bg-neutral-200">
            <Ellipsis className="size-5" />
            <span className="sr-only">シートメニューを開く</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/sheets/${id}/edit`}>シートを編集</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/sheets/${id}/categories`}>カテゴリを編集</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => {}}>リストを削除</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {groupedItems.length === 0 && uncategorizedItems.length > 0 && (
        <div className="px-4">
          <div className="divide-y divide-[#F6F6F6] overflow-hidden rounded-[12px] border border-[#F6F6F6]">
            {uncategorizedItems.map((item) => (
              <SheetDetailItem
                key={item.id}
                id={item.id}
                name={item.name}
                checked={item.checked}
                onEdit={() => editItem(id, { ...item, checked: !item.checked })}
              />
            ))}
          </div>
        </div>
      )}

      {displayGroups.length > 0 && (
        <Accordion type="multiple" defaultValue={displayGroups.map((group) => group.category.id)}>
          {displayGroups.map((group) => (
            <AccordionItem
              key={group.category.id}
              value={group.category.id}
              className="border-none px-4"
            >
              <AccordionTrigger className="py-3">
                <div className="flex items-center gap-x-1">
                  <Bookmark className="size-4.5 fill-neutral-300 text-neutral-300" />
                  <span className="text-[14px] text-neutral-400">{group.category.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="divide-y divide-[#F6F6F6] overflow-hidden rounded-[12px] border border-[#F6F6F6]">
                  {group.items.map((item) => (
                    <SheetDetailItem
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      checked={item.checked}
                      onEdit={() => editItem(id, { ...item, checked: !item.checked })}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
