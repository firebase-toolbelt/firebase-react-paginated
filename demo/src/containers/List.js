import firebase from '../../lib/firebase';
import withFirebasePagination from '../../../src/';
import List from '../components/List';

const ListContainer = withFirebasePagination(firebase)({
  path: '/',
  orderBy: '.value',
  length: 4,
  onNewItem: () => (item) => console.log(item),
  onNewPage: () => (pageItems) => console.log(pageItems)
})(List);

export default ListContainer;
