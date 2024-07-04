<template>
 <div class="home container">
    <!-- Header -->
    <v-infinite-scroll
    @load="load"
  >
    <div class="header flex">
      <div class="left flex flex-column">
        <div class="m1">Invoices</div>
        <span class="m2">There are {{ invoiceData.length }} total invoices</span>
      </div>
      <div class="right flex">
        <div  class="filter flex">
          <span
            >Filter by status <span v-if="filteredInvoice">: {{ filteredInvoice }}</span></span
          >
          <img src="../assets/icon-arrow-down.svg" alt="" >

         <q-menu :offset="[-10, 0]"   auto-close>
          <q-list class="filter-menu"  style="min-width: 100px">
            <q-item  @click="filteredInvoices" clickable>
              <q-item-section>Draft</q-item-section>
            </q-item>
            <q-item @click="filteredInvoices" clickable>
              <q-item-section >Pending</q-item-section>
            </q-item>
            <q-separator dark />
            <q-item @click="filteredInvoices" clickable>
              <q-item-section >Paid</q-item-section>
            </q-item>
            <q-item @click="filteredInvoices" clickable>
              <q-item-section >Partially Paid</q-item-section>
            </q-item>
            <q-item @click="filteredInvoices" clickable>
              <q-item-section >Over Due</q-item-section>
            </q-item>
            <q-item @click="filteredInvoices" clickable>
              <q-item-section >Clear Filter</q-item-section>
            </q-item>
          </q-list>
        </q-menu>

        </div>
        <div @click="newInvoice" class="button flex">
          <div class="inner-button flex">
            <img src="../assets/icon-plus.svg" alt="" />
          </div>
          <span v-if="$q.screen.gt.xs">New Invoice</span>
        </div>
      </div>
    </div>
    <!-- Invoices -->
    <div v-if="invoiceData.length > 0">
      <Invoice v-for="(invoice, index) in filteredData" :invoice="invoice" :key="index" />
    </div>
    <div v-else-if="storeInvoices.loading||storeInvoices.moreDataAvailable"><invoiceLoading v-for="index in 3" :key="index"/></div>
    <div v-else class="empty flex flex-column">
      <img src="../assets/illustration-empty.svg" alt="" />
      <h3>There is nothing here</h3>
      <p>Create a new invoice by clicking the New Invoice button and get started</p>
    </div>
    <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots v-if="storeInvoices.moreDataAvailable" color="primary" size="40px" />
          <!-- <div v-else-if="!storeInvoices.moreDataAvailable&&invoiceData.length > 0">No More Invoices</div> -->
        </div>
      </template>
      <template v-slot:error="{ props }">
      <v-alert type="error">
        <div class="d-flex justify-space-between align-center">
          Something went wrong...
          <v-btn
            color="white"
            variant="outlined"
            size="small"
            v-bind="props"
          >
            Retry
          </v-btn>
        </div>
      </v-alert>
    </template>
    <template v-slot:empty>
      <v-alert type="warning">No more items!</v-alert>
    </template>
  </v-infinite-scroll>
  </div>
</template>

<script setup>
import Invoice from "src/components/Invoice.vue"
import invoiceLoading from "src/components/InvoiceLoading.vue"
import { storeToRefs } from 'pinia'
import { useStoreInvoices } from 'src/stores/storeInvoices'
import {computed,ref} from 'vue'
import { useStoreWorks } from "src/stores/storeWorks"
import { useQuasar } from "quasar"

const $q=useQuasar()
/*
  Stores
*/
    const storeInvoices=useStoreInvoices()
    const storeWorks=useStoreWorks()
    const {  invoicesLoaded } = storeToRefs(storeInvoices)
/*
  InvoiceData
*/
    // storeInvoices.GET_INVOICES()
    const invoiceData=computed(()=>{ return storeInvoices.invoiceData})
/*
 FilterRef
*/
   const   filteredInvoice= ref(null)
   function  newInvoice() {
      storeInvoices.TOGGLE_INVOICE()
    }

   function filteredInvoices(e) {
      if (e.target.innerText === "Clear Filter") {
        filteredInvoice.value = null
        return
      }
      filteredInvoice.value = e.target.innerText
    }

   const filteredData = computed(() => {
      return invoiceData.value.filter((invoice) => {


        if (filteredInvoice.value === "Draft") {
          return invoice.invoiceDraft === true
        }
        if (filteredInvoice.value === "Pending") {
          return storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage==0&&!invoice.invoiceDraft
        }
        if (filteredInvoice.value === "Paid") {
          return storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage==100
        }
        if (filteredInvoice.value === "Partially Paid") {
          return storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage<100&&storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage>0
        }
        if (filteredInvoice.value === "Over Due") {
          return storeWorks.invoiceWorks[invoice.invoiceId].overallPercentage<100&&storeWorks.invoiceWorks[invoice.invoiceId].overDue&&!invoice.invoiceDraft
        }
        return invoice
      })
    })

   async function load ({ done }) {
        setTimeout(() => {
          storeInvoices.GET_INVOICES_NEXT()
          done('empty')
        }, 200)
      }

    // async function  onLoad (index, done) {
    //   setTimeout(() => {
    //     storeInvoices.GET_INVOICES_NEXT()
    //       done()
    //     }, 1000)

    //   }




</script>

<style lang="scss" scoped>
.home {
  color: #000000;

  .header {
    margin-bottom: 65px;

    .left,
    .right {
      flex: 1;
    }

    .right {
      justify-content: flex-end;
      align-items: center;

      .button,
      .filter {
        align-items: center;

        span {
          font-size: 12px;
        }
      }

      .filter {
        position: relative;
        margin-right: 40px;
        cursor: pointer;

        img {
          margin-left: 12px;
          width: 9px;
          height: 5px;
        }

        .filter-menu {
          width: 120px;
          position: absolute;
          top: 25px;
          list-style: none;
          background-color: #e1e6df;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

          li {
            cursor: pointer;
            font-size: 12px;
            padding: 10px 20px;

            &:hover {
              color: #1e2139;
              background-color: #fff;
            }
          }
        }
      }
    }
  }

  .empty {
    margin-top: 160px;
    align-items: center;

    img {
      width: 214px;
      height: 200px;
    }

    h3 {
      font-size: 20px;
      margin-top: 40px;
    }

    p {
      text-align: center;
      max-width: 224px;
      font-size: 12px;
      font-weight: 300;
      margin-top: 16px;
    }
  }
.flex {
    display: flex;
    flex-wrap:nowrap;
}
.m1 {
    font-size: 2.5em;
    font-weight:bold
      }

.m2 {
    font-size: 1.1em;
    font-weight: 500;
      }

}
.filter-menu {
   width: 120px;
   top: 25px;
   list-style: none;
   background-color: #e1e6df;
   box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
   border-radius: 0;
          }

</style>
