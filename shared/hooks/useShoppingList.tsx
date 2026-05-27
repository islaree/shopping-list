import { useCallback, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { localStorageKey } from '@/lib/localStorage';
import { ShoppingCategoryModel, ShoppingItemModel } from '@/types/shopping-list';

function useShoppingList() {
  const { getItems } = useLocalStorage();
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [shareId, setShareId] = useState<string | null>(null);
  const [items, setItems] = useState<ShoppingItemModel[]>([]);
  const [categories, setCategories] = useState<ShoppingCategoryModel[]>([]);

  const getShoppingList = useCallback((id: string) => {
    const data = getItems(localStorageKey.SHOPPING_LIST);
    if (!data) return undefined;

    const shoppingList = data.find((d) => d.id === id);
    if (!shoppingList) return undefined;

    setId(shoppingList.id);
    setName(shoppingList.name);
    setShareId(shoppingList.shareId);
    setItems(shoppingList.items ?? []);
    setCategories(shoppingList.categories ?? []);

    return shoppingList;
  }, []);

  return { id, name, shareId, items, categories, getShoppingList };
}

export { useShoppingList };
