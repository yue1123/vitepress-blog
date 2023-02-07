<script setup lang="ts">
	import { computed, getCurrentInstance, ref, watch, nextTick } from 'vue'
	import { useData } from 'penpress'
	import { renderMermaid } from '../modules/mermaid'
	import ShadowRoot from './ShadowRoot.vue'
	import Loading from './Loading.vue'

	const props = defineProps<{
		code: string
		scale?: number
		theme?: string
	}>()

	const vm = getCurrentInstance()
	const { isDark } = useData()
	const loading = ref<boolean>(true)
	const error = ref<string>()
	const svgObj = computed(() => {
		loading.value = true
		try {
			return renderMermaid(props.code || '', {
				theme: props.theme || (isDark.value ? 'dark' : undefined),
				...vm!.attrs
			})
		} catch (e) {
			error.value = e.message
		} finally {
			nextTick(() => {
				loading.value = false
			})
		}
	})
	const html = computed(() => svgObj.value)
	const actualHeight = ref<number>()
	const actualWidth = ref<number>()

	watch(html, () => {
		actualWidth.value = undefined
		actualHeight.value = undefined
	})
	// FIXME: resize 重新计算 scale
	function handleUpdate($event: ShadowRoot) {
		nextTick(() => {
			const svgEl = $event?.children?.[0] as SVGElement | undefined
			if (svgEl) {
				svgEl.setAttribute('width', `100%`)
				svgEl.setAttribute('height', `100%`)
				svgEl.setAttribute('preserveAspectRatio', `xMinYMin`)
				svgEl.setAttribute('role', `img`)
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
	<Loading v-if="loading" />
	<div class="mermaid" v-else-if="error">
		{{ error }}
	</div>
	<ShadowRoot v-else-if="html" class="mermaid" :inner-html="html" @shadow="handleUpdate" />
</template>

<style scoped>
	.mermaid {
		background: var(--vp-c-mute);
		padding: 15px;
		border-radius: 6px;
		overflow-x: auto;
		position: relative;
		margin: 1rem 0;
	}
</style>
