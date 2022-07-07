import { StoryData } from 'storyblok-js-client';

export type mappedStoryblokItem = {
  objectID: string;
  story_id: number;
  space_id: string;
  language: string;
  contentype: string;
  slug?: string;
  title?: string;
  seoMetaDataTitle?: string;
  seoMetaDataDescription?: string;
  searchableContent?: Array<string>;
};

const getTextFieldData = (item, searchableContent) => {
  if (item.text && typeof item.text === 'string') {
    searchableContent.push(item.text);
  }
  if (item.title) {
    searchableContent.push(item.title);
  }
  if (typeof item.text === 'object' && item.text.content) {
    getTextFieldData(item.text.content[0], searchableContent);
  } else if (item.content) {
    getTextFieldData(item.content[0], searchableContent);
  }
  return;
};

export const mapStoryblokItem = (item: StoryData): mappedStoryblokItem => {
  if (!item) return null;
  const searchableContent = [];

  if (item.content && item.content.body) {
    item.content.body.forEach(element => {
      getTextFieldData(element, searchableContent);
    });
  }

  return {
    objectID: item.uuid,
    story_id: item.id,
    space_id: item.group_id,
    language: item.lang,
    contentype: item.content?.component,
    slug: item.slug,
    title: item.name,
    searchableContent,
  };
};
