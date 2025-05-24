<template>
  <div class="particle-container" ref="particleContainer"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const particleContainer = ref(null)
let particles = []
let animationFrame = null

class Particle {
  constructor(canvas) {
    this.canvas = canvas
    this.reset()
  }

  reset() {
    this.x = Math.random() * this.canvas.width
    this.y = Math.random() * this.canvas.height
    this.vx = (Math.random() - 0.5) * 0.5
    this.vy = (Math.random() - 0.5) * 0.5
    this.radius = Math.random() * 2
    this.alpha = Math.random() * 0.5 + 0.2
  }

  update() {
    this.x += this.vx
    this.y += this.vy

    if (this.x < 0 || this.x > this.canvas.width) this.vx = -this.vx
    if (this.y < 0 || this.y > this.canvas.height) this.vy = -this.vy
  }

  draw(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 255, 255, ' + this.alpha + ')'
    ctx.fill()
  }
}

const initParticles = (canvas) => {
  const particleCount = 100
  particles = []
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(canvas))
  }
}

const drawLines = (ctx, p1, p2) => {
  const dx = p1.x - p2.x
  const dy = p1.y - p2.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance < 100) {
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(255, 255, 255, ' + (0.2 * (1 - distance / 100)) + ')'
    ctx.lineWidth = 0.5
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()
  }
}

const animate = (canvas, ctx) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  particles.forEach(particle => {
    particle.update()
    particle.draw(ctx)
  })

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      drawLines(ctx, particles[i], particles[j])
    }
  }

  animationFrame = requestAnimationFrame(() => animate(canvas, ctx))
}

onMounted(() => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  
  particleContainer.value.appendChild(canvas)
  initParticles(canvas)
  animate(canvas, ctx)
})

onBeforeUnmount(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<style scoped>
.particle-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

canvas {
  display: block;
}
</style> 