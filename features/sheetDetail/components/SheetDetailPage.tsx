'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronLeft, Ellipsis, Plus } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';

import { Button } from '@/shared/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
import { useBoundStore } from '@/stores/useBoundStore';
import { ShoppingCategoryModel, ShoppingItemModel } from '@/types/shopping-list';

import { CategoryManagement } from './CategoryManagement';
import { ShareDialog } from './ShareDialog';
import { SheetDetailModeTabs } from './SheetDetailModeTabs';
import { SheetEditing } from './SheetEditing';

const modes = {
  SHOPPING: 'shopping',
  EDITING: 'editing',
  CATEGORY_MANAGEMENT: 'category_management',
} as const;

export function SheetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sheetId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [categoryValue, setCategoryValue] = useState<string | undefined>(undefined);
  const [value, setValue] = useState('');
  const [mode, setMode] = useState<(typeof modes)[keyof typeof modes]>(modes.SHOPPING);
  const [shareDialog, setShareDialog] = useState(false);
  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);

  const {
    sheet,
    deleteSheet,
    issueShareId,
    addItem,
    editItem,
    deleteItem,
    setItems,
    setItemCategory,
    addCategory,
    editCategory,
    deleteCategory,
    setCategories,
  } = useBoundStore(
    useShallow((state) => ({
      sheet: state.sheets.find((s) => s.id === sheetId),
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

  const shareShoppingList = async (shareId: string) => {
    const response = await fetch('/api/shopping-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: sheet?.id ?? sheetId ?? '',
        name: sheet?.name ?? '',
        items: sheet?.items ?? [],
        categories: sheet?.categories ?? [],
        shareId,
      }),
    });
    if (!response.ok) throw new Error('Failed to add shopping list');
  };

  const handleShare = async () => {
    if (!sheetId || sheet?.shareId) return;
    const id = issueShareId(sheetId);
    if (!id) return;
    await shareShoppingList(id);
  };

  const handleAddItem = () => {
    setValue('');
    setCategoryValue(undefined);
    if (!sheetId) return;
    addItem(sheetId, { name: value, categoryId: categoryValue ?? null });
  };

  const handleEditItem = async (item: ShoppingItemModel) => {
    if (!sheetId) return;
    editItem(sheetId, item);
  };

  const handleDeleteItem = (id: string) => {
    if (!sheetId) return;
    deleteItem(sheetId, id);
  };

  const handleSelectCategory = (categoryId: string | null, id: string) => {
    if (!sheetId) return;
    setItemCategory(sheetId, id, categoryId);
  };

  const handleAddCategory = (newCategory: ShoppingCategoryModel) => {
    if (!sheetId) return;
    addCategory(sheetId, newCategory);
  };

  const handleUpdateCategories = (items: ShoppingCategoryModel[]) => {
    if (!sheetId) return;
    setCategories(sheetId, items);
  };

  const handleDeleteCategory = (shoppingCategoryId: string) => {
    if (!sheetId) return;
    deleteCategory(sheetId, shoppingCategoryId);
  };

  const handleEditCategory = (newItem: ShoppingCategoryModel) => {
    if (!sheetId) return;
    editCategory(sheetId, newItem);
  };

  const sortItemsByCategory = (
    items: ShoppingItemModel[],
    categories: ShoppingCategoryModel[],
  ): ShoppingItemModel[] => {
    const indexMap = new Map(items.map((item, index) => [item.id, index]));
    const categoryOrderMap = new Map(categories.map((category, index) => [category.id, index]));
    return [...items].sort((a, b) => {
      const aOrder = categoryOrderMap.get(a.categoryId ?? '') ?? Infinity;
      const bOrder = categoryOrderMap.get(b.categoryId ?? '') ?? Infinity;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return (indexMap.get(a.id) ?? 0) - (indexMap.get(b.id) ?? 0);
    });
  };

  const sortItems = () => {};
  const categories = useMemo(() => sheet?.categories ?? [], [sheet?.categories]);
  const list = useMemo(
    () => sortItemsByCategory(sheet?.items ?? [], categories),
    [sheet?.items, categories],
  );
  const hasOther = list.some((item) => categories.some((c) => c.id === item.categoryId));

  const handleReorderItemsInCategory = (
    categoryId: string | null,
    newCategoryItems: ShoppingItemModel[],
  ) => {
    if (!sheetId || !sheet) return;
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
    setItems(sheetId, next);
  };

  if (!sheet) {
    return (
      <div className="p-4">
        <Link href="/sheets" className="inline-flex items-center gap-x-2 text-sm underline">
          <ChevronLeft />
          一覧へ戻る
        </Link>
        <div className="mt-4 text-sm text-neutral-500">リストが見つかりませんでした。</div>
      </div>
    );
  }

  return (
    <>
      {(mode === modes.SHOPPING || mode === modes.EDITING) && (
        <>
          <div className="sticky top-0 z-20 flex h-14 items-center justify-between bg-white px-4">
            <div className="flex items-center gap-x-2">
              <Link href="/sheets" className="text-sm underline">
                <ChevronLeft />
              </Link>
              <div className="font-bold">{sheet.name}</div>
            </div>
            <div className="flex items-center gap-x-4">
              {mode === modes.SHOPPING ? (
                <button onClick={() => setOpenAddItemDialog(true)}>
                  <Plus />
                </button>
              ) : null}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Ellipsis />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setMode(modes.CATEGORY_MANAGEMENT)}>
                    カテゴリを管理
                  </DropdownMenuItem>
                  <DropdownMenuItem>タイトルを編集</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShareDialog(true)}>
                    シートを共有
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-rose-600"
                    onClick={() => {
                      deleteSheet(sheet.id);
                      router.push('/sheets');
                    }}
                  >
                    シートを削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {mode === modes.SHOPPING ? (
            <>
              <div className="mb-16 divide-y divide-neutral-100">
                {list.map((item, index) => (
                  <div key={index}>
                    {list[index - 1]?.categoryId !== item.categoryId && (
                      <>
                        {hasOther && !categories.find((c) => c.id === item.categoryId)?.name && (
                          <div className="flex h-8 items-center border-y border-neutral-200 bg-neutral-50 px-4 text-[13px] text-neutral-500">
                            その他
                          </div>
                        )}
                        {categories.find((c) => c.id === item.categoryId)?.name && (
                          <div className="flex h-8 items-center border-y border-neutral-200 bg-neutral-50 px-4 text-[13px] text-neutral-500">
                            {categories.find((c) => c.id === item.categoryId)?.name}
                          </div>
                        )}
                      </>
                    )}
                    <CheckListItem
                      data={item}
                      categories={categories}
                      handleDeleteItem={handleDeleteItem}
                      handleSelectCategory={handleSelectCategory}
                      onEdit={handleEditItem}
                    />
                  </div>
                ))}
              </div>
              <Dialog open={openAddItemDialog} onOpenChange={setOpenAddItemDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>チェックアイテムを追加</DialogTitle>
                    <DialogDescription />
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid w-full max-w-sm items-center gap-2">
                      <Label htmlFor="name">カテゴリ</Label>
                      <Select onValueChange={setCategoryValue} disabled={categories.length === 0}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="カテゴリを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-2">
                      <Label htmlFor="name">アイテム名</Label>
                      <Input
                        id="name"
                        value={value}
                        placeholder="アイテム名を入力"
                        onChange={(e) => setValue(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="default"
                      disabled={value.trim() === ''}
                      onClick={() => {
                        setOpenAddItemDialog(false);
                        handleAddItem();
                      }}
                    >
                      追加
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <SheetEditing
              sheetId={sheet.id}
              items={sheet.items}
              categories={sheet.categories}
              onAddItem={addItem}
              onDeleteItem={deleteItem}
              onReorderItemsInCategory={(_sheetId, categoryId, newItems) =>
                handleReorderItemsInCategory(categoryId, newItems)
              }
            />
          )}
          <ShareDialog
            open={shareDialog}
            shareId={sheet.shareId}
            onOpenChange={setShareDialog}
            onSubmit={handleShare}
          />
        </>
      )}

      {mode === modes.CATEGORY_MANAGEMENT && (
        <div className="pb-16">
          <CategoryManagement
            list={categories}
            onChageMode={() => setMode(modes.SHOPPING)}
            onAdd={handleAddCategory}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            onUpdate={handleUpdateCategories}
            onSort={sortItems}
          />
        </div>
      )}

      <SheetDetailModeTabs value={mode} onValueChange={setMode} />
    </>
  );
}

function CheckListItem({
  data,
  categories,
  handleDeleteItem,
  handleSelectCategory,
  onEdit,
}: {
  data: ShoppingItemModel;
  categories: { id: string; name: string }[];
  handleDeleteItem: (id: string) => void;
  handleSelectCategory: (categoryId: string | null, id: string) => void;
  onEdit: (data: ShoppingItemModel) => void;
}) {
  const { id, name, checked } = data;
  const [openEditItemDialog, setOpenEditItemDialog] = useState(false);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (openEditItemDialog) {
      setValue(name);
    }
  }, [openEditItemDialog, name]);

  return (
    <>
      <div className={`flex h-14 items-center justify-between gap-x-2 px-4`}>
        <button
          type="button"
          className="flex h-full flex-1 items-center gap-x-2 text-left"
          onClick={() => onEdit({ ...data, checked: !checked })}
        >
          <input
            type="checkbox"
            checked={checked}
            className="hidden"
            id={`checkbox-${id}`}
            readOnly
          />
          <div
            className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded border ${
              checked ? 'border-[#22C55E] bg-[#22C55E]' : 'border-neutral-200 bg-neutral-50'
            }`}
          >
            {checked && <Check size={16} color="white" />}
          </div>
          <div className="text-md">{name}</div>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Ellipsis />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger
                  disabled={categories.length === 0}
                  className={`${categories.length === 0 && 'text-muted-foreground'}`}
                >
                  カテゴリ変更
                </DropdownMenuSubTrigger>

                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {categories.map((category) => (
                      <DropdownMenuItem
                        key={category.id}
                        onSelect={() => {
                          handleSelectCategory(category.id, id);
                        }}
                      >
                        {category.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem
                      onSelect={() => {
                        handleSelectCategory(null, id);
                      }}
                    >
                      その他
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuItem onClick={() => setOpenEditItemDialog(true)}>編集</DropdownMenuItem>
              <DropdownMenuItem className="text-rose-600" onClick={() => handleDeleteItem(id)}>
                削除
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Dialog open={openEditItemDialog} onOpenChange={setOpenEditItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>アイテム名を変更</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <div>
            <div className="grid w-full max-w-sm items-center gap-2">
              <Label htmlFor="name">アイテム名</Label>
              <Input
                id="name"
                value={value}
                placeholder="アイテム名を入力"
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              disabled={value.trim() === ''}
              onClick={() => {
                setOpenEditItemDialog(false);
                onEdit({ ...data, name: value });
              }}
            >
              変更を保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
