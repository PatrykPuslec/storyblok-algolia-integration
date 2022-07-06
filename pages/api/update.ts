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

  const index = algolia.initIndex(ALGOLIA_INDEX_NAME);

  console.log(storyblokReqData);
  storyblok
    .get(`cdn/stories/157821025`)
    .then(async res => {
      response.status(200).json(res.data.story);
      const mappedResponse = mapStoryblokItem(res.data.story);
      if (storyblokReqData) {
        console.log('has reqdata');
        if (storyblokReqData.action === 'published') {
          console.log('has action published');
          await index
            .saveObject(mappedResponse)
            .wait()
            .catch(e => console.log(e));
        } else {
          await index
            .deleteObject(storyblokReqData.story_id.toString())
            .wait()
            .catch(e => console.log(e));
        }
      } else {
        response.status(400);
      }
    })
    .catch(e => {
      console.log(e);
      response.status(400);
    });
  return;
}
