<script setup lang="ts">
import ProfileForm from '../components/Settings/ProfileForm.vue'
import FormsLayout from '../layouts/FormsLayout.vue'
import {
  IonCard,
  IonCardContent,
  IonTitle,
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButton, IonItem, IonList, IonPopover
} from '@ionic/vue';
</script>

<template>
   <ion-page ref="page">
    <!-- <ion-header v-if="mobile" :translucent="true">
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header> -->
    <ion-content>
      <div class="settings-page">
  <FormsLayout>
    <ProfileForm />
  </FormsLayout>
  </div>
</ion-content>
</ion-page>
</template>

<style module>
/* Use CSS modules to avoid style conflicts */
.settings-page {
  /* Reset any inherited styles */
  all: initial;

  /* Add your base styles */
  font-family: system-ui, -apple-system, sans-serif;
  color: var(--foreground);
  background: var(--background);

  /* Container styles */
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.settings-main {
  flex: 1;
  min-height: calc(100vh - theme('spacing.16'));
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: var(--background);
  padding: 1rem;
}

@media (min-width: 768px) {
  .settings-main {
    gap: 2rem;
    padding: 2.5rem;
  }
}

/* Override any global styles that might affect our components */
:global(.settings-page) {
  /* Card styles */
  .card {
    background: var(--card-background);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    box-shadow: var(--card-shadow);
  }

  /* Button styles */
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    font-weight: 500;
    padding: 0.5rem 1rem;
    transition: all 0.2s;
  }

  /* Input styles */
  .input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--input-background);
  }

  /* Navigation styles */
  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    transition: all 0.2s;

    &:hover {
      background: var(--muted);
    }
  }
}

/* CSS Custom Properties for theming */
:root {
  --foreground: #000000;
  --background: #ffffff;
  --muted: #f4f4f5;
  --border: #e4e4e7;
  --card-background: #ffffff;
  --card-shadow: 0 1px 3px rgba(0,0,0,0.1);
  --input-background: #ffffff;
}

/* Dark mode variables */
:root[data-theme="dark"] {
  --foreground: #ffffff;
  --background: #09090b;
  --muted: #27272a;
  --border: #3f3f46;
  --card-background: #18181b;
  --card-shadow: 0 1px 3px rgba(0,0,0,0.3);
  --input-background: #27272a;
}
</style>

<style scoped>
/* Add any component-specific styles here */
:deep(.ion-page) {
  background: var(--background);
}

:deep(.ion-content) {
  --background: var(--background);
}

/* Ensure Ionic components don't override our styles */
:deep(.ion-page) {
  contain: none;
}

/* Override any unwanted inherited styles */
:deep(*) {
  font-family: inherit;
  box-sizing: border-box;
}


</style>
