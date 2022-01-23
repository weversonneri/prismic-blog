import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';

import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { formatDate } from '../utils';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const { results, next_page } = postsPagination;
  const [posts, setPosts] = useState<Post[]>(results);
  const [nextPage, setNextPage] = useState(next_page);

  async function handleLoadMorePosts(): Promise<void> {
    try {
      if (!nextPage) {
        return;
      }

      const response = await fetch(next_page);
      const data = await response.json();

      const newPosts = data.results.map(result => {
        return {
          uid: result.uid,
          first_publication_date: result.first_publication_date,
          data: {
            title: result.data.title,
            subtitle: result.data.subtitle,
            author: result.data.author,
          },
        };
      });

      setPosts(prevPosts => [...prevPosts, ...newPosts]);
      setNextPage(data.next_page);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>

      <main className={styles.container}>
        {posts.map(post => (
          <section key={post.uid} className={styles.post}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <h2 title="titulo">{post.data.title}</h2>
              </a>
            </Link>
            <p>{post.data.subtitle}</p>

            <div className={styles.postStatus}>
              <span>
                <FiCalendar />
                {formatDate(post.first_publication_date)}
              </span>
              <span>
                <FiUser />
                {post.data.author}
              </span>
            </div>
          </section>
        ))}
        {!!nextPage && (
          <button
            type="button"
            className={
              !nextPage
                ? `${styles.loadPostsButton} ${styles.loadPostsButtonDisabled}`
                : styles.loadPostsButton
            }
            onClick={handleLoadMorePosts}
            disabled={!nextPage}
          >
            Carregar mais posts
          </button>
        )}
      </main>
      <footer className={styles.footer} />
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'post'),
    { pageSize: 2 }
  );

  const results: Post[] = postsResponse.results.map(result => {
    return {
      uid: result.uid,
      first_publication_date: result.first_publication_date,
      data: {
        title: result.data.title,
        subtitle: result.data.subtitle,
        author: result.data.author,
      },
    };
  });

  const { next_page } = postsResponse;

  const postsPagination = {
    results,
    next_page,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
