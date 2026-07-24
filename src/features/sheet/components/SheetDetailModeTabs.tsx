'use client';

import type React from 'react';
import { Pencil, ShoppingCart, Tags } from 'lucide-react';

const labels = {
  shopping: '買い物中',
  editing: '編集中',
  category_management: 'カテゴリ管理',
} as const;

export function SheetDetailModeTabs({
  value,
  onValueChange,
}: {
  value: keyof typeof labels;
  onValueChange: (value: keyof typeof labels) => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white">
      <div className="mx-auto grid h-14 max-w-xl grid-cols-3">
        <TabButton
          active={value === 'shopping'}
          label={labels.shopping}
          icon={<ShoppingCart size={18} />}
          onClick={() => onValueChange('shopping')}
        />
        <TabButton
          active={value === 'editing'}
          label={labels.editing}
          icon={<Pencil size={18} />}
          onClick={() => onValueChange('editing')}
        />
        <TabButton
          active={value === 'category_management'}
          label={labels.category_management}
          icon={<Tags size={18} />}
          onClick={() => onValueChange('category_management')}
        />
      </div>
    </div>
  );
}

function TabButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-full flex-col items-center justify-center gap-1 text-xs ${
        active ? 'text-teal-600' : 'text-neutral-500'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
