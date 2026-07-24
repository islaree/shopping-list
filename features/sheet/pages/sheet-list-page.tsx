'use client';

import { useBoundStore } from '@/stores/use-bound-store';
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { CornerDownLeft, Plus } from 'lucide-react';
import { SheetListItem } from '../components/sheet-list-item';
import { ShoppingItemModel, ShoppingListModel } from '@/types/shopping-list';
import { SheetShareDialog } from '../components/SheetShareDialog';

export function SheetListPage() {
  const [selectedSheet, setSelectedSheet] = useState<ShoppingListModel | null>(null);
  const { sheets, addSheet, editSheet, deleteSheet } = useBoundStore(
    useShallow((state) => ({
      sheets: state.sheets,
      addSheet: state.addSheet,
      editSheet: state.editSheet,
      deleteSheet: state.deleteSheet,
    })),
  );

  const handleAddItem = (title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    addSheet(trimmed);
    setValue('');
  };

  const confirmEditingSheet = (id: string, editName: string) => {
    editSheet({ id: id, name: editName });
  };

  const handleDeleteSheet = (sheet: { id: string; name: string }) => {
    deleteSheet(sheet.id);
  };

  const [value, setValue] = useState('');

  const isAllChecked = (items: ShoppingItemModel[]) => {
    const sum = items.length;
    let count = 0;

    items.map((item) => {
      if (!item.checked) return;
      count++;
    });

    return sum === count;
  };

  const calcNonCheckedCount = (items: ShoppingItemModel[]) => {
    let count = 0;

    items.map((item) => {
      if (!item.checked) count++;
    });

    return count;
  };

  const [isOpenShare, setIsOpenShare] = useState(false);

  return (
    <>
      {!isOpenShare && (
        <div className="min-h-screen bg-[#FAFAFA] pb-20">
          <div className="flex h-14 items-center justify-end px-4">
            <div className="flex size-8 items-center justify-center rounded-full bg-neutral-200">
              <span className="text-[13px] font-bold text-white">M</span>
            </div>
          </div>
          <div className="px-4">
            <div className="text-[13px] text-neutral-400">シート一覧</div>
            <div className="mt-3 divide-y divide-[#F6F6F6] overflow-hidden rounded-[12px] border border-[#F6F6F6]">
              {sheets.map((sheet) => (
                <SheetListItem
                  // 個別のシートに関する処理
                  key={sheet.id}
                  sheet={sheet}
                  name={sheet.name}
                  isEmpty={sheet.items.length === 0}
                  count={calcNonCheckedCount(sheet.items)}
                  isAllChecked={isAllChecked(sheet.items)}
                  href={`/sheets/${sheet.id}`}
                  // シート一覧に関係する処理
                  onDelete={() => handleDeleteSheet({ id: sheet.id, name: sheet.name })}
                  onEdit={(name: string) => confirmEditingSheet(sheet.id, name)}
                  onOpen={() => {
                    setIsOpenShare(true);
                    setSelectedSheet(sheet);
                  }}
                />
              ))}
              <div className="flex h-14 items-center gap-x-2 bg-white px-4">
                <div>
                  <Plus className="size-5 text-[#DFDFDF]" />
                </div>
                <div className="h-full flex-1">
                  <input
                    className="h-full w-full border-none placeholder:text-[#D4D4D4] focus-visible:outline-none"
                    value={value}
                    placeholder="新規シートを追加"
                    onChange={(e) => {
                      setValue(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return;
                      if (e.nativeEvent.isComposing) return;
                      e.preventDefault();
                      const value = e.currentTarget.value;
                      handleAddItem(value);
                      e.currentTarget.value = '';
                      setValue('');
                    }}
                  />
                </div>
                {value.trim().length > 0 && (
                  <button
                    type="button"
                    className="flex size-5 cursor-pointer items-center justify-center rounded-[8px] bg-emerald-400"
                    onClick={() => {
                      handleAddItem(value);
                    }}
                  >
                    <CornerDownLeft className="size-3 stroke-4 text-white" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {isOpenShare && selectedSheet && (
        <SheetShareDialog onClose={() => setIsOpenShare(false)} sheet={selectedSheet} />
      )}
    </>
  );
}
