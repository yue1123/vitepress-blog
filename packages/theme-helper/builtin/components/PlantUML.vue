<script setup lang="ts">
	import { renderPlantUml } from '../modules/plantUml'
	import { ref, nextTick, watchEffect } from 'vue'
	import ShadowRoot from './ShadowRoot.vue'
	import Loading from './Loading.vue'
	import { useData } from 'vitepress'
	const { isDark } = useData()

	const props = defineProps<{
		code: string
		server: string
		scale?: number
	}>()
	const loading = ref<boolean>(true)
	const svg = ref<string>()
	const actualHeight = ref<number>()
	const actualWidth = ref<number>()
	const errorText = ref<string>()
	watchEffect(async () => {
		try {
			loading.value = true
			svg.value = await renderPlantUml(
				`${props.server}/${isDark.value ? 'd' : ''}svg/${props.code}`
			)
		} catch (error) {
			errorText.value = error.message
		} finally {
			nextTick(() => {
				loading.value = false
			})
		}
	})
	function handleUpdate($event: ShadowRoot) {
		nextTick(() => {
			const svgEl = $event?.children?.[0] as SVGElement | undefined
			if (svgEl) {
				svgEl.setAttribute('width', `100%`)
				svgEl.setAttribute('height', `100%`)
				svgEl.setAttribute('preserveAspectRatio', `xMinYMin`)
				svgEl.setAttribute('role', `img`)
				svgEl.removeAttribute('style')
				if (actualWidth.value == null && actualHeight.value == null) {
					const rect = svgEl.getBoundingClientRect()
					actualWidth.value = rect.width
					actualHeight.value = rect.height
				}
				if (
					props.scale != null &&
					actualHeight.value != null &&
					actualWidth.value != null
				) {
					svgEl.setAttribute('width', `${actualWidth.value * props.scale}`)
					svgEl.setAttribute('height', `${actualHeight.value * props.scale}`)
				}
			}
		})
	}
</script>

<template>
	<div class="plantUml-container">
		<Loading v-if="loading" />
		<ShadowRoot v-else-if="!errorText && svg" :inner-html="svg!" @shadow="handleUpdate" />
		<span>{{ errorText }}</span>
	</div>
</template>

<style scoped>
	.plantUml-container {
		background: var(--vp-c-mute);
		text-align: center;
		padding: 15px;
		border-radius: 6px;
		overflow-x: auto;
		position: relative;
		margin: 1rem 0;
		position: relative;
		min-height: 100px;
	}
</style>
