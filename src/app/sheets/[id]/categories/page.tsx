import { CategoryManagementPage } from '@/features/sheet/pages/category-management-page';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <CategoryManagementPage id={id} />;
}
