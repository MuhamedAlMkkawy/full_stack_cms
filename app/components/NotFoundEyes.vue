<template>
  <div class="eyes-container" ref="container">
    <div class="eye" ref="leftEye">
      <div class="pupil" :style="leftPupilStyle">
        <div class="light-reflection" :style="leftReflectionStyle"></div>
      </div>
    </div>
    <div class="eye" ref="rightEye">
      <div class="pupil" :style="rightPupilStyle">
        <div class="light-reflection" :style="rightReflectionStyle"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const container = ref(null)
const leftEye = ref(null)
const rightEye = ref(null)
const mousePosition = ref({ x: 0, y: 0 })

// Assume light comes from top-left (45 degree angle) 
const lightSource = { x: -0.707, y: -0.707 } // Normalized vector

const handleMouseMove = (e) => {
  if (!container.value) return
  
  const rect = container.value.getBoundingClientRect()
  mousePosition.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
}

const calculatePupilPosition = (eyeRef) => {
  if (!eyeRef.value || !mousePosition.value) return { x: 0, y: 0 }
  
  const eyeRect = eyeRef.value.getBoundingClientRect()
  const eyeCenter = {
    x: eyeRect.left - container.value.getBoundingClientRect().left + eyeRect.width / 2,
    y: eyeRect.top - container.value.getBoundingClientRect().top + eyeRect.height / 2
  }
  
  const dx = mousePosition.value.x - eyeCenter.x
  const dy = mousePosition.value.y - eyeCenter.y
  const angle = Math.atan2(dy, dx)
  
  // Limit pupil movement to stay within iris
  const maxDistance = eyeRect.width * 0.15
  const distance = Math.min(maxDistance, Math.sqrt(dx * dx + dy * dy) * 0.15)
  
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    angle: angle
  }
}

const leftPupilStyle = computed(() => {
  const pos = calculatePupilPosition(leftEye)
  return {
    transform: `translate(${pos.x}px, ${pos.y}px)`
  }
})

const rightPupilStyle = computed(() => {
  const pos = calculatePupilPosition(rightEye)
  return {
    transform: `translate(${pos.x}px, ${pos.y}px)`
  }
})

const leftReflectionStyle = computed(() => {
  const pos = calculatePupilPosition(leftEye)
  // Position reflection opposite to pupil movement (simulating light from top-left)
  return {
    transform: `translate(${-pos.x * 0.3}px, ${-pos.y * 0.3}px)`
  }
})

const rightReflectionStyle = computed(() => {
  const pos = calculatePupilPosition(rightEye)
  return {
    transform: `translate(${-pos.x * 0.3}px, ${-pos.y * 0.3}px)`
  }
})

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<style lang="scss" scoped>
.eyes-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  height: 100%;
  position: relative;
  
  .eye {
    width: 5rem;
    height: 7rem;
    background: #f0f0f0; // Off-white for more natural look
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 0.5px solid #5a5a5a6b; // Dark gray border for eyelid effect
    position: relative;
    overflow: hidden;
    box-shadow: inset 0.2rem 0.2rem 0.5rem rgba(0,0,0,0.2);
    
    // Iris gradient
    &::before {
      content: '';
      position: absolute;
      width: 120%;
      height: 120%;
      background: radial-gradient(
        circle at center,
        #fff 0%,
        color-mix(in srgb, #f0f0f0, white 15%) 70%,
        color-mix(in srgb, #f0f0f0, black 5%) 90%,
        #1a1a1a 100%
      );
      border-radius: 50%;
      z-index: 1;
    }
    
    .pupil {
      width: 2.5rem;
      height: 4rem;
      background: #1a1a1a;
      border-radius: 50%;
      position: absolute;
      transition: transform 0.15s ease-out;
      z-index: 2;
      
      .light-reflection {
        position: absolute;
        width: 0.8rem;
        height: 0.8rem;
        background: white;
        border-radius: 50%;
        top: 20%;
        left: 20%;
        filter: blur(0.1rem);
        z-index: 3;
      }
    }
  }

  @media (max-width: 560px) {
    gap: 1rem;
    
    .eye {
      width: 4rem;
      height: 4rem;
      border-width: 0.2rem;
      
      &::before {
        width: 110%;
        height: 110%;
      }
      
      .pupil {
        width: 1.5rem;
        height: 1.5rem;
        
        .light-reflection {
          width: 0.5rem;
          height: 0.5rem;
        }
      }
    }
  }
}
</style>