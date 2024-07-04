<template>
  <div v-if="currentInvoice" class="invoice-view container">
    <router-link class="nav-link flex" :to="{ name: 'dashboard' }">
      <img src="../assets/icon-arrow-left.svg" alt="" /> Go Back
    </router-link>
    <!-- Header -->
    <div class="header flex">
      <div class="left flex">
        <span>Status</span>
        <div
          class="status-button flex"
          :class="{
            paid: currentInvoice.invoicePaid,
            draft: currentInvoice.invoiceDraft,
            pending: currentInvoice.invoicePending,
          }"
        >
          <span v-if="currentInvoice.invoicePaid">Paid</span>
          <span v-if="currentInvoice.invoiceDraft">Draft</span>
          <span v-if="currentInvoice.invoicePending">Pending</span>
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
      <div class="top flex">
        <div class="left flex flex-column">
          <p><span>#</span>{{ currentInvoice.invoiceId }}</p>
          <p>{{ currentInvoice.productDescription }}</p>
        </div>
        <div class="right flex flex-column">
          <p>{{ currentInvoice.typeOfWork }}</p>
          <p>{{ currentInvoice.billerCity }}</p>
          <p>{{ currentInvoice.billerZipCode }}</p>
          <p>{{ currentInvoice.billerCountry }}</p>
        </div>
      </div>
      <div class="middle flex">
        <div class="payment flex flex-column">
          <h4>Invoice Date</h4>
          <p>
            {{ currentInvoice.invoiceDate }}
          </p>
          <h4>Last Payment Date</h4>
          <p>
            {{ currentInvoice.paymentDueDate }}
          </p>
        </div>
        <div class="bill flex flex-column">
          <h4>Bill To</h4>
          <p>{{ currentInvoice.clientName }}</p>
          <p>{{ currentInvoice.clientStreetAddress }}</p>
        </div>
        <div class="send-to flex flex-column">
          <h4>Sent To</h4>
          <p v-for="doctor in doctorsWorked ">Dr. {{ doctor }}</p>
        </div>
      </div>
      <div  class="bottom flex flex-column">
        <div  class="bottom flex flex-column">
        <div class="billing-items ">
          <div class="heading flex">
            <p>Work Done</p>
            <p>Doctor</p>
            <p>Price</p>
            <p>Edit</p>
          </div>
          <div  v-if="!storeWorks.loading" v-for="work in storeWorks.invoiceWorks[currentInvoice.invoiceId]">
            <div class="item flex">
               <p>{{ work.label}}</p>
               <p>{{ work.doctor.label}}</p>
               <p>{{ work.price+' '+work.currency }}</p>
               <p>Edit</p>
           </div>
          <!-- <div  v-for="payment in storePayments.invoicePayments[currentInvoice.invoiceId]" >
            <div  v-if="payment.workId==work.workId" class="item flex">
               <p>{{ payment.paid}}</p>
               <p>{{ payment.date}}</p>
               <p>{{ payment.paid}}</p>
           </div>
          </div> -->
        </div>

      </div>
      <div class="total flex">
          <p>Amount Due</p>
          <p>333</p>
        </div>
      </div>
        <!-- <div :class="`billing-items bg-${work.color}-1`">
          <div class="heading flex">
            <p>Work Name</p>
            <p>QTY</p>
            <p>Price</p>
            <p>Total</p>
          </div>
          <div  v-for="payment in storePayments.invoicePayments[currentInvoice.invoiceId]"   class="item flex">
            <div  v-if="payment.workId==work.workId" class="item flex">
               <p>{{ payment.paid}}</p>
               <p>{{ payment.paid}}</p>
               <p>{{ payment.paid}}</p>
               <p>{{ payment.paid}}</p>

          </div>
            <p>{{ work}}</p>
          </div>
        </div>
        <div :class="`total bg-${work.color}-2 flex`">
          <p>Amount Due</p>
          <p>{{ currentInvoice.invoiceTotal }}</p>
        </div> -->
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
    getCurrentInvoice()
    function getCurrentInvoice() {
      storeInvoices.SET_CURRENT_INVOICE(route.params.invoiceId)
    }
    const currentInvoice=computed(()=>{
      return storeInvoices.GET_CURRENT_INVOICE(route.params.invoiceId)
    })
    function toggleEditInvoice() {
      getCurrentInvoice()
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

    const doctorsWorked=computed(()=>{
      const doctorsSet = new Set()
        currentInvoice.value.workItemList.forEach((work) => {
          const doctorName = work.doctor.label
          // Add the doctor name to the Set to ensure uniqueness
          doctorsSet.add(doctorName)
        })
        // Convert the Set to an array to remove duplicates
        const uniqueDoctorNames = Array.from(doctorsSet)
        return uniqueDoctorNames
    })

    storePayments.getPaymentsForInvoice(currentInvoice.value.invoiceId)
    storeWorks.getWorksForInvoice(currentInvoice.value.invoiceId)

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
    font-family: "Poppins", sans-serif;
}
    .top {
      div {
        color: #000000;
        flex: 1;
      }

      .left {
        font-size: 12px;
        p:first-child {
          font-size: 24px;
          text-transform: uppercase;
          color: #000000;
          margin-bottom: 8px;
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
        align-items: flex-end;
      }
    }

    .middle {
      padding-top: 50px;
      color: #000000;
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
        flex:none;
      }
    }

    .bottom {
      padding-top: 20px;


      .billing-items {
        padding: 20px 32px 32px 32px;
        border-radius: 20px 20px 0 0;
        background-color: #efefef;


        .heading {
          color: #000000;
          font-size: 12px;
          padding: 20px 0 10px 0;
          font-weight: 600;

          p:first-child {
            flex: 3;
            text-align: left;
          }

          p {
            flex: 1;
            text-align: right;
          }
        }

        .item {
          margin-bottom: 32px;
          font-size: 13px;
          color: #000000;

          &:last-child {
            margin-bottom: 0;
          }

          p:first-child {
            flex: 3;
            text-align: left;
          }

          p {
            flex: 1;
            text-align: right;
          }
        }
      }

      .total {
        color: #000000;
        padding: 32px;
        background-color: #b4c2af;
        align-items: center;
        border-radius: 0 0 20px 20px;

        p {
          flex: 1;
          font-size: 12px;
        }

        p:nth-child(2) {
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

</style>
