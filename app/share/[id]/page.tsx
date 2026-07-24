import { notFound } from 'next/navigation';

import { getSharedSheetById } from '@/lib/shared-sheet';
import { SharePage } from '@/features/share/pages/share-page';

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
      sheet={{
        id: crypto.randomUUID(),
        ...sharedSheet.sheet,
        shareId: sharedSheet.id,
      }}
    />
  );
}
