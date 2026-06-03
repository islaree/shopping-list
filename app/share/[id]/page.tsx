import { notFound } from 'next/navigation';

import SharePage from '@/features/share/components/SharePage';
import { getSharedSheetById } from '@/lib/shared-sheet';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  const sharedSheet = await getSharedSheetById(id);

  if (!sharedSheet) {
    notFound();
  }

  return (
    <SharePage
      shoppingList={{
        id: crypto.randomUUID(),
        ...sharedSheet.sheet,
        shareId: sharedSheet.id,
      }}
    />
  );
}
