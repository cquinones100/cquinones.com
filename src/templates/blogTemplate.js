import React from 'react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import { graphql } from 'gatsby';
import Image from '../components/Image';

const BINARY_OBJECTIONS_TITLE = 'Binary Objections';

export default function Template({ data }) {
  const { markdownRemark } = data
  const { frontmatter, html } = markdownRemark
  const { title } = frontmatter;

  if (title === BINARY_OBJECTIONS_TITLE) {
    document.body.style.backgroundColor = 'white';
    document.body.style.margin = 0;
    document.body.style.maxWidth = '100vw';

    return <Image/>
  }

  return (
    <Layout>
      <SEO title={frontmatter.title} />
      <div>
        <div>
          <h2>{frontmatter.title}</h2>
          <h3>{frontmatter.date}</h3>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </Layout>
  );
}

export const pageQuery = graphql`
  query($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        path
        title
      }
    }
  }
`;