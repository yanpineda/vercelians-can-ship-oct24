'use client'

npm install react-dnd react-dnd-html5-backend 

import React, { useState } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

// Furniture types and their SVG representations
const furnitureTypes = {
  chair: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M5.566 4.657A4.505 4.505 0 016.75 4.5h10.5c.41 0 .806.055 1.183.157A3 3 0 0015.75 3h-7.5a3 3 0 00-2.684 1.657zM2.25 12a3 3 0 013-3h13.5a3 3 0 013 3v3a3 3 0 01-3 3H5.25a3 3 0 01-3-3v-3zM5.25 7.5c-.41 0-.806.055-1.184.157A3 3 0 016.75 6h10.5a3 3 0 012.684 1.657A4.505 4.505 0 0018.75 7.5H5.25zM20.25 16.5a.75.75 0 00-.75.75v2.25a.75.75 0 001.5 0v-2.25a.75.75 0 00-.75-.75zM3.75 17.25a.75.75 0 00-1.5 0v2.25a.75.75 0 001.5 0v-2.25z" />
    </svg>
  ),
  table: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
  ),
  bed: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M5.25 12.75a.75.75 0 01.75-.75h12a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75z" />
      <path fillRule="evenodd" d="M2.25 4.5A2.25 2.25 0 004.5 6.75V18a2.25 2.25 0 002.25 2.25h10.5A2.25 2.25 0 0019.5 18V6.75a2.25 2.25 0 00-2.25-2.25H4.5zm7.5 7.5a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zm0 3a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zm-3-3a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zm0 3a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    </svg>
  ),
}

const FurnitureItem = ({ type, rotateItem }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'furniture',
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      className={`w-16 h-16 m-2 cursor-move ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      onClick={rotateItem}
    >
      {furnitureTypes[type]}
    </div>
  )
}

const GridCell = ({ x, y, item, rotation, removeItem }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'furniture',
    drop: (droppedItem) => ({ x, y, item: droppedItem.type }),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  return (
    <div
      ref={drop}
      className={`w-16 h-16 border border-gray-300 ${isOver ? 'bg-blue-100' : 'bg-white'}`}
    >
      {item && (
        <div
          className="w-full h-full relative"
          style={{ transform: `rotate(${rotation}deg)` }}
          onClick={() => removeItem(x, y)}
        >
          {furnitureTypes[item]}
        </div>
      )}
    </div>
  )
}

export default function Component() {
  const [grid, setGrid] = useState(Array(8).fill().map(() => Array(8).fill(null)))
  const [rotations, setRotations] = useState({})

  const placeItem = (x, y, item) => {
    const newGrid = [...grid]
    newGrid[y][x] = item
    setGrid(newGrid)
  }

  const removeItem = (x, y) => {
    const newGrid = [...grid]
    newGrid[y][x] = null
    setGrid(newGrid)
    const newRotations = { ...rotations }
    delete newRotations[`${x},${y}`]
    setRotations(newRotations)
  }

  const rotateItem = (x, y) => {
    const key = `${x},${y}`
    setRotations({
      ...rotations,
      [key]: (rotations[key] || 0) + 90,
    })
  }

  const clearRoom = () => {
    setGrid(Array(8).fill().map(() => Array(8).fill(null)))
    setRotations({})
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Room Planner</h1>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 mb-4 md:mb-0">
            <h2 className="text-xl font-semibold mb-2">Furniture</h2>
            <div className="flex flex-wrap">
              {Object.keys(furnitureTypes).map((type) => (
                <FurnitureItem key={type} type={type} rotateItem={() => {}} />
              ))}
            </div>
            <Button className="mt-4" onClick={clearRoom}>Clear Room</Button>
          </div>
          <div className="md:w-3/4">
            <h2 className="text-xl font-semibold mb-2">Room Layout</h2>
            <div className="grid grid-cols-8 gap-0 border border-gray-400">
              {grid.map((row, y) =>
                row.map((cell, x) => (
                  <GridCell
                    key={`${x},${y}`}
                    x={x}
                    y={y}
                    item={cell}
                    rotation={rotations[`${x},${y}`] || 0}
                    removeItem={removeItem}
                  />
                ))
              )}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="room-name">Room Name</Label>
          <Input id="room-name" placeholder="Enter room name" className="max-w-sm" />
        </div>
      </div>
    </DndProvider>
  )
}
