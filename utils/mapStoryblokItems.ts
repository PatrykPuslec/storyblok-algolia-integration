import { StoryData } from 'storyblok-js-client';

type mappedStoryblokItem = {
  objectID: string;
  story_id: string;
  space_id: string;
  language: string;
  contentype: string;
  slug?: string;
  title?: string;
  seoMetaDataTitle?: string;
  seoMetaDataDescription?: string;
  searchableContent?: Array<string>;
};

export const mapStoryblokItems = (
  items: StoryData[]
): mappedStoryblokItem[] => {
  if (!items) return [];
  const mappedItems: mappedStoryblokItem[] = [];
  items.forEach(item => {
    mappedItems.push({
      objectID: item.uuid,
      story_id: item.uuid,
      space_id: item.group_id,
      language: item.lang,
      contentype: item.content?.component,
      slug: item.slug,
      title: item.name,
    });
  });
  return mappedItems;
};
