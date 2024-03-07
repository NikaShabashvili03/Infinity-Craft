import React from 'react';
import {useDroppable} from '@dnd-kit/core';

export function Droppable(props) {
  const {isOver, setNodeRef} = useDroppable({
    id: props.id,
  });

  const style = {
    border: props.merge && (isOver ? '1px solid green' : undefined),
  };

  return (
    <div className={props.className} ref={setNodeRef} style={style}>
      {props.children}
    </div>
  );
}