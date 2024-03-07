// import React from 'react'

// import Rive from 'rive-react';

// export default function App() {
//   // const { rive, RiveComponent } = useRive({
//   //   src: 'cursor_tracking.riv',
//   //   animations: 'Preview',
//   //   autoplay: true
//   // })

//   // console.log(rive);
//   return (
//     <div className='w-full h-dvh'>
//       <Rive
//           src="cursor_tracking.riv"
//           stateMachines="Pressed"
//         />
//     </div>
//   )
// }

import React, {useState} from 'react';
import {DndContext} from '@dnd-kit/core';

import {Droppable} from './Droppable';
import {Draggable} from './Draggable';
import axios from 'axios';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);

  const [value, setValue] = useState('');
  const [apikey, setApikey] = useState(null);

  const [items, setItems] = useState([
    {
      content: 'Water 💧',
      position: {
        x: 0,
        y: 0,
      }
    },
    {
      content: 'Fire 🔥',
      position: {
        x: 0,
        y: 0,
      }
    },
    {
      content: 'Earth 🌎',
      position: {
        x: 0,
        y: 0,
      }
    },
    {
      content: 'Rock 🪨',
      position: {
        x: 0,
        y: 0,
      }
    }
  
  ]);

  const [crafting, setCrafting] = useState([])

  const handleAddKey = () => {
    if(value?.length > 5){
      setApikey(value);
    }else{
      alert('Please set correct api key')
    }
  }

  if(!apikey){
    return (
      <div className='w-full h-dvh flex justify-around items-center flex-col'>
        <h2 className='text-6xl'>Infinity Craft</h2>
        <div className='flex flex-col justify-center items-center'>
          <label className='self-start ml-2 mb-1 text-gray-400'>Please set your chatgpt api key</label>
          <input placeholder='Your API KEY' className='w-[400px] h-[50px] border-black border mb-2 rounded-full pl-2' value={value} onChange={(e) => setValue(e.target.value)}></input>
          <button className='w-[200px] h-[50px] hover:bg-white hover:text-black hover:border-black bg-black text-white border border-black rounded-full' onClick={() => {handleAddKey()}}>Submit</button>
        </div>
      </div>
    )
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className='flex h-dvh'>
          <Droppable className={'w-full overflow-auto relative  h-full'} id="add">
              {crafting.map((item, i) =>
                  <div key={i}>
                    <Draggable disabled={isLoading} styles={{
                      position: 'absolute',
                      left: `${item.position.x}px`,
                      top: `${item.position.y}px`
                    }} id={`crafting/${item.content}/${i}`} data={item.content}>
                      <Droppable className={'px-2 py-2 rounded-2xl'} merge={true} id={`merge/${item.content}/${i}`}>
                        <h2 key={i}>{item.content}</h2>
                      </Droppable>
                    </Draggable>
                  </div>
              )}
          </Droppable>
          <div className='flex flex-col h-full border-l-2 w-2/4 border-r px-5 py-5'>
            <div className='w-full flex justify-between px-2 items-center h-[10%]'>
              <div>
                <h2 className='text-3xl'>Infinity Craft</h2>
              </div>
              <div>
                <button onClick={() => {setCrafting([])}}>Clear</button>
              </div>
            </div>
            <Droppable className={'w-full p-2 mt-5 max-h-[90%] min-h-[90%] h-[90%] grid grid-cols-2 gap-2 border-t-2 content-start'} id={"clear"}>
              {items?.map((item, i) => 
                <Draggable disabled={isLoading} id={`items/${item.content}/${i}`} data={item.content} key={i}>
                  {item.content}
                </Draggable>
              )}
            </Droppable>
        </div>
      </div>
    </DndContext>
  );
  
  async function handleSendMessage({prev, merge}){
      setIsLoading(true);
      const toSend = `${prev} + ${merge} write in 1 word and 1 emoji`;
      try {
        const result = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: "gpt-3.5-turbo-0125",
            messages: [
                {
                    role: "user",
                    content: toSend
                },
                {
                    role: "assistant",
                    content: "",
                }
            ]
          },
          {
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apikey}`,
              }
          }
      );
      return result.data.choices[0].message.content;
    } catch (error) {

    }
  };

  async function handleDragEnd(event) {
    if(event?.over?.id === 'add' && event?.active?.id.includes('items/')){
      let item = {
        content: '',
        position: {
          x: 0,
          y: 0
        }
      };
      item.content = event.active.data.current;
      item.position.x += event.activatorEvent.screenX + event.delta.x;
      item.position.y += (event.activatorEvent.screenY + event.delta.y) - 100;
      setCrafting((prev) => [...prev, item]);
    }
    else if(event?.over?.id === 'clear' && event?.active?.id.includes('crafting/')){
      const id = parseInt(event.active.id.at(-1))
      setCrafting(crafting?.filter((_, i) => i !== id));
    }

    else if(event?.over?.id.includes('merge/') && event?.active?.id.includes('crafting/') || (event?.over?.id.includes('merge/') && event?.active.id.includes('items/'))){
      const remove = parseInt(event.active.id.at(-1));
      const merge = parseInt(event.over.id.at(-1));
      const removedItem = event.active.id.slice(6, -2);
      const mergeItem = event.over.id.slice(6, -2);

      if(removedItem.length > 0 && mergeItem.length > 0){
        const response = handleSendMessage({
          prev: removedItem,
          merge: mergeItem
        });

        await response.then((res) => {
          setIsLoading(false)
          if(!res){
            return;
          }

          if(merge !== remove){
            if(event?.over?.id.includes('merge/') && event?.active.id.includes('items/')){
              setCrafting(crafting?.map((item, id) => {
                if(merge === id){
                  item.content = res;
                  return item;
                }
                return item
              }))
            }
            else{
              setCrafting(crafting?.map((item, id) => {
                if(merge === id){
                  item.content = res;
                  return item;
                }
                return item
              }).filter((_, id) => id !== parseInt(remove)));
            }
            if(items?.some((item) => item?.content?.toString() === res?.toString())){
              return;
            }else{
              setItems((prev) => [...prev, {
                content: res,
                position: {
                  x: 0,
                  y: 0,
                }
              }]);
            }
          }else{
            const id = parseInt(event.active.id.at(-1));
            setCrafting(crafting?.map((item, i) => {
              if(id !== i){
                return item
              }
              item.position.x += event.delta.x;
              item.position.y += event.delta.y;
              return item;
            }));
          }
        });
      }
    }
    else if(event?.active?.id.includes('crafting/') && event?.over?.id === 'add'){
      const id = parseInt(event.active.id.at(-1));
      setCrafting(crafting.map((item, i) => {
        if(id !== i){
          return item
        }
        item.position.x += event.delta.x;
        item.position.y += event.delta.y;
        return item;
      }))
    }
  }
};