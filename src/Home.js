import React from 'react';
import BlogListEntry from './blog/BlogListEntry.js';
import { ENTRIES } from './blog/BlogEntry.js'

const BLOGS = Object.keys(ENTRIES).map(entry => ENTRIES[entry].metadata);

const Home = () => (
  BLOGS.map(({ name, url, date }, index) => (
    <BlogListEntry name={name} url={url} key={index} date={date} />
  ))
);

export default Home;