import { ShoppingListModel } from '@/types/shopping-list';
import { useCallback } from 'react';

function useLocalStorage() {
  // shopping_idに紐づくデータを返す
  const getItems = useCallback((key: string) => {
    const dataString = localStorage.getItem(key);

    if (!dataString) return;

    const data: ShoppingListModel[] = JSON.parse(dataString);
    return data ?? undefined;
  }, []);

  return {
    getItems,
  };
}

export { useLocalStorage };
