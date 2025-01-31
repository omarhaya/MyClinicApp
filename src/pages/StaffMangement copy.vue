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
              <TableCell class="text-center">
                <span v-if="storeAuth.user.uid === storeAuth.role.clinicId">
                  <span v-if="staff.role==='admin'">All</span>
                  <span v-else >{{ staff.permissions.length }}</span>
                </span>
                <span v-else>****</span>
              </TableCell>
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

      <!-- Modal Dialog -->
      <Dialog :open="permissionsModal" @update:open="permissionsModal = $event">
        <!-- <DialogTrigger as-child>
          <Button variant="outline">
            Edit Profile
          </Button>
        </DialogTrigger> -->
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <form id="dialogForm" @submit="handleSubmit($event, onSubmit)">
            <FormField v-slot="{ componentField }" name="username">
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="shadcn" v-bind="componentField" />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
          </form>

          <DialogFooter>
            <Button type="submit" form="dialogForm">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue';
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
import { Button } from "src/components/ui/button"; // ShadCN button
import { Pencil } from 'lucide-vue-next';
import { useStoreAuth } from 'src/stores/storeAuth';
import { useStoreSettings } from 'src/stores/storeSettings';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from 'src/components/ui/form';
import { Input } from 'src/components/ui/input';
import { toast } from 'src/components/ui/toast';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';

const storeAuth = useStoreAuth();
const storeSettings = useStoreSettings();

// Example data for doctors and staff
const staffData = computed(() => {
  console.log(storeAuth.doctors, 'storeAuth.doctors');
  return storeAuth.doctors;
});

const formSchema = toTypedSchema(z.object({
  username: z.string().min(2).max(50),
}));

function onSubmit(values: any) {
  console.log('ho');
  toast({
    title: 'You submitted the following values:',
    description: h('pre', { class: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4' }, h('code', { class: 'text-white' }, JSON.stringify(values, null, 2))),
    variant: 'default',
    duration: 5000
  });
}

const permissionsModal = ref(false);

const openPermissionsModal = (staff: any) => {
  permissionsModal.value = true; // Open the modal
  console.log(`Editing permissions for ${staff.name}`);
};

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
