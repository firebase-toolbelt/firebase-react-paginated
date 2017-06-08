# firebase-react-paginated

Implementing paginated lists when dealing with dynamic content using Firebase can be troublesome. This simple HOC will make dealing with this a breeze for most cases.

# Getting started

First of all, install the package dependency from npm.

`npm install -s firebase-react-paginated`

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

    {isLoading && <p>loading list page…</p>}

    {!isLoading && (
      <ul>
        {pageIds.map((itemId) => (
          <li key={itemId}>
            <MyListItem itemId={itemId} />
          </li>
        ))}
      </ul>
    )}

  </div>
);

export default MyComponent;
```

```javascript
// ./containers/MyComponent
import React from 'react'
import firebase from 'firebase';
import withFirebasePagination from 'firebase-react-paginated';
import MyComponent from '../components/MyComponent';

firebase.config(/* your firebase config */);

const myPaginatedHOC = withFirebasePagination(firebase)({ path: 'listItems' });
const MyComponentContainer = myPaginatedHOC(MyComponent);

export default MyComponentContainer;
```

# Required Data Structure

When dealing with firebase you should always denormalize your data.
So when creating a list structure you should probably separate the list items data from the list itself.
That way your list is a lightweight as it gets and you can fetch the item data when the time is right.

```json
{
  "listItems": {
    "$itemId_1": "timestamp",
    "$itemId_2": "timestamp",
    "$itemId_3": "timestamp",
    "$itemId_4": "timestamp" 
  },
  "items": {
    "$itemId_1": {
      "title": "My item title",
      "author": "Arthur C. Clarke",
      "description": "A really awesome book",
      "createdAt": "timestamp"
    }
  }
}
```
