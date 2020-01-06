---
path: "/blog/a-dsl-for-writing-html-in-ruby"
date: "2020-01-05"
title: "A DSL for Writing HTML in Ruby"
---
In late 2018 I starting working on [RVC](https://github.com/cquinones100/rvc).
The goal was to make using React-style components in Rails easier. The API I landed
on back then was not as easy as I would have liked, for instance the DSL
required an additonal method call in order to write element siblings:

``` ruby
class Home < RVC::Component
  def render
    inline do |demo_container|
      demo_container.add do
        "<h1 id='hello'>Hello!</h1>"
      end
        
      demo_container.add do
        "<div id='enter-your-name'>Enter your name </div>"
      end
    end
  end
end
```

Here `#inline` is keeping a list of elements to concatenate. I think a more
user-friendly API would be to allow elements to have the component itself keep
track:

``` ruby
class Home < Rvc::Component
  def render
    h1 id: 'Hello' do
      'Hello!'
    end

    div id: 'enter-your-name' do
      'Enter your name'
    end
  end
end
```

Two things need to be implemented to make this change:
* `RVC::Component` needs to be able to respond to arbitrary methods that correspond to HTML tags.
* `RVC::Component` needs to keep track of methods called within its `#render` and return the string.

In Ruby, the last value in the method is returned, so that would mean that 
whatever value is returned by 
```ruby
demo_container.add do
  "<div id='enter-your-name'>Enter your name </div>"
end
```

will be the rendered. In this case, only that `div` will be rendered.

`RVC::Component`'s `#render` is designed to behave similarly to `React.Component`'s
`render()`. React requires all sibling elements to be nested within a top-level element,
so often the `render()` looks something like:

``` javascript
render() {
  return (
    <div>
      <ElementOne />
      <ElementTwo />
    </div>
  );
}
```

or with a `Fragment`:

```javascript
render() {
  return (
    <>
      <ElementOne />
      <ElementTwo />
    </>
  );
}
```

I think I can solve this issue by implmenting a similar requirement in `RVC::Component`: 

``` ruby
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
```

To test this out, I'll print out the output of a new `HTMLRenderer`
object's `#render` method. This first step is to work on handling HTML tags as methods.

``` ruby
class HTMLBuilder
  def render
    h1 do
      'hello i am carlos'
    end
  end
end

puts HTMLBuilder.new.render
```

In Rails views, the `#content_tag` method accepts a tag name as its first argument
and the body as string or block as a second argument. This method handles
arbitrary tag names regardless of validity, so `content_tag(:no_tag, 'hi')` will
return `<notag>hi</notag>`. I'll implement something similar:

``` ruby
class HTMLBuilder
  def render
    h1 do
      'hello i am carlos'
    end
  end

  def method_missing(method_name, *args, &block)
    "#{method_name}#{instance_eval(&block)}#{method_name}"
  end
end
```

Next I need to handle siblings. This means that `HTMLBuilder` needs to store the 
contructed html. I'll start off with an array and raise an error if the array
is greater than 1.

``` ruby
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
    @render_elements << "#{method_name}#{instance_eval(&block)}#{method_name}"

    if @render_elements.size > 1
      raise 'sibling elements must be nested'
    else
      string
    end
  end
end
```

This implementation raises an error 👍

The next step is a little more complex. I'll wrap the body of `#render` in a
div, but just wrapping the siblings in a block is not enough since each
method call will add to the `#render_elements` array. When the outer `#div`
method is called, I need to instantiate an object that'll keep track of all of
the elements generated within the block. I'll make a `Wrapper` class to handle that.

``` ruby
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
```

This works when nesting is only one level deep and breaks down at deeper levels.
A more robust solution will involve defining a base case, that describes the
very bottom of the nesting. An implementation can involve instantiating a
wrapper at each level, and returning the evaulated block when it is a string.
First, I'll test the base case:

``` ruby
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
```

This works for the base case, but the base case is very different
from the nested case. The wrapper needs to know when the block is NOT
only a string. The wrapper knows this if it has to call a method to render
its block. The `Wrapper` can be changed to default to the base case:

``` ruby
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
```

Next: I have to handle the nested method call in `#method_missing`. This is where
the `Wrapper` needs to keep track of method calls. Since we now have a base case,
we can instantiate a new `Wrapper` and push it into an array:

``` ruby
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
```

At this point, deeply nested elements are working:

``` ruby
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
```

Finally, I'll use the `Wrapper` in `HTMLBuilder`

``` ruby
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

puts HTMLBuilder.new.render # => # new lines added for clarity
#
# <div>
#   <div>
#     <div>hello i am deeply nested</div>
#   </div>
#   <div>hello i am carlos</div>
#   <div>hello i am not carlos</div>
# </div>
```

Using `#method_missing` in this way, is dangerous. When I integrate this in `RVC`
I'll replace `HTMLBuilder` with `Rvc::Component` and other components are expected
to inherit from that class. I'm eliminating valuable feedback that child
components will rely on, and any missing method will result in changing the
`@render_elements` array.

`HTMLBuilder` only needs to use `#method_missing` during render.
One implementation might be to have `#render` to be a private method,
called as a step in the rendering process, and set a `@rendering` flag before
calling `#render`. The issue with this approach is that the render method might
rely on methods local to the component, and this could make devlopment
frustrating when a typo causes a new tag to be rendered instead of raising
a `NoMethodError`.

There are a limited set of "valid" HTML tags. In React, I get the
following warning in the console when I attempt to use a tag that
is not supported by my browser:

> Warning: The tag `<notatag>` is unrecognized in this browser. If you meant to
> render a React component, start its name with an uppercase letter.

React's `render()` (and functional components), don't behave the
way `HTMLBuilder`'s `#render` does. In Javascript, there is no "implicit return"
in a method call, we must always use `return`. I think it might be clearer to push
the `#method_missing` behavior into an object that is instantiated when we `return`
from `#render`.

I think adding a `Renderer` class that first
checks if the component responds to a method before creating a tag would work:

``` ruby
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
```

I can put this behavior in the `Wrapper` This also removes the reliance on the
extraneous wrapper `div`.

``` ruby
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
```

While this cleans up `HTMLBuilder` it does not help with the confusing `#method_missing` issue.
At this point, I feel the simplest implementation would be to make it so that
methods on the component are explicitly called with the following changes:

``` ruby
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
```

In the next post, I'll integrate this with RVC and share and example.