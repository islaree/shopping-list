'use client';

import { Ellipsis, Plus, StickyNote } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import { useEffect, useRef, useState } from 'react';
import { getLocalStorage, localStorageKey, setLocalStorage } from '@/lib/localStorage';
import { ShoppingList } from '@/types/shoppingList';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function ShoppingListsPage() {
  const [open, setOpen] = useState(false); // ショッピングリストの追加ダイアログ表示制御
  const [value, setValue] = useState(''); // ショッピングリストの追加value
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]); // ショッピングリスト一覧

  const isFirstRender = useRef(true);

  // 買い物リスト追加処理
  const handleAddItem = () => {
    const list = { id: crypto.randomUUID(), name: value, items: [], categories: [] };

    setShoppingLists([...shoppingLists, list]);
    setValue('');
    setOpen(false);
  };

  const handleEdit = ({ id, name }: { id: string; name: string }) => {
    setShoppingLists(
      shoppingLists.map((item) => {
        if (item.id === id) {
          return { ...item, name: name };
        }
        return item;
      }),
    );
    setValue('');
    setOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    setShoppingLists(shoppingLists.filter((item) => item.id !== id));
  };

  useEffect(() => {
    const data = getLocalStorage<ShoppingList[]>(localStorageKey.SHOPPING_LIST);
    if (data === undefined) return;
    setShoppingLists(data);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setLocalStorage<ShoppingList[]>(localStorageKey.SHOPPING_LIST, shoppingLists);
  }, [shoppingLists]);

  return (
    <>
      <div className="py-10">
        <div className="px-4 text-[13px] text-neutral-400">買い物リスト一覧</div>
        <div className="mt-2 flex flex-col px-2">
          {shoppingLists.map(({ id, name }) => (
            <List key={id} data={{ id, name }} onEdit={handleEdit} onDelete={handleDeleteItem} />
          ))}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <div className="flex cursor-pointer items-center gap-x-2 rounded p-2 text-teal-400 hover:bg-teal-50">
                <Plus />
                <div className="font-bold">リストを追加</div>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>リストを追加</DialogTitle>
              </DialogHeader>
              <div>
                <div className="grid w-full max-w-sm items-center gap-2">
                  <Label htmlFor="name" className="text-neutral-600">
                    リスト名
                  </Label>
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
                    setOpen(false);
                    handleAddItem();
                  }}
                >
                  追加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}

function List({
  data,
  onEdit,
  onDelete,
}: {
  data: { id: string; name: string };
  onEdit: (list: { id: string; name: string }) => void;
  onDelete: (id: string) => void;
}) {
  const { id, name } = data;
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);

  const handleEdit = () => {
    onEdit({ id, name: value });
  };
  const handleDelete = () => onDelete(id);

  useEffect(() => {
    setValue(name);
  }, [open, name]);

  return (
    <>
      <div className="flex items-center justify-between gap-x-2 rounded p-2 hover:bg-neutral-100">
        <Link href={`/shopping-list/${id}`} className="flex flex-1 items-center gap-2">
          <StickyNote className="text-neutral-400" />
          <div>{name}</div>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer rounded hover:bg-neutral-200">
            <Ellipsis />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast('共有リンクをコピーしました🥳')}>
              共有リンクをコピー
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpen(true)}>リスト名を編集</DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>リストを削除</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>リスト名を編集</DialogTitle>
          </DialogHeader>
          <div>
            <div className="grid w-full max-w-sm items-center gap-2">
              <Label htmlFor="name" className="text-neutral-600">
                リスト名
              </Label>
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
              variant="default"
              disabled={value.trim() === ''}
              onClick={() => {
                setOpen(false);
                handleEdit();
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
