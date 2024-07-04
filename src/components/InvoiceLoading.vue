<template>
  <div class="invoice flex" >
    <div class="left flex">
      <span class="tracking-number">   <q-skeleton type="text" width="100%" class="text-subtitle1" /></span>

      <span class="person"><div class="col"><q-icon size="20px" name="person"></q-icon>  <q-skeleton type="text" width="100%" class="text-caption" /></div></span>
      <span>
        <div class="column">     <q-skeleton class="q-mt-xs"  :type="'QBadge'"  width="100%"/><q-skeleton class="q-mt-xs" :type="'QBadge'"  width="100%"/></div>
      </span>
     </div>
     <div class="right justify-end flex row">
      <span> <div  class="price center column">
        <q-skeleton type="text" width="100%" class="text-subtitle1 col flex" />
     </div>
      </span>

      <div> <q-skeleton class="status-button flex"/></div>
      <div class="icon">
        <img src="../assets/icon-arrow-right.svg" alt="" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStorePayments } from 'src/stores/storePayments'
import { useStoreWorks } from 'src/stores/storeWorks'
import { ref,computed } from 'vue'

/*
 Stores
*/
  const storeWorks=useStoreWorks()
  const storePayments=useStorePayments()

   /*
    Styling
   */

       const formatMoney = (value) => {
         const stringValue = value.toString()
         return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
       }
</script>

<style lang="scss" scoped>
.invoice {
  text-decoration: none;
  cursor: pointer;
  gap: 16px;
  margin-bottom: 16px;
  color: #000000;
  border-radius: 20px;
  padding: 10px 18px;
  min-height: 100px;
  background-color: #e1e6df;
  align-items: center;
  .person {
      align-items: center;

    }
  span {
    font-size: 13px;
  }

  .left {
    align-items: center;
    flex-basis: 60%;
    gap: 16px;

    span {
      flex: 1;
    }

    .tracking-number {
      text-transform: uppercase;
      max-width:60px;
    }
  }

  .right {
    gap: 16px;
    flex-basis: 40%;
    align-items: center;

    .price {
      flex: 1;
      flex-basis: 10% !important;
      font-size: 16px;
      font-weight: 600px;
      align-items: center;
      min-width: 130px;
    }
    .status-button{
      flex-basis: 10% !important;
      max-width: 140px;
      min-width: 107px;

    }
  }
}
</style>
