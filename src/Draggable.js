import React from 'react';
import {useDraggable} from '@dnd-kit/core';

export function Draggable({id, data, styles, children, disabled}) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: id,
    data: data,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  
  return (
    <button className='py-2' disabled={disabled} ref={setNodeRef} style={{...style, ...styles}} {...listeners} {...attributes}>
      {children}
    </button>
  );
}