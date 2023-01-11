<template></template>

<script setup lang="ts">
  import { watch } from 'vue'
  import { useData } from 'vitepress'
  import { getScriptAsync } from '@vitepress-blog/theme-helper'
  import { LIGHT_THEME_CONFIG, DARK_THEME_CONFIG } from './config'
  const { isDark } = useData()
  let canvasEl: HTMLCanvasElement | null = null
  const init = () => {
    if (window.particlesJS) {
      window.particlesJS(
        'particlesJS_container',
        document.querySelector('html.dark') ? DARK_THEME_CONFIG : LIGHT_THEME_CONFIG
      )
      canvasEl = document.getElementById('particlesJS_container')!.querySelector('canvas')
    }
  }
  watch(() => isDark.value, init)

  getScriptAsync({
    key: 'particlesJS',
    src: 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js'
  }).then(() => {
    const div = document.createElement('div')
    div.style.cssText = 'position: fixed; top:0; left:0; width: 100vw; height: 100vh; z-index: -1;'
    div.id = 'particlesJS_container'
    document.body.append(div)
    window.addEventListener('mousemove', (e) => {
      canvasEl?.dispatchEvent(
        new MouseEvent('mousemove', {
          clientY: e.clientY,
          clientX: e.clientX
        })
      )
    })
    window.addEventListener('click', () => canvasEl?.dispatchEvent(new MouseEvent('click')))
    window.addEventListener('mouseout', () => canvasEl?.dispatchEvent(new MouseEvent('mouseout')))
    init()
  })
</script>
