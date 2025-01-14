<template>
<ion-page ref="page">
    <ion-header v-if="mobile" :translucent="true">
    <ion-toolbar>
      <ion-title>Invoices</ion-title>
      <ion-buttons :collapse="true" slot="end">

    <ion-fab-button  @click="openInvoiceModal" size="small">
      <ion-icon :icon="add"></ion-icon>
    </ion-fab-button>

        <!-- <q-btn round color="secondary" @click="openInvoiceModal" size="10px" icon="add"/> -->
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
 <ion-content ref="ionContent1" :fullscreen="true" :scroll-y="false" >

      <!-- Ensure scroller class properly styled -->
      <RecycleScroller
        class="ion-content-scroll-host scroller"
        :items="sortedAndFilteredData"
        :min-item-size="70"
        :items-limit="sortedAndFilteredData.length + 1000"
        :key-field="'invoiceId'"
        sizeField="size"
      >
      <template #before>
        <ion-header collapse="condense">
      <ion-toolbar class="home container">
        <ion-title size="large">Invoices</ion-title>
            <!-- Header -->
            <q-btn slot="end"  round flat color="secondary" icon="filter_alt">

  </q-btn>
        <ion-buttons :collapse="true" slot="end">
          <ion-fab-button  @click="openInvoiceModal" size="small">
      <ion-icon :icon="add"></ion-icon>
    </ion-fab-button>
        </ion-buttons>

        <span class=" header m2">There are {{ invoiceData.length }} total invoices</span>
      </ion-toolbar>
      <ion-toolbar>

    </ion-toolbar>
    </ion-header>

    <div class="home container">
     <!-- Header -->

     <div v-if="!mobile" class="header flex">
       <div class="left flex flex-column">
         <div class="m1">Invoices</div>
         <span class="m2">There are {{ invoiceData.length }} total invoices</span>

       </div>
       <div class="right flex">
        <Button @click="newInvoice" class="button" >
          <div class="inner-button ">
             <img src="../assets/icon-plus.svg" alt="" />
           </div>
           <span v-if="$q.screen.gt.xs">New Invoice</span>
      </Button>
       </div>
 </div>
   <div  class="filter flex">
          <DataTableFacetedFilter
        title="Status"
        :options="[
          { label: 'Draft', value: 'Draft' },
          { label: 'Pending', value: 'Pending' },
          { label: 'Paid', value: 'Paid' },
          { label: 'Partially Paid', value: 'Partially Paid' },
          { label: 'Over Due', value: 'Over Due' }
        ]"
        :column="table.getColumn('status')"
      />

         </div>
 </div>
  </template>
        <template #default="{ item,index ,active}">
       <Invoice
      :active="active"
      @openPaymentModal="openPaymentModal"
      :invoice="item"
      :mobile="mobile"
      :key="item.invoiceId"
      :pageRef="page"
        />
        </template>
    <template #after>
      <ion-infinite-scroll threshold="0" @ionInfinite="load">
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </template>

      </RecycleScroller>

    </ion-content>

  </ion-page>
</template>
<script setup>
import Invoice from "src/components/Invoice.vue"
import invoiceLoading from "src/components/InvoiceLoading.vue"
import { storeToRefs } from 'pinia'
import { useStoreInvoices } from 'src/stores/storeInvoices'
import {computed,ref,h,watch} from 'vue'
import {IonList,
   IonInfiniteScroll,
   IonInfiniteScrollContent,IonPage,  IonFab,
   IonFabButton,IonContent, IonHeader, IonToolbar, IonTitle ,IonButtons, IonButton,modalController} from '@ionic/vue';
import { useStoreWorks } from "src/stores/storeWorks"
import { useQuasar } from "quasar"
import { Platform } from 'quasar'
import MobileInvoiceModal from 'src/components/MobileInvoiceModal.vue'
import MobilePaymentModal from 'src/components/MobilePaymentModal.vue'
import { useStorePayments } from "src/stores/storePayments"
import { RecycleScroller,DynamicScrollerItem } from "vue-virtual-scroller";
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import {add} from "ionicons/icons";
import { useStorePatients } from "src/stores/storePatients"
import DataTableFacetedFilter from 'src/components/InvoicesTable/DataTableFacetedFilter.vue'
import {
  useVueTable,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
} from '@tanstack/vue-table'
import Button from "src/components/ui/button/Button.vue"

const $q=useQuasar()
/*
  Stores
// */

    const storeInvoices=useStoreInvoices()
    const storePayments=useStorePayments()
    const storePatients=useStorePatients()
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

   function  newInvoice() {
      storeInvoices.TOGGLE_INVOICE()
    }


   const $=useQuasar()


// function getStatus(invoice) {
//   if (invoice.invoiceDraft) return 'Draft';
//   const percentage = invoice.works?.overallPercentage;
//   console.log('percentage',percentage)
//   if (percentage == 100&& !invoice.invoiceDraft) return 'Paid';
//   if (percentage == 0 && !invoice.invoiceDraft) return 'Pending';
//   if (percentage < 100) return invoice.works?.overDue ? 'Over Due' : 'Partially-Paid';
//   return 'Unknown';
// }

   async function load(ev) {
      await storeInvoices.GET_INVOICES_NEXT()
      setTimeout(() => ev.target.complete(), 50);
}
if(!storeInvoices.invoiceData.length)
{storeInvoices.GET_INVOICES_NEXT()}

// storeInvoices.GET_INVOICES_NEXT()
    // async function  onLoad (index, done) {
    //   setTimeout(() => {
    //     storeInvoices.GET_INVOICES_NEXT()
    //       done()
    //     }, 1000)

    //   }

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
/*
  Modal
*/


const openInvoiceModal = async () => {
     await Haptics.impact({ style: ImpactStyle.Light })
    const modal = await modalController.create({
      component: MobileInvoiceModal,
      presentingElement:page.value.$el,

    });

    modal.present();
    const { data, role } = await modal.onWillDismiss();
    modal.onDidDismiss(storeInvoices.CLEAR_DATA())
    if (role === 'confirm') {
      console.log('data',data)
      // message.value = `Hello, ${data}!`;
    }

  };

  const openPaymentModal = async () => {
    await Haptics.impact({ style: ImpactStyle.Light });
    const modal = await modalController.create({
      component: MobilePaymentModal,
      presentingElement:page.value.$el,
    });

    modal.present();
    const { data, role } = await modal.onWillDismiss();
    modal.onDidDismiss( storePayments.CLEAR_DATA())
    if (role === 'confirm') {
      console.log('data',data)
      // message.value = `Hello, ${data}!`;
    }
  };
  const page = ref();

  const columns = [
    {
      accessorKey: 'invoiceId',
      header: 'Invoice #',
      cell: ({ row }) => h('div', { class: 'font-medium' }, row.getValue('invoiceId'))
    },
    {
      accessorKey: 'workItemList',
      header: 'Services',
      cell: ({ row }) => {
        const workItems = row.getValue('workItemList')
        return h('div', { class: 'text-sm' },
          workItems.map(work => work.label).join(', ')
        )
      }
    },
    {
      accessorKey: 'doctor',
      header: 'Doctor',
      cell: ({ row }) => {
        const workItems = row.getValue('workItemList')
        const doctors = [...new Set(workItems.map(work => work.doctor))]
        return h('div', { class: 'text-sm' }, doctors.join(', '))
      }
    },
    {
      accessorKey: 'invoice',
      header: '',
      cell: ({ row }) => {
        return h(Invoice, {
          invoice: row.original,
          mobile: mobile.value,
          onOpenPaymentModal: openPaymentModal
        })
      }
    }
  ]
  const currentSort = ref({ key: '', direction: 'asc' })
  function toggleSort(key) {
    if (currentSort.value.key === key) {
      currentSort.value.direction = currentSort.value.direction === 'asc' ? 'desc' : 'asc'
    } else {
      currentSort.value.key = key
      currentSort.value.direction = 'asc'
    }
  }

  const table = useVueTable({
    get data() {
      return invoiceData.value
    },
    columns: [
      {
        accessorKey: 'status',
        header: 'Status',
        accessorFn: (invoice) => {
          const status = invoice.invoiceDraft ? 'Draft'
            : invoice.works?.overallPercentage == 100 ? 'Paid'
            : invoice.works?.overallPercentage === 0 && !invoice.invoiceDraft ? 'Pending'
            : invoice.works?.overallPercentage < 100
              ? (invoice.works?.overDue ? 'Over Due' : 'Partially Paid')
            : 'Unknown'
          return status
        },
        filterFn: (row, columnId, filterValues) => {
          if (!filterValues?.length) return true
          const status = row.getValue(columnId)
          return filterValues.includes(status)
        }
      }
    ],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const sortedAndFilteredData = computed(() => {
    const rows = table.getFilteredRowModel().rows
    console.log('Filtered rows:', rows.length) // Debug log

    const processedData = rows.map(row => {
      const invoice = row.original
      const nameSize = invoice.patientName?.length > 18 ? 15 : 0
      const baseSize = $q.screen.lt.sm ? nameSize + 75 : 45
      invoice.size = invoice.workItemList.length <= 1
        ? baseSize * 1.5
        : baseSize * 1.5 + invoice.workItemList.length * 15
      return invoice
    })

    console.log('Processed data:', processedData.length) // Debug log
    return processedData
  })

  // Add a watch to monitor invoiceData changes
  watch(invoiceData, (newVal) => {
    console.log('InvoiceData changed:', newVal?.length)
  }, { immediate: true })
</script>

<style lang="scss" scoped>
.home {
box-sizing: border-box;
  .header {
    margin-bottom: 12px;

    .left,
    .right {
      flex: 1;
    }

    .right {
      justify-content: flex-end;
      align-items: center;

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
.fade-out {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}
.filter-menu {
   width: 120px;
   top: 25px;
   list-style: none;
   background-color: #e1e6df;
   box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
   border-radius: 0;
          }
.ion-content::part(scroll) {
--offset-top: 0px !important;
z-index: 1000 !important;
// --offset-bottom: 0px !important;
}
.list-md {
  background:none !important
}

:deep(.invoice-table) {
  // Headers styling
  .table-header {
    &:hover {
      background-color: var(--muted);
    }

    &[data-sortable="true"] {
      cursor: pointer;
    }
  }

  // Cells styling
  .table-cell {
    padding: 0.75rem;
    vertical-align: top;
  }

  // Row styling
  .table-row {
    &:not(:last-child) {
      border-bottom: 1px solid var(--border);
    }
  }

  // Invoice component cell specific styling
  .table-cell:last-child {
    padding: 0;
  }
}

// Dark mode adjustments
:deep(.dark) {
  .table-header:hover {
    background-color: var(--muted-dark);
  }
}

.invoice-table {
  width: 100%;
  border-radius: 0.5rem;
  background: var(--background);

  .table-header-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: 0.75rem 1rem;
    background: var(--muted);
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    border-bottom: 1px solid var(--border);
  }

  .table-header {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--muted-foreground);

    &.sortable {
      cursor: pointer;

      &:hover {
        color: var(--foreground);
      }
    }
  }

  .invoice-row {
    border-bottom: 1px solid var(--border);

    &:last-child {
      border-bottom: none;
    }

    // Remove any internal padding/margins from the Invoice component
    :deep(.invoice-component) {
      margin: 0;
      border-radius: 0;
    }
  }
}

// Dark mode adjustments
:deep(.dark) {
  .table-header-row {
    background: var(--muted-dark);
  }
}

.scroller {
  height: 100%;
}

.table-header {
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: var(--muted);
  }
}

.no-data {
  padding: 2rem;
  text-align: center;
  color: var(--muted-foreground);
}

</style>
<style scoped>


ion-action-sheet {
  z-index: 9999 !important; /* Ensure the action sheet appears above the modal */
}
/* Ensure proper styling for scroller and Ionic components */
.scroller {
  height: 100%; /* Full height for the scroller */
}
.vue-recycle-scroller.direction-vertical:not(.page-mode) {
  z-index: 1000000 !important;
}

</style>
