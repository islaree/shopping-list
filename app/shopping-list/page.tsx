'use client';

import { useState } from 'react';
// icons
import { Plus } from 'lucide-react';
// components
import { AddShoppingListDialog } from './add-shopping-list-dialog';
import { ShoppingList } from './shopping-list';
import { useBoundStore } from '@/store/useBoundStore';
import { useShallow } from 'zustand/react/shallow';

export default function ShoppingListsPage() {
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
        <div className="px-4 text-[13px] text-neutral-400">買い物リスト一覧</div>
        <div className="mt-2 px-2">
          {sheets.map(({ id, name }) => (
            <ShoppingList key={id} data={{ id, name }} onEdit={editSheet} onDelete={deleteSheet} />
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
      <AddShoppingListDialog
        open={openShoppingListDialog}
        onOpenChange={setOpenShoppingListDialog}
        onSubmit={addSheet}
        onClose={() => setOpenShoppingListDialog(false)}
      />
    </>
  );
}
