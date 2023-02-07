import { defineTheme } from '@penpress/theme-helper'
import PostItem from './components/PostItem.vue'
import PostBottom from './components/PostBottom.vue'
import PostHeader from './components/PostHeader.vue'
import Layout from './layout/index.vue'
import PageIndex from './pages/index.vue'
import TagsIndex from './pages/tags.vue'
import ArchiveIndex from './pages/archive.vue'
import './styles/index.css'

export default defineTheme({
  Layout,
  enhanceApp: (ctx) => {
    ctx.app.component('PostItem', PostItem)
    ctx.app.component('PostBottom', PostBottom)
    ctx.app.component('PostHeader', PostHeader)
    // page
    ctx.app.component('PageIndex', PageIndex)
    ctx.app.component('TagsIndex', TagsIndex)
    ctx.app.component('ArchiveIndex', ArchiveIndex)
  }
})
