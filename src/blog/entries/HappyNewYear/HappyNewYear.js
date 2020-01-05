import React from 'react';
import Emoji from '../../../Emoji.js';

export const metadata = {
  name: 'Happy New Year',
  date: '1-1-2020',
  url: '/blog/happy-new-year'
};

const PartyPopper = () => (
  <Emoji name='party-popper'>🎉</Emoji>
);

const HappyNewYear = () => (
  <div>
    <PartyPopper />Happy New Year!<PartyPopper />;
  </div>
);

export default HappyNewYear;
