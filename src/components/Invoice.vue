<template>

    <ion-item-sliding class="invoice" :class="{ 'fade-out': isDeleted }" >

      <ion-item-options side="start">
        <ion-item-option expandable @click="newPayment" color="success"><q-icon size="25px" name="payment"/>Pay</ion-item-option>
      </ion-item-options>

      <ion-item lines="none" :disabled="!Works" :button="true" @click="$router.push(`/Invoices/${invoice.invoiceId}`)" detail="false" class="sliding-item" >
        <div class="left flex q-pt-xs q-pb-xs ">
      <span class="tracking-number">#{{ invoice.invoiceId }}</span>

      <span>

        <q-avatar v-if="!isArabic(invoice.patientName)" class="q-mr-xs avatar-name" size="35px" font-size="16px" color="green-3" text-color="white"> {{getInitials( invoice.patientName) }} </q-avatar>
              <q-avatar v-if="isArabic(invoice.patientName)" class="q-mr-xs avatar-person" font-size="42px" size="35px" color="green-3" text-color="white" icon="person"/>
        <span class="text-bold" > {{ invoice.patientName }}</span></span>
      <span> <div class="column" v-if="Works" v-for="item in Works">  <q-badge :color="item.color" class="col q-mt-xs">{{ item.label}}

        <q-badge  v-if="item.teeth&&item.teeth.length" color="white" class="q-ml-xs text-black">      <!-- Render the first two items -->
      <span v-for="(tooth, index) in getDisplayedItems(item.teeth)" :key="index" >
        <!-- Render your content for the first two items -->
        {{'#'+ tooth }}
      </span>
       <span v-if="item.teeth.length>2">...</span>
    </q-badge>

      </q-badge ><q-badge v-if="item.doctor.name!==''" class="col q-mt-xs" color="grey-5" >{{' by Dr. '+item.doctor.name }}</q-badge></div>
        <div class="column" v-else>     <q-skeleton class="q-mt-xs"  :type="'QBadge'"  width="100%"/><q-skeleton class="q-mt-xs" :type="'QBadge'"  width="100%"/></div>
      </span>
     </div>
     <div class="right justify-end flex row">
      <span> <div v-if="invoice.workItemList" v-for="subtotal in Works.subTotals" class="price center column" >
      <div  class="col flex" :class="{
            'text-green-9': subtotal.subTotal.sign!=='-',
            'text-red': subtotal.subTotal.sign=='-',
          }"><span class="currency">{{(subtotal.totalAmount.sign+' ' +subtotal.totalAmount.currency)}} </span>{{formatMoney(subtotal.totalAmount.absoluteValue) }}</div>
     </div>
        <!-- <div class="center column price">
          <q-circular-progress

      show-value
      rounded
      font-size="12px"
      :value="value"
      size="50px"
      :thickness="0.30"
      color="teal"
      track-color="grey-3"
      >
      %{{ value }}
      </q-circular-progress>
        </div> -->
      </span>
  <span v-if="Works" class="flex">
    <v-progress-linear
      v-model="Works.overallPercentage"
      height="37"
      bg-opacity="0.8"
      rounded="10"
      class="progress-buttom"
      :class="{ paid: Works.overallPercentage==100, draft: invoice.invoiceDraft, pending: Works.overallPercentage==0,partiallyPaid: Works.overallPercentage<100&&Works.overallPercentage>0,overDue: Works.overDue&&Works.overallPercentage<100&&!invoice.invoiceDraft, }"
    >
      <template v-slot:default="{ value }">
        <span class="paid-text" v-if="Works.overallPercentage==100">Paid <q-icon name="done" size="15px" color="teal-4" > </q-icon></span>
        <span class="draft-text" v-if="invoice.invoiceDraft">Draft</span>

        <span class="pending-text" v-if="Works.overallPercentage==0&&!invoice.invoiceDraft&&!Works.overDue">Pending</span>
        <span class="partiallyPaid-text" v-if="Works.overallPercentage<100&&Works.overallPercentage>0&&!Works.overDue">Partly</span>
        <span class="overDue-text" v-if="Works.overallPercentage<100&&Works.overDue&&!invoice.invoiceDraft">Over Due</span>
      </template>
    </v-progress-linear>
  </span>
      <div v-else> <q-skeleton class="progress-buttom flex"/></div>
      <div class="icon">
        <img src="../assets/icon-arrow-right.svg" alt="" />
      </div>
    </div>
      </ion-item>

      <ion-item-options side="end">
        <ion-item-option  @click="handleClick()"><q-icon size="25px" name="edit"/> Edit</ion-item-option>
        <ion-item-option @click="isOpen=true" expandable color="danger"><q-icon size="25px" name="delete"/>Delete</ion-item-option>
      </ion-item-options>
    </ion-item-sliding>
    <ion-action-sheet   @didDismiss="isOpen=false" :is-open="isOpen"  header="Delete The Following Invoice?" :buttons="actionSheetButtons"/>
</template>

<script setup>
import { useStorePayments } from 'src/stores/storePayments'
import { useStoreWorks } from 'src/stores/storeWorks'
import { useStorePatients } from 'src/stores/storePatients'
import { useStoreInvoices } from 'src/stores/storeInvoices'
import { ref,watch,getCurrentInstance,toRefs,computed } from 'vue'
import { IonItem,IonActionSheet, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, modalController } from '@ionic/vue';
import MobileInvoiceModal from 'src/components/MobileInvoiceModal.vue'
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { actionSheetController } from '@ionic/vue';

const instance = getCurrentInstance()
const props = defineProps({
  invoice:{
    type : Object,
    required:true
  },
  mobile:{
    type : Boolean,
    required:true
  },
  pageRef:{
type: Object,
required: true
},
})
const { pageRef } = toRefs(props);
const isOpen=ref(false)
/*
 Stores
*/
  const storeWorks=useStoreWorks()
  const storePayments=useStorePayments()
  const storePatients=useStorePatients()
  const storeInvoices=useStoreInvoices()
const skill=ref(60)
   /*
    Styling
   */
   const isDeleted = ref(false)

watch(() => props.invoice.deleted, (newValue) => {
  if (newValue) {
    // Add a small delay before setting isDeleted to true to allow Vue to re-render the component
    setTimeout(() => {
      isDeleted.value = true
    }, 100)
  }
})
const Works = computed(() => {
  const invoice = props.invoice || {};
  const works = invoice.workItemList || [];
  const payments = storePayments.invoicePayments?.[invoice.invoiceId] || [];
  const currencies = [...new Set(works.map((item) => item.currency))];
  console.log(payments, 'payments');

  // Calculate subtotals for each currency
  const subTotals = currencies.map((currency) => {
    const paid = payments.reduce((accumulator, item) => {
      if (item.currency === currency && (item.type === 'payment' || item.type === 'expense')) {
        return accumulator + Number(item.paid || 0);
      }
      return accumulator;
    }, 0);

    const paymentDates = payments.map((payment) => Number(payment.dateUnix || 0));
    const highestPaymentDate = Math.max(...paymentDates, 0);

    const paymentDueDates = works.map((work) => Number(work.paymentDueDateUnix || 0));
    const highestPaymentDueDate = Math.max(...paymentDueDates, 0);

    const subTotal = works.reduce((accumulator, item) => {
      if (item.currency === currency) {
        const priceValue = Number(item.price.replace(/,/g, '') || 0);
        return accumulator + priceValue;
      }
      return accumulator;
    }, 0);

    const totalDiscount = works.reduce((accumulator, item) => {
      if (item.currency === currency) {
        const discountValue = Number(item.discount || 0);
        return accumulator + discountValue;
      }
      return accumulator;
    }, 0);

    const totalAmount = subTotal - totalDiscount;
    const dueAmount = totalAmount - paid;
    const paidPercentage = totalAmount !== 0 ? (paid / totalAmount) * 100 : 0;

    return {
      currency,
      subTotal: formatPrice(subTotal, currency),
      totalDiscount: formatPrice(totalDiscount, currency),
      tax: formatPrice(0, currency),
      totalAmount: formatPrice(totalAmount, currency),
      paid: formatPrice(paid, currency),
      dueAmount: formatPrice(dueAmount, currency),
      paidPercentage,
      highestPaymentDate,
      highestPaymentDueDate,
    };
  });

  // Calculate overall percentage and overdue status
  const overallPercentage = subTotals.length > 0
    ? (
        subTotals.reduce(
          (acc, subtotal) => acc + subtotal.paidPercentage,
          0
        ) / subTotals.length
      ).toFixed(1)
    : 0;

  const overDue = subTotals.some((subtotal) => {
    const currentDate = new Date().getTime();
    return subtotal.highestPaymentDueDate && currentDate > subtotal.highestPaymentDueDate;
  });

  // Add payment details to works
  const worksWithDetails = works.map((work) => {
    const allPaid = payments.reduce((accumulator, item) => {
      if (
        item.workId === work.workId &&
        (item.type === 'payment' || item.type === 'expense')
      ) {
        return accumulator + Number(item.paid || 0);
      }
      return accumulator;
    }, 0);

    const price = Number(work.price.replace(/,/g, '') || 0);
    const discount = payments.reduce((accumulator, item) => {
      if (item.workId === work.workId && item.category === 'Discount') {
        return accumulator + Number(item.paid || 0);
      }
      return accumulator;
    }, 0);

    work.discount = discount;
    const total = price - discount;
    // Calculate discount percentage
    const percent = price !== 0 ? (discount / price) * 100 : 0;
    return {
      ...work,
      allPaid,
      paidPercentage: total !== 0 ? ((allPaid / total) * 100).toFixed(2) : 0,
      formattedPrice: formatPrice(price, work.currency), // Add formatted price
      formattedTotal: formatPrice(total, work.currency), // Add formatted total
      percent: percent.toFixed(2), // Calculate and format percent
    };
  });

  // Function to handle doctor label modifications
  function manipulateRepeatedDoctorLabels(arr) {
    const copiedArray = JSON.parse(JSON.stringify(arr)); // Deep copy to avoid mutation
    const doctorLabels = {};

    copiedArray.forEach((obj, index) => {
      const doctorLabel = obj.doctor.name;
      if (!doctorLabels[doctorLabel]) {
        doctorLabels[doctorLabel] = index; // Store index of the last occurrence
      } else {
        doctorLabels[doctorLabel] = index; // Update index for repeated doctor.label
      }
    });

    copiedArray.forEach((obj, index) => {
      const doctorLabel = obj.doctor.name;
      if (index !== doctorLabels[doctorLabel]) {
        obj.doctor.name = ''; // Clear label for non-last occurrences
      }
    });

    return copiedArray;
  }

  const modifiedWorks = manipulateRepeatedDoctorLabels(worksWithDetails);

  // Add subtotals, overall percentage, and overdue status
  modifiedWorks.subTotals = subTotals;
  modifiedWorks.overallPercentage = overallPercentage;
  modifiedWorks.overDue = overDue;

  console.log("SubTotals:", subTotals);
  console.log("Updated works with overallPercentage and overDue:", modifiedWorks);

  return modifiedWorks;
});
/*
 Filters
*/
       function formatPrice(value, currency) {
        const absoluteValue = Number( Math.abs(value).toLocaleString().replace(/,/g, '') || 0); // Format the absolute value
        const sign = value < 0 ? '-' : ''; // Determine the sign
        return {sign,absoluteValue,currency}; // Format: [sign] [price] [currency]
       }
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
      const  getDisplayedItems=(teeth) => {
      const maxItemsToShow = 2; // Define the maximum number of items to display
      return teeth.slice(0, maxItemsToShow)
       }
   async function  newPayment() {
      await Haptics.impact({ style: ImpactStyle.Light });
        storePayments.patient=storePatients.patients.find(
        patient => patient.patientId === props.invoice.patientId)
        storeInvoices.SET_PATIENT_INVOICES(props.invoice.patientId,props.invoice.invoiceId)
        if(!props.mobile){storePayments.TOGGLE_PAYMENT()
          console.log('not mobile')}
        else {instance.emit('openPaymentModal')}
    }
    // async function deleteInvoice(docId) {
    //   storeInvoices.DELETE_INVOICE(docId)
    //   console.log('itemDeleted')
    // }

    const actionSheetButtons =ref([
        {
          text: 'Delete',
          role: 'destructive',
          data: {
            action: 'delete',
          },
          handler: async () => {
          const hasPaymentsToDelete=storePayments.invoicePayments[props.invoice.invoiceId] || []
          if (hasPaymentsToDelete.length) {
            const paymentsActionSheet = await actionSheetController.create({
              header: 'Delete associated payments as well?',
              buttons: [
                {
                  text: 'Delete Payments Too',
                  role: 'destructive',
                  handler: async () => {
                    hasPaymentsToDelete.forEach(async item=>{
                      item.invoiceId=props.invoice.invoiceId
                      await storePayments.deletePayment(item)}
                    )
                    isDeleted.value = true
                  setTimeout(async () => {
                    await  storeInvoices.DELETE_INVOICE(props.invoice.invoiceId)
                }, 280)
                const slidingItem = document.querySelector('.invoice')
                slidingItem.closeOpened()
                 },
                },
                {
                  text: 'No just Delete Invoice',
                  role: 'destructive',
                  handler: async () => {
                    isDeleted.value = true
             setTimeout(async () => {
              await  storeInvoices.DELETE_INVOICE(props.invoice.invoiceId)
                }, 280)
                const slidingItem = document.querySelector('.invoice')
                slidingItem.closeOpened()
                  },
                },
                {
                  text: 'Cancel',
                  role: 'cancel',
                  handler: () => {
                    const slidingItem = document.querySelector('.invoice')
                    slidingItem.closeOpened()
                  },
                },
              ],
              presentingElement: pageRef.value.$el,
            });
            await paymentsActionSheet.present();
          } else {
            isDeleted.value = true
             setTimeout(async () => {
              await  storeInvoices.DELETE_INVOICE(props.invoice.invoiceId)
          }, 280)
          const slidingItem = document.querySelector('.invoice')
          slidingItem.closeOpened()
          }
        }
        },
        {
          text: 'Cancel',
          role:'cancel',
          data: {
            action: 'cancel',
          },
          handler: () => {
          const slidingItem = document.querySelector('.invoice')
          slidingItem.closeOpened()
        }
        },
      ])

      async function handleDeleteItemsAndPayments (data,itemsToDelete) {
  console.log('deletePaymentsand invoices')
  storeInvoices.loading=true
  console.log(itemsToDelete)
  for (const item of itemsToDelete) {
    const payments = (storePayments.invoicePayments[item.invoiceId] || []).filter(
      (payment) => payment.workId === item.workId);

              payments.forEach(async payment=>{
                payment.invoiceId=item.invoiceId
                await storePayments.deletePayment(payment)
              })

              console.log(item,payments,'paymenttttt')
              await storeWorks.deleteWork(item.docId)
              console.log(`Deleted work item with docId: ${item.docId}`)
            }
            // Update the invoice in storeInvoices after deletion
          await  storeInvoices.updateInvoice(data);
          await data.workItemList.forEach(work=>{
              work.patientDetails=patient.value
              console.log(work,'wreee2')
              if(work.paymentItemList){
                  if(work.paymentItemList.paid!==0)
                  storePayments.addPayment(work)
                }
           })
          await consolidateDiscountPayments(data.workItemList);

            // Proceed with updating/adding works and payments
            // await handleWorkUpdates(data);
}

function handleClick () {
    if (!props.mobile) {
      // Actions for non-mobile devices
      storeInvoices.editInvoice = true;
      storeInvoices.TOGGLE_INVOICE(props.invoice.invoiceId);
    } else {
      // Actions for mobile devices
      storeInvoices.TOGGLE_INVOICE(props.invoice.invoiceId)
      openInvoiceModal()
      storeInvoices.editInvoice = true; // Example of different action
      // Add any other mobile-specific actions here
    }
  }
/*
  Modal
*/


const openInvoiceModal = async () => {
    const modal = await modalController.create({
      component: MobileInvoiceModal,
      presentingElement:pageRef.value.$el,

    });

    modal.present();
    const { data, role } = await modal.onWillDismiss();
    modal.onDidDismiss(storeInvoices.CLEAR_DATA())
    if (role === 'confirm') {
      console.log('data',data)
      // message.value = `Hello, ${data}!`;
    }

  };
</script>

<style lang="scss" scoped>
.invoice {
  max-width:850px;
  margin:auto;
  text-decoration: none;
  cursor: pointer;
  // gap: 16px;
  margin-bottom: 16px;
  color: #000000;
  border-radius: 20px;

  // min-height: 100px;
  background-color: #e2dfe6;
  align-items: center;
  ion-item {
    --background: #e1e6df;
    --padding-top:0px !important;
    --padding-bottom:0px !important;


  }


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
      max-width:65px;
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
      span {
        font-size: 10px;
      }
    }
    .status-button{
      flex-basis: 37% !important;
      max-width: 140px;
      min-width: 108px;
    }
  }
}
.progress-buttom{
    border-radius: 10px !important;
    flex-basis: 37% !important;
    width:100%;
      max-width: 140px;
      min-width: 108px;
}
/* Dark Mode Styles */
.ion-dark .invoice {
  background-color: #1e3639;
  color: #ffffff;
  ion-item {
    --background: #1e3539;
  }
}
</style>

<style lang="scss">
.v-progress-linear__background {
border-radius: 10px !important;
}
.v-progress-linear__determinate {
 position: initial !important;
}
.fade-out {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

</style>

