<template>

  <template   v-if="storePayments.payments.length &&!storePayments.loadingPayments">
    <q-dialog   v-model="modals.deletePayment" >
     <ModalDeletePayment
     v-if="modals.deletePayment"
      v-model="modals.deletePayment"
     :paymentId="paymentId"
     />

      </q-dialog>
  <!-- <q-card
        v-for="payment in storePayments.payments"
        :key="payment.id"
        class="card-payment q-mb-md"
        flat
        container
        bordered>
    <q-card-section>
        <div class="row">
        <div class="col "><div><div class="text-weight-bold">Tooth:</div> {{payment.tooth}} <q-badge color="primary" v-if="payment.doctor!==''" class="absolute-top-right badge-doctor">{{DoctorFilter(payment.doctor)}}</q-badge></div>
        <span v-if="$q.screen.gt.xs" style="width:470px; word-wrap:break-word; display:inline-block;"><div class="text-weight-bold">Work Done:</div> {{payment.details }}</span>
        <span v-else-if="$q.screen.gt.xs" style="width:500px; word-wrap:break-word; display:inline-block;"><div class="text-weight-bold">Work Done:</div> {{payment.details }}</span>
         <span v-else style="width:300px; word-wrap:break-word; display:inline-block;"><div class="text-weight-bold">Work Done:</div> {{payment.details }}</span>
        </div>

    </div>

==
        <div class="text-caption text-right text-grey">{{(dateFormatted(payment.date))}}</div>
          <div  v-if="$q.screen.gt.xs">

       <div><q-badge   color="green"  ><div class="text-weight-bold">Money Paid</div>: {{formatPrice(payment.moneypaid)}} {{payment.currencypaid}}</q-badge></div>
       <div><q-badge  color="orange"  ><div class="text-weight-bold">Total to Pay</div>: {{formatPrice(payment.moneyhavetopay)}} {{payment.currencyhavetopay}}</q-badge></div>
        </div>
         <div  v-else>
         <div><q-badge color="green"  ><div class="text-weight-bold">Paid</div>: {{formatPrice(payment.moneypaid)}} {{payment.currencypaid}}</q-badge></div>
       <div><q-badge  color="orange"   ><div class="text-weight-bold">Total</div>: {{formatPrice(payment.moneyhavetopay)}} {{payment.currencyhavetopay}}</q-badge></div>
      </div>
      </q-card-section>
    </q-card>
         </template>
          <template v-else-if="!storePayments.loadingPayments && storePayments.payments.length===0">
<h5 class="text-center text-grey">Patient Has No Recent </h5>
<h5 class="text-center text-grey"> Payments Yet. </h5>
         </template>
         <template v-else>
<q-card class="card-payment q-mb-md" flat bordered >
      <q-item>

        <q-item-section>
          <q-item-label>
            <q-skeleton width="10%"  type="text" class="text-subtitle2" animation="fade" />
          </q-item-label>
          <q-item-label caption>
            <q-skeleton width="50%" type="text" class="text-subtitle2" animation="fade" />
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-card-section>
        <q-skeleton type="text" width="25%" class="text-subtitle2" animation="fade" />
        <q-skeleton type="text" width="25%" class="text-subtitle2" animation="fade" />
      </q-card-section>
    </q-card>
  </template> -->
  <div  class="q-pb-md" >

    <q-list
        v-for="payment in storePayments.Mainpayments"
        :key="payment"

        >
        <q-slide-item
    :left-color="leftColor"
    :right-color="rightColor"
    @left="onLeft(payment.id2)"
    @right="paymentId=payment.id2"
    @slide="onSlide"
    @action="onAction"
  >

    <template v-if="!$q.screen.gt.xs" v-slot:left>
        Left
    </template>
    <template v-if="!$q.screen.gt.xs" v-slot:right>
      <div class="row items-center">
        Delete <q-icon right name="delete" />
      </div>
    </template>

      <q-expansion-item
        group="payments"
        header-class="text-primary"
      >
      <template v-slot:header>
          <q-item-section avatar>
            <q-avatar icon="bluetooth" color="primary" text-color="white" />
          </q-item-section>

          <q-item-section>
            Bluetooth technology
          </q-item-section>

          <q-item-section side>
            <div class="row items-center">
              <div class="row" v-if="$q.screen.gt.xs">


            <div class="row q-pl-xs">
            <q-badge color="teal"><div class="text-weight-bold">Money Paid</div>: {{formatPrice(payment.moneypaidTotal)}} {{payment.currencypaid}}</q-badge>
            <div class="q-pl-xs"></div>
            <q-badge class="col" color="orange"><div class="text-weight-bold">Total</div>: {{formatPrice(payment.moneyhavetopayTotal)}} {{payment.currencyhavetopay}}</q-badge>
            </div>
  </div>
  <div   v-else>


    <div class="row q-pl-xs">
            <q-badge color="teal"><div class="text-weight-bold">Paid</div>: {{formatPrice(payment.moneypaidTotal)}} {{payment.currencypaid}}</q-badge>

            <q-badge class="col" color="orange"><div class="text-weight-bold">Total</div>: {{formatPrice(payment.moneyhavetopayTotal)}} {{payment.currencyhavetopay}}</q-badge>
            </div>
             </div>
            </div>
          </q-item-section>
        </template>
            <TransitionGroup  name="slide-fade">
        <div >

        <q-list
        class="card-payment"
        v-for="payment,index in storePayments.getSubPaymentsMap(payment.id,payment.moneyhavetopay)"
        :key="payment.id"
        separator
        style="background:white"
        >
      <q-slide-item
        :left-color="leftColor"
        :right-color="rightColor"
        @left="onLeft(payment.id2)"
        @right="modals.deletePayment=true;paymentId=payment.id2"
        @slide="onSlide"
        @action="onAction"
      >
  <!-- <q-dialog v-if="modals.deletePayment" v-model="modals.deletePayment" >
<ModalDeletePayment
  v-if="modals.deletePayment"
  v-model="modals.deletePayment"
  :paymentId="payment.id2"
/>
</q-dialog> -->
    <template v-if="!$q.screen.gt.xs" v-slot:left>
      Left
    </template>
    <template v-if="!$q.screen.gt.xs" v-slot:right>

      <div class="row items-center">
        Delete <q-icon right name="delete" />
      </div>
    </template>


        <q-item :class="{'inset-shadow':index===0,'':index!==0}" :active="true">
        <q-badge color="primary" v-if="payment.doctor!==''" class="absolute-top-right badge-doctor">{{DoctorFilter(payment.doctor)}}</q-badge>
        <q-item-section avatar>
          <q-circular-progress
            show-value
            font-size="12px"
            :value="subValue(payment)"
            size="40px"
            :thickness="0.22"
            :color="subProgresColor(payment)"
            track-color="grey-3"
            class=" absolute"
           ></q-circular-progress>

              </q-item-section>
              <q-item-section>
                <div class="text-weight-bold">{{payment.tooth}} : {{payment.details}}</div>
              <div class="row" v-if="$q.screen.gt.xs">
              <div class="text-caption text-grey">{{(dateFormatted(payment.date))}}</div>
            <div class="col row position-right"></div>
            <div class="row q-pl-xs">
            <q-badge color="teal"><div class="text-weight-bold">Money Paid</div>: {{formatPrice(payment.moneypaid)}} {{payment.currencypaid}}</q-badge>
            <div class="q-pl-xs"></div>
            <q-badge class="col" color="orange"><div class="text-weight-bold">Total</div>: {{formatPrice(payment.moneyhavetopaytotal)}} {{payment.currencyhavetopay}}</q-badge>
            <q-badge class="col" floating v-if="payment.moneyhavetopayExtra!==null&&payment.moneyhavetopay>0" color="red">+{{formatPrice(payment.moneyhavetopayExtra)}} {{payment.currencyhavetopay}}</q-badge>
            </div>
            </div>
            <div   v-else>
              <div class="row" >
              <div class="text-caption text-grey">{{(dateFormatted(payment.date))}}</div>
              <div class="row q-pl-xs">
              <q-badge color="teal"><div class="text-weight-bold">Paid</div>: {{formatPrice(payment.moneypaid)}} {{payment.currencypaid}}</q-badge>
            <q-badge class="col" color="orange"><div class="text-weight-bold">Total</div>: {{formatPrice(payment.moneyhavetopaytotal)}} {{payment.currencyhavetopay}}</q-badge>
            <q-badge class="col" floating v-if="payment.moneyhavetopayExtra!==null&&payment.moneyhavetopay>0" color="red">+{{formatPrice(payment.moneyhavetopayExtra)}} {{payment.currencyhavetopay}}</q-badge>
              </div>
            </div></div></q-item-section>
            <q-item-section v-if="$q.screen.gt.xs" side>  <q-btn @click="modals.deletePayment=true;paymentId=payment.id2"  :class="{'' :$q.screen.gt.xs , 'absolute' :!$q.screen.gt.xs}" size="12px" flat dense round icon="delete" /></q-item-section>
                  </q-item>
                  </q-slide-item>
        </q-list>
        </div>
  </TransitionGroup>

      </q-expansion-item>

    </q-slide-item>

    </q-list>

</div>
  </template>
</template>

<script setup>

 import {ref,reactive,onBeforeUnmount,computed,watch} from 'vue'
 import { useQuasar } from 'quasar'
 import { useStorePayments } from 'src/stores/storePayments'
 import { date } from 'quasar'
 import { useRouter } from 'vue-router'
 import ModalDeletePayment from './ModalDeletePayment.vue'

/*
 props
*/
    const props = defineProps({

        patientId:{
          type: String,
          required:true
        }
    })

/*
store
*/
  const storePayments =useStorePayments()

/*
 Router
*/
  const router=useRouter()

/*
  Payments
*/
  const value=(Payment) => {
    if(Payment.moneyhavetopaytotal<1){return 100}
    else{
    const percent=(Payment.moneypaidTotal/Payment.moneyhavetopayTotal*100).toFixed(2)
      return   parseInt(percent)}
      }
  const progresColor=(Payment) => {
      const percent=(Payment.moneypaidTotal/Payment.moneyhavetopayTotal*100).toFixed(2)
      if(percent<=75 ){ if(percent<=25){return 'red'} else if(percent<=50){return'orange'} else{return 'yellow'}} else if(percent<100&&percent>75){return'light-green'}  else{ return'teal'}
      }
  const subValue=(Payment) => {
    const percent=(Payment.moneypaid/Payment.moneyhavetopaytotal*100).toFixed(2)
      return   parseInt(percent)
      }
  const subProgresColor=(Payment) => {
      const percent=(Payment.moneypaid/Payment.moneyhavetopaytotal*100).toFixed(2)
      if(percent<=75 ){ if(percent<=25){return 'red'} else if(percent<=50){return'orange'} else{return 'yellow'}} else if(percent<100&&percent>75){return'light-green'}  else{ return'teal'}
      }
  storePayments.getPayments(props.patientId)
  const payments=computed(()=>{
    return storePayments.getPaymentsMap()
  })


/*
 Modals
*/
    const modals = reactive({
      deletePayment:false
    })

 /*
filters
*/
  const dateFormatted = (paymentDate)=>{
       return date.formatDate(parseInt(paymentDate), 'Do MMM YYYY , hh:mm A')
      }
  const DoctorFilter = (value) => {
        return 'Dr.'+(value)
      }
  const currency = (value) => {
        return  ( value) +' ' +this.currencyval
      }
  const formatPrice = (value) => {
    if (value !==0 ||value !== '') {
       let val = (value/1).toFixed().replace(',', '.')
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
      }

/*
   SLIDE function
*/
const $q = useQuasar()
    let timer
    const slideRatio = ref({
      left: 0,
      right: 0
    })

    const leftColor = computed(() => (
      slideRatio.value.left >= 1
        ? 'green'
        : 'green-' + (3 + Math.round(Math.min(3, slideRatio.value.left * 3)))

    ))

    const rightColor = computed(() => (
      slideRatio.value.right >= 1
        ? 'red'
        : 'red-' + (3 + Math.round(Math.min(3, slideRatio.value.right * 3)))
    ))

    function finalize (reset) {
      timer = setTimeout(() => {
        reset()
      }, 1000)
    }

    onBeforeUnmount(() => {
      clearTimeout(timer)
    })

    const onLeft= (paymentId)=> {
        $q.notify(`Left action triggered. Resetting in 1 second.${{paymentId}}`)
     }

    const paymentId=ref()

    async function onAction({ reset,side }) {
        if(side!=='right'){finalize(reset)}
        if(side==='right'){modals.deletePayment=true}

        watch(() => modals.deletePayment,
          (newValue, oldValue) => {
           if (newValue===false&&storePayments.loadingPayments!==true){
            timer = setTimeout(() => {
        reset()
      }, 0)
           }

          })
      }
      const onSlide= ({ side, ratio, isReset })=> {
        // clearTimeout(timer)
        timer = setTimeout(() => {
          slideRatio.value[ side ] = ratio
        }, isReset === true ? 200 : void 0)
      }

</script>
<style lang="sass" scoped>
.q-expansion-item__toggle-icon
    font-size: 0px !important
.card-payment
 .badge-doctor
   border-top-right-radius: 0 !important
   border-bottom-right-radius: 0
   border-top-left-radius: 0
.payment-list
 .q-item
 border-style: solid
 border-width: 0px
 border-color: #d8dbdb
 padding: 8px -1px

.payment-list-main
 .q-item
 border-bottom-style: solid
 border-bottom-width: 1px
 border-bottom-color: #d8dbdb
 padding: 8px -1px
 border-right-style: solid
 border-right-color: #d8dbdb
 border-right-width:1px
 border-left-style: solid
 border-left-color: #d8dbdb
 border-left-width:1px
.payment-list-border
  border-top-color:#d8dbdb
  border-top-width: 1px
  border-top-style: solid
  max-height: 1px
  min-height: 0px
  padding: 0px
.q-badge
  border-radius: 0px

.q-badge--floating
 top: 17px
 right: 61px
 cursor: inherit
 border-radius: 0px
.slide-fade-move,
.slide-fade-enter-active,
.slide-fade-leave-active
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1)


.slide-fade-enter-from,
.slide-fade-leave-to
  transform: translateY(20px)
  opacity: 0
// .list-move, /* apply transition to moving elements */
// .list-enter-active,
// .list-leave-active {
//   transition: all 0.5s ease;
// }

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.slide-fade-leave-active
  position: absolute


.payment-expanded
  background: #00000021
.inset-shadow
  box-shadow: 1px 6px 7px -7px rgb(0 0 0 / 23%) inset !important


</style>
