import Link from 'next/link';
import Head from 'next/head';
import Header from '../component/header';
import styles from '../styles/Home.module.css';

export default function MemoryPage({ memory }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>{memory.title}</title>
        <meta name="description" content={memory.description} />
      </Head>

      <Header />

      <main className={styles.main}>
        <h1>{memory.title}</h1>
        <iframe
          width="560"
          height="315"
          src={memory.youTubeEmbedUrl}
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
        <p>{memory.description}</p>

        <Link href="/">
          <a>&larr; back to all videos</a>
        </Link>
      </main>
    </div>
  );
}

export async function getStaticProps({ params }) {
  const { memory } = params;

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
          query GetMemory($slug: String!) {
            memoryCollection(
              where: {
                slug: $slug
              },
              limit: 1
            ) {
              items {
                title
                slug
                youTubeEmbedUrl
                description
              }
            }
          }
        `,
        variables: {
          slug: memory,
        },
      }),
    },
  );

  if (!result.ok) {
    console.error(result);
    return {};
  }

  const { data } = await result.json();

  const [memoryData] = data.memoryCollection.items;

  return {
    props: { memory: memoryData },
  };
}

export async function getStaticPaths() {
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
                slug
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
  const memorySlugs = data.memoryCollection.items;

  const paths = memorySlugs.map(({ slug }) => {
    return {
      params: { memory: slug },
    };
  });

  return {
    paths,
    fallback: false,
  };
}
