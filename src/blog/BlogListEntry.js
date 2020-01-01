import React from 'react';
import { Link } from 'react-router-dom';

const BlogListEntry = ({ name, url, date }) => {
  return (
    <div>
      <h2 style={{ marginBottom: 0 }}><Link to={url}>{name}</Link></h2>
      <p style={{ marginTop: 0 }}>{date}</p>
    </div>
  );
};

export default BlogListEntry;
