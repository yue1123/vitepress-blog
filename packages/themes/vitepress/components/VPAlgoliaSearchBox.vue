<script setup lang="ts">
import type { Theme } from '../theme'
import docsearch from '@docsearch/js'
import { onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'upress'
import { useData } from '../composables/data'

const props = defineProps<{
  algolia: Theme.AlgoliaSearchOptions
}>()

const router = useRouter()
const route = useRoute()
const { site, localeIndex, lang } = useData()
// @ts-ignore
const docsearch$ = docsearch.default ?? docsearch
// @ts-ignore
type DocSearchProps = Parameters<typeof docsearch$>[0]

onMounted(update)
watch(localeIndex, update)

function update() {
  const options = {
    ...props.algolia,
    ...props.algolia.locales?.[localeIndex.value]
  }
  const rawFacetFilters = options.searchParameters?.facetFilters ?? []
  const facetFilters = [
    ...(Array.isArray(rawFacetFilters)
      ? rawFacetFilters
      : [rawFacetFilters]
    ).filter((f) => !f.startsWith('lang:')),
    `lang:${lang.value}`
  ]
  initialize({
    ...options,
    searchParameters: {
      ...options.searchParameters,
      facetFilters
    }
  })
}

function initialize(userOptions: Theme.AlgoliaSearchOptions) {
  const options = Object.assign<{}, {}, DocSearchProps>({}, userOptions, {
    container: '#docsearch',

    navigator: {
      // @ts-ignore
      navigate({ itemUrl }) {
        const { pathname: hitPathname } = new URL(
          window.location.origin + itemUrl
        )

        // router doesn't handle same-page navigation so we use the native
        // browser location API for anchor navigation
        if (route.path === hitPathname) {
          window.location.assign(window.location.origin + itemUrl)
        } else {
          router.go(itemUrl)
        }
      }
    },
    // @ts-ignore
    transformItems(items) {
      // @ts-ignore
      return items.map((item) => {
        return Object.assign({}, item, {
          url: getRelativePath(item.url)
        })
      })
    },

    // @ts-expect-error vue-tsc thinks this should return Vue JSX but it returns the required React one
    hitComponent({ hit, children }) {
      return {
        __v: null,
        type: 'a',
        ref: undefined,
        constructor: undefined,
        key: undefined,
        props: { href: hit.url, children }
      }
    }
  })
  // @ts-ignore
  docsearch$(options)
}

function getRelativePath(absoluteUrl: string) {
  const { pathname, hash } = new URL(absoluteUrl)
  return (
    pathname.replace(
      /\.html$/,
      site.value.cleanUrls ? '' : '.html'
    ) + hash
  )
}
</script>

<template>
  <div id="docsearch" />
</template>
