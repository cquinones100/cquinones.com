import React from 'react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import { graphql, Link } from 'gatsby';

const IndexPage = ({ data }) => {
  const { postsData } = data;
  const  { posts } = postsData;

  return( 
    <Layout>
      <SEO title='Home' />
      {
        posts.map(({ metadata }, index) => {
          const { date, path, title } = metadata;

          return (
            <div key={index}>
              <h2 style={{ marginBottom: 0 }}><Link to={path}>{title}</Link></h2>
              <p style={{ marginTop: 0 }}>{date}</p>
            </div>
          );
        })
      }
    </Layout>
  );
};

export const blogPostQuery = graphql`
  query MyQuery {
    postsData: allMarkdownRemark(sort: {fields: frontmatter___date, order: DESC}, filter: {}) {
      posts: nodes {
        metadata: frontmatter {
          date
          path
          title
        }
      }
    }
  }
 `;

export default IndexPage
