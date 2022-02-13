import Document, { Head, Html, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render(): JSX.Element {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
            rel="stylesheet"
          />

          <link rel="shortcut icon" href="favicon.png" type="image/png" />
          <script
            async
            defer
            src="https://static.cdn.prismic.io/prismic.js?new=true&repo=blog-ignite-weverson"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
