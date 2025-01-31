<script setup lang="ts">
import { ref,computed,h,render,Transition } from 'vue';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "src/components/ui/table"; // ShadCN table components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'src/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from 'src/components/ui/form';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { Input } from 'src/components/ui/input';
import { toast } from 'src/components/ui/toast';
import { Button } from "src/components/ui/button"; // ShadCN button
import { Pencil } from 'lucide-vue-next';
import { IonPage, IonContent,modalController } from '@ionic/vue';
import { useStoreAuth } from 'src/stores/storeAuth';
import {useStoreSettings} from 'src/stores/storeSettings'
const storeAuth=useStoreAuth()
const storeSettings=useStoreSettings()
// Example data for doctors and staff
const staffData = computed(()=>{
  console.log(storeAuth.doctors,'storeAuth.doctors')
return storeAuth.doctors
})

let container: HTMLDivElement | null = null; // Define container globally
let isOpen = ref(false);
const openPermissionsModal = async (staff: any) => {
  if (!storeSettings.mobile) {
    if (container) return; // Prevent multiple modals from being created

      container = document.createElement("div");
      document.body.appendChild(container);
      isOpen.value = true; // Set modal state to open

      function closeModal() {
        isOpen.value = false; // Trigger transition first
        // Wait for transition to finish before removing from DOM
        setTimeout(() => {
          if (container) {
            render(null, container); // Unmount
            document.body.removeChild(container);
            container = null;

          }
        }, 300); // Adjust this duration based on your animation time
      }
      const dialogVNode = h(Dialog, {
        open: isOpen.value,
        "onUpdate:open": (val) => {
          if (!val) closeModal();
        },
      }, () => [
        h(Transition, { name: "fade", appear: true,  onBeforeLeave: (el: HTMLElement) => {
          console.log(el,'el')
          el.style.transition = 'opacity 0.3s ease';
          el.style.opacity = '1';
        },
        onLeave: (el: HTMLElement) => {
          console.log(el,'el')
          el.style.transition = 'opacity 0.3s ease';
          el.style.opacity = '0';
        } }, [
          isOpen.value
            ? h(DialogContent, { class: "sm:max-w-[425px]" }, [
                h(DialogHeader, {}, [
                  h(DialogTitle, {}, staff.name),
                  h(DialogDescription, {}, "Make changes to your profile here. Click save when you're done."),
                ]),
                h("form", {
                  id: "dialogForm",
                  onSubmit: (e) => {
                    e.preventDefault(); // Prevent default form submission
                    handleSubmit(e, onSubmit); // Call your handleSubmit function
                  }
                }, [
                  h(FormField, { name: "username" }, {
                    default: ({ componentField }) => [
                      h(FormItem, {}, [
                        h(FormLabel, {}, "Username"),
                        h(FormControl, {}, [
                          h(Input, {
                            type: "text",
                            placeholder: "shadcn",
                            ...componentField
                          })
                        ]),
                        h(FormDescription, {}, "This is your public display name."),
                        h(FormMessage),
                      ])
                    ]
                  }),
                ]),
                h(DialogFooter, {}, [
                  h(Button, { type: "submit", form: "dialogForm" }, "Save changes"),
                ]),
              ])
            : null,
        ]),
      ]);

      render(dialogVNode, container);
    }
  else {
  const modal = await modalController.create({
    component: MobileAppointmentModal,
    isOpen:storeAppointments.modal,
    componentProps: {
      appointment:newAppointment// Replace 'yourValue' with the value you want to pass
    },
    presentingElement: pageRef.value.$el,
  });
  storeAppointments.modal=true
  modal.present();
  const { data, role } = await modal.onWillDismiss();
  modal.onDidDismiss(handleEventUnselect ()
  // ||storeInvoices.CLEAR_DATA()
  )
  if (role === 'confirm') {
    storeAppointments.modal=false
    console.log('data',data)
    // message.value = `Hello, ${data}!`;
  }
}
};
function handleSubmit(e, callback) {
  e.preventDefault();
  // Handle form validation and submission
  const formData = new FormData(e.target);
  const values = Object.fromEntries(formData.entries());
  callback(values);
}
// Sorting state
const sortKey = ref<string>('name');
const sortOrder = ref<'asc' | 'desc'>('asc');

// Method to sort the data
function sortData(key: string) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }

  staffData.value.sort((a, b) => {
    const modifier = sortOrder.value === 'asc' ? 1 : -1;

    if (key === 'permissions') {
      const aValue = a.permissions.length;
      const bValue = b.permissions.length;
      return (aValue - bValue) * modifier;
    }

    const aValue = a[key as keyof typeof a] as string | number;
    const bValue = b[key as keyof typeof b] as string | number;

    if (aValue < bValue) return -1 * modifier;
    if (aValue > bValue) return 1 * modifier;
    return 0;
  });
}

// Edit permissions handler
function editPermissions(staff: typeof staffData.value[0]) {
  alert(`Edit permissions for ${staff.name}`);
}
</script>
<template>
  <ion-page>
    <ion-content>
      <div class="p-6 space-y-4">
        <h1 class="text-2xl font-bold">Clinic Staff Permissions</h1>
        <p class="text-sm text-muted-foreground">
          Manage permissions for doctors and staff members in the clinic.
        </p>
        <!-- Table -->
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="cursor-pointer" @click="sortData('doctorId')">
                ID
                <span v-if="sortKey === 'doctorId'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </TableHead>
              <TableHead class="cursor-pointer" @click="sortData('name')">
                Name
                <span v-if="sortKey === 'name'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </TableHead>
              <TableHead class="cursor-pointer" @click="sortData('role')">
                Role
                <span v-if="sortKey === 'role'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </TableHead>
              <TableHead class="cursor-pointer text-center" @click="sortData('permissions')">
                Permissions
                <span v-if="sortKey === 'permissions'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </TableHead>
              <TableHead class="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="staff in staffData" :key="staff.doctorId">
              <TableCell>{{ staff.doctorId.slice(-6) }}</TableCell>
              <TableCell>{{ staff.name }}</TableCell>
              <TableCell>{{ staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}}</TableCell>
              <TableCell class="text-center"><span v-if="storeAuth.user.uid === storeAuth.role.clinicId"><span v-if="staff.role==='admin'">All</span><span v-else >{{ staff.permissions.length }}</span></span><span v-else>****</span></TableCell>
              <TableCell class="text-right">
                <Button
                  :disabled="storeAuth.user.uid !== storeAuth.role.clinicId"
                  variant="ghost"
                  size="sm"
                  @click="openPermissionsModal(staff)"
                >
                  <Pencil class="w-4 h-4 mr-1" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <!-- <Dialog :open="permissionsModal" @update:open="permissionsModal = $event" >
    <DialogContent class="sm:max-w-[425px] grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90dvh]">
      <DialogHeader class="p-6 pb-0">
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>
          Make changes to your profile here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4 overflow-y-auto px-6">
        <div class="flex flex-col justify-between h-[300dvh]">
          <p>
            This is some placeholder content to show the scrolling behavior for modals. We use repeated line breaks to demonstrate how content can exceed minimum inner height, thereby showing inner scrolling. When content becomes longer than the predefined max-height of modal, content will be cropped and scrollable within the modal.
          </p>

          <p>This content should appear at the bottom after you scroll.</p>
        </div>
      </div>
      <DialogFooter class="p-6 pt-0">
        <Button type="submit">
          Save changes
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog> -->
    </ion-content>
  </ion-page>
</template>
