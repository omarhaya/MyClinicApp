<template>

  <!-- InvoiceModal -->
  <q-dialog
    v-if="!mobile"
    full-width
    full-height
    allow-focus-outside
    :persistent="checkContent"
    position="left"
    transition-duration="700"
    @shake="closeWithcontent"
    v-model="storeInvoices.invoiceModal"
    class="dialog-addInvoice"
  >
    <q-dialog v-model="storeInvoices.modalActive">
      <q-card>
        <q-card-section>
          <div class="text-h6">Second dialog</div>
        </q-card-section>
        <q-card-section class="row items-center q-gutter-sm">
          <q-btn v-close-popup="2" label="Close" color="red" />
          <q-btn v-close-popup label="Return" color="purple" />
        </q-card-section>
      </q-card>
    </q-dialog>
    <InvoiceModal />
  </q-dialog>
  <v-bottom-sheet v-if="mobile" v-model="storeInvoices.invoiceModal" scrollable inset>
    <v-card height="auto">
      <InvoiceModal />
    </v-card>
  </v-bottom-sheet>
  <q-dialog
    full-width
    full-height
    allow-focus-outside
    :persistent="checkContent"
    position="bottom"
    transition-duration="700"
    @shake="closeWithcontent"
    class="dialog-addInvoice"
  >
    <q-dialog v-model="storeInvoices.modalActive">
      <q-card>
        <q-card-section>
          <div class="text-h6">Second dialog</div>
        </q-card-section>
        <q-card-section class="row items-center q-gutter-sm">
          <q-btn v-close-popup="2" label="Close" color="red" />
          <q-btn v-close-popup label="Return" color="purple" />
        </q-card-section>
      </q-card>
    </q-dialog>
    <InvoiceModal />
  </q-dialog>
  <!-- PaymentModal -->
  <q-dialog
    v-if="!mobile"
    full-width
    full-height
    allow-focus-outside
    :persistent="checkContent"
    :position="$route.path === '/Transactions' ? 'left' : 'left'"
    transition-duration="700"
    @shake="closeWithcontent"
    v-model="storePayments.paymentModal"
    class="dialog-addInvoice"
  >
    <q-dialog v-model="storePayments.modalActive">
      <q-card>
        <q-card-section>
          <div class="text-h6">Second dialog</div>
        </q-card-section>
        <q-card-section class="row items-center q-gutter-sm">
          <q-btn v-close-popup="2" label="Close" color="red" />
          <q-btn v-close-popup label="Return" color="purple" />
        </q-card-section>
      </q-card>
    </q-dialog>
    <PaymentModal />
  </q-dialog>

  <v-bottom-sheet v-if="mobile" v-model="storePayments.paymentModal" scrollable inset>
    <v-card height="auto">
      <PaymentModal />
    </v-card>
  </v-bottom-sheet>






<!--
        <q-drawer
      v-if="!mobile"
      v-model="leftDrawerOpen"
      show-if-above
      :mini="storeSettings.appearance.miniState"
      @mouseover="checkPopup"
      @mouseout="storeSettings.appearance.enlargeHover?storeSettings.appearance.miniState = true:''"
      :width="200"
      :breakpoint="500"
      class="drawer "
    >
      <q-scroll-area class="fit">
        <q-list>
          <q-item style="padding:8px 14px">
            <q-item-section avatar>
              <q-icon size="29px" style="height: 19px; filter: drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.5));" name="appLogo" />
            </q-item-section>

          </q-item>

          <div v-if="storeAuth.user.uid">
            <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />
          </div>
          <q-item
            v-if="!storeAuth.user.uid"
            v-ripple
            to="/auth"
            clickable
            :active="$route.fullPath === '/auth'"
            active-class="my-menu-link"
          >
            <q-item-section avatar>
              <q-icon name="account_circle" />
            </q-item-section>

            <q-item-section>
              Login/Register
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item v-ripple  to="/settings" clickable :active="$route.fullPath === '/settings'" active-class="my-menu-link">
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>

            <q-item-section>
              Settings
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer> -->

  <SidebarProvider :open="!storeSettings.appearance.miniState" v-if="!mobile">

    <Sidebar v-if="storeAuth.user.uid"   collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <SidebarMenuButton
                  size="lg"
                  class="data-[state=open]:bg-accent  hover:bg-accent hover:text-accent-foreground  data-[state=open]:text-accent-foreground"
                >
                  <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <component :is="activeTeam.logo" class="size-4" />
                  </div>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-semibold">{{ activeTeam.name }}</span>
                    <span class="truncate text-xs">{{ activeTeam.plan }}</span>
                  </div>
                  <ChevronsUpDown class="ml-auto mb-1" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="start"
                side="bottom"
                :side-offset="4"
              >
                <DropdownMenuLabel class="text-xs text-muted-foreground">
                  Teams
                </DropdownMenuLabel>
                <DropdownMenuItem
                  v-for="(team, index) in data.teams"
                  :key="team.name"
                  class="gap-2 p-2"
                  @click="setActiveTeam(team)"
                >
                  <div class="flex size-6 items-center justify-center rounded-sm border">
                    <component :is="team.logo" class="size-4 shrink-0" />
                  </div>
                  {{ team.name }}
                  <DropdownMenuShortcut>⌘{{ index + 1 }}</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="gap-2 p-2">
                  <div class="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus class="size-4" />
                  </div>
                  <div class="font-medium text-muted-foreground">
                    Add team
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            <Collapsible
              v-for="item in data.navMain"
              :key="item.title"
              as-child
              :default-open="active(item.url)"
              class="group/collapsible"
            >
              <SidebarMenuItem >
                <CollapsibleTrigger   as-child>
                  <SidebarMenuButton  @click="$router.push(item.url)" :class="active(item.url) ? 'bg-primary' : ''" class="group-data-[state=open]/collapsible:bg-sidebar-accent group-data-[state=open]/collapsible:text-accent-foreground hover:bg-accent hover:text-accent-foreground" :tooltip="item.title">
                    <component :class="!storeSettings.appearance.miniState?'mt-[-2px]':''" :is="item.icon"  />
                    <span :class="!storeSettings.appearance.miniState?'mt-[-2px]':''" >{{ item.title }}</span>
                    <CollapsibleTrigger class="cursor-default"  as-child>
                    <ChevronRight @click.stop v-if="item.collapsible"  class="ml-auto mt-[-2px] transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 cursor-default" />
                  </CollapsibleTrigger>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent v-if="item.collapsible">
                  <SidebarMenuSub>
                    <SidebarMenuSubItem
                      v-for="subItem in item.items"
                      :key="subItem.title"
                    >
                      <SidebarMenuSubButton as-child :class="active(subItem.url) ? 'bg-primary' : ''">
                        <a @click="$router.push(subItem.url)">
                          <span class="cursor-default">{{ subItem.title }}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup class="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem
              v-for="item in data.projects"
              :key="item.name"
            >
              <SidebarMenuButton as-child class="group-data-[state=open]/collapsible:bg-accent text-accent-foreground group-data-[state=open]/collapsible:text-accent-foreground hover:bg-accent  ">
                <a :href="item.url">
                  <component :is="item.icon" />
                  <span>{{ item.name }}</span>
                </a>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <SidebarMenuAction show-on-hover>
                    <MoreHorizontal />
                    <span class="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-48 rounded-lg" side="bottom" align="end">
                  <DropdownMenuItem>
                    <Folder class="text-muted-foreground" />
                    <span>View Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Forward class="text-muted-foreground" />
                    <span>Share Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Trash2 class="text-muted-foreground" />
                    <span>Delete Project</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton class="text-foreground/70">
                <MoreHorizontal class="text-foreground/70" />
                <span>More</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <SidebarMenuButton
                  size="lg"
                  class="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground  hover:bg-accent hover:text-accent-foreground "
                >
                  <Avatar class="h-8 w-8 rounded-lg">
                    <AvatarImage :src="data.user.avatar" :alt="data.user.name" />
                    <AvatarFallback v-if="storeAuth.doctors[0]" class="rounded-lg">
                      {{getInitials(storeAuth.doctors[0].name)}}
                    </AvatarFallback>
                  </Avatar>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-semibold">{{ data.user.name }}</span>
                    <span class="truncate text-xs">{{ data.user.email }}</span>
                  </div>
                  <ChevronsUpDown class="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side="bottom" align="end" :side-offset="4">
                <DropdownMenuLabel class="p-0 font-normal">
                  <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar class="h-8 w-8 rounded-lg">
                      <AvatarImage :src="data.user.avatar" :alt="data.user.name" />
                      <AvatarFallback class="rounded-lg">
                        {{getInitials(storeAuth.doctors[0].name)}}
                      </AvatarFallback>
                    </Avatar>
                    <div class="grid flex-1 text-left text-sm leading-tight">
                      <span class="truncate font-semibold">{{ storeAuth.doctors[0].name }}</span>
                      <span class="truncate text-xs">{{ storeAuth.user.email }}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Sparkles />
                    Upgrade to Pro
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BadgeCheck />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="storeAuth.logoutUser()">
                  <LogOut/>
                    Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    <SidebarInset>
      <!-- Static Header -->
      <header class="app-header">
        <div class="flex h-16 items-center gap-2 px-4">
          <SidebarTrigger @click="storeSettings.appearance.miniState = !storeSettings.appearance.miniState" class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbLink href="#">
                  Building Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <!-- Routed Content -->
      <ion-page class="router-content">
        <IonRouterOutlet />
      </ion-page>
    </SidebarInset>
  </SidebarProvider>


  <ion-page v-if="mobile" ref="page">

    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar class="q-pb-lg" slot="bottom">
        <ion-tab-button tab="tab4" href="/Calendar">
          <ion-icon aria-hidden="true" :icon="calendar" />
          <ion-label>Calendar</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" href="/Patients">
          <ion-icon aria-hidden="true" :icon="people" />
          <ion-label>Patients</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab1" href="/Transactions">
          <ion-icon aria-hidden="true" :icon="swapHorizontalOutline" />
          <ion-label>Transactions</ion-label>
        </ion-tab-button>


        <ion-tab-button tab="tab2" href="/Invoices">
          <ion-icon aria-hidden="true" :icon="newspaper" />
          <ion-label>Invoices</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab5" href="/">
          <ion-icon aria-hidden="true" :icon="grid" />
          <ion-label>DashBoard</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup>

import { ref, computed, watch, onUnmounted } from 'vue'
import { useStoreAuth } from 'stores/storeAuth'
import UserMenu from 'src/components/UserMenu.vue'
import { Platform } from 'quasar'
import EssentialLink from 'components/EssentialLink.vue'
import EssentialLinkMobile from 'src/components/EssentialLinkMobile.vue'
import { useStoreInvoices } from '../stores/storeInvoices'
import InvoiceModal from 'src/components/InvoiceModal.vue'
import { useQuasar } from 'quasar'
import PaymentModal from 'src/components/PaymentModal.vue'
import { useStorePayments } from 'src/stores/storePayments'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonRouterOutlet } from '@ionic/vue'
import { useStoreSettings } from 'src/stores/storeSettings'
import { newspaper, people, calendar,swapHorizontalOutline,grid} from 'ionicons/icons'
import { useTheme } from 'vuetify'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from 'src/components/ui/avatar'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from 'src/components/ui/breadcrumb'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'src/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu'
import { Separator } from 'src/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from 'src/components/ui/sidebar'
import {
  AudioWaveform,
  BadgeCheck,
  Bell,
  BookOpen,
  Bot,
  ChevronRight,
  ChevronsUpDown,
  Command,
  CreditCard,
  Folder,
  Forward,
  Frame,
  GalleryVerticalEnd,
  LogOut,
  Map,
  MoreHorizontal,
  PieChart,
  Plus,
  Settings2,
  Sparkles,
  SquareTerminal,
  Trash2,
  ScrollText,
  ArrowLeftRight,
  CalendarCheck,
  Users,
  UserRoundCog,
  ChartNoAxesCombined,
  Package
} from 'lucide-vue-next'
import {useRoute}  from 'vue-router'

const theme = useTheme()
const $q = useQuasar()
const storeAuth = useStoreAuth()
const storeInvoices = useStoreInvoices()
const storePayments = useStorePayments()
const storeSettings = useStoreSettings()
// This is sample data.
const data = {
  user: {
    name: storeAuth.doctors[0].name,
    email: storeAuth.user.email,
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free',
    },
  ],
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'History',
          url: '#/settings',
        },
        {
          title: 'Starred',
          url: '#',
        },
        {
          title: 'Settings',
          url: '#',
        },
      ],
    },
    {
      title: 'Invoices',
      url: '/invoices',
      icon: ScrollText,
    },
    {
      title: 'Clients List',
      url: '/patients',
      icon: Users,
    },
    {
      title: 'Transactions',
      url: '/transactions',
      icon: ArrowLeftRight ,
      items: [
        {
          title: 'Introduction',
          url: '#',
        },
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
        {
          title: 'Changelog',
          url: '#',
        },
      ],
    },
    {
      title: 'Schedule',
      url: '/calendar',
      // collapsible:true,
      icon:CalendarCheck,
      // items: [
      //   {
      //     title: 'General',
      //     url: '#',
      //   },
      //   {
      //     title: 'Team',
      //     url: '#',
      //   },
      //   {
      //     title: 'Billing',
      //     url: '#',
      //   },
      //   {
      //     title: 'Limits',
      //     url: '#',
      //   },
      // ],
    },
    {
      title: 'Inventory',
      url: '/inventory',
      icon: Package ,
    },
    {
      title: 'Staff Mangement',
      url: '/staff',
      icon: UserRoundCog ,
    },
    {
      title: 'Reports & Analytics',
      url: '/analytics',
      icon: PieChart ,
    },
    {
      title: 'Settings',
      url: '/settings',
      icon:Settings2,
      collapsible:true,
      items: [
        {
          title: 'Profile',
          url: '/settings/profile',
        },
        {
          title: 'Account',
          url: '/settings/account',
        },
        {
          title: 'Appearance',
          url: '/settings/appearance',
        },
        {
          title: 'Notifications',
          url: '/settings/notifications',
        },
        {
          title: 'Display',
          url: '/settings/display',
        },
      ],
    },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map,
    },
  ],
}

const checkContent = computed(() => false)

function closeWithcontent() {
  if (checkContent) {
    storeInvoices.modalActive = true
  }
}

watch(() => storeInvoices.invoiceModal, (currentValue) => {
  if (!currentValue) {
    storeInvoices.CLEAR_DATA()
  }
})

watch(() => storePayments.paymentModal, (currentValue) => {
  if (!currentValue) {
    storePayments.CLEAR_DATA()
  }
})

const mobile = computed(() => Platform.is.mobile)
// DARK MODE

let systemPreferenceListener = null;

// Function to apply dark mode
function setDarkMode(isDark) {
  $q.dark.set(isDark);
  document.body.classList.toggle('dark', isDark);
  document.body.classList.toggle('ion-dark', isDark);
  theme.global.name.value = isDark ? 'dark' : 'light';
}

// Watch for changes in appearance.theme
watch(
  () => storeSettings.appearance.theme,
  (newTheme) => {
    // Remove system preference listener if it exists
    if (systemPreferenceListener) {
      systemPreferenceListener();
      systemPreferenceListener = null;
    }

    if (newTheme === 'light') {
      setDarkMode(false);
    } else if (newTheme === 'dark') {
      setDarkMode(true);
    } else if (newTheme === 'system') {
      // Follow the system's color scheme preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);

      // Listen for system preference changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const systemChangeHandler = (event) => {
        setDarkMode(event.matches);
      };
      mediaQuery.addEventListener('change', systemChangeHandler);

      // Store the listener cleanup function
      systemPreferenceListener = () => {
        mediaQuery.removeEventListener('change', systemChangeHandler);
      };
    }
  },
  { immediate: true } // Trigger the watcher immediately on initialization
);

const myIcons = {
  'appLogo': 'img:/src/assets/appLogo.svg',
}
$q.iconMapFn = (iconName) => {
  const icon = myIcons[iconName]
  if (icon !== undefined) {
    return { icon }
  }
}
const activeTeam = ref(data.teams[0])
const route = useRoute();
const active = (link) => {
  let result = null;
  if (link === '/') {
    result = route.fullPath.toLowerCase() === link.toLowerCase();
  } else {
    result = route.fullPath.toLowerCase().startsWith(link.toLowerCase());
  }
  return result;
};
function getInitials(name) {
          const nameParts = name.split(' ');
          const firstName = nameParts[0].charAt(0).toUpperCase();
          const lastName = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
          return `${firstName}${lastName}`;
       }
function setActiveTeam(team) {
  activeTeam.value = team;
}

// Cleanup on unmount
onUnmounted(() => {
  if (systemPreferenceListener) {
    systemPreferenceListener();
  }
});
</script>

<style lang="sass">
.q-dialog__inner--minimized
   padding: 0px
   padding-left: 57px !important

.dialog-addInvoice
   z-index: 1
   box-shadow: 10px 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important
   button,
.drawer
   box-sizing: border-box
.header
   z-index: 10
   box-sizing: border-box
.q-toolbar
   min-height: 42px !important
   box-sizing: border-box
.ion-text
   font-size: 11px !important
.appLogo-icon
   padding-bottom:1px
   padding-top:5px
.ion-page
   padding-bottom: var(--padding-bottom)
.q-drawer
    position: absolute
    top: 0
    bottom: 0
    z-index: 0

</style>
<style scoped>
.dialog-addInvoice {
  /* Adjust modal styling */
  z-index: 9998 !important; /* Ensure the modal's z-index is lower than the action sheet */
}

ion-action-sheet {
  z-index: 9999 !important; /* Ensure the action sheet appears above the modal */
}
.app-header {
  /* background-color: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast); */
  position: sticky;
  top: 0;
  z-index: 10;
  height: 3rem; /* Adjust based on header size */
  display: flex;
  align-items: center;
  /* box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1); */
}

.router-content {
  margin-top: 4rem; /* Matches the height of the header */
  display: flex;
  flex-grow: 1;
  flex-direction: column;
}

.sidebar-menu-button:hover {
  background-color: #fafafa !important;

}
</style>
