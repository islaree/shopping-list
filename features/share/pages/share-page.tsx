import { DownloadButton } from '../components/download-button';

export type Sheet = {
  id: string;
  name: string;
  items: SheetItem[] | [];
  categories: SheetCategory[] | [];
  shareId: string | null;
};

export type SheetItem = {
  id: string;
  name: string;
  categoryId: string | null;
  checked: boolean;
};

export type SheetCategory = {
  id: string;
  name: string;
};

type Props = {
  sheet: Sheet;
};

export function SharePage({ sheet }: Props) {
  return (
    <div className="w-full space-y-4 px-4 py-10">
      <div className="font-bold">共有されたリスト「{sheet.name}」</div>
      <div className="w-full overflow-auto bg-neutral-100 p-2 text-sm">
        <pre>{JSON.stringify(sheet, null, 2)}</pre>
      </div>
      <div>
        <DownloadButton />
      </div>
    </div>
  );
}
