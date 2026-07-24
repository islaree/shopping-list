'use client';

import { Button } from '@/shared/components/button';
// import { useBoundStore } from '@/stores/useBoundStore';
import { useRouter } from 'next/navigation';

export function DownloadButton() {
  const router = useRouter();
  // const importSheet = useBoundStore((state) => state.importSheet);

  const handleDownload = () => {
    // importSheet(shoppingList);
    // router.push(`/sheets/${shoppingList.id}`);
    alert('download');
    router.push('/sheets');
  };

  return <Button onClick={handleDownload}>Download</Button>;
}
