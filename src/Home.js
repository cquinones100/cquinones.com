import React from 'react';
import BlogListEntry from './blog/BlogListEntry.js';
import Bio from './Bio.js';
import { ENTRIES } from './blog/BlogEntry.js'

const BLOGS = Object.keys(ENTRIES).map(entry => ENTRIES[entry].metadata);

const Home = () => (
  <div>
    <h1>Carlos Quinones</h1>
    <Bio />
    {
      BLOGS.map(({ name, url, date }, index) => (
        <BlogListEntry name={name} url={url} key={index} date={date} />
      ))
    }
  </div>
);

export default Home;