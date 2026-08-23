'use client';

import { CategoryManagement } from '@/features/sheet/components/CategoryManagement';
import { useBoundStore } from '@/stores/use-bound-store';
import { notFound, useRouter } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';

type Props = {
  id: string;
};

export function CategoryManagementPage({ id }: Props) {
  const router = useRouter();
  const { sheet, addCategory, editCategory, deleteCategory, setCategories } = useBoundStore(
    useShallow((state) => ({
      sheet: state.sheets.find((current) => current.id === id),
      addCategory: state.addCategory,
      editCategory: state.editCategory,
      deleteCategory: state.deleteCategory,
      setCategories: state.setCategories,
    })),
  );

  if (!sheet) {
    notFound();
  }

  return (
    <CategoryManagement
      list={sheet.categories}
      onAdd={(category) => addCategory(id, category)}
      onEdit={(category) => editCategory(id, category)}
      onDelete={(categoryId) => deleteCategory(id, categoryId)}
      onUpdate={(categories) => setCategories(id, categories)}
      onClose={() => router.push(`/sheets/${id}`)}
    />
  );
}
