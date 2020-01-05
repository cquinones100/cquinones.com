import React from 'react';
import CodeBlock from '../../../CodeBlock.js';
import Emoji from '../../../Emoji.js';

export const metadata = {
  name: 'A DSL For Writing HTML in Ruby',
  date: '1-1-2020',
  url: '/blog/a-dsl-for-writing-html-in-ruby'
}

const ADslForWritingHtmlInRuby = () => (
  <div>
    <p>
      In late 2018 I starting working 
      on <b><a target='_blank' rel='noopener noreferrer' href='https://github.com/cquinones100/rvc'>RVC</a></b>.
      The goal was to make using React-style components in Rails easier. The API I landed
       on back then was not as easy as I would have liked, for instance in order to 
       the DSL required an additonal method call in order to write element siblings:
    </p>
  <CodeBlock>
       {
`
class Home < RVC::Component
  def render
    inline do |demo_container|
      demo_container.add do
        <<~HTML
          <h1 id='hello'>Hello!</h1>
        HTML
      end
        
      demo_container.add do
        <<~HTML
          <div id='enter-your-name'>
            Enter your name
          </div>
        HTML
      end
        
      demo_container.add { TextInput onchange: js_handle_on_change }
    end
  end
end
`
       }
  </CodeBlock>
  <p>
  Here <CodeBlock inline>#inline</CodeBlock> is keeping a list of elements to concatenate. I
   think a more user-friendly API would be to allow elements to have the
    component itself keep track:
  </p>
  <CodeBlock>
    {
`
class Home < Rvc::Component
  def render
    h1 id: 'Hello' do
      'Hello!'
    end

    div id: 'enter-your-name' do
      'Enter your name'
    end

    TextInput onchange: js_handle_on_change
  end
end
`
    }
  </CodeBlock>
  <p>
   Two things need to be implemented to make this change:
  </p>
  <ul>
    <li>
      <CodeBlock inline>RVC::Component</CodeBlock> needs to be able to respond to arbitrary 
       methods that correspond to HTML tags.
    </li>
    <li>
      <CodeBlock inline>RVC::Component</CodeBlock> needs to keep track of methods called within 
       its <CodeBlock inline>#render</CodeBlock> and return the string.
    </li>
  </ul>
  In Ruby, the last value in the method is returned, so that would mean that 
  whatever value is returned by <CodeBlock inline>TextInput onchange: js_handle_on_change</CodeBlock>
  will be the rendered. In this case, only the <CodeBlock inline>input</CodeBlock> will be rendered.
  <p>
    <CodeBlock inline>RVC::Component</CodeBlock>'s <CodeBlock inline>#render</CodeBlock> is designed to behave
     similarly to <CodeBlock inline>React.Component</CodeBlock>'s <CodeBlock inline>render()</CodeBlock>. React
     requires all sibling elements to be nested within a top-level element, so 
     often the <CodeBlock inline>render()</CodeBlock> looks something like:
  </p>
  <CodeBlock>
    {
`
render() {
  return (
    <div>
      <ElementOne />
      <ElementTwo />
    </div>
  );
}
`
    }
  </CodeBlock>
  <p>
    I think I can solve this issue by implmenting a similar requirement 
     in <CodeBlock inline>RVC::Component</CodeBlock>: 
  </p>
  <CodeBlock>
    {
`
class Home < Rvc::Component
  def render
    div do
      h1 id: 'Hello' do
        'Hello!'
      end

      div id: 'enter-your-name' do
        'Enter your name'
      end

      TextInput onchange: js_handle_on_change
    end
  end
end
`
    }
  </CodeBlock>
  <p>
    To test this out, I'll
     print out the output of a new `HTMLRenderer`
     object's <CodeBlock inline>#render</CodeBlock> method.
     This first step is to work on handling HTML tags as methods.
  </p>
  <CodeBlock>
    {
`
class HTMLBuilder
  def render
    h1 do
      'hello i am carlos'
    end
  end
end

puts HTMLBuilder.new.render
`
    }
    </CodeBlock>
    <p>
      In Rails views, the <CodeBlock inline>#content_tag</CodeBlock> method accepts a 
      tag name as its first argument and the body as string or block as a 
      second argument. This method handles arbitrary tag names regardless of
      validity, so <CodeBlock inline>content_tag(:no_tag, 'hi')</CodeBlock> will
      return <CodeBlock inline>{`<notag>hi</notag>`}</CodeBlock>. I'll
      implement something similar:
    </p>
    <CodeBlock>
      {
`
class HTMLBuilder
  def render
    h1 do
      'hello i am carlos'
    end
  end

  def method_missing(method_name, *args, &block)
    "#{method_name}instance_eval(&block)#{method_name}"
  end
end
`
      }
    </CodeBlock>
    <p>
      Next I need to handle siblings. This means
      that <CodeBlock inline>HTMLBuilder</CodeBlock> needs to store the 
      contructed html. I'll start off with an array and raise an error
      if the array is greater than 1.
    </p>
    <CodeBlock>
      {
`
class HTMLBuilder
  def initialize
    @render_elements = []
  end

  def render
    h1 do
      'hello i am carlos'
    end

    div do
      'this div should throw an error'
    end
  end

  def method_missing(method_name, *args, &block)
    @render_elements << "#{method_name}instance_eval(&block)#{method_name}"

    if @render_elements.size > 1
      raise 'sibling elements must be nested'
    else
      string
    end
  end
end
`
      }
    </CodeBlock>
    <p>This implementation raises an error <Emoji name='thumbs-up'>👍</Emoji></p>
    <p>
      The next step is a little more complex. I'll wrap the body
      of <CodeBlock inline>#render</CodeBlock> in a div, but just wrapping
      the siblings in a block is not enough since each method call will add to
      the <CodeBlock inline>#render_elements</CodeBlock> array. When the
      outer <CodeBlock inline>#div</CodeBlock> method is called, I need to
      instantiate an object that'll keep track of all of the elements generated
      within the block.
      I'll make a <CodeBlock inline>Wrapper</CodeBlock> class to handle that.
    </p>
    <CodeBlock>
      {
`
class Wrapper
  def initialize(method_name:, block:)
    @method_name = method_name
    @block = block
    @render_elements = []
  end

  def to_s
    @render_elements = []

    instance_eval(&block)

    "<#{@method_name}>#{render_elements.join('')}</#{@method_name}>"
  end

  def method_missing(method_name, *args, &block)
    string = "<#{method_name}>#{instance_eval(&block)}</#{method_name}>"

    @render_elements << string
  end

  private
  
  attr_reader :block
end
`
      }
    </CodeBlock>
    <p>
      This works when nesting is only one level deep and breaks down at deeper
      levels. A more robust solution will involve defining a base case, that
      describes the very bottom of the nesting. An implementation can involve 
      instantiating a wrapper at each level, and stopping at the bottom.
    </p>
    <p>First, I'll test the base case:</p>
    <CodeBlock>
      {
`
class Wrapper
  def initialize(block:)
    @block = block
  end

  def to_s
    instance_eval(&block)
  end

  private

  attr_reader :block
end

block = Proc.new { 'hello i am carlos' }

puts Wrapper.new(block: block).to_s
`
      }
    </CodeBlock>
    <p>
      This works for the base case, but the base case is very different
      from the nested case. The wrapper needs to know when the block is NOT
      only a string. The wrapper knows this if it has to call a method to render
      its block. The <CodeBlock inline>Wrapper</CodeBlock> can be changed to handle this:
    </p>
    <CodeBlock>
      {
`
class Wrapper
  def initialize(block:)
    @block = block
    @block_is_string = true
  end

  def to_s
    if @block_is_string
      instance_eval(&block)
    else
      # handle nested methods
    end
  end

  def method_missing(method_name, *args, &block)
    @block_is_string = false

    # handle nested method call
  end

  private

  attr_reader :block
end
`
      }
    </CodeBlock>
    <p>
      Next: I have to handle the nested method call
      in <CodeBlock inline>#method_missing</CodeBlock>. This is where
      the <CodeBlock inline>Wrapper</CodeBlock> needs to keep track of method calls.
      Since we now have a base case, we can instantiate a
      new <CodeBlock inline>Wrapper</CodeBlock> and push it into an array:
    </p>
    <CodeBlock>
      {
`
def to_s
  string = instance_eval(&block)
  string = render_elements.join('') if !@block_is_string

  if method_name
    "<#{method_name}>#{string}</#{method_name}>"
  else
    string
  end
end

def method_missing(method_name, *args, &block)
  @block_is_string = false

  @render_elements << Wrapper.new(method_name: method_name, block: block).to_s
end
`
      }
    </CodeBlock>
    <p>
      At this point, deeply nested elements are working:
    </p>
    <CodeBlock>
      {
`
block = Proc.new do
  div do
    div do
      'hello i am deeply nested'
    end
  end
  div { 'hello i am carlos' }
  div { 'hello i am not carlos'}
end

puts Wrapper.new(block: block).to_s
# <div><div>hello i am deeply nested</div></div><div>hello i am carlos</div><div>hello i am not carlos</div>
`
      }
    </CodeBlock>
    <p>
      Finally, I'll use 
      the <CodeBlock inline>Wrapper</CodeBlock> in <CodeBlock inline>HTMLBuilder</CodeBlock>
    </p>
    <CodeBlock>
      {
`
class Wrapper
  def initialize(method_name: nil, block:)
    @method_name = method_name
    @block = block
    @render_elements = []
    @block_is_string = true
  end

  def to_s
    string = instance_eval(&@block)

    string = @render_elements.join('') if !@block_is_string
  
    if @method_name
      "<#{@method_name}>#{string}</#{@method_name}>"
    else
      string
    end
  end
  
  def method_missing(method_name, *args, &block)
    @block_is_string = false
  
    @render_elements << Wrapper.new(method_name: method_name, block: block).to_s
  end
end

class HTMLBuilder
  def initialize
    @render_elements = []
  end

  def render
    div do
      div do
        div { 'hello i am deeply nested' }
      end
      div { 'hello i am carlos' }
      div { 'hello i am not carlos'}
    end
  end

  def method_missing(method_name, *args, &block)
    render_elements << Wrapper.new(method_name: method_name, block: block)

    if render_elements.size > 1
      raise 'sibling elements must be nested'
    else
      render_elements.first.to_s
    end
  end

  private 

  attr_reader :render_elements
end

puts HTMLBuilder.new.render
# new lines added for clarity
#
# <div>
#   <div>
#     <div>hello i am deeply nested</div>
#   </div>
#   <div>hello i am carlos</div>
#   <div>hello i am not carlos</div>
# </div>
`
      }
    </CodeBlock>
    <p>
      Using <CodeBlock inline>#method_missing</CodeBlock> in this way, is 
      dangerous. Since <CodeBlock inline>HTMLBuilder</CodeBlock> is a
      stand in for <CodeBlock inline>Rvc::Component</CodeBlock>, other components
      are expected to inherit from this class. I'm eliminating valuable feedback
      that child components will rely on, and any missing method will result in
      changing the <CodeBlock inline>@render_elements</CodeBlock> array.
    </p>
    <p>
      <CodeBlock inline>HTMLBuilder</CodeBlock> only needs to
      use <CodeBlock inline>#method_missing</CodeBlock> during render.
      One implementation might be to have <CodeBlock inline>#render</CodeBlock>
      to be a private method, called as a step in the rendering process, and
      set a <CodeBlock inline>@rendering</CodeBlock> flag before
      calling <CodeBlock inline>#render</CodeBlock>. The issue with this
      approach is that the render method might rely on methods local to the
      component, and this could make devlopment frustrating when a typo
      causes a new tag to be rendered instead of raising
      a <CodeBlock inline>NoMethodError</CodeBlock>.
    </p>
    <p>
      There are a limited set of "valid" HTML tags. In React, I get the
      following warning in the console when I attempt to use a tag that
      is not supported by my browser:
    </p>
    <p>
      Warning: The tag <CodeBlock inline>{`<notatag>`}</CodeBlock> is
      unrecognized in this browser. If you meant to render a React component,
      start its name with an uppercase letter.
    </p>
    <p>
      React's <CodeBlock inline>render()</CodeBlock> (and functional components),
      don't behave the
      way <CodeBlock inline>HTMLBuilder</CodeBlock>'s <CodeBlock inline>#render</CodeBlock> does.
      In Javascript, there is no "implicit return" in a method call, we must always 
      call <CodeBlock inline>return</CodeBlock>. I think it might be clearer to push
      the <CodeBlock inline>#method_missing</CodeBlock> behavior into an object that
      is instantiated when we <CodeBlock inline>return</CodeBlock>
      from <CodeBlock inline>#render</CodeBlock>.
    </p>
    <p>
      I think adding a <CodeBlock inline>Renderer</CodeBlock> class that First
      checks if the component responds to a method before creating a tag would work:
    </p>
    <CodeBlock>
      {
`
class Renderer
  def initialize(base:, block:)
    @render_elements = []
    @base = base
    @block = block
  end

  def to_s
    instance_eval(&@block)
  end

  def method_missing(method_name, *args, &block)
    if base.respond_to?(method_name)
      return base.send(method_name, *args, &block)
    end

    @render_elements << Wrapper.new(method_name: method_name, block: block)

    if @render_elements.size > 1
      raise 'sibling elements must be nested'
    else
      @render_elements.first.to_s
    end
  end
end

class HTMLBuilder
  def render
    return_render do
      div do
        div do
          div { 'hello i am deeply nested' }
        end
        div { 'hello i am carlos' }
        div { 'hello i am not carlos'}
      end
    end
  end

  def return_render(&block)
    Renderer.new(base: self, block: block).to_s
  end
end
`
      }
    </CodeBlock>
    <p>
      I can put this behavior in
      the <CodeBlock inline>Wrapper</CodeBlock> This also 
      removes the reliance on the extraneous wrapper <CodeBlock inline>div</CodeBlock>.
    </p>
    <CodeBlock>
      {
`
class Wrapper
  def initialize(method_name: nil, block:, base:)
    @method_name = method_name
    @block = block
    @render_elements = []
    @block_is_string = true
    @base = base
  end

  def to_s
    string = instance_eval(&@block)

    string = @render_elements.join('') if !@block_is_string
  
    if @method_name
      "<#{@method_name}>#{string}</#{@method_name}>"
    else
      string
    end
  end
  
  def method_missing(method_name, *args, &block)
    if @base.respond_to?(method_name, true)
      @base.send(method_name, *args, &block) 
    else
      if block_given?
        @block_is_string = false

        @render_elements << Wrapper.new(
          method_name: method_name,
          block: block,
          base: @base
        )
          .to_s
      else
        super
      end
    end
  end
end

class HTMLBuilder
  def render
    return_render do
      div do
        div { message }
      end
      div { 'hello i am carlos' }
      div { 'hello i am not carlos'}
    end
  end

  private

  def message
    'hello i am a deeply nested message'
  end

  def return_render(&block)
    Wrapper.new(base: self, block: block).to_s
  end
end
`
      }
    </CodeBlock>
    <p>
      While this cleans up <CodeBlock inline>HTMLBuilder</CodeBlock> it
      does not help with the confusing <CodeBlock>#method_missing</CodeBlock> issue.
      At this point, I feel the simplest implementation would be to make it so that
      methods on the component are explicitly called with the following changes:
    </p>
    <CodeBlock>
      {
`
class Wrapper
  def initialize(method_name: nil, block:, base:)
    @method_name = method_name
    @block = block
    @render_elements = []
    @block_is_string = true
    @base = base
  end

  def to_s
    string = instance_eval(&@block)

    string = @render_elements.join('') if !@block_is_string
  
    if @method_name
      "<#{@method_name}>#{string}</#{@method_name}>"
    else
      string
    end
  end
  
  def method_missing(method_name, *args, &block)
    @block_is_string = false
  
    @render_elements << Wrapper.new(
      method_name: method_name,
      block: block,
      base: @base
    )
      .to_s
  end

  private
  
  attr_reader :base

  alias component base
end

class HTMLBuilder
  def render
    return_render do
      div do
        div { component.message }
      end
      div { 'hello i am carlos' }
      div { 'hello i am not carlos'}
    end
  end

  def message
    'hello i am a deeply nested message'
  end

  private

  def return_render(&block)
    Wrapper.new(base: self, block: block).to_s
  end
end

puts HTMLBuilder.new.render
`
      }
    </CodeBlock>
  </div>
);

export default ADslForWritingHtmlInRuby; 