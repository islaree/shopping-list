import { SheetDetail } from '@/features/sheetDetail/components/SheetDetail';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <SheetDetail id={id} />;
}
