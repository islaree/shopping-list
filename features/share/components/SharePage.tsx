'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Button } from '@/shared/components/button';
import { useBoundStore } from '@/stores/useBoundStore';
import { ShoppingListModel } from '@/types/shopping-list';

export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const importSheet = useBoundStore((state) => state.importSheet);

  const [shoppingList, setShoppingList] = useState<ShoppingListModel | null>(null);

  const handleDownload = () => {
    if (!shoppingList) return;
    importSheet(shoppingList);
    router.push(`/sheets/${shoppingList.id}`);
  };

  useEffect(() => {
    const getShoppingList = async () => {
      const res = await fetch(`/api/shopping-list?id=${params.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) return;
      const { id, sheet } = await res.json();
      if (!sheet) return;
      setShoppingList({ id: crypto.randomUUID(), ...sheet, shareId: id });
    };
    getShoppingList();
  }, [params.id]);

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
