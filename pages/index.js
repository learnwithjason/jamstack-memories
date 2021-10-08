import Link from 'next/link';
import Head from 'next/head';
import Header from '../component/header';
import styles from '../styles/Home.module.css';

export default function Home({ memories }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Jamstack Memories</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className={styles.main}>
        <h1 className={styles.title}>Jamstack Memories</h1>

        <ul>
          {memories.map((memory) => (
            <li key={memory.slug}>
              <Link href={`/${memory.slug}`}>
                <a>{memory.title}</a>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  const result = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/master`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CONTENTFUL_DELIVERY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            memoryCollection {
              items {
                title
                slug
                youTubeEmbedUrl
                description
              }
            }
          }
        `,
      }),
    },
  );

  if (!result.ok) {
    console.error(result);
    return {};
  }

  const { data } = await result.json();
  const memories = data.memoryCollection.items;

  return {
    props: {
      memories,
    },
  };
}
