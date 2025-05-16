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

type ShoppingList = {
  id: string;
  title: string;
};

export default function Home() {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const handleAddItem = () => {
    if (value.trim() === '') return;
    const newItem = {
      id: crypto.randomUUID(),
      title: value,
    };
    setShoppingLists([...shoppingLists, newItem]);
    setValue('');
    setOpen(false);
  };

  const handleEdit = ({ id, title }: { id: string; title: string }) => {
    setShoppingLists(
      shoppingLists.map((item) => {
        if (item.id === id) {
          return { ...item, title: title };
        }
        return item;
      }),
    );
    setValue('');
    setOpen(false);
  };

  const isFirstRender = useRef(true);

  const handleDeleteItem = (id: string) => {
    setShoppingLists(shoppingLists.filter((item) => item.id !== id));
  };

  useEffect(() => {
    const data = getLocalStorage(localStorageKey.SHOPPING_LIST);
    if (data === undefined) return;
    setShoppingLists(data);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // 初回はスキップ
    }
    setLocalStorage<ShoppingList[]>(localStorageKey.SHOPPING_LIST, shoppingLists);
  }, [shoppingLists]);

  return (
    <>
      <div className="py-10">
        <div className="px-4 text-[13px] text-neutral-400">あなたの買い物リスト</div>
        <div className="mt-2 flex flex-col px-2">
          {shoppingLists.map((shoppingList) => (
            <ShoppingList
              key={shoppingList.id}
              data={shoppingList}
              onEdit={handleEdit}
              onDelete={handleDeleteItem}
            />
          ))}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <div
                className="flex cursor-pointer items-center gap-x-2 rounded p-2 text-teal-400 hover:bg-teal-50"
                onClick={handleAddItem}
              >
                <Plus />
                <div className="font-bold">リストを追加</div>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>リストを追加</DialogTitle>
              </DialogHeader>
              <div>
                <div>
                  <div className="mb-1 text-sm text-neutral-400">リスト名</div>
                  <div>
                    <Input
                      value={value}
                      placeholder="リスト名を入力"
                      onChange={(e) => setValue(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <button
                  className="text-md h-10 w-full rounded border border-neutral-200 bg-white text-black"
                  onClick={() => setOpen(false)}
                >
                  キャンセル
                </button>
                <button
                  className="text-md h-10 w-full rounded bg-black font-bold text-white"
                  onClick={() => {
                    setOpen(false);
                    handleAddItem();
                  }}
                >
                  追加
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}

function ShoppingList({
  data,
  onEdit,
  onDelete,
}: {
  data: { id: string; title: string };
  onEdit: (list: { id: string; title: string }) => void;
  onDelete: (id: string) => void;
}) {
  const { id, title } = data;
  const [value, setValue] = useState(title);
  const [open, setOpen] = useState(false);

  const handleEdit = () => {
    onEdit({ id, title: value });
  };
  const handleDelete = () => onDelete(id);

  return (
    <>
      <div className="flex items-center justify-between gap-x-2 rounded p-2 hover:bg-neutral-100">
        <Link href={`/shopping-list/${id}`} className="flex flex-1 items-center gap-2">
          <StickyNote className="text-neutral-400" />
          <div>{title}</div>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer rounded hover:bg-neutral-200">
            <Ellipsis />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-md py-2"
              onClick={() => toast('共有リンクをコピーしました🥳')}
            >
              共有リンクをコピー
            </DropdownMenuItem>
            <DropdownMenuItem className="text-md py-2" onClick={() => setOpen(true)}>
              リスト名を編集
            </DropdownMenuItem>
            <DropdownMenuItem className="text-md py-2" onClick={handleDelete}>
              リストを削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>リスト名を編集</DialogTitle>
          </DialogHeader>
          <div>
            <div>
              <div className="mb-1 text-sm text-neutral-400">リスト名</div>
              <div>
                <Input
                  value={value}
                  placeholder="アイテム名を入力"
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <button
              className="text-md h-10 w-full rounded border border-neutral-200 bg-white text-black"
              onClick={() => setOpen(false)}
            >
              キャンセル
            </button>
            <button
              className="text-md h-10 w-full rounded bg-black font-bold text-white"
              onClick={() => {
                setOpen(false);
                handleEdit();
              }}
            >
              変更を保存
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
