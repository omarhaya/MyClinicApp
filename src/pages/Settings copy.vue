<template>
  <ion-page ref="page">
    <!-- <ion-header v-if="mobile" :translucent="true">
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header> -->
    <ion-content>
      <!-- <ion-header collapse="condense">
        <ion-toolbar class="home container">
          <ion-title size="large">Dashboard</ion-title>
        </ion-toolbar>
      </ion-header> -->


      <div class="settings-page">
        <Sheet>
          <SheetTrigger as-child>
            <Button
              variant="outline"
              size="icon"
              class="shrink-0 md:hidden"
            >
              <Menu class="h-5 w-5" />
              <span class="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav class="grid gap-6 text-lg font-medium">
              <a
                href="#"
                class="flex items-center gap-2 text-lg font-semibold"
              >
                <Package2 class="h-6 w-6" />
                <span class="sr-only">Acme Inc</span>
              </a>
              <a
                href="#"
                class="text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </a>
              <a
                href="#"
                class="text-muted-foreground hover:text-foreground"
              >
                Orders
              </a>
              <a
                href="#"
                class="text-muted-foreground hover:text-foreground"
              >
                Products
              </a>
              <a
                href="#"
                class="text-muted-foreground hover:text-foreground"
              >
                Customers
              </a>
              <a href="#" class="hover:text-foreground">
                Settings
              </a>
            </nav>
          </SheetContent>
        </Sheet>
        <div class="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">


        </div>

        <main class="settings-main">
          <div class="mx-auto grid w-full max-w-6xl gap-2">
            <div class="flex items-center gap-2 text-muted-foreground">
              <span>Dashboard</span>
              <span>/</span>
              <span class="font-medium text-foreground">Settings</span>
            </div>
            <div class="flex items-center justify-between">
              <h1 class="text-3xl font-bold tracking-tight">Settings</h1>

            </div>
          </div>

          <div class="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
            <nav class="sticky top-4 grid gap-4 text-sm">
              <a href="#" class="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 font-medium text-primary">
                <CircleUser class="h-4 w-4" />
                General
              </a>
              <a href="#" class="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                Security
              </a>
              <a href="#" class="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                Integrations
              </a>
              <a href="#" class="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                Support
              </a>
              <a href="#" class="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                Organizations
              </a>
              <a href="#" class="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                Advanced
              </a>
            </nav>

            <div class="grid gap-6">
              <Card>
                <CardHeader class="space-y-1">
                  <CardTitle class="text-xl">Store Name</CardTitle>
                  <CardDescription class="text-sm text-muted-foreground">
                    Used to identify your store in the marketplace.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form class="space-y-4">
                    <div class="space-y-2">
                      <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Store Name
                      </label>
                      <Input placeholder="Enter your store name" />
                    </div>
                  </form>
                </CardContent>
                <CardFooter class="flex items-center justify-between border-t px-6 py-4">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader class="space-y-1">
                  <CardTitle class="text-xl">Plugins Directory</CardTitle>
                  <CardDescription class="text-sm text-muted-foreground">
                    The directory within your project, in which your plugins are located.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form class="space-y-4">
                    <div class="space-y-2">
                      <label class="text-sm font-medium leading-none">
                        Directory Path
                      </label>
                      <Input placeholder="Enter directory path" defaultValue="/content/plugins" />
                    </div>
                    <div class="flex items-center space-x-2">
                      <Checkbox id="include" defaultChecked />
                      <label for="include" class="text-sm text-muted-foreground">
                        Allow administrators to change the directory
                      </label>
                    </div>
                  </form>
                </CardContent>
                <CardFooter class="flex items-center justify-between border-t px-6 py-4">
                  <Button variant="outline">Reset</Button>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup>
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
import { Button } from 'src/components/ui/button'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from 'src/components/ui/card'
import { Checkbox } from 'src/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from 'src/components/ui/dropdown-menu'
import { Input } from 'src/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from 'src/components/ui/sheet'
import { CircleUser, Menu, Package2, Search } from 'lucide-vue-next'

const invoices = [
  {
    invoice: 'INV001',
    paymentStatus: 'Paid',
    totalAmount: '$250.00',
    paymentMethod: 'Credit Card',
  },
  {
    invoice: 'INV002',
    paymentStatus: 'Pending',
    totalAmount: '$150.00',
    paymentMethod: 'PayPal',
  },
  {
    invoice: 'INV003',
    paymentStatus: 'Unpaid',
    totalAmount: '$350.00',
    paymentMethod: 'Bank Transfer',
  },
  {
    invoice: 'INV004',
    paymentStatus: 'Paid',
    totalAmount: '$450.00',
    paymentMethod: 'Credit Card',
  },
  {
    invoice: 'INV005',
    paymentStatus: 'Paid',
    totalAmount: '$550.00',
    paymentMethod: 'PayPal',
  },
  {
    invoice: 'INV006',
    paymentStatus: 'Pending',
    totalAmount: '$200.00',
    paymentMethod: 'Bank Transfer',
  },
  {
    invoice: 'INV007',
    paymentStatus: 'Unpaid',
    totalAmount: '$300.00',
    paymentMethod: 'Credit Card',
  },
]
</script>

<style module>
/* Use CSS modules to avoid style conflicts */
.settings-page {
  /* Reset any inherited styles */
  all: initial;

  /* Add your base styles */
  font-family: system-ui, -apple-system, sans-serif;
  color: var(--foreground);
  background: var(--background);

  /* Container styles */
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.settings-main {
  flex: 1;
  min-height: calc(100vh - theme('spacing.16'));
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: var(--background);
  padding: 1rem;
}

@media (min-width: 768px) {
  .settings-main {
    gap: 2rem;
    padding: 2.5rem;
  }
}

/* Override any global styles that might affect our components */
:global(.settings-page) {
  /* Card styles */
  .card {
    background: var(--card-background);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    box-shadow: var(--card-shadow);
  }

  /* Button styles */
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    font-weight: 500;
    padding: 0.5rem 1rem;
    transition: all 0.2s;
  }

  /* Input styles */
  .input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--input-background);
  }

  /* Navigation styles */
  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    transition: all 0.2s;

    &:hover {
      background: var(--muted);
    }
  }
}

/* CSS Custom Properties for theming */
:root {
  --foreground: #000000;
  --background: #ffffff;
  --muted: #f4f4f5;
  --border: #e4e4e7;
  --card-background: #ffffff;
  --card-shadow: 0 1px 3px rgba(0,0,0,0.1);
  --input-background: #ffffff;
}

/* Dark mode variables */
:root[data-theme="dark"] {
  --foreground: #ffffff;
  --background: #09090b;
  --muted: #27272a;
  --border: #3f3f46;
  --card-background: #18181b;
  --card-shadow: 0 1px 3px rgba(0,0,0,0.3);
  --input-background: #27272a;
}
</style>

<style scoped>
/* Add any component-specific styles here */
:deep(.ion-page) {
  background: var(--background);
}

:deep(.ion-content) {
  --background: var(--background);
}

/* Ensure Ionic components don't override our styles */
:deep(.ion-page) {
  contain: none;
}

/* Override any unwanted inherited styles */
:deep(*) {
  font-family: inherit;
  box-sizing: border-box;
}


</style>
src/components/InvoicesTable/columns
