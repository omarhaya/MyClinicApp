<template>
    <ion-app>
      <ion-router-outlet v-if="!storeAuth.loadingApp"/>
      <q-layout v-else>
      <q-page-container class="center">
        <div class="spinner-container ">
          <q-spinner color="secondary"class="loading-spinner" />
          <p class="loading-text text-secondary">Loading...</p>
        </div>
      </q-page-container>
    </q-layout>
  </ion-app>
</template>

<script setup>
import { onMounted } from 'vue'
import { useStoreAppointments } from './stores/storeAppointments';
import { useStoreAuth } from './stores/storeAuth'
import { useStoreInvoices } from './stores/storeInvoices'
import { IonApp, IonRouterOutlet } from '@ionic/vue';
  import { defineComponent } from 'vue';

/*
    store
*/
  const storeAuth=useStoreAuth()

/*
  mounted
*/

onMounted(async () => {
  try {
    console.log("Initializing...");
    await storeAuth.init();
    console.log("Initialization complete");
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});
</script>

<style lang="scss">

ion-content {
  --offset-bottom: 0px !important;
}

@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap");

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Poppins", sans-serif;
}

.app {
  background-color: #142225;
  min-height: 100vh;
  box-sizing: border-box;

  @media (min-width: 900px) {
    flex-direction: row !important;
  }

  .app-content {
    padding: 0 20px;
    flex: 1;
    position: relative;
  }
}

.mobile-message {
  text-align: center;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #142325;
  color: #fff;

  p {
    margin-top: 16px;
  }
}

// animated invoice

.invoice-enter-active,
.invoice-leave-active {
  transition: 0.8s ease all;
}

.invoice-enter-from,
.invoice-leave-to {
  transform: translateX(-700px);
}


.dark-purple {
  background-color: #252945;
}

.red {
  background-color: #b70000;
}

.purple {
  background-color: #7c5dfa;
}

.green {
  background-color: #096616;
}
.dark-green {
  background-color: #33d69f;
}

.orange {
  background-color: #ff8f00;
}

.grey{
  background-color: #535353;
}
// utility classes

.flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.container {
  width: 95%;
  padding-right:10px !important;
  padding-left:10px !important;
  max-width: 850px;
  margin:auto;

  padding-bottom:30px;
  @media (min-width: 900px) {
    padding-top: 20px;
    .button {

        background-color:#09665e;
        border-radius: 40px;
        color:#fff !important;
        cursor: pointer;
        .inner-text{
        padding-top: 3px;
        }

        .inner-button {
          margin-right: 8px;
          border-radius: 50%;
          padding: 8px;
          align-items: center;
          justify-content: center;
          background-color: #fff;
          img {
            width: 10px;
            height: 10px;
            margin-left: 1px;
            margin-top: 1px;
          }
        }
      }
  }
  @media (max-width: 900px) {

    .button {
        padding: 8px 10px;
        background-color:#09665e;
        border-radius: 40px;
        color:#fff !important;
        cursor: pointer;
        .inner-text{
        padding-top: 3px;
        }

        .inner-button {
          border-radius: 50%;
          padding: 8px;
          align-items: center;
          justify-content: center;
          background-color: #fff;
          img {
            width: 10px;
            height: 10px;
            margin-left: 1px;
            margin-top: 1px;
          }
        }
      }
  }
}


.nav-link {
  text-decoration: none;
  color: initial;
}

// Status Button Styling

.status-button {
  &::before {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 4px;
  }
  font-size: 12px;
  align-items: center;
  // padding: 8px 20px 10px 14px;
  border-radius: 10px;
}
.button-custom {
  &:hover {
    background-color: #f4f4f5 !important;
  }
}
.dark .button-custom {
  &:hover {
    background-color: #27272a !important;
  }
}
.paid-text {
  color: #078359;
}
.paid {
  &::before {
    background-color: #33d69f;
  }
  color: rgba(51, 214, 160, 0.3);
  background-color: rgba(51, 214, 160, 0.3);
}
.pending {
  &::before {
    background-color: #ff00d9;
  }
  color: rgba(255, 0, 208, 0.3);
  background-color: rgba(255, 0, 208, 0.3);
}
.pending-text {
  color: #d500dc;
}
.partiallyPaid {
  &::before {
    background-color: #ff8f00;
  }
  color: rgba(255, 145, 0, 0.3);
  background-color: rgba(255, 145, 0, 0.3);
}
.partiallyPaid-text {
  color: #dc7b00;
}
.overDue {
  &::before {
    background-color: #ff0000;
  }
  color: rgba(255, 0, 0, 0.3);
  background-color: rgba(255, 0, 0, 0.3);
}
.overDue-text {
  color: #dc0000;
}
.draft {
  &::before {
    background-color: #dfe3fa;
  }
  color: rgb(126 127 133 / 35%);
  background-color: rgb(126 127 133 / 35%);
}
.draft-text {
  color: #00000063;
}
.currency{
  font-size: 10px;
  vertical-align: text-top;
  padding-right: 3px ;
}
.menu-style{
  max-height: 300px !important;
}
.avatar-person{
  position: relative; /* Set the avatar position to relative */
  overflow: hidden; /* Hide any content that extends beyond the border */
  border: 2px solid #a5d6a7; /* Change #000 to the desired color */
  border-radius: 50%; /* This will make the border around the avatar circular */
  // display: inline-block; /* Ensures the avatar remains inline */
  box-sizing: border-box;
 .q-icon {
    border-radius: inherit;
    height: inherit;
    width: inherit;
    padding-right:4px;
}
}
.avatar-name{
  font-weight: 600;
  .text-white{
    font-size: 11px !important;
  }
}
.spinner-container {
  display: flex;
  flex-direction: column; /* Ensures vertical stacking */
  justify-content: center;
  align-items: center;
  height: 100vh; /* Center vertically */
}

.loading-spinner {
  width: 15%;
  height: 15%;
  margin-bottom: 10px; /* Space between spinner and text */
}

.loading-text {
  font-size: 18px;
  color: #000;
}
</style>


