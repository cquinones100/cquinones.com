import { Link } from 'gatsby';
import { useStaticQuery, graphql } from "gatsby"
import PropTypes from 'prop-types';
import React from 'react';

const Header = ({ siteTitle }) => {
  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "src/images/profile-photo.png" }) {
        childImageSharp {
          fixed {
            ...GatsbyImageSharpFixed
          }
        }
      }
      allImageSharp {
        edges {
          node {
            resize(width: 130, height: 130, grayscale: false) {
              src
            }
          }
        }
      }
    }
  `
  );

  return (
    <header>
      <div style={{ margin: `20px auto`, display: 'flex', flexDirection: 'row' }}>
        <div>
          <img src={data.allImageSharp.edges[0].node.resize.src} />
        </div>
        <div style={{ marginLeft: '20px' }}>
          <h1><Link to='/'>{siteTitle}</Link></h1>
          <p>
            I'm an Engineering Lead at Knotch in NYC. I love to write music and ride my bike.
          </p>
          <div style={{ display: 'flex', flexDirection: 'row'}}>
            <a href='https://github.com/cquinones100'>GitHub</a>
            <a
              href='https://www.linkedin.com/in/carlos-quinones-29169a12a/'
              style={{ marginLeft: '20px' }}
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
