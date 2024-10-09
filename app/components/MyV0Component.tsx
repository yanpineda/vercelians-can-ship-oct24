'use client'

import React, { useState, useCallback, useRef } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, onClick, className = '' }) => (
  <button
    className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
)

const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
    {children}
  </label>
)

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ id, type = "text", value, onChange, className = '' }) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    className={`mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${className}`}
  />
)

interface FurnitureType {
  name: string;
  icon: string;
}

const furnitureTypes: { [key: string]: FurnitureType } = {
  chair: { name: "Chair", icon: "🪑" },
  table: { name: "Table", icon: "🪵" },
  bed: { name: "Bed", icon: "🛏️" },
  sofa: { name: "Sofa", icon: "🛋️" },
  bookshelf: { name: "Bookshelf", icon: "📚" },
  plant: { name: "Plant", icon: "🪴" },
  tv: { name: "TV", icon: "📺" },
}

interface DraggableItemProps {
  type: string;
  onDrop: (type: string) => void;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ type, onDrop }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [, drag] = useDrag(() => ({
    type: 'FURNITURE',
    item: { type },
  }), [type])

  drag(ref)

  return (
    <div
      ref={ref}
      className="w-16 h-16 m-2 cursor-move flex items-center justify-center text-4xl"
      onClick={() => onDrop(type)}
    >
      {furnitureTypes[type].icon}
    </div>
  )
}

interface GridCellProps {
  x: number;
  y: number;
  item: string | null;
  onDrop: (type: string, x: number, y: number) => void;
  onRemove: (x: number, y: number) => void;
}

const GridCell: React.FC<GridCellProps> = ({ x, y, item, onDrop, onRemove }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [, drop] = useDrop(() => ({
    accept: 'FURNITURE',
    drop: (droppedItem: { type: string }) => onDrop(droppedItem.type, x, y),
  }), [x, y, onDrop])

  drop(ref)

  return (
    <div
      ref={ref}
      className="w-16 h-16 border border-gray-300 bg-white"
      onClick={() => onRemove(x, y)}
    >
      {item && (
        <div className="w-full h-full flex items-center justify-center text-2xl">
          {furnitureTypes[item].icon}
        </div>
      )}
    </div>
  )
}

interface RoomSize {
  width: number;
  length: number;
}

interface FurnitureItem {
  type: string;
  x: number;
  y: number;
}

const EnhancedRoomPlanner: React.FC = () => {
  const [roomSize, setRoomSize] = useState<RoomSize>({ width: 5, length: 5 })
  const [furniture, setFurniture] = useState<FurnitureItem[]>([])
  const [roomName, setRoomName] = useState<string>("")

  const placeItem = useCallback((type: string, x: number, y: number) => {
    setFurniture(prev => [...prev, { type, x, y }])
  }, [])

  const removeItem = useCallback((x: number, y: number) => {
    setFurniture(prev => prev.filter(item => item.x !== x || item.y !== y))
  }, [])

  const saveLayout = () => {
    const layout = { roomName, roomSize, furniture }
    localStorage.setItem('roomLayout', JSON.stringify(layout))
    alert('Layout saved!')
  }

  const loadLayout = () => {
    const savedLayout = localStorage.getItem('roomLayout')
    if (savedLayout) {
      const layout = JSON.parse(savedLayout)
      setRoomName(layout.roomName)
      setRoomSize(layout.roomSize)
      setFurniture(layout.furniture)
      alert('Layout loaded!')
    } else {
      alert('No saved layout found!')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Enhanced Room Planner</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/4">
          <h2 className="text-xl font-semibold mb-2">Room Settings</h2>
          <div className="grid grid-cols-2 gap-2">
            <Label htmlFor="room-width">Width (m)</Label>
            <Input
              id="room-width"
              type="number"
              value={roomSize.width}
              onChange={(e) => setRoomSize(prev => ({ ...prev, width: parseInt(e.target.value) || 1 }))}
            />
            <Label htmlFor="room-length">Length (m)</Label>
            <Input
              id="room-length"
              type="number"
              value={roomSize.length}
              onChange={(e) => setRoomSize(prev => ({ ...prev, length: parseInt(e.target.value) || 1 }))}
            />
          </div>
          <h2 className="text-xl font-semibold mt-4 mb-2">Furniture</h2>
          <div className="flex flex-wrap">
            {Object.keys(furnitureTypes).map((type) => (
              <DraggableItem key={type} type={type} onDrop={(type) => placeItem(type, 0, 0)} />
            ))}
          </div>
          <div className="mt-4">
            <Button onClick={saveLayout} className="mr-2">Save Layout</Button>
            <Button onClick={loadLayout}>Load Layout</Button>
          </div>
        </div>
        <div className="md:w-3/4">
          <h2 className="text-xl font-semibold mb-2">Room Layout</h2>
          <div className="mb-4">
            <p>Room Size: {roomSize.width}m x {roomSize.length}m</p>
          </div>
          <div
            className="grid gap-0 border border-gray-300"
            style={{
              gridTemplateColumns: `repeat(${roomSize.width}, 64px)`,
              gridTemplateRows: `repeat(${roomSize.length}, 64px)`,
            }}
          >
            {Array.from({ length: roomSize.length }).map((_, y) =>
              Array.from({ length: roomSize.width }).map((_, x) => (
                <GridCell
                  key={`${x},${y}`}
                  x={x}
                  y={y}
                  item={furniture.find(item => item.x === x && item.y === y)?.type || null}
                  onDrop={placeItem}
                  onRemove={removeItem}
                />
              ))
            )}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Label htmlFor="room-name">Room Name</Label>
        <Input 
          id="room-name" 
          placeholder="Enter room name" 
          className="max-w-sm"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
      </div>
    </div>
  )
}

export default function Myv0Component() {
  return (
    <DndProvider backend={HTML5Backend}>
      <EnhancedRoomPlanner />
    </DndProvider>
  )
}