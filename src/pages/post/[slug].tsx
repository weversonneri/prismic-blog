import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { formatDate, formatFullDate } from '../../utils';
import { UtterancesComments } from '../../components/UtterancesComments';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface Content {
  heading: string;
  body: {
    text: string;
  }[];
}

interface PaginationProps {
  uid?: string;
  data?: {
    title: string;
  };
}

interface PostProps {
  post: Post;
  prevpost: PaginationProps;
  nextpost: PaginationProps;
  editDate: string | null;
}

export default function Post({
  post,
  prevpost,
  nextpost,
  editDate,
}: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const totalLetters = (content: Content[]): string => {
    const text = content.reduce((acc, curr) => {
      return RichText.asText(curr.body).trim().split(/\w+/g).length + acc;
    }, 0);
    const heading = content.reduce((acc, curr) => {
      return curr.heading.trim().split(/\w+/g).length + acc;
    }, 0);
    const timeOfRead = Math.ceil((text + heading) / 200);
    return `${timeOfRead} min`;
  };

  return (
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>
      <header>
        <figure>
          <img
            src={post.data.banner.url}
            alt="banner"
            className={styles.postBanner}
          />
        </figure>
      </header>
      <main className={styles.container}>
        <article className={styles.postContainer}>
          <header className={styles.postHeader}>
            <h1>{post.data.title}</h1>
            <div className={styles.postStats}>
              <div>
                <p>
                  <FiCalendar />
                  {formatDate(post.first_publication_date)}
                </p>
                <p>
                  <FiUser />
                  {post.data.author}
                </p>
                <p>
                  <FiClock />
                  {totalLetters(post.data.content)}
                </p>
              </div>

              {editDate && <small>* editado em {editDate}</small>}
            </div>
          </header>
          {post.data.content.map(item => (
            <div key={item.heading} className={styles.postContent}>
              <h3 className={styles.heading}>{item.heading}</h3>
              <div
                className={styles.text}
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(item.body) }}
              />
            </div>
          ))}
        </article>
        <footer className={styles.footer}>
          <hr />

          <div className={styles.postsNavigation}>
            <div className={styles.prevPost}>
              {prevpost.data && (
                <>
                  <h3>{prevpost.data.title}</h3>
                  <a href={`/post/${prevpost.uid}`}>Post anterior</a>
                </>
              )}
            </div>

            <div className={styles.nextPost}>
              {nextpost.data && (
                <>
                  <h3>{nextpost.data.title}</h3>
                  <a href={`/post/${nextpost.uid}`}>Próximo post</a>
                </>
              )}
            </div>
          </div>

          <UtterancesComments />
        </footer>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.predicates.at('document.type', 'post'),
    { pageSize: 2 }
  );

  const paths = posts.results.map(post => ({
    params: { slug: String(post.uid) },
  }));

  return {
    paths,
    fallback: true,
  };
};

// // aqui gera a pagina estaticamente
export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});
  console.log('🚀 ~ file: [slug].tsx ~ line 172 ~ response', response);

  const editDate =
    response.last_publication_date !== response.first_publication_date
      ? formatFullDate(response.first_publication_date)
      : null;

  const prevpost =
    (
      await prismic.query([Prismic.Predicates.at('document.type', 'post')], {
        pageSize: 1,
        after: `${response.id}`,
        orderings: '[document.first_publication_date]',
      })
    ).results[0] || 'undefined';

  const nextpost =
    (
      await prismic.query([Prismic.Predicates.at('document.type', 'post')], {
        pageSize: 1,
        after: `${response.id}`,
        orderings: '[document.first_publication_date desc]',
      })
    ).results[0] || 'undefined';

  return {
    props: {
      post: response,
      prevpost,
      nextpost,
      editDate,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};
