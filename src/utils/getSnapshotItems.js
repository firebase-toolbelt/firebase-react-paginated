export default function getSnapshotItems(snap, onNewItem, onNewItemCallStack) {
  
  let items = [];

  snap.forEach((childSnap) => {

    const item = {
      id: childSnap.key,
      value: childSnap.val(),
      priority: childSnap.getPriority()
    };

    items.unshift(item);

    if (onNewItem && !onNewItemCallStack[item.id]) {
      onNewItem(item);
      onNewItemCallStack[item.id] = true;
    }

  });

  return items;

}
