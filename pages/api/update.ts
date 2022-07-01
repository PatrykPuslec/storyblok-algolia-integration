import axios from 'axios';
import algoliasearch from 'algoliasearch';
import StoryblokClient from 'storyblok-js-client';
import { NextApiRequest, NextApiResponse } from 'next';
import { mapStoryblokItems } from '../../utils/mapStoryblokItems';

export default function handler(
  req: NextApiRequest,
  response: NextApiResponse
) {
  const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
  const ALGOLIA_API_ADMIN_TOKEN = process.env.ALGOLIA_API_ADMIN_TOKEN;
  const ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME;
  const STORYBLOK_CONTENT_DELIVERY_API_TOKEN =
    process.env.STORYBLOK_CONTENT_DELIVERY_API_TOKEN;

  const algolia = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_ADMIN_TOKEN);
  const storyblok = new StoryblokClient({
    accessToken: STORYBLOK_CONTENT_DELIVERY_API_TOKEN,
  });
  const options = {
    per_page: 100,
    page: 1,
  };
  let records = [];

  storyblok
    .get(`cdn/stories/`, options)
    .then(async res => {
      const total = res.headers.total;
      const maxPage = Math.ceil(total / options.per_page);

      let contentRequests = [];
      for (let page = 1; page <= maxPage; page++) {
        contentRequests.push(
          storyblok.get(`cdn/stories`, { ...options, page })
        );
      }

      const index = algolia.initIndex(ALGOLIA_INDEX_NAME);

      axios
        .all(contentRequests)
        .then(
          axios.spread(async (...responses) => {
            responses.forEach(response => {
              let data = response.data;
              records = records.concat(data.stories);
            });
            const mappedResponse = mapStoryblokItems(records);
            response.status(200).json(records);
            await index
              .saveObjects(mappedResponse)
              .wait()
              .catch(e => console.log(e));
            console.log('Indexed: ' + records.length);
          })
        )
        .catch(e => console.log(e));
    })
    .catch(e => console.log(e));
  return;
}
