import React from 'react';

export const metadata = {
  name: 'Happy New Year',
  date: '1-1-2020',
  url: '/blog/happy-new-year'
};

const PartyPopper = () => (
  <span role='img' aria-label='party-popper'>🎉</span>
);

const HappyNewYear = () => {
  return (
    <div>
      <h2>Happy New Year</h2>
      <PartyPopper />Happy New Year!<PartyPopper />
    </div>
  );
};

export default HappyNewYear;
