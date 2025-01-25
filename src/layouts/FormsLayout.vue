<script setup lang="ts">
import {onMounted} from 'vue'
import { Separator } from 'src/lib/registry/new-york/ui/separator'
import SidebarNav from 'src/components/Settings/SidebarNav.vue'
import { IonContent, IonPage, IonRouterOutlet } from '@ionic/vue';
import {useRouter} from 'vue-router'
const router=useRouter()
onMounted (()=>{
router.push('/settings/profile')
})
</script>

<template>
  <ion-page ref="page">
        <ion-content>
      <!-- Layout with Sidebar and Router Outlet -->
      <div class="layout h-full flex flex-col space-y-8 lg:flex-row lg:space-x-2 lg:space-y-0">
        <!-- Sidebar -->
        <aside class="sidebar ml-2 mt-4 ">
          <SidebarNav />
        </aside>

        <!-- Router Outlet -->
        <div class="router-outlet h-full">
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

}

/* Sidebar styles */
.sidebar {
  position: sticky;
  width: 200px; /* Fixed width for the sidebar */
  background-color: var(--background); /* Match theme */

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
