# firebase-react-paginated

Implementing paginated lists when dealing with dynamic content using Firebase can be troublesome. This simple HOC will make dealing with this a breeze for most cases.

## Table of Contents

[Demo](https://codesandbox.io/s/qKQ9DMMR)

[Getting Started](#getting-started)

[Composing with connect or other HOCs](#composing-with-connect-or-other-hocs)

[Configurations](#configurations)

[Required Data Structure](#required-data-structure)

[Next Steps](#next-steps)

## Getting started

First of all, install the package dependency from npm.

```
npm -i -s firebase-react-paginated
```

You can then create your component using any of our props.

```javascript
// ./components/MyComponent

import React from 'react'
import MyListItem from './MyListItem';

const MyComponent = ({
  pageIds,
  pageValues,
  hasNextPage,
  hasPrevPage,
  onNextPage,
  onPrevPage,
  isLoading
}) => (
  <div>

    {(isLoading) ? (
      <p>loading list page…</p>
     ) : (
      <ul>
        {pageIds.map((itemId) => (
          <li key={itemId}>
            <MyListItem itemId={itemId} />
          </li>
        ))}
      </ul>
    )}
    
    <button disabled={!hasPrevPage} onClick={onPrevPage}>
      show previous page
    </button>
    
    <button disabled={!hasNextPage} onClick={onNextPage}>
      show next page
    </button>

  </div>
);

export default MyComponent;
```

Then create your container using `withFirebasePagination`.

```javascript
// ./containers/MyComponent

import React from 'react'
import firebase from 'firebase';
import withFirebasePagination from 'firebase-react-paginated';
import MyComponent from '../components/MyComponent';

firebase.config(/* your firebase config */);

export default withFirebasePagination(firebase)({
  path: 'listItems',
  orderBy: '.value',
  length: 20
})(MyComponent);
```

## Composing with connect or other HOCs

You can compose your component as you would with `connect` or any other HOC from `recompose` for instance.

```javascript
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withFirebasePagination } from 'firebase-react-paginated';
import { fetchItem } from './redux/actions';

...

export default compose(
  connect(null, { fetchItem }),
  withFirebasePagination({
    path: 'list',
    onNewItem: ({ fetchItem }) => (itemId) => fetchItem(itemId)
  })
)(MyComponent);
```

## Configurations

`withFirebasePagination(*firebase)(*options)(*WrappedComponent)`

**\*firebase** - must be a valid firebase object or a valid firebase reference.

**\*options** - an object as specified below

**\*WrappedComponent** - the component that will receive the list props

### Options

|prop|value|description|
|---|---|---|
|path|`string`|the path to your firebase list. e.g. `list`. **required**|
|length|`number`|the number of items per page. defaults to `10`.|
|orderBy|`string`|the prop that will be used for ordering the list. must hold numbered values. defaults to `.value`. e.g. `.value or .priority or propName`|
|onNewItem|`function`|a function that is called whenever a new item is added to the list (only once per item id). e.g. `(props) => (itemId) => {...}`|
|onPage|`function`|a function that is called whenever a new page is rendered (even when calling 'the same page' twice as pages may be dynamic). e.g. `(props) => (pageIds, pageValues) => {...}`|

### Passed Props

|prop|value|description|
|---|---|---|
|isLoading|`boolean`|is true when a new page is loading.|
|hasNextPage|`boolean`|is true when the next page has items.|
|hasPrevPage|`boolean`|is true when the previous page has items.|
|onNextPage|`function`|will render the next page when called. takes no arguments.|
|onPrevPage|`function`|will render the previous page when called. takes no arguments.|

## Required Data Structure

When dealing with firebase you should always denormalize your data.
So when creating a list structure you should probably separate the list items data from the list itself.
That way your list is a lightweight as it gets and you can fetch the item data when the time is right.

```
// firebase.json

{
  "listItems": {
    "$itemId_1": "timestamp",
    "$itemId_2": "timestamp",
    "$itemId_3": "timestamp",
    "$itemId_4": "timestamp",
    ...
  },
  "items": {
    "$itemId_1": {
      "title": "My item title",
      "author": "Arthur C. Clarke",
      "description": "A really awesome book",
      "createdAt": "timestamp"
    },
    ...
  }
}
```

Right now we **only work with lists that are ordered by values and they must be numbers**.

```
{
   $path: {
     $itemId: $value : number,
     $itemId: $value : number,
     ...
   }
}
```
We plan to make this more flexible by accepting an `orderBy` prop.
Still the prop passed must hold a numerical value.

## Next Steps

- [ ] accept other `orderBy` possibilities
- [ ] create tests using jest
