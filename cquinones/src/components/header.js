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
            resize(width: 100, height: 100, grayscale: false) {
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
        <img src={data.allImageSharp.edges[0].node.resize.src} />
        <div style={{ marginLeft: '20px' }}>
          <h1><Link to='/'>{siteTitle}</Link></h1>
          I'm an Engineering Lead at Knotch in NYC. I love to write music and ride my bike.
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
