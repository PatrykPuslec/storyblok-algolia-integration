import algoliasearch from 'algoliasearch';
import StoryblokClient from 'storyblok-js-client';
import { NextApiRequest, NextApiResponse } from 'next';
import { mapStoryblokItem } from '../../utils/mapStoryblokItems';
import { StoryblokPayload } from '../../utils/storyblokTypes';

export default function handler(
  req: NextApiRequest,
  response: NextApiResponse
) {
  const storyblokReqData: StoryblokPayload = req.body;
  const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
  const ALGOLIA_API_ADMIN_TOKEN = process.env.ALGOLIA_API_ADMIN_TOKEN;
  const ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME;
  const STORYBLOK_CONTENT_DELIVERY_API_TOKEN =
    process.env.STORYBLOK_CONTENT_DELIVERY_API_TOKEN;
  const algolia = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_ADMIN_TOKEN);
  const storyblok = new StoryblokClient({
    accessToken: STORYBLOK_CONTENT_DELIVERY_API_TOKEN,
  });
  response.status(200).json({});

  storyblok
    .getStory(storyblokReqData.toString())
    .then(res => {
      const index = algolia.initIndex(ALGOLIA_INDEX_NAME);
      const mappedItem = mapStoryblokItem(res.data.story);
      index
        .saveObject(mappedItem)
        .wait()
        .catch(e => console.log(e));
      console.log('saved');
    })
    .catch(e => console.log(e));
  return;
}
