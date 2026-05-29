'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { useBoundStore } from '@/stores/useBoundStore';
import { Bookmark, ChevronLeft, Ellipsis } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { SheetDetailItem } from './SheetDetailItem';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/accordion';
import { useMemo, useState } from 'react';
import { SheetEditing } from './SheetEditing';
import { ShoppingCategoryModel, ShoppingItemModel } from '@/types/shopping-list';
import { CategoryManagement } from './CategoryManagement';

type Props = {
  id: string;
};

export function SheetDetail({ id }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const {
    sheet,
    // deleteSheet,
    // issueShareId,
    addItem,
    editItem,
    deleteItem,
    setItems,
    // setItemCategory,
    addCategory,
    editCategory,
    deleteCategory,
    setCategories,
  } = useBoundStore(
    useShallow((state) => ({
      sheet: state.sheets.find((s) => s.id === id),
      deleteSheet: state.deleteSheet,
      issueShareId: state.issueShareId,
      addItem: state.addItem,
      editItem: state.editItem,
      deleteItem: state.deleteItem,
      setItems: state.setItems,
      setItemCategory: state.setItemCategory,
      addCategory: state.addCategory,
      editCategory: state.editCategory,
      deleteCategory: state.deleteCategory,
      setCategories: state.setCategories,
    })),
  );

  const handleAddCategory = (newCategory: ShoppingCategoryModel) => {
    if (!id) return;
    addCategory(id, newCategory);
  };

  const handleUpdateCategories = (items: ShoppingCategoryModel[]) => {
    if (!id) return;
    setCategories(id, items);
  };

  const handleDeleteCategory = (shoppingCategoryId: string) => {
    if (!id) return;
    deleteCategory(id, shoppingCategoryId);
  };

  const handleEditCategory = (newItem: ShoppingCategoryModel) => {
    if (!id) return;
    editCategory(id, newItem);
  };

  const sortItems = () => {};
  const categories = useMemo(() => sheet?.categories ?? [], [sheet?.categories]);

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
            category: {
              id: 'uncategorized',
              name: 'その他',
            },
            items: uncategorizedItems,
          },
        ]
      : []),
  ];

  const handleReorderItemsInCategory = (
    categoryId: string | null,
    newCategoryItems: ShoppingItemModel[],
  ) => {
    if (!id || !sheet) return;
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
    <>
      {!isOpen && !isCategoryOpen && (
        <div className="min-h-screen bg-[#FAFAFA] pb-20">
          {/* header */}
          <div className="flex h-14 items-center gap-x-2 px-4">
            <div className="">
              <Link href="/sheets">
                <ChevronLeft className="size-5 stroke-2" />
              </Link>
            </div>
            <div className="flex-1">
              <span className="text-md font-bold">{sheet.name}</span>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger className="shrink-0 cursor-pointer rounded hover:bg-neutral-200">
                  <Ellipsis className="size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() => {
                      setIsOpen(true);
                    }}
                  >
                    シートを編集
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      setIsCategoryOpen(true);
                    }}
                  >
                    カテゴリを編集
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {}}>リストを削除</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
            <Accordion
              type="multiple"
              defaultValue={displayGroups.map((group) => group.category.id)}
            >
              {displayGroups.map((group) => (
                <AccordionItem
                  key={group.category.id}
                  value={group.category.id}
                  className="border-none px-4"
                >
                  <AccordionTrigger className="py-3">
                    <div className="flex items-center gap-x-1">
                      <div className="flex items-center">
                        <Bookmark className="size-4.5 fill-neutral-300 text-neutral-300" />
                      </div>
                      <div className="flex flex-1 items-center">
                        <span className="text-[14px] text-neutral-400">{group.category.name}</span>
                      </div>
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
      )}
      {isOpen && (
        <SheetEditing
          sheetId={sheet.id}
          items={sheet.items}
          categories={sheet.categories}
          onAddItem={addItem}
          onDeleteItem={deleteItem}
          onReorderItemsInCategory={(_sheetId, categoryId, newItems) =>
            handleReorderItemsInCategory(categoryId, newItems)
          }
          onClose={() => {
            setIsOpen(false);
          }}
        />
      )}
      {isCategoryOpen && (
        <CategoryManagement
          list={categories}
          onClose={() => setIsCategoryOpen(false)}
          onAdd={handleAddCategory}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
          onUpdate={handleUpdateCategories}
          onSort={sortItems}
        />
      )}
    </>
  );
}
