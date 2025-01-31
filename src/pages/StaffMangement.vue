<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "src/components/ui/table"; // ShadCN table components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from 'src/components/ui/dialog';
import { Checkbox } from 'src/lib/registry/new-york/ui/checkbox';
import { Form, FormControl, FormField, FormItem } from 'src/components/ui/form';
import { Button } from "src/components/ui/button"; // ShadCN button
import { Pencil,Loader2 } from 'lucide-vue-next';
import { useStoreAuth } from 'src/stores/storeAuth';
import { IonPage, IonContent } from '@ionic/vue';

const storeAuth = useStoreAuth();
const staffData = computed(() => storeAuth.doctors);

const tempPermissions = ref([]); // Stores temporary permissions
const originalPermissions = ref([]); // Stores the original permissions

// Function to update when the dialog opens or closes
const updateOpen = (event, staff) => {
  console.log(staff,'staff1')
  const staffItem = storeAuth.doctors.find((item) => item.doctorId === staff.doctorId);
  if (staffItem) {
    if (event) {
      // Store the original permissions when dialog opens
      originalPermissions.value = [...staffItem.permissions];
      tempPermissions.value = [...staffItem.permissions]; // Populate the temp permissions
    } else {
      // Reset tempPermissions to original when dialog closes without saving
      tempPermissions.value = [...originalPermissions.value];
    }
  }
}
const openDialog = ref<Record<string, boolean>>({});

// Function to handle form submission
const onSubmit = async (staff) => {
  storeAuth.loadingStaff=true
  const staffItem = storeAuth.doctors.find((item) => item.doctorId === staff.doctorId);
  if (staffItem) {
    staffItem.permissions = [...tempPermissions.value]; // Update the permissions
    try {
      await storeAuth.updateStaff(staffItem); // Wait for update to complete
      openDialog.value[staff.doctorId] = false; // Close the dialog after successful update
      storeAuth.loadingStaff=false
    } catch (error) {
      console.error("Failed to update staff:", error);
      // Optionally, show an error message using toast
      storeAuth.loadingStaff=false
    }
  }

};

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

    const aValue = a[key as keyof typeof a] as string | number;
    const bValue = b[key as keyof typeof b] as string | number;

    if (aValue < bValue) return -1 * modifier;
    if (aValue > bValue) return 1 * modifier;
    return 0;
  });
}

const categories = ref([
  "Patients",
  "Appointments",
  "Records",
  "Invoices",
  "Transactions",
]);

// Function to check if a permission exists
const hasPermission = (staff, permission) => {
  return tempPermissions.value.includes(permission); // Check in tempPermissions instead of staff object
};

// Function to toggle permission in the tempPermissions array
const togglePermission = (permission) => {
  const index = tempPermissions.value.indexOf(permission);
  if (index !== -1) {
    tempPermissions.value.splice(index, 1); // Remove if exists
  } else {
    tempPermissions.value.push(permission); // Add if not exists
  }
};

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
              <TableCell class="text-center">
                <span v-if="storeAuth.user.uid === storeAuth.role.clinicId">
                  <span v-if="staff.role === 'admin'">All</span>
                  <span v-else>{{ staff.permissions.length }}</span>
                </span>
                <span v-else>****</span>
              </TableCell>
              <TableCell class="text-right">
                <Form v-slot="{ handleSubmit }" as="" keep-values :validation-schema="formSchema">
                  <Dialog :open="openDialog[staff.doctorId] || false" @update:open="updateOpen($event, staff);openDialog[staff.doctorId ]=$event" >
                    <DialogTrigger as-child>
                      <Button
                        :disabled="storeAuth.user.uid !== storeAuth.role.clinicId"
                        variant="ghost"
                        size="sm"
                        @click="openDialog[staff.doctorId] = true"
                      >
                        <Pencil class="w-4 h-4 mr-1" />
                      </Button>
                    </DialogTrigger>

                    <DialogContent class="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Edit Account Permissions</DialogTitle>
                        <DialogDescription>
                          Change the permissions for User ({{ staff.name }}).
                        </DialogDescription>
                      </DialogHeader>

                      <form id="dialogForm" @submit="handleSubmit($event, () => onSubmit(staff))">
                        <!-- Permissions Table -->
                        <div class="mt-6 border-b pb-4">
                          <h3 class="text-lg font-semibold">Permissions</h3>

                          <!-- Table Header Row -->
                          <div class="grid grid-cols-[1.5fr,1fr,1fr,1fr] gap-4 mt-4 text-center font-medium">
                            <div class="text-left">Category</div>
                            <div>Add</div>
                            <div>Edit</div>
                            <div>Delete</div>
                          </div>

                          <!-- Loop through categories -->
                          <div v-for="category in categories" :key="category">
                            <div class="grid grid-cols-[1.5fr,1fr,1fr,1fr] gap-4 items-center">
                              <div class="font-medium text-left">{{ category }}</div>

                              <!-- Add Checkbox -->
                              <FormField v-slot="{ componentField }" :name="`${category}.add`">
                                <FormItem class="flex justify-center">
                                  <FormControl>
                                    <Checkbox
                                      v-bind="componentField"
                                      :checked="hasPermission(staff, `Add ${category}`)"
                                      @update:checked="togglePermission(`Add ${category}`)"
                                    />
                                  </FormControl>
                                </FormItem>
                              </FormField>

                              <!-- Edit Checkbox -->
                              <FormField v-slot="{ componentField }" :name="`${category}.edit`">
                                <FormItem class="flex justify-center">
                                  <FormControl>
                                    <Checkbox
                                      v-bind="componentField"
                                      :checked="hasPermission(staff, `Edit ${category}`)"
                                      @update:checked="togglePermission(`Edit ${category}`)"
                                    />
                                  </FormControl>
                                </FormItem>
                              </FormField>

                              <!-- Delete Checkbox -->
                              <FormField v-slot="{ componentField }" :name="`${category}.delete`">
                                <FormItem class="flex justify-center">
                                  <FormControl>
                                    <Checkbox
                                      v-bind="componentField"
                                      :checked="hasPermission(staff, `Delete ${category}`)"
                                      @update:checked="togglePermission(`Delete ${category}`)"
                                    />
                                  </FormControl>
                                </FormItem>
                              </FormField>
                            </div>
                          </div>
                        </div>
                      </form>

                      <DialogFooter>
                        <Button type="submit" form="dialogForm" :disabled="storeAuth.loadingStaff"><span v-if="!storeAuth.loadingStaff">Save changes</span> <span v-else class="flex items-center"> <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                          Please wait</span></Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </Form>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </ion-content>
  </ion-page>
</template>
