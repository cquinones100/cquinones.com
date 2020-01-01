import React from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import HappyNewYear, {
  metadata as happyNewYearMetadata
} from './entries/HappyNewYear/HappyNewYear.js';

export const ENTRIES = {
  'happy-new-year': {
    component: HappyNewYear,
    metadata: happyNewYearMetadata
  }
};

const BlogEntry = () => {
  const { id } = useParams();
  const Post = ENTRIES[id].component;

  return (
    <div>
      <h1><Link to='/'>Carlos Quinones</Link></h1>
      <Post />
    </div>
  );
};

export default BlogEntry;