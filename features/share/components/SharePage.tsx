'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/shared/components/button';
import { useBoundStore } from '@/stores/useBoundStore';
import { ShoppingListModel } from '@/types/shopping-list';

type Props = {
  shoppingList: ShoppingListModel;
};

export default function SharePage({ shoppingList }: Props) {
  const router = useRouter();
  const importSheet = useBoundStore((state) => state.importSheet);

  const handleDownload = () => {
    importSheet(shoppingList);
    router.push(`/sheets/${shoppingList.id}`);
  };

  return (
    <div className="w-full space-y-4 px-4 py-10">
      <div className="font-bold">共有されたリスト「{shoppingList.name}」</div>
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
