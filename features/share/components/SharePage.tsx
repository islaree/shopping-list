'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Button } from '@/shared/components/button';
import { getLocalStorage, localStorageKey, setLocalStorage } from '@/lib/localStorage';
import { ShoppingListModel } from '@/types/shopping-list';

export default function SharePage() {
  const params = useParams();
  const router = useRouter();

  const [shoppingList, setShoppingList] = useState<ShoppingListModel | null>(null);

  const handleDownload = () => {
    const currentStorage = getLocalStorage(localStorageKey.SHOPPING_LIST);
    const storageArray = Array.isArray(currentStorage) ? currentStorage : [];
    const newStorage = [...storageArray, shoppingList];
    setLocalStorage(localStorageKey.SHOPPING_LIST, newStorage);

    router.push(`/sheets/${shoppingList?.id}`);
  };

  useEffect(() => {
    const getShoppingList = async () => {
      const res = await fetch(`/api/shopping-list?shareId=${params.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const { list, share_id } = await res.json();
      setShoppingList({ id: crypto.randomUUID(), ...list, shareId: share_id });
    };
    getShoppingList();
  }, [params]);

  return (
    <div className="w-full space-y-4 px-4 py-10">
      <div className="font-bold">共有されたリスト「{shoppingList?.name}」</div>
      <div className="w-full overflow-auto bg-neutral-100 p-2 text-sm">
        <pre>{JSON.stringify(shoppingList, null, 2)}</pre>
      </div>
      <div>
        <Button className="w-full" onClick={handleDownload}>
          取り込む
        </Button>
      </div>
    </div>
  );
}
