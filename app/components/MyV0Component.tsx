'use client'

import React, { useState, useEffect, useRef } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import * as THREE from 'three'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

// UI Components (simplified versions of shadcn/ui components)
const Button = ({ children, onClick, className = '' }) => (
  <button
    className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
)

const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
    {children}
  </label>
)

const Input = ({ id, type = "text", value, onChange, className = '' }) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    className={`mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${className}`}
  />
)

// Expanded furniture types with customizable sizes
const furnitureTypes = {
  chair: { name: "Chair", icon: "🪑", defaultSize: { width: 0.5, depth: 0.5, height: 0.9 } },
  table: { name: "Table", icon: "🪵", defaultSize: { width: 1.2, depth: 0.8, height: 0.75 } },
  bed: { name: "Bed", icon: "🛏️", defaultSize: { width: 2, depth: 1.5, height: 0.5 } },
  sofa: { name: "Sofa", icon: "🛋️", defaultSize: { width: 2, depth: 0.9, height: 0.8 } },
  bookshelf: { name: "Bookshelf", icon: "📚", defaultSize: { width: 1, depth: 0.4, height: 2 } },
  plant: { name: "Plant", icon: "🪴", defaultSize: { width: 0.5, depth: 0.5, height: 1 } },
  tv: { name: "TV", icon: "📺", defaultSize: { width: 1.2, depth: 0.1, height: 0.7 } },
}

const roomFeatures = {
  door: { name: "Door", icon: "🚪", defaultSize: { width: 0.9, height: 2 } },
  window: { name: "Window", icon: "🪟", defaultSize: { width: 1.2, height: 1.5 } },
  socket: { name: "Socket", icon: "🔌", defaultSize: { width: 0.1, height: 0.1 } },
}

const FurnitureItem = ({ type, placeItem }) => {
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
      className={`w-16 h-16 m-2 cursor-move flex items-center justify-center text-4xl ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      onClick={() => placeItem(type)}
    >
      {furnitureTypes[type].icon}
    </div>
  )
}

const RoomFeatureItem = ({ type, placeFeature }) => {
  return (
    <div
      className="w-16 h-16 m-2 cursor-pointer flex items-center justify-center text-4xl"
      onClick={() => placeFeature(type)}
    >
      {roomFeatures[type].icon}
    </div>
  )
}

const GridCell = ({ x, y, item, removeItem, cellSize }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'furniture',
   //#region  drop: (droppedItem) => ({ x, y, item: droppedItem.type }),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  return (
    <div
      ref={drop}
      className={`border border-gray-300 ${isOver ? 'bg-blue-100' : 'bg-white'}`}
      style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
      onClick={() => removeItem(x, y)}
    >
      {item && (
        <div className="w-full h-full flex items-center justify-center text-2xl">
          {furnitureTypes[item].icon}
        </div>
      )}
    </div>
  )
}

const Room3D = ({ roomSize, furniture, walls, doors, windows, sockets }) => {
  const { scene, camera } = useThree()
  const roomRef = useRef()

  useEffect(() => {
    camera.position.set(roomSize.width / 2, roomSize.height / 2, Math.max(roomSize.width, roomSize.length) * 1.5)
    camera.lookAt(roomSize.width / 2, 0, roomSize.length / 2)
  }, [camera, roomSize])

  useFrame(() => {
    if (roomRef.current) {
  
    }
  })

  return (
    <group ref={roomRef}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[roomSize.width / 2, 0, roomSize.length / 2]}>
        <planeGeometry args={[roomSize.width, roomSize.length]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* Walls */}
      {walls.map((wall, index) => (
        <mesh key={index} position={[wall.x, wall.height / 2, wall.z]}>
          <boxGeometry args={[wall.width, wall.height, wall.depth]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>
      ))}

      {/* Furniture */}
      {furniture.map((item, index) => (
        <mesh key={index} position={[item.x + item.width / 2, item.height / 2, item.z + item.depth / 2]}>
          <boxGeometry args={[item.width, item.height, item.depth]} />
          <meshStandardMaterial color={new THREE.Color().setHSL(Math.random(), 0.5, 0.5)} />
        </mesh>
      ))}

      {/* Doors */}
      {doors.map((door, index) => (
        <mesh key={index} position={[door.x, door.height / 2, door.z]}>
          <boxGeometry args={[door.width, door.height, 0.1]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      ))}

      {/* Windows */}
      {windows.map((window, index) => (
        <mesh key={index} position={[window.x, window.y + window.height / 2, window.z]}>
          <boxGeometry args={[window.width, window.height, 0.1]} />
          <meshStandardMaterial color="#87ceeb" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Sockets */}
      {sockets.map((socket, index) => (
        <mesh key={index} position={[socket.x, socket.y, socket.z]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color="#c0c0c0" />
        </mesh>
      ))}

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
    </group>
  )
}

export default function Component() {
  const [roomSize, setRoomSize] = useState({ width: 5, length: 5, height: 2.5 })
  const [gridSize, setGridSize] = useState({ width: 10, length: 10 })
  const [furniture, setFurniture] = useState([])
  const [walls, setWalls] = useState([])
  const [doors, setDoors] = useState([])
  const [windows, setWindows] = useState([])
  const [sockets, setSockets] = useState([])
  const [roomName, setRoomName] = useState("")
  const [showGrid, setShowGrid] = useState(true)
  const [show3D, setShow3D] = useState(false)

  useEffect(() => {
    // Initialize walls
    const newWalls = [
      { x: 0, z: 0, width: roomSize.width, height: roomSize.height, depth: 0.1 }, // Front wall
      { x: 0, z: roomSize.length, width: roomSize.width, height: roomSize.height, depth: 0.1 }, // Back wall
      { x: 0, z: 0, width: 0.1, height: roomSize.height, depth: roomSize.length }, // Left wall
      { x: roomSize.width, z: 0, width: 0.1, height: roomSize.height, depth: roomSize.length }, // Right wall
    ]
    setWalls(newWalls)
  }, [roomSize])

  const cellSize = Math.min(500 / gridSize.width, 500 / gridSize.length)

  const placeItem = (type) => {
    const newItem = {
      type,
      x: 0,
      z: 0,
      ...furnitureTypes[type].defaultSize,
    }
    setFurniture([...furniture, newItem])
  }

  const placeFeature = (type) => {
    const feature = {
      type,
      x: 0,
      y: type === 'socket' ? 0.3 : 0, // Place sockets slightly above the floor
      z: 0,
      ...roomFeatures[type].defaultSize,
    }
    switch (type) {
      case 'door':
        setDoors([...doors, feature])
        break
      case 'window':
        setWindows([...windows, feature])
        break
      case 'socket':
        setSockets([...sockets, feature])
        break
    }
  }

  const removeItem = (x, y) => {
    // Implementation for removing items
    setFurniture(furniture.filter(item => item.x !== x || item.z !== y))
  }

  const saveLayout = () => {
    const layout = {
      roomName,
      roomSize,
      gridSize,
      furniture,
      walls,
      doors,
      windows,
      sockets,
    }
    localStorage.setItem('roomLayout', JSON.stringify(layout))
    alert('Layout saved!')
  }

  const loadLayout = () => {
    const savedLayout = localStorage.getItem('roomLayout')
    if (savedLayout) {
      const layout = JSON.parse(savedLayout)
      setRoomName(layout.roomName)
      setRoomSize(layout.roomSize)
      setGridSize(layout.gridSize)
      setFurniture(layout.furniture)
      setWalls(layout.walls)
      setDoors(layout.doors)
      setWindows(layout.windows)
      setSockets(layout.sockets)
      alert('Layout loaded!')
    } else {
      alert('No saved layout found!')
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
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
                onChange={(e) => setRoomSize({ ...roomSize, width: parseFloat(e.target.value) })}
              />
              <Label htmlFor="room-length">Length (m)</Label>
              <Input
                id="room-length"
                type="number"
                value={roomSize.length}
                onChange={(e) => setRoomSize({ ...roomSize, length: parseFloat(e.target.value) })}
              />
              <Label htmlFor="room-height">Height (m)</Label>
              <Input
                id="room-height"
                type="number"
                value={roomSize.height}
                onChange={(e) => setRoomSize({ ...roomSize, height: parseFloat(e.target.value) })}
              />
            </div>
            <h2 className="text-xl font-semibold mt-4 mb-2">Furniture</h2>
            <div className="flex flex-wrap">
              {Object.keys(furnitureTypes).map((type) => (
                <FurnitureItem key={type} type={type} placeItem={placeItem} />
              ))}
            </div>
            <h2 className="text-xl font-semibold mt-4 mb-2">Room Features</h2>
            <div className="flex flex-wrap">
              {Object.keys(roomFeatures).map((type) => (
                <RoomFeatureItem key={type} type={type} placeFeature={placeFeature} />
              ))}
            </div>
            <div className="mt-4">
              <Button onClick={saveLayout} className="mr-2">Save Layout</Button>
              <Button onClick={loadLayout}>Load Layout</Button>
            </div>
          </div>
          <div className="md:w-3/4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Room Layout</h2>
              <div>
                <Button onClick={() => setShowGrid(!showGrid)} className="mr-2">
                  {showGrid ? 'Hide Grid' : 'Show Grid'}
                </Button>
                <Button onClick={() => setShow3D(!show3D)}>
                  {show3D ? 'Show 2D' : 'Show 3D'}
                </Button>
              </div>
            </div>
            {show3D ? (
              <div style={{ width: '100%', height: '500px' }}>
                <Canvas>
                  <Room3D
                    roomSize={roomSize}
                    furniture={furniture}
                    walls={walls}
                    doors={doors}
                    windows={windows}
                    sockets={sockets}
                  />
                  <OrbitControls />
                </Canvas>
              </div>
            ) : (
              showGrid && (
                <div
                  className="grid gap-0 border border-gray-400"
                  style={{
                    gridTemplateColumns: `repeat(${gridSize.width}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${gridSize.length}, ${cellSize}px)`,
                  }}
                >
                  {Array.from({ length: gridSize.length }).map((_, y) =>
                    Array.from({ length: gridSize.width }).map((_, x) => (
                      <GridCell
                        key={`${x},${y}`}
                        x={x}
                        y={y}
                        item={furniture.find(item => item.x === x && item.z === y)?.type}
                        removeItem={removeItem}
                        cellSize={cellSize}
                      />
                    ))
                  )}
                </div>
              )
            )}
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="room-name">Room Name</Label>
          <Input 
            id="room-name" 
           
            className="max-w-sm"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
        </div>
      </div>
    </DndProvider>
  )
}