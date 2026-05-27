'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { useBoundStore } from '@/stores/useBoundStore';

import { AddSheetDialog } from './AddSheetDialog';
import { SheetListTitle } from './SheetListTitle';
import { ShoppingListCard } from './ShoppingListCard';

export function SheetListPage() {
  const [openShoppingListDialog, setOpenShoppingListDialog] = useState(false);

  const { sheets, addSheet, editSheet, deleteSheet } = useBoundStore(
    useShallow((state) => ({
      sheets: state.sheets,
      addSheet: state.addSheet,
      editSheet: state.editSheet,
      deleteSheet: state.deleteSheet,
    })),
  );

  return (
    <>
      <div className="py-10">
        <SheetListTitle title="買い物リスト一覧" />
        <div className="mt-2 px-2">
          {sheets.map(({ id, name }) => (
            <ShoppingListCard
              key={id}
              data={{ id, name }}
              onEdit={editSheet}
              onDelete={deleteSheet}
            />
          ))}
          <div
            className="inline-flex cursor-pointer items-center gap-x-2 rounded p-2 text-teal-400 hover:bg-teal-50"
            onClick={() => setOpenShoppingListDialog(true)}
          >
            <Plus />
            <div className="font-bold">リストを追加</div>
          </div>
        </div>
      </div>
      <AddSheetDialog
        open={openShoppingListDialog}
        onOpenChange={setOpenShoppingListDialog}
        onSubmit={addSheet}
        onClose={() => setOpenShoppingListDialog(false)}
      />
    </>
  );
}
