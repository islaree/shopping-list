import { Check } from 'lucide-react';

type Props = {
  id: string;
  name: string;
  checked: boolean;
  onEdit: () => void;
};

export function SheetDetailItem({ id, name, checked, onEdit }: Props) {
  return (
    <div className="flex h-14 items-center gap-x-2 bg-white px-4">
      <button
        type="button"
        className="flex h-full w-full flex-1 items-center gap-x-2 text-left"
        onClick={onEdit}
      >
        <input
          type="checkbox"
          checked={checked}
          className="hidden"
          id={`checkbox-${id}`}
          readOnly
        />
        <div
          className={`flex size-5 cursor-pointer items-center justify-center rounded-[6px] border ${
            checked ? 'border-emerald-400 bg-emerald-400' : 'border-[#F6F6F6] bg-[#FAFAFA]'
          } `}
        >
          {checked && <Check className="size-3.5 stroke-4 text-white" />}
        </div>
        <div className="text-md">{name}</div>
      </button>
    </div>
  );
}
