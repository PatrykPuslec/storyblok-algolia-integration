export interface StoryblokPayload {
  action: 'published' | 'unpublished' | 'deleted';
  text: string;
  story_id: number;
  space_id: number;
}
