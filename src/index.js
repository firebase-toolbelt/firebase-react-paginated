// react
import React, { Component } from 'react';
// utils
import getRef from './utils/getFirebaseRef';
import getDisplayName from './utils/getComponentDisplayName';
import getItems from './utils/getSnapshotItems';

const withFirebasePages = (firebase) => {

  const ref = getRef(firebase);

  return (options) => {

    if (!options || !options.path) {
      throw new Error('withFirebasePages - must receive an options object with a valid path prop.');
    }

    return (WrappedComponent) => {
      return class extends Component {

        static displayName = `withFirebasePages(${getDisplayName(WrappedComponent)})`

        baseRef = null

        onItemCallStack = {}
      
        mounted = true
      
        front = true
        anchor = null
        listeners = {}
      
        options = {}
        
        state = {
          pageItems: [],
          hasNextPage: false,
          hasPrevPage: false
        }

        componentDidMount() {
          this.setupOptions();
          this.setupRef();
          this.goToNextPage();
        }

        componentWillUnmount() {
          this.mounted = false;
          this.unbindListeners();
        }

        setupOptions = () => {
          this.options = { ...options };
          if (typeof this.options.path === 'function') this.options.path = this.options.path(this.props);
          if (typeof this.options.orderBy === 'function') this.options.orderBy = this.options.orderBy(this.props);
          if (!this.options.orderBy) this.options.orderBy = '.value';
          if (!this.options.length) this.options.length = 10;
          if (this.options.onNewItem) this.options.onNewItem = this.options.onNewItem(this.props);
        }

        setupRef = () => {
          switch (this.options.orderBy) {
            case '.value':
              this.baseRef = ref.child(this.options.path).orderByValue();
              break;
            case '.priority':
              this.baseRef = ref.child(this.options.path).orderByPriority();
              break;
            default:
              this.baseRef = ref.child(this.options.path).orderByChild(this.options.orderBy);
              break;
          }
        }

        getAnchorValue = (idx) => {
          const anchorItem = this.state.pageItems[idx];
          switch (this.options.orderBy) {
            case '.value':
              return anchorItem.value;
            case '.priority':
              return anchorItem.priority;
            default:
              return anchorItem.value[this.options.orderBy];
          }
        }

        preBindListeners = () => {

          const pageItems = this.state.pageItems;

          if (!pageItems.length) {
            this.anchor = null;
            return;
          }

          this.anchor = (
            this.front
              ? this.getAnchorValue(pageItems.length - 1)
              : pageItems.length > this.options.length + 1
                ? this.getAnchorValue(1)
                : this.getAnchorValue(0)
          );

        }

        bindListeners = () => {

          this.setState({ isLoading: true });
          
          const curRef = (
            this.front
              ? this.anchor !== null
                ? this.baseRef.endAt(this.anchor).limitToLast(this.options.length + 1)
                : this.baseRef.limitToLast(this.options.length + 1)
              : this.baseRef.startAt(this.anchor).limitToFirst(this.options.length + 2)
          );

          const curListener = curRef.on('value', (snap) => {
            
            if (!this.mounted) return;
            
            let newState = {
              pageItems: getItems(snap, this.options.onNewItem, this.onNewItemCallStack),
              isLoading: false
            };
            
            if (this.front) {
              newState.hasNextPage = newState.pageItems.length > this.options.length;
            } else {
              newState.hasPrevPage = newState.pageItems.length > this.options.length + 1;
            }
            
            this.setState(newState);

          });

          this.listeners.current = { ref: curRef, listener: curListener };

          if (this.anchor !== null) {

            const tailRef = (
              this.front
                ? this.baseRef.startAt(this.anchor).limitToFirst(2)
                : this.baseRef.endAt(this.anchor).limitToLast(2)
            );
            
            const tailListener = tailRef.on('value', (snap) => {
              if (!this.mounted) return;
              
              let newState = {};
              
              if (this.front) {
                newState.hasPrevPage = snap.numChildren() === 2;
              } else {
                newState.hasNextPage = snap.numChildren() === 2;
              }
              
              this.setState(newState);
              
            });

            this.listeners.tail = { ref: tailRef, listener: tailListener };

          }

        }
        
        unbindListeners = () => {
          Object.keys(this.listeners).forEach((key) => {
            if (this.listeners[key]) {
              this.listeners[key].ref.off('value', this.listeners[key].listener);
              this.listeners[key] = null;
            }
          });
        }

        goToNextPage = () => {
          this.front = true;
          this.unbindListeners();
          this.preBindListeners();
          this.bindListeners();
        }

        goToPrevPage = () => {
          this.front = false;
          this.unbindListeners();
          this.preBindListeners();
          this.bindListeners();
        }

        render() {
          
          let pageItems = this.state.pageItems;
          
          if (this.front) {
            pageItems = pageItems.slice(0, this.options.length);
          } else {
            pageItems = pageItems.slice(-1 + (this.options.length * -1), -1);
          }
          
          return (
            <WrappedComponent
              {...this.props}
              pageItems={pageItems}
              isLoading={this.state.isLoading}
              hasNextPage={this.state.hasNextPage}
              hasPrevPage={this.state.hasPrevPage}
              onNextPage={this.goToNextPage}
              onPrevPage={this.goToPrevPage} />
          );
        }

      };
    };

  };
}

export default withFirebasePages;
