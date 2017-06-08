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
          pageIds: [],
          pageValues: [],
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
          if (!this.options.length) this.options.length = 10;
          if (this.options.onNewItem) this.options.onNewItem = this.options.onNewItem(this.props);
        }

        setupRef = () => {
          this.baseRef = ref.child(this.options.path).orderByValue();
        }

        preBindListeners = () => {
          const pageValues = this.state.pageValues;
          this.anchor = (
            this.front
              ? pageValues.length ? pageValues[pageValues.length - 1] : null
              : pageValues.length
                ? pageValues.length > this.options.length + 1 ? pageValues[1] : pageValues[0]
                : null
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

            const items = getItems(snap, this.options.onNewItem, this.onNewItemCallStack);
            
            let newState = {
              pageIds: items.ids,
              pageValues: items.values,
              isLoading: false
            };
            
            if (this.front) {
              newState.hasNextPage = newState.pageIds.length > this.options.length;
            } else {
              newState.hasPrevPage = newState.pageIds.length > this.options.length + 1;
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
          
          let pageIds = this.state.pageIds;
          let pageValues = this.state.pageValues;
          
          if (this.front) {
            pageIds = pageIds.slice(0, this.options.length);
            pageValues = pageValues.slice(0, this.options.length);
          } else {
            pageIds = pageIds.slice(-1 + (this.options.length * -1), -1);
            pageValues = pageValues.slice(-1 + (this.options.length * -1), -1);
          }
          
          return (
            <WrappedComponent
              {...this.props}
              pageIds={pageIds}
              pageValues={pageValues}
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
