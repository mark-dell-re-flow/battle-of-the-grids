<template>
  <div class="readme-wrapper">
    <div class="readme-content" v-html="html" />
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import readmeRaw from '../../README.md?raw'

const html = marked(readmeRaw)
</script>

<style scoped>
.readme-wrapper {
  max-width: 860px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
  overflow-y: auto;
  height: 100%;
  box-sizing: border-box;
}

.readme-content :deep(h1) { font-size: 1.8rem; margin-bottom: 0.5rem; }
.readme-content :deep(h2) { font-size: 1.3rem; margin: 2rem 0 0.6rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3rem; }
.readme-content :deep(h3) { font-size: 1.05rem; margin: 1.4rem 0 0.4rem; }
.readme-content :deep(p)  { line-height: 1.7; margin: 0.5rem 0; }
.readme-content :deep(a)  { color: #3b82f6; text-decoration: none; }
.readme-content :deep(a:hover) { text-decoration: underline; }

.readme-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
  font-size: 0.88rem;
}
.readme-content :deep(th),
.readme-content :deep(td) {
  border: 1px solid #d1d5db;
  padding: 0.45rem 0.75rem;
  text-align: left;
}
.readme-content :deep(th) { background: #f3f4f6; font-weight: 600; }
.readme-content :deep(tr:nth-child(even)) { background: #f9fafb; }

.readme-content :deep(code) {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 3px;
  padding: 0.1rem 0.35rem;
  font-size: 0.85em;
}
.readme-content :deep(pre) {
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 6px;
  padding: 1rem 1.2rem;
  overflow-x: auto;
  margin: 0.8rem 0;
}
.readme-content :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.85rem;
}
.readme-content :deep(ul),
.readme-content :deep(ol) { padding-left: 1.5rem; margin: 0.4rem 0; }
.readme-content :deep(li) { margin: 0.2rem 0; line-height: 1.6; }
.readme-content :deep(hr) { border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0; }
.readme-content :deep(strong) { font-weight: 600; }
.readme-content :deep(em) { font-style: italic; }
.readme-content :deep(blockquote) {
  border-left: 3px solid #3b82f6;
  margin: 0.8rem 0;
  padding: 0.4rem 1rem;
  color: #555;
  background: #f0f6ff;
}
</style>
