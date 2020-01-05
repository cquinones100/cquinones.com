import React from 'react';
import Gist from 'react-gist';

export const metadata = {
  name: 'Component Based Rails Views',
  date: '1-1-2020',
  url: '/blog/component-based-rails-views'
}

const ComponentBasedRailsViews = () => {
  return (
    <div>
      <h2>Component Based Rails Views</h2>
      <p>
        I've always loved React. Not only do I like the APIs for React,
        I feel React's approach to writing views promotes maintanable, testable
        views. In late 2018, I started experimenting with 
        writing Rails views using components. That led to RVC.
      </p>

      
        RVC works by making views plain old ruby objects that provide HTML. RVC
        looks like this:
      </p>
      <Gist id='d45cf476e2fb0bd0e6cfb47110984972' />
      <p>
        And the above renders 'hi this is carlos' to the screen.
      </p>
      <p>
        We can also render "hi this is carlos" in a H1 simply by adding the tags:
        CODE BELOW
      </p>
        {/* class Home < Rvc::Component
          render do
            c :h1 { "hi my name is carlos" }

            c :p { "hi i am someone <b>else</b>" }
          end
        end */}
      <h3>
        Components
      </h3>
      <p>
        All custom components are stored in <code>app/components</code> and 
        including <code>Rvc::ComponentHelper</code> in <code>Applicationhelper</code> will 
        allow Rails views to respond to <code>component</code>.
      </p>
      <p>
        RVC looks through the components directory to and finds the component 
        that corresponds to the argument to <code>#component</code>.
      </p>
      <p>
        All <code>RVC::Component</code>s respond to <code>#c</code>, which
          can be thought of as an alias for <code>#component</code>.
          Multiple <code>#c</code> calls can be made within the <code>#render</code> block
          and they can also be nested:

      </p>
    </div>
  );
};

export default ComponentBasedRailsViews;