import { SheetDetailPage } from '@/features/sheet/pages/sheet-detail-page';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <SheetDetailPage id={id} />;
}
