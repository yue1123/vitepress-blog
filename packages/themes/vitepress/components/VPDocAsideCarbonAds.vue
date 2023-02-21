<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import type { Theme } from '../theme'

defineProps<{
  carbonAds: Theme.CarbonAdsOptions
}>()

const VPCarbonAds = __CARBON__
  ? defineAsyncComponent(() => import('./VPCarbonAds.vue'))
  : () => null
</script>

<template>
  <div class="VPDocAsideCarbonAds">
    <VPCarbonAds :carbon-ads="carbonAds" />
  </div>
</template>
