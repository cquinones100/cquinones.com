import React from 'react';
import BlogListEntry from './blog/BlogListEntry.js';
import { ENTRIES } from './blog/BlogEntry.js'

const BLOGS = Object.keys(ENTRIES).map(entry => ENTRIES[entry].metadata);

const Home = () => (
  <div>
    <h1>Carlos Quinones</h1>
    {
      BLOGS.map(({ name, url, date }, index) => (
        <BlogListEntry name={name} url={url} key={index} date={date} />
      ))
    }
    <p>I'm an Engineering Lead at Knotch in NYC. I love to write music and ride my bike.</p>
  </div>
);

export default Home;