'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Canvas, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls, Box, Plane } from '@react-three/drei'
import * as THREE from 'three'

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
  defaultSize: {
    width: number;
    depth: number;
    height: number;
  };
  color: string;
  model: string;
}

const furnitureTypes: { [key: string]: FurnitureType } = {
  chair: { name: "Chair", icon: "🪑", defaultSize: { width: 50, depth: 50, height: 90 }, color: "#8B4513", model: "/placeholder.svg?height=90&width=50" },
  table: { name: "Table", icon: "🪵", defaultSize: { width: 120, depth: 80, height: 75 }, color: "#A0522D", model: "/placeholder.svg?height=75&width=120" },
  bed: { name: "Bed", icon: "🛏️", defaultSize: { width: 200, depth: 150, height: 50 }, color: "#DEB887", model: "/placeholder.svg?height=50&width=200" },
  sofa: { name: "Sofa", icon: "🛋️", defaultSize: { width: 180, depth: 90, height: 80 }, color: "#CD853F", model: "/placeholder.svg?height=80&width=180" },
  bookshelf: { name: "Bookshelf", icon: "📚", defaultSize: { width: 100, depth: 40, height: 200 }, color: "#D2691E", model: "/placeholder.svg?height=200&width=100" },
  plant: { name: "Plant", icon: "🪴", defaultSize: { width: 40, depth: 40, height: 100 }, color: "#228B22", model: "/placeholder.svg?height=100&width=40" },
  tv: { name: "TV", icon: "📺", defaultSize: { width: 120, depth: 10, height: 70 }, color: "#000000", model: "/placeholder.svg?height=70&width=120" },
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
  item: FurnitureItem | null;
  onDrop: (type: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
  onResize: (id: string, newSize: { width: number; depth: number; height: number }) => void;
  snapToGrid: boolean;
}

const GridCell: React.FC<GridCellProps> = ({ x, y, item, onDrop, onRemove, onResize, snapToGrid }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [, drop] = useDrop(() => ({
    accept: 'FURNITURE',
    drop: (droppedItem: { type: string }, monitor) => {
      const offset = monitor.getClientOffset()
      if (offset && ref.current) {
        const cellRect = ref.current.getBoundingClientRect()
        const dropX = snapToGrid ? x : x + offset.x - cellRect.left
        const dropY = snapToGrid ? y : y + offset.y - cellRect.top
        onDrop(droppedItem.type, dropX, dropY)
      }
    },
  }), [x, y, onDrop, snapToGrid])

  drop(ref)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    if (item) {
      const resizeDialog = document.createElement('div')
      resizeDialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
      resizeDialog.innerHTML = `
        <div class="bg-white p-4 rounded-lg">
          <h3 class="text-lg font-bold mb-4">Resize ${furnitureTypes[item.type].name}</h3>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Width (cm)</label>
            <input type="number" id="width-input" value="${item.width}" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Depth (cm)</label>
            <input type="number" id="depth-input" value="${item.depth}" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Height (cm)</label>
            <input type="number" id="height-input" value="${item.height}" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
          </div>
          <div class="flex justify-end">
            <button id="cancel-btn" class="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancel</button>
            <button id="save-btn" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Save</button>
          </div>
        </div>
      `
      document.body.appendChild(resizeDialog)

      const widthInput = resizeDialog.querySelector('#width-input') as HTMLInputElement
      const depthInput = resizeDialog.querySelector('#depth-input') as HTMLInputElement
      const heightInput = resizeDialog.querySelector('#height-input') as HTMLInputElement
      const cancelBtn = resizeDialog.querySelector('#cancel-btn') as HTMLButtonElement
      const saveBtn = resizeDialog.querySelector('#save-btn') as HTMLButtonElement

      cancelBtn.onclick = () => document.body.removeChild(resizeDialog)
      saveBtn.onclick = () => {
        const newWidth = Number(widthInput.value)
        const newDepth = Number(depthInput.value)
        const newHeight = Number(heightInput.value)
        if (newWidth && newDepth && newHeight) {
          onResize(item.id, { width: newWidth, depth: newDepth, height: newHeight })
        }
        document.body.removeChild(resizeDialog)
      }
    }
  }

  return (
    <div
      ref={ref}
      className="w-16 h-16 border border-gray-300 bg-white relative"
      onContextMenu={handleContextMenu}
    >
      {item && (
        <div 
          className="absolute flex items-center justify-center text-2xl"
          style={{
            backgroundColor: furnitureTypes[item.type].color,
            width: `${item.width / 2}px`,
            height: `${item.depth / 2}px`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          {furnitureTypes[item.type].icon}
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
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  height: number;
}

interface SavedLayout {
  roomName: string;
  roomSize: RoomSize;
  furniture: FurnitureItem[];
}

const FurnitureModel: React.FC<{ item: FurnitureItem }> = ({ item }) => {
  const texture = useLoader(THREE.TextureLoader, furnitureTypes[item.type].model)
  const { scene } = useThree()

  useEffect(() => {
    const material = new THREE.MeshStandardMaterial({ 
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      color: new THREE.Color(furnitureTypes[item.type].color)
    })

    const geometry = new THREE.BoxGeometry(item.width / 100, item.height / 100, item.depth / 100)
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(item.x / 100 + item.width / 200, item.height / 200, item.y / 100 + item.depth / 200)
    scene.add(mesh)

    return () => {
      scene.remove(mesh)
      geometry.dispose()
      material.dispose()
    }
  }, [item, texture, scene])

  return null
}

const Room3D: React.FC<{ roomSize: RoomSize; furniture: FurnitureItem[] }> = ({ roomSize, furniture }) => {
  return (
    <Canvas camera={{ position: [5, 5, 5] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Plane 
        args={[roomSize.width / 100, roomSize.length / 100]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[roomSize.width / 200, 0, roomSize.length / 200]}
      >
        <meshStandardMaterial color="gray" />
      </Plane>
      {furniture.map((item) => (
        <FurnitureModel key={item.id} item={item} />
      ))}
      <OrbitControls />
    </Canvas>
  )
}

const EnhancedRoomPlanner: React.FC = () => {
  const [roomSize, setRoomSize] = useState<RoomSize>({ width: 500, length: 500 })
  const [furniture, setFurniture] = useState<FurnitureItem[]>([])
  const [roomName, setRoomName] = useState<string>("")
  const [savedLayouts, setSavedLayouts] = useState<SavedLayout[]>([])
  const [show3D, setShow3D] = useState(false)
  const [snapToGrid, setSnapToGrid] = useState(true)

  useEffect(() => {
    const layouts = localStorage.getItem('roomLayouts')
    if (layouts) {
      setSavedLayouts(JSON.parse(layouts))
    }
  }, [])

  const placeItem = useCallback((type: string, x: number, y: number) => {
    const newItem: FurnitureItem = {
      id: Date.now().toString(),
      type,
      x: snapToGrid ? Math.round(x / 64) * 64 : x,
      y: snapToGrid ? Math.round(y / 64) * 64 : y,
      ...furnitureTypes[type].defaultSize
    }
    setFurniture(prev => [...prev, newItem])
  }, [snapToGrid])

  const removeItem = useCallback((id: string) => {
    setFurniture(prev => prev.filter(item => item.id !== id))
  }, [])

  const resizeItem = useCallback((id: string, newSize: { width: number; depth: number; height: number }) => {
    setFurniture(prev => prev.map(item => item.id === id ? { ...item, ...newSize } : item))
  }, [])

  const saveLayout = () => {
    if (!roomName) {
      alert('Please enter a room name before saving.')
      return
    }
    const layout: SavedLayout = { roomName, roomSize, furniture }
    const updatedLayouts = [...savedLayouts.filter(l => l.roomName !== roomName), layout]
    setSavedLayouts(updatedLayouts)
    localStorage.setItem('roomLayouts', JSON.stringify(updatedLayouts))
    alert('Layout saved!')
  }

  const loadLayout = (layout: SavedLayout) => {
    setRoomName(layout.roomName)
    setRoomSize(layout.roomSize)
    setFurniture(layout.furniture)
  }

  const deleteLayout = useCallback((layoutName: string) => {
    if (window.confirm(`Are you sure you want to delete the layout "${layoutName}"?`)) {
      const updatedLayouts = savedLayouts.filter(l => l.roomName !== layoutName)
      setSavedLayouts(updatedLayouts)
      localStorage.setItem('roomLayouts', JSON.stringify(updatedLayouts))
    }
  }, [savedLayouts])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Enhanced Room Planner</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div  className="md:w-1/4">
          <h2 className="text-xl font-semibold mb-2">Room Settings</h2>
          <div className="grid grid-cols-2 gap-2">
            <Label htmlFor="room-width">Width (cm)</Label>
            <Input
              id="room-width"
              type="number"
              value={roomSize.width}
              onChange={(e) => setRoomSize(prev => ({ ...prev, width: parseInt(e.target.value) || 100 }))}
            />
            <Label htmlFor="room-length">Length (cm)</Label>
            <Input
              id="room-length"
              type="number"
              value={roomSize.length}
              onChange={(e) => setRoomSize(prev => ({ ...prev, length: parseInt(e.target.value) || 100 }))}
            />
          </div>
          <h2 className="text-xl font-semibold mt-4 mb-2">Furniture</h2>
          <div className="flex flex-wrap">
            {Object.keys(furnitureTypes).map((type) => (
              <DraggableItem key={type} type={type} onDrop={(type) => placeItem(type, 0, 0)} />
            ))}
          </div>
          <div className="mt-4">
            <Label htmlFor="room-name">Room Name</Label>
            <Input 
              id="room-name" 
              placeholder="Enter room name" 
              className="max-w-sm mb-2"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <Button onClick={saveLayout} className="mr-2">Save Layout</Button>
            <Button onClick={() => setShow3D(!show3D)}>{show3D ? 'Show 2D' : 'Show 3D'}</Button>
          </div>
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.target.checked)}
                className="mr-2"
              />
              Snap to Grid
            </label>
          </div>
          <h2 className="text-xl font-semibold mt-4 mb-2">Saved Layouts</h2>
          <ul>
            {savedLayouts.map((layout, index) => (
              <li key={index} className="mb-2 flex items-center">
                <Button onClick={() => loadLayout(layout)} className="mr-2">{layout.roomName}</Button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => deleteLayout(layout.roomName)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:w-3/4">
          <h2 className="text-xl font-semibold mb-2">Room Layout</h2>
          <div className="mb-4">
            <p>Room Size: {roomSize.width}cm x {roomSize.length}cm</p>
          </div>
          {show3D ? (
            <div style={{ width: '100%', height: '500px' }}>
              <Room3D roomSize={roomSize} furniture={furniture} />
            </div>
          ) : (
            <div
              className="grid gap-0 border border-gray-300"
              style={{
                gridTemplateColumns: `repeat(${Math.ceil(roomSize.width / 64)}, 64px)`,
                gridTemplateRows: `repeat(${Math.ceil(roomSize.length / 64)}, 64px)`,
              }}
            >
              {Array.from({ length: Math.ceil(roomSize.length / 64) }).map((_, y) =>
                Array.from({ length: Math.ceil(roomSize.width / 64) }).map((_, x) => (
                  <GridCell
                    key={`${x},${y}`}
                    x={x * 64}
                    y={y * 64}
                    item={furniture.find(item => 
                      item.x >= x * 64 && item.x < (x + 1) * 64 && item.y >= y * 64 && item.y < (y + 1) * 64
                    ) || null}
                    onDrop={placeItem}
                    onRemove={removeItem}
                    onResize={resizeItem}
                    snapToGrid={snapToGrid}
                  />
                ))
              )}
            </div>
          )}
        </div>
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