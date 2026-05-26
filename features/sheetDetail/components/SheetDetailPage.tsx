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

const modes = {
  CATEGORY_MANAGEMENT: 'category_management',
  CHECK_LIST: 'check_list',
} as const;

export function SheetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sheetId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [categoryValue, setCategoryValue] = useState<string | undefined>(undefined);
  const [value, setValue] = useState('');
  const [mode, setMode] = useState<(typeof modes)[keyof typeof modes]>(modes.CHECK_LIST);
  const [shareDialog, setShareDialog] = useState(false);
  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);

  const {
    sheet,
    deleteSheet,
    issueShareId,
    addItem,
    editItem,
    deleteItem,
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
    const categoryOrderMap = new Map(categories.map((category, index) => [category.id, index]));
    return [...items].sort(
      (a, b) =>
        (categoryOrderMap.get(a.categoryId ?? '') ?? Infinity) -
        (categoryOrderMap.get(b.categoryId ?? '') ?? Infinity),
    );
  };

  const sortItems = () => {};
  const categories = sheet?.categories ?? [];
  const list = useMemo(
    () => sortItemsByCategory(sheet?.items ?? [], categories),
    [sheet?.items, categories],
  );
  const hasOther = list.some((item) => categories.some((c) => c.id === item.categoryId));

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

  if (mode === modes.CHECK_LIST) {
    return (
      <>
        <div className="sticky top-0 z-20 flex h-14 items-center justify-between bg-white px-4">
          <div className="flex items-center gap-x-2">
            <Link href="/sheets" className="text-sm underline">
              <ChevronLeft />
            </Link>
            <div className="font-bold">{sheet.name}</div>
          </div>
          <div className="flex items-center gap-x-4">
            <button onClick={() => setOpenAddItemDialog(true)}>
              <Plus />
            </button>
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
        <div className="mb-16 p-2">
          {list.map((item, index) => (
            <div key={index}>
              {list[index - 1]?.categoryId !== item.categoryId && (
                <>
                  {hasOther && !categories.find((c) => c.id === item.categoryId)?.name && (
                    <div className="relative my-5 h-[1px] w-full bg-neutral-200">
                      <div className="absolute top-1/2 left-0 flex h-4 w-full -translate-y-1/2 items-center justify-start">
                        <div className="rounded bg-white px-2 py-0.5 text-[13px] text-neutral-500">
                          その他
                        </div>
                      </div>
                    </div>
                  )}
                  {categories.find((c) => c.id === item.categoryId)?.name && (
                    <div className="relative my-5 h-[1px] w-full bg-neutral-200">
                      <div className="absolute top-1/2 left-0 flex h-4 w-full -translate-y-1/2 items-center justify-start">
                        <div className="rounded bg-white px-2 py-0.5 text-[13px] text-neutral-500">
                          {categories.find((c) => c.id === item.categoryId)?.name}
                        </div>
                      </div>
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
        <ShareDialog
          open={shareDialog}
          shareId={sheet.shareId}
          onOpenChange={setShareDialog}
          onSubmit={handleShare}
        />
      </>
    );
  }

  return (
    <CategoryManagement
      list={categories}
      onChageMode={() => setMode(modes.CHECK_LIST)}
      onAdd={handleAddCategory}
      onEdit={handleEditCategory}
      onDelete={handleDeleteCategory}
      onUpdate={handleUpdateCategories}
      onSort={sortItems}
    />
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
      <div className={`flex items-center justify-between gap-x-2 p-2`}>
        <div className="flex items-center gap-x-2">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onEdit({ ...data, checked: e.target.checked })}
            className="hidden"
            id={`checkbox-${id}`}
          />
          <label
            htmlFor={`checkbox-${id}`}
            className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded border ${
              checked ? 'border-teal-400 bg-teal-400' : 'border-neutral-300 bg-white'
            }`}
          >
            {checked && <Check size={16} color="white" />}
          </label>
          <div className="text-md">{name}</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
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
