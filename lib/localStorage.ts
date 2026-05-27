export const localStorageKey = {
  SHOPPING_LIST: 'shopping-list',
} as const;

export const getLocalStorage = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;

  const value = window.localStorage.getItem(key);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const setLocalStorage = <T>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
};
