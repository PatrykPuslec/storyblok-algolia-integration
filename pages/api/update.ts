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
  const ALGOLIA_APP_ID = 'Z2C0Z8M1C9';
  const ALGOLIA_API_ADMIN_TOKEN = '6f09b7d1a0f2a82ecbf05211e2a38dad';
  const ALGOLIA_INDEX_NAME = 'dev_TREF_test';
  const STORYBLOK_CONTENT_DELIVERY_API_TOKEN = 'sS7XtfFCIYaZxsFvGZor0gtt';
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
