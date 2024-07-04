<template>
   <div v-if="!mobile">
  <div  v-if="$route.name === 'payments'"  class="loadingPayments-right">
    <span></span>
  </div>
  <div v-else class="loadingPayments-left">
    <span></span>
  </div>
</div>
  <div v-else="mobile" class="loadingPayments-right loadingPayments-mobile">
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
.loadingPayments-left {
  top: 0;
  left: none ;
  z-index: 101;
  height: 100%;
  width: 89.8%;
  background-color: rgba(0, 0, 0, 0.5);
  position: absolute;
  display: flex;
  justify-content: center;
  padding:57px ;
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
.loadingPayments-right {
  top: 0;
  left: 57px;
  z-index: 2;
  height: 100%;
  width: 90%;
  background-color: rgba(0, 0, 0, 0.5);
  position: absolute;
  display: flex;
  justify-content: center;
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
.loadingPayments-mobile {
  padding-left:0px !important ;
  border-radius: 15px 15px 0 0 !important;
}
</style>
