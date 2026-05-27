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

      <div class="settings-bar" v-if="activeTab !== 'readme'">
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

        <div class="setting-group">
          <span class="setting-label">Selection</span>
          <button
            class="toggle-btn"
            :class="{ active: settings.selection }"
            @click="settings.selection = !settings.selection"
          >{{ settings.selection ? 'On' : 'Off' }}</button>
        </div>

        <div class="setting-group">
          <span class="setting-label">Expandable</span>
          <button
            class="toggle-btn"
            :class="{ active: settings.expandable }"
            @click="settings.expandable = !settings.expandable"
          >{{ settings.expandable ? 'On' : 'Off' }}</button>
        </div>

        <div class="setting-group">
          <span class="setting-label">Custom cells</span>
          <button
            class="toggle-btn"
            :class="{ active: settings.customCells }"
            @click="settings.customCells = !settings.customCells"
          >{{ settings.customCells ? 'On' : 'Off' }}</button>
        </div>
      </div>
    </header>

    <main class="tab-content">
      <AgGridDemo      v-if="activeTab === 'ag'"      :settings="settings" />
      <BryntumGridDemo v-else-if="activeTab === 'bryntum'" :settings="settings" />
      <ReadmeViewer    v-else-if="activeTab === 'readme'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import AgGridDemo from './components/AgGridDemo.vue'
import BryntumGridDemo from './components/BryntumGridDemo.vue'
import ReadmeViewer from './components/ReadmeViewer.vue'
import type { Settings } from './types'

const activeTab = ref('ag')
const tabs = [
  { id: 'ag',      label: 'AG Grid' },
  { id: 'bryntum', label: 'Bryntum Grid' },
  { id: 'readme',  label: '📖 README' },
]

const settings = reactive<Settings>({
  scrollMode:  'paginate',
  filters:     true,
  grouping:    false,
  striping:    true,
  selection:   false,
  expandable:  false,
  customCells: false,
})
</script>
