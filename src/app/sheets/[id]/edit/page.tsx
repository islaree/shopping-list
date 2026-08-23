import { SheetEditingPage } from '@/features/sheet/pages/sheet-editing-page';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <SheetEditingPage id={id} />;
}
