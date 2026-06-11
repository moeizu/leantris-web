<template>
  <div id="intro-region" v-if="visible">
    <div class="intro" :class="{ animatehide: hiding }">
      <div class="intro-media-region">
        <div class="mediawrap" :class="coverClass">
          <img
            class="intro-portrait-media media loaded"
            src="/wp-content/uploads/2021/04/LEA_Bildmarke_Screen.svg"
            alt=""
          >
          <img
            class="intro-landscape-media media loaded"
            src="/wp-content/uploads/2021/04/LEA_Bildmarke_Screen.svg"
            alt=""
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Werte aus dem Export (layData): intro_hide_after = 1000ms,
// intro_transition_duration = 400ms, Hide-Animation: opacity 0 + scale(1.5).
// Positionierung/Zentrierung übernimmt die Theme-CSS (.intro .media:
// fixed, 50%/50%, translate(-50%,-50%)); w100/h100 bildet das
// "object-fit: cover"-Verhalten des Originals nach (Bildseitenverhältnis 1.6).
const IMAGE_AR = 1680 / 1050

const emit = defineEmits(['done'])
const visible = ref(true)
const hiding = ref(false)
const coverClass = ref('w100')

function updateCover() {
  coverClass.value =
    window.innerWidth / window.innerHeight >= IMAGE_AR ? 'w100' : 'h100'
}

onMounted(() => {
  updateCover()
  window.addEventListener('resize', updateCover, { passive: true })
  document.body.classList.add('intro-loading')
  setTimeout(() => {
    hiding.value = true
    setTimeout(() => {
      visible.value = false
      document.body.classList.remove('intro-loading')
      emit('done')
    }, 400)
  }, 1000)
})

onBeforeUnmount(() => window.removeEventListener('resize', updateCover))
</script>
