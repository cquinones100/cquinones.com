import React from 'react';
import { useParams } from 'react-router-dom';
import HappyNewYear, {
  metadata as happyNewYearMetadata
} from './entries/HappyNewYear/HappyNewYear.js';
import ADslForWritingHtmlInRuby, {
  metadata as aDslForWritingHtmlInRubyMetadata
} from './entries/ADslForWritingHtmlInRuby/ADslForWritingHtmlInRuby.js'

export const ENTRIES = {
  'a-dsl-for-writing-html-in-ruby': {
    component: ADslForWritingHtmlInRuby,
    metadata: aDslForWritingHtmlInRubyMetadata
  },
  'happy-new-year': {
    component: HappyNewYear,
    metadata: happyNewYearMetadata
  }
};

const BlogEntry = () => {
  const { id } = useParams();
  const Post = ENTRIES[id].component;

  const script = document.createElement('script');
  script.src = 'https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js';
  document.head.appendChild(script);

  return (
  <div>
    <h2>{ENTRIES[id].metadata.name}</h2>
    <Post />
  </div>
  );
};

export default BlogEntry;