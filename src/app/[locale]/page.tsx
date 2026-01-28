import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Layout } from '@/components/layouts';
import SearchBar from '@/components/search/SearchBar';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <Layout>
       <SearchBar autoFocus={true}/>
    </Layout>
  );
}