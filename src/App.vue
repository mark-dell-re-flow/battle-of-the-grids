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
        >
          {{ tab.label }}
        </button>
      </nav>
    </header>

    <main class="tab-content">
      <Suspense>
        <AgGridDemo v-if="activeTab === 'ag'" :rowData="rowData" />
        <BryntumGridDemo v-else-if="activeTab === 'bryntum'" :rowData="rowData" />
      </Suspense>
    </main>
  </div>
</template>

<script setup>
import { ref, shallowRef } from 'vue'
import AgGridDemo from './components/AgGridDemo.vue'
import BryntumGridDemo from './components/BryntumGridDemo.vue'
import { generateEmployees } from './data/generateData.js'

const activeTab = ref('ag')

const tabs = [
  { id: 'ag',      label: 'AG Grid' },
  { id: 'bryntum', label: 'Bryntum Grid' },
]

// Generate once, share between both grids
const rowData = shallowRef(generateEmployees(100_000))
</script>
