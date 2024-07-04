<template>
  <div v-if="!mobile" class="loading">
    <span></span>
  </div>
  <div v-else class="loading loading-mobile">
    <span></span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Platform } from 'quasar';

/*
 Mobile
*/
const   mobile=computed(()=>{
          if (Platform.is.desktop){
            return false
          }
          if (Platform.is.mobile){
        return true
          }
        })

</script>

<style lang="scss">
.loading {
  top: 0;
  left: 0;
  z-index: 101;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  position: absolute;
  display: flex;
  justify-content: center;
  padding-left:57px;
  align-items: center;
  @keyframes spin {
    to {
      transform: rotateZ(360deg);
    }
  }
  span {
    display: block;
    width: 60px;
    height: 60px;
    margin: 0 auto;
    border: 3px solid transparent;
    border-top-color: #fff;
    border-bottom-color: #fff;
    border-radius: 50%;
    animation: spin ease 1000ms infinite;
  }
}
.loading-mobile {
  padding-left:0px !important;
}
</style>
