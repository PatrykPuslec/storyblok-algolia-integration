import algoliasearch from 'algoliasearch';
import StoryblokClient from 'storyblok-js-client';
import { NextApiRequest, NextApiResponse } from 'next';
import { mapStoryblokItem } from '../../utils/mapStoryblokItems';
import { StoryblokPayload } from '../../utils/storyblokTypes';

export default async function handler(
  req: NextApiRequest,
  response: NextApiResponse
) {
  const storyblokReqData: StoryblokPayload = req.body;

  const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
  const ALGOLIA_API_ADMIN_TOKEN = process.env.ALGOLIA_API_ADMIN_TOKEN;
  const ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME;
  const STORYBLOK_CONTENT_DELIVERY_API_TOKEN =
    process.env.STORYBLOK_CONTENT_DELIVERY_API_TOKEN;
  const STORYBLOK_OUATH_TOKEN = process.env.STORYBLOK_OUATH_TOKEN;

  const algolia = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_ADMIN_TOKEN);
  const storyblok = new StoryblokClient({
    accessToken: STORYBLOK_CONTENT_DELIVERY_API_TOKEN,
    oauthToken: STORYBLOK_OUATH_TOKEN,
  });
  try {
    const schema = await storyblok.get('spaces/157824/components');

    const story = await storyblok
      .getStory(storyblokReqData.story_id.toString(), { cv: Date.now() })
      .then(res => res.data.story);

    if (story.content?.component === 'page') {
      const index = algolia.initIndex(ALGOLIA_INDEX_NAME);
      const mappedItem = mapStoryblokItem(story, schema.data.components);

      await index.saveObject(mappedItem).wait();
    }
  } catch (err) {
    console.error(err);
    response.status(400).json({});
  }
  response.status(200).json({});
}
