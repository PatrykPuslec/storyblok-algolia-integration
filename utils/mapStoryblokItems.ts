import StoryblokClient, { StoryData } from 'storyblok-js-client';
const STORYBLOK_CONTENT_DELIVERY_API_TOKEN =
  process.env.STORYBLOK_CONTENT_DELIVERY_API_TOKEN;

const storyblok = new StoryblokClient({
  accessToken: STORYBLOK_CONTENT_DELIVERY_API_TOKEN,
});
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

export type componentSchema = {
  name: string;
  display_name: string | null;
  id: number;
  created_at: string;
  updated_at: string;
  schema: {
    [name: string]: {
      type: string;
    };
  };
};

const searchableContentTypes = ['text', 'richtext', 'textarea'];

const getTextFieldData = (
  item,
  searchableContent: string[],
  schema: componentSchema[]
) => {
  const currentItemSchema = schema.find(
    schemaItem => item.component === schemaItem.name
  );

  if (currentItemSchema && currentItemSchema.schema) {
    const { schema } = currentItemSchema;

    Object.keys(item).forEach(itemKey => {
      if (
        schema[itemKey] &&
        schema[itemKey].type &&
        searchableContentTypes.includes(schema[itemKey].type)
      ) {
        if (schema[itemKey].type === 'richtext') {
          const richtextResolver = storyblok.richTextResolver.render(
            item[itemKey]
          );
          searchableContent.push(richtextResolver);
        } else {
          searchableContent.push(item[itemKey]);
        }
      }
    });
  }
  // if (item.text && typeof item.text === 'string') {
  //   searchableContent.push(item.text);
  // }

  if (typeof item.text === 'object' && item.text.content) {
    getTextFieldData(item.text.content[0], searchableContent, schema);
  } else if (item.content) {
    getTextFieldData(item.content[0], searchableContent, schema);
  }
  return;
};

export const mapStoryblokItem = (
  item: StoryData,
  schema: any
): mappedStoryblokItem => {
  if (!item) return null;
  const searchableContent = [];

  if (item.content && item.content.body) {
    item.content.body.forEach(element => {
      getTextFieldData(element, searchableContent, schema);
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
