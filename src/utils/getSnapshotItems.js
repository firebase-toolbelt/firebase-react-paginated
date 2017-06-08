export default function getSnapshotItems(snap, onNewItem, onNewItemCallStack) {
  
  let items = { ids: [], values: [] };

  snap.forEach((childSnap) => {

    const itemId = childSnap.key;
    const itemValue = childSnap.val();

    items.ids.unshift(itemId);
    items.values.unshift(itemValue);

    if (onNewItem && !onNewItemCallStack[itemId]) {
      onNewItem(itemId, itemValue);
      onNewItemCallStack[itemId] = true;
    }

  });

  return items;

}
