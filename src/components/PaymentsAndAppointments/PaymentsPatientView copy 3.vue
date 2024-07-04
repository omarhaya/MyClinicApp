<template>

  <template   v-if="!storePayments.loadingPayments">
    <q-dialog   v-model="modals.deletePayment" >
     <ModalDeletePayment
     v-if="modals.deletePayment"
      v-model="modals.deletePayment"
     :paymentId="paymentId"
     /></q-dialog>
  <div  class="q-pb-md" >
    <q-list
        v-for="payment in storePayments.Mainpayments"
        :key="payment"
        class="list-border"

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
        expand-icon-class="hidden"
      >
      <template v-slot:header>
          <q-item-section avatar>
            <q-circular-progress
            show-value
            font-size="12px"
            :value="value(payment)"
            size="40px"
            :thickness="0.22"
            :color="progresColor(payment)"
            track-color="grey-3"
            class=" absolute"
          >
          </q-circular-progress>
          </q-item-section>
          <q-badge color="primary" v-if="payment.doctor!==''" class="absolute-top-right badge-doctor">{{DoctorFilter(payment.doctor)}}</q-badge>

          <q-item-section class="row">
                <div class=" text-weight-bold">{{payment.tooth}} : {{payment.details}}</div>
              <div class="row" v-if="$q.screen.gt.xs">
              <div class="text-caption text-grey ">{{(dateFormatted(payment.updated))}}</div>
            <div class="col row position-right"></div>
            <div class="row q-pl-xs">
            <q-badge color="teal"><div class="text-weight-bold">Money Paid</div>: {{formatPrice(payment.moneypaidTotal)}} {{payment.currencypaid}}</q-badge>
            <div class="q-pl-xs"></div>
            <q-badge class="col" color="orange"><div class="text-weight-bold">Total</div>: {{formatPrice(payment.moneyhavetopayTotal)}} {{payment.currencyhavetopay}}</q-badge>

            </div>
            </div>
            <div   v-else>
              <div class="text-caption text-grey">{{(dateFormatted(payment.updated))}}</div>
              <div class="absolute-bottom-right col q-mb-xs">

           <div> <q-badge class="row" color="orange"><div class="text-weight-bold">Total</div>: {{formatPrice(payment.moneyhavetopayTotal)}} {{payment.currencyhavetopay}}</q-badge></div>
            <div><q-badge class="row" color="teal"><div class="text-weight-bold">Paid</div>: {{formatPrice(payment.moneypaidTotal)}} {{payment.currencypaid}}</q-badge></div>


            </div></div></q-item-section>
            <q-item-section v-if="$q.screen.gt.xs"  side>  <q-btn v-on:click.stop :class="{'' :$q.screen.gt.xs , 'absolute' :!$q.screen.gt.xs}" size="12px" flat dense round icon="add" /></q-item-section>
            <q-item-section v-if="$q.screen.gt.xs" side>  <q-btn v-on:click.stop @click="modals.deletePayment=true;paymentId=payment.id2"  :class="{'' :$q.screen.gt.xs , 'absolute' :!$q.screen.gt.xs}" size="12px" flat dense round icon="delete" /></q-item-section>
        </template>



        <q-list
        v-for="payment,index in storePayments.getSubPaymentsMap(payment.id,payment.moneyhavetopay)"
        :key="payment"
        >
      <q-slide-item
        :left-color="leftColor"
        :right-color="rightColor"
        @left="onLeft(payment.id2)"
        @right="modals.deletePayment=true;paymentId=payment.id2"
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
              <q-item-section class="row">
                <div class=" text-weight-bold">{{payment.tooth}} : {{payment.details}}</div>
              <div class="row" v-if="$q.screen.gt.xs">
              <div class="text-caption text-grey ">{{(dateFormatted(payment.date))}}</div>
            <div class="col row position-right"></div>
            <div class="row q-pl-xs">
            <q-badge color="teal"><div class="text-weight-bold">Money Paid</div>: {{formatPrice(payment.moneypaid)}} {{payment.currencypaid}}</q-badge>
            <div class="q-pl-xs"></div>
            <q-badge class="col" color="orange"><div class="text-weight-bold">Total</div>: {{formatPrice(payment.moneyhavetopaytotal)}} {{payment.currencyhavetopay}}</q-badge>
            <q-badge class="col " floating v-if="payment.moneyhavetopayExtra!==null&&payment.moneyhavetopay>0" color="red">+{{formatPrice(payment.moneyhavetopayExtra)}} {{payment.currencyhavetopay}}</q-badge>
            </div>
            </div>
            <div   v-else>
              <div class="text-caption text-grey">{{(dateFormatted(payment.date))}}</div>
              <div class="absolute-bottom-right q-mb-xs col">

           <div> <q-badge class="row" v-if="payment.moneyhavetopayExtra!==null&&payment.moneyhavetopay>0" color="red"><div class="text-weight-bold">Extra+</div>: {{formatPrice(payment.moneyhavetopayExtra)}} {{payment.currencyhavetopay}}</q-badge></div>
           <div> <q-badge class="row"  v-if="!payment.moneyhavetopayExtra&&payment.moneyhavetopay>0"  color="orange"><div class="text-weight-bold">Total</div>: {{formatPrice(payment.moneyhavetopaytotal)}} {{payment.currencyhavetopay}}</q-badge></div>
            <div><q-badge class="row" color="teal"><div class="text-weight-bold">Paid</div>: {{formatPrice(payment.moneypaid)}} {{payment.currencypaid}}</q-badge></div>
            <!-- <q-badge class=" badge-moneyhavetopayextra" floating v-if="payment.moneyhavetopayExtra!==null&&payment.moneyhavetopay>0" color="red">+{{formatPrice(payment.moneyhavetopayExtra)}} {{payment.currencyhavetopay}}</q-badge> -->


            </div></div></q-item-section>
            <q-item-section v-if="$q.screen.gt.xs" side>  <q-btn @click="modals.deletePayment=true;paymentId=payment.id2"  :class="{'' :$q.screen.gt.xs , 'absolute' :!$q.screen.gt.xs}" size="12px" flat dense round icon="delete" /></q-item-section>
                  </q-item>
                  </q-slide-item>
        </q-list>

      </q-expansion-item>

    </q-slide-item>

    </q-list>

</div>
  </template>
</template>

<script setup>

 import {ref,reactive,onBeforeUnmount,onMounted,computed,watch} from 'vue'
 import { useQuasar } from 'quasar'
 import { useStorePayments } from 'src/stores/storePayments'
 import { useStoreAuth } from 'src/stores/storeAuth'
 import { date } from 'quasar'
 import { useRouter } from 'vue-router'
 import ModalDeletePayment from './ModalDeletePayment.vue'
 import {
  collection, onSnapshot,where,
  query,orderBy,addDoc,deleteDoc,doc,updateDoc
} from 'firebase/firestore'
import {db} from '/src/js/firebase'
import {useDynamicSort} from 'src/use/useDynamicSort'
import { filter } from 'compression'


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
  const storeAuth=useStoreAuth()

/*
 Router
*/
  const router=useRouter()

/*
  Payments details
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



/*
  Payments
*/
    storePayments.getPayments(props.patientId)
    const paymentsCollectionRef = collection(db, 'users',storeAuth.user.id,'payments')
    const paymentsCollectionQuery = query(paymentsCollectionRef, where("patientid", "==",props.patientId),orderBy("date","desc"))
    const getPayments=ref([])
    // const payments=ref([])
    const payments=computed(()=>{
      const payments2=[]
      const payments=[]
      const p = query(paymentsCollectionQuery)
          onSnapshot(p, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
          const payment={
                id2:doc.id,
                id:doc.data().id,
                details:doc.data().details,
                date:doc.data().date,
                currencyhavetopay:doc.data().currencyhavetopay,
                currencypaid:doc.data().currencypaid,
                moneyhavetopay:doc.data().moneyhavetopay,
                moneypaid:doc.data().moneypaid,
                tooth:doc.data().tooth,
                doctor:doc.data().doctor,
                patientid:doc.data().patientid,
            }
            payments.push(payment)

          })

         payments2.value=payments
              }

              )


              return payments
            }
            )
    // onMounted(()=>{
    //   const p = query(paymentsCollectionQuery)
    //       onSnapshot(p, (querySnapshot) => {
    //         payments.value=[]
    //       querySnapshot.forEach((doc) => {

    //       const payment={
    //             id2:doc.id,
    //             id:doc.data().id,
    //             details:doc.data().details,
    //             date:doc.data().date,
    //             currencyhavetopay:doc.data().currencyhavetopay,
    //             currencypaid:doc.data().currencypaid,
    //             moneyhavetopay:doc.data().moneyhavetopay,
    //             moneypaid:doc.data().moneypaid,
    //             tooth:doc.data().tooth,
    //             doctor:doc.data().doctor,
    //             patientid:doc.data().patientid,
    //         }
    //         getPayments.value.push(payment)

    //       })
    //           const ids = getPayments.value.map(o => o.id)
    //           const filtered = getPayments.value.filter(({id}, index) => !ids.includes(id, index + 1))
    //           const filtered1 = filtered.forEach((payment) => {
    //             const sum=[]
    //             const filter = getPayments.value.filter(({id}) => id.includes(payment.id))
    //             const filter1 = filter.forEach((payment) => {
    //               if(!payment.moneyhavetopay){payment.moneyhavetopay=0}
    //               sum.push(payment)
    //             })
    //             const sumMoneypaid = sum.reduce(
    //             (previousValue, currentValue) => previousValue + parseInt(currentValue.moneypaid),0
    //             )
    //             const sumMoneyhavetopay = sum.reduce(
    //             (previousValue, currentValue) => previousValue + parseInt(currentValue.moneyhavetopay),0
    //             )
    //             payment.moneypaidTotal=sumMoneypaid
    //             payment.moneyhavetopayTotal=sumMoneyhavetopay
    //             payment.updated=filter[0].date
    //             payments.value.push(payment)})
    //             payments.value.sort(useDynamicSort("updated")).reverse()


    //     })
    // })


    const getSubPaymentsMap=computed(()=>{
      return (paymentId,paymentMoneyhavetopay) =>{
        const map=[]
        const filtered = getPayments.value.filter(({id}) => paymentId.includes(id))
        if(filtered.length>1){
        const filtered1 = filtered.forEach((payment,index) => {
          console.log(payment)
          if (!payment.moneyhavetopay){payment.moneyhavetopay=0}
          const prevPayment=filtered[index+1]
          const thisPayment=filtered[index]
          if(prevPayment!==undefined){
           const newMoneyhavetopay=parseInt(prevPayment.moneyhavetopaytotal)+parseInt(thisPayment.moneyhavetopay)
           payment.moneyhavetopaytotal=newMoneyhavetopay
           payment.moneyhavetopayExtra=payment.moneyhavetopay
          }
          else{
          const newMoneyhavetopay=parseInt(paymentMoneyhavetopay)
          payment.moneyhavetopaytotal=newMoneyhavetopay
          payment.moneyhavetopayExtra=null
          }
          map.push(payment)
          console.log(map,'hoho')
        })
        return map
        }
        else return
      }
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


.payment-list
 .q-item
 border-style: solid
 border-width: 0px
 border-color: #d8dbdb
 padding: 8px -1px


.q-badge
  border-radius: 0px
.badge-doctor
 border-bottom-left-radius: 3px
.q-badge--floating
 top: 17px
 right: 61px
 cursor: inherit
 border-radius: 3px
.badge-moneyhavetopayextra
 margin-top: -28px
 margin-right: 19px
.inset-shadow
  box-shadow: 1px 10px 8px -12px rgb(0 0 0 / 70%) inset !important
.list-border
 border: 0.5px solid rgb(187 187 187 / 0%)
</style>
