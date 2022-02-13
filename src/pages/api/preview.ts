/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { getPrismicClient } from '../../services/prismic';
import { linkResolver } from '../../services/prismicConfiguration';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async (req, res) => {
  const { token: ref, documentId } = req.query;
  const redirectUrl = await getPrismicClient(req)
    .getPreviewResolver(ref, documentId)
    .resolve(linkResolver, '/');

  if (!redirectUrl) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.setPreviewData({ ref });

  res.write(
    `<!DOCTYPE html><html><head><meta http-equiv="Refresh" content="0; url=${redirectUrl}" />
    <script>window.location.href = '${redirectUrl}'</script>
    </head>`
  );
  res.end();
};
