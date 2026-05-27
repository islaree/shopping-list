import Link from 'next/link';

export default function Home() {
  return (
    <>
      home画面
      <Link href="/sheets">シート一覧→</Link>
    </>
  );
}
