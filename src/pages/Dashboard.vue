<script setup>
import { Avatar, AvatarFallback, AvatarImage } from 'src/components/ui/avatar'
import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'src/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from 'src/components/ui/dropdown-menu'
import { Input } from 'src/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from 'src/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'src/components/ui/table'
import { Loader2, ArrowUpRight, CalendarPlus, CircleUser, CreditCard, DollarSign, Menu, Package2, Search, Users } from 'lucide-vue-next'
import { ref, computed, onMounted, watch } from 'vue';
import {
  IonCard,
  IonCardContent,
  IonTitle,
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButton, IonItem, IonList, IonPopover
} from '@ionic/vue';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useStorePayments } from 'src/stores/storePayments';
import MonthlyPaymentLineChart from 'src/components/Charts/MonthlyPaymentLineChart.vue';
import CardWidgetIcons from 'src/components/CardWidgetIcons.vue';
import { Platform } from 'quasar';
import { useStorePatients } from 'src/stores/storePatients';
import { useStoreAppointments } from 'src/stores/storeAppointments';
import { useStoreWorks } from 'src/stores/storeWorks';
import { useStoreAuth } from 'src/stores/storeAuth';
import { defineEmits } from "vue";
import numeral from 'numeral';
import GrowingNumeral from 'src/components/GrowingNumeral.vue'
import { useStoreInvoices } from 'src/stores/storeInvoices'
dayjs.extend(isToday);
dayjs.extend(isSameOrBefore);

const storePayments = useStorePayments();
const storePatients = useStorePatients()
const storeAppointments=useStoreAppointments()
const storeWorks=useStoreWorks()
const storeInvoices=useStoreInvoices()
const storeAuth=useStoreAuth()
storeInvoices.GET_INVOICES_NEXT()
storePayments.getLastPayments()
const conversionRates = {
  '$': 1500, // 1 USD = 1500 IQD
  'EUR': 1700, // Example: 1 EUR = 1700 IQD
  'GBP': 2000, // Example: 1 GBP = 2000 IQD
  'IQD': 1, // IQD is the base currency
};
// Helper to format the date
function formatDate(date) {
  const today = dayjs();
  const nextWeek = today.add(7, 'day');
  const current = dayjs(date); // Ensure `current` is a Day.js object

  // Check if it's today
  if (current.isToday()) return 'Today';

  // Check if it's within the next 7 days
  if (current.isSameOrBefore(nextWeek, 'day')) return  current.format('dddd');

  // Beyond the next 7 days
  return current.format('dddd, MMMM D, YYYY');
}

// Group appointments by their date
const groupedAppointmentsByDate = computed(() => {
  const grouped = {};

  // Flatten all appointments into a single array
  const allAppointments = Object.values(storeAppointments.dayAppointments).flat();

  allAppointments.forEach((appointment) => {
    if (!appointment.groupId && appointment.resourceIds[0] === storeAuth.user.uid) {
      const dateKey = (appointment.appointmentdate) // Group by date (e.g., 2024-11-19)

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          id:formatDate(dateKey),
          date: appointment.date,
          sessions: [],
        };
      }

      grouped[dateKey].sessions.push(appointment);
    }
  });
  console.log(grouped,'grouped')
  // Convert the grouped object into an array and sort by date
  return Object.values(grouped).sort((a, b) =>
    dayjs(a.id).valueOf() - dayjs(b.id).valueOf()
  );
});
// Set the initial date range to the current year
onMounted(() => {
  const startDate = dayjs().startOf('year').format('YYYY-MM-DD');
  const endDate = dayjs().endOf('year').format('YYYY-MM-DD');
  const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
  const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');
  const currentMonthStart = dayjs().startOf('month').valueOf(); // Start of current month (Unix timestamp in milliseconds)
  const currentMonthEnd = dayjs().endOf('month').valueOf(); // End of current month (Unix timestamp in milliseconds)
  storePayments.selectedDateRange = { from: startDate, to: endDate };
  fetchPayments();
  storeAppointments.fetchMonthAppointments(startOfMonth,endOfMonth)
  storeWorks.fetchMonthWorksPrice(currentMonthStart,currentMonthEnd)
});

// Fetch payments based on the selected date range
const fetchPayments = async () => {
  if (storePayments.selectedDateRange?.from && storePayments.selectedDateRange?.to) {
    const startDate = storePayments.selectedDateRange.from;
    const endDate = storePayments.selectedDateRange.to;
    await storePayments.fetchPaymentsByDate(startDate, endDate);
  }
};

const paymentsData = computed(() => storePayments.getPaymentsByPeriod('day'));
// Calculate the number of patients added in the current month
const currentMonthPatientsCount = computed(() => {
  const startOfMonth = dayjs().startOf('month').valueOf(); // Start of the current month in milliseconds
  const endOfMonth = dayjs().endOf('month').valueOf(); // End of the current month in milliseconds

  return storePatients.patients.filter(patient =>
    patient.dateUnix >= startOfMonth && patient.dateUnix <= endOfMonth
  ).length;
});
const currentMonthAppointmentsCount = computed(() => {
  return storeAppointments.appointmentsCount
});
const currentMonthPaymentsData = computed(() => {
  const currentMonth = dayjs().format('YYYY-MM'); // Get the current month
  let totalSum = 0;

  // Iterate over all currencies in paymentsData
  Object.keys(paymentsData.value).forEach(currency => {
    const currencyData = paymentsData.value[currency];

    // Find the payment entry for the current month
    const currentMonthPayment = currencyData.find(payment => payment.date === currentMonth);

    if (currentMonthPayment) {
      // Get the conversion rate for the current currency
      const rate = conversionRates[currency];

      // Add the converted total to the sum
      totalSum += currentMonthPayment.total * rate;
    }
  });

  return totalSum;
});
watch(storePayments.selectedDateRange, fetchPayments);

const mobile = computed(() => {
  if (Platform.is.desktop) {
    return false;
  }
  if (Platform.is.mobile) {
    return true;
  }
  return false;
});

// Touch handling logic
const touchStartX = ref(0);
const touchStartY = ref(0);
const isScrollingVertically = ref(true);

// Handle touch start to detect initial coordinates
const handleTouchStart = (event) => {
  const touch = event.touches[0];
  touchStartX.value = touch.clientX;
  touchStartY.value = touch.clientY;
  isScrollingVertically.value = true; // Reset scrolling direction
};

// Handle touch move to prevent vertical scrolling during horizontal swipe
const handleTouchMove = (event) => {
  const touch = event.touches[0];
  const deltaX = Math.abs(touch.clientX - touchStartX.value);
  const deltaY = Math.abs(touch.clientY - touchStartY.value);

  if (deltaX > deltaY) {
    // Horizontal scrolling detected
    isScrollingVertically.value = false;
    event.preventDefault(); // Prevent vertical scrolling
  }
};
 storeAppointments.getMyAppointments()
//style
const getLabelStyle = (track) => {
  let colorVar = track === "Ionic" ? "primary" : track.toLowerCase();
  return {
    borderLeft: `2px solid var(--ion-color-${colorVar})`,
    paddingLeft: "10px",
    marginTop: "12px",
    marginBottom: "12px"
  };
};
const isArabic=(value) =>{
          return /[\u0600-\u06FF]/.test(value)
       }
const getInitials=(name) =>{
          const nameParts = name.split(' ');
          const firstName = nameParts[0].charAt(0).toUpperCase();
          const lastName = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
          return `${firstName}${lastName}`;
       }
</script>

<template>
  <ion-page>
    <ion-content>

  <div class="flex min-h-screen w-full flex-col">
    <main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div class="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign class="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
             IQD <GrowingNumeral :value="currentMonthPaymentsData" />

            </div>
            <p class="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">
              New Clients
            </CardTitle>
            <Users class="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
             + <GrowingNumeral :value="currentMonthPatientsCount" />

            </div>
            <p class="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">
              New Invoices
            </CardTitle>
            <CreditCard class="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
             + <GrowingNumeral :value="storeWorks.totalPriceThisMonth" />

            </div>
            <p class="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">
              New Appointments
            </CardTitle>
            <CalendarPlus class="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              + <GrowingNumeral :value="currentMonthAppointmentsCount"/>
            </div>
            <p class="text-xs text-muted-foreground">
              +201 since last hour
            </p>
          </CardContent>
        </Card>
      </div>
      <div class="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card class="xl:col-span-1">
          <CardHeader class="flex flex-row items-center">
            <div class="grid gap-2">
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>
                Upcoming appointments from today.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ion-list v-if="groupedAppointmentsByDate.length > 0">
                <ion-item-group v-for="group in groupedAppointmentsByDate" :key="group.id">
                  <ion-item-divider sticky>
                    <ion-label>{{ group.id }}</ion-label>
                  </ion-item-divider>
                  <ion-item-sliding v-for="session in group.sessions" :key="session.appointmentId">
                    <ion-card>
                    <ion-item >
                      <ion-label :style="getLabelStyle('primary')">
                        <h3>{{ session.title }}</h3>
                        <p>
                          {{ dayjs(session.start, "HH:mm").format("h:mm A") + ' - ' + dayjs(session.end, "HH:mm").format("h:mm A") }}
                        </p>
                      </ion-label>
                    </ion-item>
                  </ion-card>
                    <!-- <ion-item-options>
                      <ion-item-option color="favorite" @click="addFavorite(session)">
                        Favorite
                      </ion-item-option>
                      <ion-item-option color="danger" @click="removeFavorite(session)">
                        Remove
                      </ion-item-option>
                    </ion-item-options> -->
                  </ion-item-sliding>
                </ion-item-group>
                <div style="display: flex; justify-content: center; margin-top: 16px;">
                 <Button as-child size="sm"
                  :disabled="storeAppointments.loadingAppointments"
                  @click="storeAppointments.limit += 2;storeAppointments.getMyAppointments()"
                  class=" row  gap-1">
                <span class="" v-if="!storeAppointments.loadingAppointments">   Load More</span>
                <span class="row" v-if="storeAppointments.loadingAppointments">
                  <Loader2 class="w-4 h-4 mr-2  animate-spin" />
                <span class="col"> Please wait</span>
              </span>
                </Button>

              </div>
              </ion-list>
              <div v-else> No Upcoming Appointments</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent class="grid gap-8">
            <div v-for="invoice in storeInvoices.invoiceData.slice(0, 5)" class="flex items-center gap-4">
              <Avatar v-if="!isArabic(storePatients.patients.find(patient => patient.patientId === invoice.patientId)?.namef || 'No Name')" class="h-9 w-9 sm:flex">
                <AvatarImage src="/avatars/01.png" alt="Avatar" />
                <AvatarFallback>{{getInitials(storePatients.patients.find(patient => patient.patientId === invoice.patientId)?.namef || 'No Name')}}</AvatarFallback>
              </Avatar>
              <Avatar v-else class="h-9 w-9 sm:flex">
                <AvatarImage src="/avatars/01.png" alt="Avatar" />
                <AvatarFallback><q-icon name="person"></q-icon></AvatarFallback>
              </Avatar>
              <div class="grid gap-1">
                <p class="text-sm font-medium leading-none">
                 {{storePatients.patients.find(patient => patient.patientId === invoice.patientId)?.namef || 'No Name'}}
                </p>
                <p class="text-sm text-muted-foreground">
                {{ storePatients.patients.find(patient => patient.patientId === invoice.patientId)?.phone || 'No Phone Number'}}
                </p>
              </div>
              <div v-if="invoice.works" v-for="subtotal in invoice.works.subTotals"  class="ml-auto font-medium">
                <div  class="col flex font-[1000]" :class="{
              'text-green-600 dark:text-green-400': subtotal.subTotal.sign !== '-', // Greener in dark mode
              'text-red-600 dark:text-red-400': subtotal.subTotal.sign === '-', // Softer red in dark mode
            }"><span class="currency"> <span v-if="subtotal.subTotal.sign !== '-'">+</span>{{(subtotal.totalAmount.currency)}} </span>{{(numeral(subtotal.totalAmount.absoluteValue).format('0,0')) }}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Income</CardTitle>
          </CardHeader>
          <CardContent
            style="height: 400px; padding: 0;"
            ref="monthlyLineChart"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove" class="grid gap-8 monthly-line-chart-wrapper">
           <MonthlyPaymentLineChart :paymentsData="paymentsData"/>
          </CardContent>
        </Card>
        <Card class="xl:col-span-2">
          <CardHeader class="flex flex-row items-center">
            <div class="grid gap-2">
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                Recent transactions from your store.
              </CardDescription>
            </div>
            <Button as-child size="sm" class="ml-auto row  gap-1">
                <span class="col">   View All</span>
                <ArrowUpRight class="col ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead class=" 2xl:table-column&&xl:table-column">
                    Type
                  </TableHead>
                  <TableHead class="hidden xl:table-column">
                    Status
                  </TableHead>
                  <TableHead class=" xl:table-cell lg:hidden 2xl:table-column">
                    Date
                  </TableHead>
                  <TableHead class="text-right">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="payment in storePayments.paymentData">
                  <TableCell>
                    <div class="font-medium">
                      {{storePatients.patients.find(patient => patient.patientId === payment.patientId)?.namef || 'No Name'}}
                    </div>
                    <div class="hidden text-sm text-muted-foreground md:inline">
                      {{storePatients.patients.find(patient => patient.patientId === payment.patientId)?.phone || 'No Phone Number'}}
                    </div>
                  </TableCell>
                  <TableCell class="2xl:table-column&&xl:table-column">
                    <Badge class="text-xs" :class="{ 'bg-green-500/10 text-green-500': payment.paid > 0, 'bg-red-500/10 text-red-500': payment.paid < 0 }" variant="outline">   {{payment.type}}</Badge>

                  </TableCell>
                  <TableCell class="hidden xl:table-column">
                    <Badge class="text-xs" variant="outline">
                      Approved
                    </Badge>
                  </TableCell>
                  <TableCell class=" xl:table-cell lg:hidden 2xl:table-column">
                     {{ payment.date }}
                  </TableCell>
                  <TableCell class="text-right"><span v-if="payment.type=='payment' && payment.paid>0" class="text-green-600">+  {{ payment.currency +' '+numeral(Math.abs(payment.paid)).format('0,0') }}</span><span v-if="payment.type=='expense' && payment.paid<0" class=text-red-600>-   {{ payment.currency +' '+numeral(Math.abs(payment.paid)).format('0,0') }}</span>

                  </TableCell>
                </TableRow>

              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  </div>

</ion-content>
  </ion-page>
</template>
<style scoped>
h3 {
  margin:0 !important;
}
</style>
