<template>
  <div v-if="currentInvoice" class="invoice-view container">
    <router-link class="nav-link flex" :to="{ name: 'invoices' }">
      <img src="../assets/icon-arrow-left.svg" alt="" /> Go Back
    </router-link>
    <!-- Header -->
    <div class="header flex">
      <div class="left flex">
        <span>Status</span>
        <div v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId]"
          class="status-button flex"
          :class="{
            paid: storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage==100,
            draft: currentInvoice.invoiceDraft,
            pending: storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage==0&&!currentInvoice.invoiceDraft&&!storeWorks.invoiceWorks[currentInvoice.invoiceId].overDue,
            partiallyPaid: storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage<100&&storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage>0,
          }"
        >
          <span v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage==100">Paid</span>
          <span v-if="currentInvoice.invoiceDraft">Draft</span>
          <span v-if=" storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage==0&&!currentInvoice.invoiceDraft&&!storeWorks.invoiceWorks[currentInvoice.invoiceId].overDue">Pending</span>
          <span v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage<100&&storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage>0">Partially Paid<q-icon v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId].overDue" name="error_outline" class="q-ml-lg" color="red-5" size="18px"/></span>
        </div>
      </div>
      <div class="right flex">
        <button @click="toggleEditInvoice" class="grey">Edit</button>
        <button @click="deleteInvoice(currentInvoice.docId)" class="red">Delete</button>
        <button @click="updateStatusToPaid(currentInvoice.docId)" v-if="currentInvoice.invoicePending" class="green">
          Mark as Paid
        </button>
        <button
          v-if="currentInvoice.invoiceDraft || currentInvoice.invoicePaid"
          @click="updateStatusToPending(currentInvoice.docId)"
          class="orange"
        >
          Mark as Pending
        </button>
      </div>
    </div>

    <!-- Invoice Details -->
    <div class="invoice-details flex flex-column">
      <div  class="top row">
        <div class="left col">
          <p><span>#</span>{{ currentInvoice.invoiceId }}</p>

    <h4>Bill To</h4>
          <p> <q-avatar v-if="!isArabic(currentInvoice.clientName)" class="q-mr-xs avatar-name" size="35px" font-size="16px" color="green-3" text-color="white"> {{getInitials( currentInvoice.clientName) }} </q-avatar>
              <q-avatar v-if="isArabic(currentInvoice.clientName)" class="q-mr-xs avatar-person" font-size="42px" size="35px" color="green-3" text-color="white" icon="person"/> {{ currentInvoice.clientName }}</p>
          <p>{{ currentInvoice.billerCity }}</p>
          <p>{{ currentInvoice.billerZipCode }}</p>
          <p>{{ currentInvoice.billerCountry }}</p>

        </div>
        <div  v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId].subTotals[0]"  class="middle flex col">
        <div class="payment flex flex-column">
          <h4>Invoice Date</h4>
          <p>
            {{ currentInvoice.invoiceDate }}
          </p>
          <h4 v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId].subTotals[0].highestPaymentDueDate">Due Date</h4>
          <p :class="{
            'text-red': storeWorks.invoiceWorks[currentInvoice.invoiceId].overDue&&storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage<100&&!currentInvoice.invoiceDraft,
          }" v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId].subTotals[0].highestPaymentDueDate">
            <span class="q-mr-md">{{ formatDate(storeWorks.invoiceWorks[currentInvoice.invoiceId].subTotals[0].highestPaymentDueDate)}}</span><q-icon v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId].overDue&&storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage<100&&!currentInvoice.invoiceDraft" name="error_outline" class="q-ml-lg" color="red-5" size="16px"/>
          </p>
          <h4 v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId].subTotals[0].highestPaymentDate">Last Payment Date</h4>
          <p v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId].subTotals[0].highestPaymentDate">
            {{ formatDate(storeWorks.invoiceWorks[currentInvoice.invoiceId].subTotals[0].highestPaymentDate)}}
          </p>
        </div>
      </div>
        <div class="right col"  v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId]">
          <q-circular-progress
        class="q-ma-md"
      show-value
      font-size="15px"
      :value="storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage"
      :color="storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage==100?'teal-4':'orange'"
      track-color="grey-3"
      size="90px"
      :thickness="0.15"
      reverse
    >
    <span v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage<100">
     {{storeWorks.invoiceWorks[currentInvoice.invoiceId].overallPercentage+'%'}}</span>
     <q-icon v-else name="done" size="35px" color="teal-4"> </q-icon>
    </q-circular-progress>

        </div>
      </div>

      <div  class="bottom flex flex-column">
        <div  class="bottom flex flex-column">
        <div class="billing-items ">
          <div class="heading flex">
            <p>Work Done</p>

            <p>Price</p>
            <p>Discount</p>
            <p>Total</p>
          </div>
          <div  v-if="!storeWorks.loading" v-for="work in storeWorks.invoiceWorks[currentInvoice.invoiceId]">
            <div :class="`bg-${work.color}-1 item flex col`">
               <p >{{ work.label}}</p>

               <p><span class="currency">{{(work.currency)}} </span>{{formatMoney(work.price) }}</p>
               <p><span class="currency">{{(work.currency)}} </span>{{formatMoney(work.discount) }}</p>
               <p><span class="currency">{{(work.currency)}} </span>{{formatMoney(work.price-work.discount) }}</p>
           </div>

          <!-- <div  v-for="payment in storePayments.invoicePayments[currentInvoice.invoiceId]" >
            <div  v-if="payment.workId==work.workId" class="item flex">
               <p>{{ payment.paid}}</p>
               <p>{{ payment.date}}</p>
               <p>{{ payment.paid}}</p>
           </div>
          </div> -->
        </div>
         <div v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId]" v-for="subtotal in storeWorks.invoiceWorks[currentInvoice.invoiceId].subTotals">
          <div   class="total flex"  >
            <p >SUBTOTAL  <span v-if="subtotal.length>1">IN ({{ subtotal.currency }})</span></p>
            <p  >
               <span class="currency">{{(subtotal.currency)}} </span>{{formatMoney(subtotal.subTotal)}}
          </p>
        </div>
        <div v-if="subtotal.totalDiscount>0" class="total text-red flex"  >
            <p >DISCOUNT ({{(subtotal.totalDiscount/subtotal.subTotal)*100}}%)</p>
            <p >
               -<span class="currency">{{(subtotal.currency)}} </span>{{formatMoney(subtotal.totalDiscount)}}
          </p>
        </div>

        <div  class="total flex"  >
            <p >TAX ({{subtotal.tax}}%)</p>
            <p >
               +<span class="currency">{{(subtotal.currency)}} </span>{{formatMoney(((subtotal.subTotal-subtotal.totalDiscount)*subtotal.tax))}}
          </p>
        </div>
        <div  class="total flex"  >
            <p > TOTAL <span v-if="subtotal.length>1">IN ({{ subtotal.currency }})</span></p>
            <p >
               <span class="currency">{{(subtotal.currency)}} </span>{{formatMoney((subtotal.subTotal-subtotal.totalDiscount)+((subtotal.subTotal-subtotal.totalDiscount)*subtotal.tax))}}
          </p>
        </div>
        <div v-if="subtotal.paid"  class="total flex"  >
            <p class="text-teal-6"> Paid </p>
            <p class="text-teal-6" >
               -<span class="currency">{{(subtotal.currency)}} </span >{{formatMoney((subtotal.paid))}}
           </p>
          </div>
        </div>
       </div>
      </div>
      <div class="due row ">
          <p>Amount Due</p>
          <p :class="{
            'text-green-9': subtotal.dueAmount==0,
            // 'text-red': storeWorks.invoiceWorks[currentInvoice.invoiceId].overDue&&subtotal.dueAmount!==0&&!currentInvoice.invoiceDraft,
          }"
           class="text-right col" v-if="storeWorks.invoiceWorks[currentInvoice.invoiceId]" v-for="subtotal in storeWorks.invoiceWorks[currentInvoice.invoiceId].subTotals">
            <span class="currency">{{(subtotal.currency)}} </span>{{ formatMoney(subtotal.dueAmount) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useStoreInvoices } from 'src/stores/storeInvoices'
import { useStorePayments } from 'src/stores/storePayments'
import { useStoreWorks } from 'src/stores/storeWorks';
import {computed,ref,onMounted,watch} from 'vue'
import { useRoute,useRouter } from "vue-router";
/*
  Stores
*/
    const storeInvoices=useStoreInvoices()
    const storePayments=useStorePayments()
    const storeWorks=useStoreWorks()
    const {  invoicesLoaded,currentInvoiceArray } = storeToRefs(storeInvoices)
    /*
 Router
*/
    const route = useRoute()
    const router  = useRouter()
/*
  InvoiceData
*/
onMounted(() => {
      if(!storeInvoices.GET_CURRENT_INVOICE(route.params.invoiceId)){
        storeInvoices.SET_CURRENT_INVOICE(route.params.invoiceId)
      }
     })
    const currentInvoice=computed(()=>{
      if(!storeInvoices.GET_CURRENT_INVOICE(route.params.invoiceId)){
        return storeInvoices.invoiceData[route.params.invoiceId]
      }
      else{
      return storeInvoices.GET_CURRENT_INVOICE(route.params.invoiceId)
      }
    })
    function toggleEditInvoice() {
      storeInvoices.TOGGLE_EDIT_INVOICE()
      storeInvoices.TOGGLE_INVOICE()
    }
    async function deleteInvoice(docId) {
      storeInvoices.DELETE_INVOICE(docId)
      router.push({ name: "invoices" })
    }

    function updateStatusToPaid(docId) {
      storeInvoices.UPDATE_STATUS_TO_PAID(docId)
    }

    function updateStatusToPending(docId) {
      storeInvoices.UPDATE_STATUS_TO_PENDING(docId)
    }
/*
    Styling
*/
       const isArabic=(value) =>{
            return /[\u0600-\u06FF]/.test(value)
       }
       function getInitials(name) {
          const nameParts = name.split(' ');
          const firstName = nameParts[0].charAt(0).toUpperCase();
          const lastName = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
          return `${firstName}${lastName}`;
       }
       const formatMoney = (value) => {
         const stringValue = value.toString()
         return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
       }
       const formatDate=(value) => {
        if (value) {
          let     dateOptions= { year: "numeric", month: "short", day: "numeric" }
          return new Date( value).toLocaleDateString("en-us", dateOptions)
        }
       }


</script>

<style lang="scss" scoped>
.invoice-view {
  .nav-link {
    margin-bottom: 32px;
    align-items: center;
    color: #000000;
    font-size: 12px;
    img {
      margin-right: 16px;
      width: 7px;
      height: 10px;
    }
  }

  .header,
  .invoice-details {
    background-color: #e1e6df;
    border-radius: 20px;
  }

  .header {
    align-items: center;
    padding: 24px 32px;
    font-size: 12px;

    .left {
      align-items: center;

      span {
        color: #000000;
        margin-right: 16px;
      }
    }

    .right {
      flex: 1;
      justify-content: flex-end;

      button {
        cursor: pointer;
        padding: 16px 24px;
        border-radius: 30px;
        border: none;
        font-size: 12px;
        margin-right: 8px;
        color: #fff;
      }
    }
  }

  .invoice-details {
    padding: 48px;
    margin-top: 24px;
    * {
    margin: 0 !important;
    padding: 0;
    box-sizing: border-box;
}
    .top {
      div {
        color: #000000;
      }

      .left {
        font-size: 12px;
        p:first-child {
          font-size: 24px;
          text-transform: uppercase;
          color: #000000;
          margin-bottom: 8px;
        }
        h4 {
        font-size: 12px;
        font-weight: 400;
        margin-bottom: 12px;
      }
      p {
        font-size: 16px;
      }
        p:nth-child(2) {
          font-size: 16px;
        }

        span {
          color: #888eb0;
        }

      }

      .right {
        font-size: 12px;
        text-align: right;
      }
    }

    .middle {
      margin-top: 50px;
      color: #181818;
      gap: 16px;

      h4 {
        font-size: 12px;
        font-weight: 400;
        margin-bottom: 12px;
      }

      p {
        font-size: 16px;
      }

      .bill,
      .payment {
        flex: 1;
      }
      .q-icon {
        padding-left: 10px;
        bottom:1px;
      }
      .payment {
        h4:nth-child(3) {
          margin-top: 32px;
        }

        p {
          font-weight: 600;
        }
      }

      .bill {
        p:nth-child(2) {
          font-size: 16px;
        }
        p:nth-child(3) {
          margin-top: auto;
        }

        p {
          font-size: 12px;
        }
      }

      .send-to {
        flex: 2;
      }
    }

    .bottom {
      padding-top: 20px;


      .billing-items {
        // padding: 20px 22px 32px 22px;
        border-radius: 20px 20px 0 0;
        background-color: #efefef;


        .heading {
          color: #000000;
          font-size: 12px;
          padding: 17px;
          font-weight: 600;

          p:first-child {
            flex: 2;
            text-align: left;
          }
          p:first-child + p {
            flex: 1;
            text-align: center;
          }

          p {
            flex: 1;
            text-align: center;
          }
        }

        .item {
          padding: 10px;
          font-size: 13px;
          color: #000000;

          &:last-child {
            margin-bottom: 0;
          }

          p:first-child  {
            flex: 2;
            text-align: left;
            font-size: 13px;
          }
          p:first-child + p {
            flex: 1;
            text-align: center;
          }

          p {
            flex: 1;
            text-align: right;
          }
          span {
            font-size: 10px;
          }
        }
        .total {
          text-align: right;

          .total-heading {
            font-size:13px;
            font-weight: 500;
            text-align:left;
          }
        p {
          flex: 1;
          font-size:13px;
        }

        p:nth-child(1) {
          font-size: 13px;
          font-weight: 500;
          flex:4;
          padding: 10px;

        }
        p:nth-child(2) {
          background-color: #c2c2c24f;
          padding: 10px;
        }
        }
      }


      .due {
        color: #000000;
        padding: 20px 32px 20px 32px;
        background-color: #b4c2af;
        align-items: center;
        border-radius: 0 0 20px 20px;
        p {

          font-size: 12px;
        }
        span {
          font-size:16px;
        }

        p:nth-child(2), p:nth-child(3) {
          font-size: 28px;
          text-align: right;
        }
      }
    }
  }
.flex {
    flex-wrap: nowrap;
}
}
.currency{
  font-size: 10px;
  vertical-align: text-top !important;
  padding-right: 3px !important;
}

</style>
