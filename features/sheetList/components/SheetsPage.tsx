'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { useBoundStore } from '@/stores/useBoundStore';
import { Ellipsis, Plus, StickyNote } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

export function SheetsPage() {
  const [newTitle, setNewTitle] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSheet, setEditingSheet] = useState<{ id: string; name: string } | null>(null);
  const [editingName, setEditingName] = useState('');
  const editModalInputRef = useRef<HTMLInputElement | null>(null);
  const { sheets, addSheet, editSheet, deleteSheet } = useBoundStore(
    useShallow((state) => ({
      sheets: state.sheets,
      addSheet: state.addSheet,
      editSheet: state.editSheet,
      deleteSheet: state.deleteSheet,
    })),
  );

  useEffect(() => {
    if (!editModalOpen) return;
    const raf = requestAnimationFrame(() => {
      editModalInputRef.current?.focus();
      editModalInputRef.current?.select();
    });
    return () => cancelAnimationFrame(raf);
  }, [editModalOpen]);

  const handleAddItem = (title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    addSheet(trimmed);
    setNewTitle('');
  };

  const startEditingSheet = (sheet: { id: string; name: string }) => {
    setEditingSheet(sheet);
    setEditingName(sheet.name);
    setEditModalOpen(true);
  };

  const cancelEditingSheet = () => {
    setEditModalOpen(false);
    setEditingSheet(null);
    setEditingName('');
  };

  const confirmEditingSheet = () => {
    if (!editingSheet) return;
    const trimmed = editingName.trim();
    if (!trimmed) return cancelEditingSheet();
    if (trimmed !== editingSheet.name) editSheet({ id: editingSheet.id, name: trimmed });
    cancelEditingSheet();
  };

  const handleDeleteSheet = (sheet: { id: string; name: string }) => {
    deleteSheet(sheet.id);
  };

  return (
    <>
      <div className="flex h-14 items-center justify-center border-b border-neutral-200 px-4">
        <span className="text-[15px] font-bold">シート一覧</span>
      </div>
      <div>
        {sheets.map((sheet) => (
          <div
            key={sheet.id}
            className="flex h-12 items-center gap-x-2 border-b border-neutral-200 px-4"
          >
            <Link href={`/sheets/${sheet.id}`} className="flex h-full w-full items-center gap-x-2">
              <div>
                <StickyNote className="text-neutral-400" />
              </div>
              <div className="w-full">{sheet.name}</div>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer rounded hover:bg-neutral-200">
                <Ellipsis />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => startEditingSheet({ id: sheet.id, name: sheet.name })}
                >
                  リスト名を編集
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => handleDeleteSheet({ id: sheet.id, name: sheet.name })}
                >
                  リストを削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
        <div className="flex h-12 items-center gap-x-2 px-4">
          <div className="text-neutral-400">
            <Plus />
          </div>
          <input
            className="w-full bg-transparent text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
            value={newTitle}
            placeholder="新規シート追加"
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              if (e.nativeEvent.isComposing) return;
              e.preventDefault();
              const value = e.currentTarget.value;
              handleAddItem(value);
              e.currentTarget.value = '';
              setNewTitle('');
            }}
          />
        </div>
      </div>
      {editModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onMouseDown={(e) => {
            if (e.target !== e.currentTarget) return;
            cancelEditingSheet();
          }}
        >
          <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-lg">
            <div className="text-sm font-bold">リスト名を編集</div>
            <input
              ref={editModalInputRef}
              className="mt-3 w-full rounded border border-neutral-200 px-3 py-2 text-neutral-900 focus:ring-2 focus:ring-teal-400 focus:outline-none"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing) return;
                if (e.key === 'Escape') {
                  e.preventDefault();
                  cancelEditingSheet();
                  return;
                }
                if (e.key !== 'Enter') return;
                e.preventDefault();
                confirmEditingSheet();
              }}
            />
            <div className="mt-4 flex justify-end gap-x-2">
              <button
                type="button"
                className="rounded px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
                onClick={cancelEditingSheet}
              >
                キャンセル
              </button>
              <button
                type="button"
                className="rounded bg-teal-500 px-3 py-2 text-sm font-bold text-white hover:bg-teal-600"
                onClick={confirmEditingSheet}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
