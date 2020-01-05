 import React from 'react'; 

const Emoji = ({ name, children }) => (
  <span role='img' aria-label='name'>{children}</span>
);

export default Emoji;