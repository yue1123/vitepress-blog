export default {
  name: 'defaultBlogTheme',
  previewLink: '',
  description: '',
  pages: [
    { title: '首页', link: '/', name: 'index', componentName: 'PageIndex', aside: false },
    { title: '标签', link: '/tags', name: 'tags', componentName: 'TagsIndex', aside: false },
    { title: '归档', link: '/archives', name: 'archives', componentName: 'ArchiveIndex', aside: false }
  ]
}
