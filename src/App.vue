<template>
  <div id="app">
    <header class="app-header">
      <h1>⚔️ Battle of the Grids</h1>

      <nav class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >{{ tab.label }}</button>
      </nav>

      <div class="settings-bar">
        <div class="setting-group">
          <span class="setting-label">Scroll</span>
          <div class="btn-group">
            <button
              :class="{ active: settings.scrollMode === 'paginate' }"
              @click="settings.scrollMode = 'paginate'"
            >Paginate</button>
            <button
              :class="{ active: settings.scrollMode === 'virtual' }"
              @click="settings.scrollMode = 'virtual'"
            >Virtual</button>
          </div>
        </div>

        <div class="setting-group">
          <span class="setting-label">Filters</span>
          <button
            class="toggle-btn"
            :class="{ active: settings.filters }"
            @click="settings.filters = !settings.filters"
          >{{ settings.filters ? 'On' : 'Off' }}</button>
        </div>

        <div class="setting-group">
          <span class="setting-label">Grouping</span>
          <button
            class="toggle-btn"
            :class="{ active: settings.grouping }"
            @click="settings.grouping = !settings.grouping"
          >{{ settings.grouping ? 'On' : 'Off' }}</button>
        </div>

        <div class="setting-group">
          <span class="setting-label">Striping</span>
          <button
            class="toggle-btn"
            :class="{ active: settings.striping }"
            @click="settings.striping = !settings.striping"
          >{{ settings.striping ? 'On' : 'Off' }}</button>
        </div>
      </div>
    </header>

    <main class="tab-content">
      <AgGridDemo
        v-if="activeTab === 'ag'"
        :settings="settings"
      />
      <BryntumGridDemo
        v-else-if="activeTab === 'bryntum'"
        :settings="settings"
      />
    </main>

    <footer class="feature-footer">
      <template v-if="activeTab === 'ag'">
        <span class="feat feat-yes">✅ CSV export</span>
        <span class="feat feat-no">❌ Excel export <em>(Enterprise)</em></span>
        <span class="feat feat-no">❌ Row grouping <em>(Enterprise)</em></span>
        <span class="feat feat-no">❌ Tree data <em>(Enterprise)</em></span>
        <span class="feat feat-no">❌ Pivoting <em>(Enterprise)</em></span>
        <span class="feat feat-yes">✅ Open source (Community)</span>
        <span class="feat feat-yes">✅ Native Vue 3 reactivity</span>
        <span class="feat feat-yes">✅ Excellent TypeScript</span>
      </template>
      <template v-else>
        <span class="feat feat-yes">✅ CSV + Excel export</span>
        <span class="feat feat-yes">✅ Row grouping</span>
        <span class="feat feat-yes">✅ Tree data</span>
        <span class="feat feat-no">❌ Pivoting</span>
        <span class="feat feat-yes">✅ Rich column types</span>
        <span class="feat feat-yes">✅ Scheduler / Gantt / Calendar suite</span>
        <span class="feat feat-warn">⚠️ Imperative feature toggles</span>
        <span class="feat feat-warn">⚠️ Pagination needs AjaxStore</span>
      </template>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import AgGridDemo from './components/AgGridDemo.vue'
import BryntumGridDemo from './components/BryntumGridDemo.vue'
import type { Settings } from './types'

const activeTab = ref('ag')
const tabs = [
  { id: 'ag',      label: 'AG Grid' },
  { id: 'bryntum', label: 'Bryntum Grid' },
]

const settings = reactive<Settings>({
  scrollMode: 'paginate',
  filters:    true,
  grouping:   false,
  striping:   true,
})
</script>
