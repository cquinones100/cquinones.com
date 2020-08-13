import React from 'react';
import Img from 'gatsby-image';
import { useStaticQuery } from 'gatsby';

const Image = () => {
  const data = useStaticQuery(graphql`
    query {
      images: allFile(filter: {relativePath: {regex: "images/binary-objections/"}, extension: { eq: "png"}}) {
        edges {
          node {
            childImageSharp {
              fluid {
                ...GatsbyImageSharpFluid
              }
            }
          }
        }
      }
    }`)
  
    console.log(data.images)

  return (
    data.images.edges.map(({ node: image }, index) => {
      return <Img key={index} fluid={image.childImageSharp.fluid} objectFit='cover' />
    })
  )
}

export default Image;