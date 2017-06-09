import React from 'react';

const List = (props) => {
  return (
    <div>
      
      {props.isLoading && <div>loading…</div>}
      
      <button
        disabled={!props.hasPrevPage}
        onClick={props.onPrevPage}>
        newer
      </button>
      
      <ul>
        {props.pageItems.map((item) => (
          <li key={item.id}>{item.id}</li>
        ))}
      </ul>
      
      <button
        disabled={!props.hasNextPage}
        onClick={props.onNextPage}>
        older
      </button>
      
    </div>
  );
};

export default List;
