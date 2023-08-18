> ⚠️ **Important** ⚠️
> This repository is not actively maintained so feel free to fork it and improve it. I've not been using Firebase for years - so I'm not motivated to continue maintaining libraries around it.

---

<a align="center" href="https://github.com/firebase-toolbelt/firebase-toolbelt"><img width="100%" src="https://i.imgur.com/ssM6FCa.png" alt="Firebase Toolbelt" border="0" /></a>

> Display Firebase dynamic paginated lists in your React applications

Implementing paginated lists when dealing with dynamic content using Firebase can be troublesome. This simple HOC will make dealing with this a breeze for most cases. You can choose to order the list by priority, value or child.  The only required setup is that **the value used for ordering the list must be a number**.

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
yarn add firebase-react-paginated
```

You can then create your component using any of our props.

```javascript
// ./components/MyComponent

import React from 'react'
import MyListItem from './MyListItem';

const MyComponent = ({
  pageItems,
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
        {pageItems.map((item.id) => (
          <li key={item.id}>
            <MyListItem itemId={item.id} />
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
|---|:---:|---|
|path|`string`|the path to your firebase list. e.g. `list`. **required**|
|length|`number`|the number of items per page. defaults to `10`.|
|orderBy|`string`|the prop that will be used for ordering the list. **must hold numbered values**. defaults to `.value`. e.g. `.value or .priority or propName`|
|onNewItem|`function`|a function that is called whenever a new item is added to the list (only once per item id). e.g. `(props) => (item) => {...}`|
|onNewPage|`function`|a function that is called whenever a new page is rendered (even when calling 'the same page' twice as pages may have changed). e.g. `(props) => (pageItems) => {...}`|

### Passed Props

|prop|value|description|
|---|---|---|
|isLoading|`boolean`|is true when a new page is loading.|
|hasNextPage|`boolean`|is true when the next page has items.|
|hasPrevPage|`boolean`|is true when the previous page has items.|
|onNextPage|`function`|will render the next page when called. takes no arguments.|
|onPrevPage|`function`|will render the previous page when called. takes no arguments.|

## Next Steps

- [ ] create tests using jest
