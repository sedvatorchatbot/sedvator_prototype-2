"use client"

import { useEffect, useRef, useState } from "react"

interface Tile {
  x: number
  y: number
  brightness: number
  targetBrightness: number
}

export function LightningCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mousePos = useRef({ x: -1000, y: -1000 })
  const tiles = useRef<Tile[][]>([])
  const animationRef = useRef<number>()
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const TILE_SIZE = 40
  const GLOW_RADIUS = 0 // Only the exact tile under cursor lights up

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const initTiles = () => {
      const cols = Math.ceil(window.innerWidth / TILE_SIZE) + 1
      const rows = Math.ceil(window.innerHeight / TILE_SIZE) + 1

      tiles.current = []
      for (let row = 0; row < rows; row++) {
        tiles.current[row] = []
        for (let col = 0; col < cols; col++) {
          tiles.current[row][col] = {
            x: col * TILE_SIZE,
            y: row * TILE_SIZE,
            brightness: 0,
            targetBrightness: 0,
          }
        }
      }
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
      initTiles()
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const updateTiles = () => {
      const { x, y } = mousePos.current
      const cursorCol = Math.floor(x / TILE_SIZE)
      const cursorRow = Math.floor(y / TILE_SIZE)

      for (let row = 0; row < tiles.current.length; row++) {
        for (let col = 0; col < tiles.current[row].length; col++) {
          const tile = tiles.current[row][col]

          if (col === cursorCol && row === cursorRow) {
            tile.targetBrightness = 1 // Full brightness for the single tile
          } else {
            tile.targetBrightness = 0
          }

          const diff = tile.targetBrightness - tile.brightness
          tile.brightness += diff * 0.25 // Faster transition

          if (tile.brightness < 0.01) tile.brightness = 0
        }
      }
    }

    const drawTiles = () => {
      if (!canvasRef.current || !canvasRef.current.getContext) return

      const ctx = canvasRef.current.getContext("2d")
      if (!ctx) return

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

      for (let row = 0; row < tiles.current.length; row++) {
        for (let col = 0; col < tiles.current[row].length; col++) {
          const tile = tiles.current[row][col]

          if (tile.brightness > 0) {
            const gradient = ctx.createRadialGradient(
              tile.x + TILE_SIZE / 2,
              tile.y + TILE_SIZE / 2,
              0,
              tile.x + TILE_SIZE / 2,
              tile.y + TILE_SIZE / 2,
              TILE_SIZE * 0.8,
            )

            gradient.addColorStop(0, `rgba(0, 255, 255, ${tile.brightness * 0.9})`)
            gradient.addColorStop(0.4, `rgba(0, 220, 255, ${tile.brightness * 0.6})`)
            gradient.addColorStop(1, `rgba(0, 180, 255, 0)`)

            ctx.fillStyle = gradient
            ctx.fillRect(tile.x, tile.y, TILE_SIZE, TILE_SIZE)

            ctx.strokeStyle = `rgba(0, 255, 255, ${tile.brightness * 0.8})`
            ctx.lineWidth = 2
            ctx.strokeRect(tile.x + 1, tile.y + 1, TILE_SIZE - 2, TILE_SIZE - 2)
          }
        }
      }

      ctx.strokeStyle = "rgba(0, 200, 255, 0.03)"
      ctx.lineWidth = 1

      for (let x = 0; x <= canvasRef.current.width; x += TILE_SIZE) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvasRef.current.height)
        ctx.stroke()
      }

      for (let y = 0; y <= canvasRef.current.height; y += TILE_SIZE) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvasRef.current.width, y)
        ctx.stroke()
      }
    }

    const animate = () => {
      updateTiles()
      drawTiles()
      animationRef.current = requestAnimationFrame(animate)
    }

    const handlePointerMove = (e: PointerEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseLeave = () => {
      mousePos.current = { x: -1000, y: -1000 }
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        mousePos.current = { x: touch.clientX, y: touch.clientY }
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        mousePos.current = { x: touch.clientX, y: touch.clientY }
      }
    }

    const handleTouchEnd = () => {
      mousePos.current = { x: -1000, y: -1000 }
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchmove", handleTouchMove, { passive: true })
    window.addEventListener("touchend", handleTouchEnd)
    window.addEventListener("touchcancel", handleTouchEnd)

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
      window.removeEventListener("touchcancel", handleTouchEnd)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" style={{ mixBlendMode: "screen" }} />
}
