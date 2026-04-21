'use client';

import { Check, ChevronLeft, Ellipsis, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

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
} from '@/components/ui/dropdown-menu';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CategoryManagement } from './category-management';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCategoryModel, ShoppingItemModel } from '@/types/shopping-list';
import { ShareDialog } from './share-dialog';
import { useBoundStore } from '@/store/useBoundStore';
import { useShallow } from 'zustand/react/shallow';

const modes = {
  CATEGORY_MANAGEMENT: 'category_management',
  CHECK_LIST: 'check_list',
} as const;

export default function ShoppingListPage() {
  const params = useParams();
  const router = useRouter();
  const sheetId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [categoryValue, setCategoryValue] = useState<string | undefined>(undefined);
  const [value, setValue] = useState('');
  const [mode, setMode] = useState<(typeof modes)[keyof typeof modes]>(modes.CHECK_LIST);
  const [shareDialog, setShareDialog] = useState(false);

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

  // TODO: 共有機能を追加
  const shareShoppingList = async (shareId: string) => {
    try {
      await fetch('/api/shopping-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: sheet?.id ?? sheetId ?? '',
          name: sheet?.name ?? '',
          items: sheet?.items ?? [],
          categories: sheet?.categories ?? [],
          shareId,
        }),
      });
    } catch (e) {
      console.error('Failed to add shopping list:', e);
      throw new Error('Failed to add shopping list');
    }
  };

  const handleShare = async () => {
    if (!sheetId || sheet?.shareId) return;
    const id = issueShareId(sheetId);
    if (!id) return;
    await shareShoppingList(id);
  };

  // チェックリスト追加ダイアログ
  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);

  // アイテム操作
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

  // カテゴリ操作
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
    _categories: ShoppingCategoryModel[],
  ): ShoppingItemModel[] => {
    const categoryOrderMap = new Map(_categories.map((category, index) => [category.id, index]));

    return [...items].sort((a, b) => {
      const aOrder = categoryOrderMap.get(a.categoryId ?? '') ?? Infinity;
      const bOrder = categoryOrderMap.get(b.categoryId ?? '') ?? Infinity;
      return aOrder - bOrder;
    });
  };

  const sortItems = () => {
    // no-op: store側で常にソート済み
  };

  const categories = sheet?.categories ?? [];
  const list = useMemo(
    () => sortItemsByCategory(sheet?.items ?? [], categories),
    [sheet?.items, categories],
  );

  // その他を表示するのは、カテゴリが未設定かつ、categoriesに含まれるidがリスト内のアイテムに設定されていない場合
  const a = list.some((item) => categories.some((c) => c.id === item.categoryId));

  if (!sheet) {
    return (
      <div className="p-4">
        <Link href="/shopping-list" className="inline-flex items-center gap-x-2 text-sm underline">
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
        {/* header */}
        <div className="sticky top-0 z-20 flex h-14 items-center justify-between bg-white px-4">
          <div className="flex items-center gap-x-2">
            <Link href="/shopping-list" className="text-sm underline">
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
                    router.push('/shopping-list');
                  }}
                >
                  シートを削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* body */}
        <div>
          <div className="flex justify-end px-4"></div>
          <div className="mb-16 p-2">
            {list.map((item, index) => (
              <div key={index}>
                {list[index - 1]?.categoryId !== item.categoryId && (
                  <>
                    {a && !categories.find((c) => c.id === item.categoryId)?.name && (
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

  if (mode === modes.CATEGORY_MANAGEMENT) {
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
