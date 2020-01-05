import React from 'react';

const CodeBlock = ({ children, inline }) => (
  inline ? (
    <span className='prettyprint inline'>
      <code>
        {children}
      </code>
    </span>
  ) : (
      <pre className='prettyprint'>
        <div>{children}</div>
      </pre>
    )
);

export default CodeBlock;