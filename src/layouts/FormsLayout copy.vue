<script setup lang="ts">
import { Separator } from 'src/lib/registry/new-york/ui/separator'
import SidebarNav from 'src/components/Settings/SidebarNav.vue'
import { IonContent, IonPage, IonRouterOutlet } from '@ionic/vue';
</script>

<template>
  <ion-page ref="page">
    <ion-content class="main-content">
      <Separator class="my-6" />

      <!-- Layout with Sidebar and Router Outlet -->
      <div class="layout">
        <!-- Sidebar -->
        <aside class="sidebar">
          <SidebarNav />
        </aside>

        <!-- Router Outlet -->
        <div class="router-outlet">
          <IonRouterOutlet />
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
/* Main layout container */
.layout {
  display: flex; /* Create a horizontal flex container */
  gap: 1rem; /* Add space between sidebar and router outlet */
  height: 100%; /* Full height of the content */
}

/* Sidebar styles */
.sidebar {
  position: sticky;
  width: 300px; /* Fixed width for the sidebar */
  background-color: var(--background); /* Match theme */
  border-right: 1px solid var(--border); /* Optional: Add a border for separation */
  padding: 1rem; /* Add padding for content inside the sidebar */
  flex-shrink: 0; /* Prevent sidebar from shrinking */
  overflow-y: auto; /* Allow scrolling if content overflows */
  z-index: 1000000;
}

/* Router outlet container styles */
.router-outlet {
  flex: 1; /* Take up the remaining space */
  background-color: var(--background); /* Match theme */
  padding: 1rem; /* Add padding for content */
  overflow-y: auto; /* Allow scrolling for the main content */
  position: relative;

}
</style>
