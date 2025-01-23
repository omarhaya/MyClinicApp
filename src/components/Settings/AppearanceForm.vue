<script setup lang="ts">
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from 'src/lib/registry/default/ui/form'
import { RadioGroup, RadioGroupItem } from 'src/lib/registry/default/ui/radio-group'
import { Button, buttonVariants } from 'src/lib/registry/new-york/ui/button'
import { Separator } from 'src/lib/registry/new-york/ui/separator'
import { Switch } from 'src/lib/registry/new-york/ui/switch'
import { toast } from 'src/lib/registry/new-york/ui/toast'
import { cn } from 'src/lib/utils'
import { ChevronDownIcon } from '@radix-icons/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { h,onMounted,ref,computed} from 'vue'
import * as z from 'zod'
import { useStoreSettings } from 'src/stores/storeSettings'

const storeSettings = useStoreSettings()

const appearanceFormSchema = toTypedSchema(z.object({
  theme: z.enum(['light', 'dark', 'system'], {
    required_error: 'Please select a theme.',
  }),
  font: z.enum(['inter', 'manrope', 'system'], {
    invalid_type_error: 'Select a font',
    required_error: 'Please select a font.',
  }),
  ministate: z.boolean(),
  enlarge_hover: z.boolean(),
}))

const loading = ref(true);

const { handleSubmit, setValues, resetForm } = useForm({
  validationSchema: appearanceFormSchema,
  initialValues: {}, // Start with empty values
});

const onSubmit = handleSubmit((values) => {
  console.log('values,',values)
  storeSettings.setTheme(values.theme);
  storeSettings.setFontContext(values.font);
  storeSettings.setMiniState(values.ministate);
  storeSettings.setEnlargeHover(values.enlarge_hover)

  toast({
    title: 'Preferences updated:',
    description: JSON.stringify(values, null, 2),
  });
});
const handleChange = () => {
  console.log('hiii')
}
onMounted(async () => {
  loading.value = true;
  try {
    await storeSettings.getSettings();

    // Set form values manually after fetching data
    setValues({
      theme: storeSettings.appearance.theme || 'system',
      font: storeSettings.appearance.fontContext || 'system',
      ministate: storeSettings.appearance.miniState ?? true, // Use nullish coalescing to handle undefined or null
      enlarge_hover: storeSettings.appearance.enlargeHover ?? true, // Only set true if undefined or null
    });
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">
      Appearance
    </h3>
    <p class="text-sm text-muted-foreground">
      Customize the appearance of the app. Automatically switch between day and night themes.
    </p>
  </div>
  <Separator />
  <form class="space-y-8" @submit="onSubmit">
    <!-- font FORM -->
    <!-- <FormField v-slot="{ field }" name="font">
      <FormItem>
        <FormLabel>Font</FormLabel>
        <div class="relative w-[200px]">
          <FormControl class="button-custom">
            <select
              :class="cn(
                buttonVariants({ variant: 'outline' }),
                'w-[200px] appearance-none font-normal',
              )"
              v-bind="field"
            >
              <option value="inter">
                Inter
              </option>
              <option value="manrope">
                Manrope
              </option>
              <option value="system">
                System
              </option>
            </select>
          </FormControl>
          <ChevronDownIcon class="pointer-events-none absolute right-3 top-2.5 h-4 w-4 opacity-50" />
        </div>
        <FormDescription>
          Set the font you want to use in the dashboard.
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField> -->

    <FormField v-slot="{ componentField }" type="radio" name="theme">
      <FormItem class="space-y-1">
        <FormLabel>Theme</FormLabel>
        <FormDescription>
          Select the theme for the dashboard.
        </FormDescription>
        <FormMessage />

        <RadioGroup
          class="grid max-w-xl grid-cols-3 gap-8 pt-2"
          v-bind="componentField"
        >
         <!-- Light Theme -->
          <FormItem>
            <FormLabel class="[&:has([data-state=checked])>div]:border-primary">
              <FormControl>
                <RadioGroupItem value="light" class="sr-only" />
              </FormControl>
              <div class="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                <div class="space-y-2 rounded-sm bg-[#ecedef] p-2">
                  <div class="space-y-2 rounded-md bg-white p-2 shadow-sm">
                    <div class="h-2 w-20 rounded-lg bg-[#ecedef]" />
                    <div class="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                  </div>
                  <div class="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                    <div class="h-4 w-4 rounded-full bg-[#ecedef]" />
                    <div class="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                  </div>
                  <div class="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                    <div class="h-4 w-4 rounded-full bg-[#ecedef]" />
                    <div class="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                  </div>
                </div>
              </div>
              <span class="block w-full p-2 text-center font-normal">
                Light
              </span>
            </FormLabel>
          </FormItem>
          <FormItem>
            <FormLabel class="[&:has([data-state=checked])>div]:border-primary">
              <FormControl>
                <RadioGroupItem value="dark" class="sr-only" />
              </FormControl>
              <div class="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
                <div class="space-y-2 rounded-sm bg-slate-950 p-2">
                  <div class="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                    <div class="h-2 w-20 rounded-lg bg-slate-400" />
                    <div class="h-2 w-[100px] rounded-lg bg-slate-400" />
                  </div>
                  <div class="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                    <div class="h-4 w-4 rounded-full bg-slate-400" />
                    <div class="h-2 w-[100px] rounded-lg bg-slate-400" />
                  </div>
                  <div class="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                    <div class="h-4 w-4 rounded-full bg-slate-400" />
                    <div class="h-2 w-[100px] rounded-lg bg-slate-400" />
                  </div>
                </div>
              </div>
              <span class="block w-full p-2 text-center font-normal">
                Dark
              </span>
            </FormLabel>
          </FormItem>
    <!-- System Theme -->
    <FormItem>
      <FormLabel class="[&:has([data-state=checked])>div]:border-primary">
        <FormControl>
          <RadioGroupItem value="system" class="sr-only" />
        </FormControl>
        <div class="w-full items-center rounded-md border-2 border-muted p-1 hover:border-accent">
          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-2 rounded-sm bg-[#ecedef] p-2">
              <div class="space-y-2 rounded-md bg-white p-2 shadow-sm">
                <div class="h-2 w-[20px] rounded-lg bg-[#ecedef]" />
                <div class="h-2 w-[25px] rounded-lg bg-[#ecedef]" />
              </div>
              <div class="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                <div class="h-4 w-4 rounded-full bg-[#ecedef]" />
                <div class="h-2 w-[15px] rounded-lg bg-[#ecedef]" />
              </div>
              <div class="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                    <div class="h-4 w-4 rounded-full bg-[#ecedef]" />
                    <div class="h-2 w-[15px] rounded-lg bg-[#ecedef]" />
              </div>
            </div>
            <div class="space-y-2 rounded-sm bg-slate-950 p-2">
              <div class="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                <div class="h-2 w-[20px] rounded-lg bg-slate-400" />
                <div class="h-2 w-[25px] rounded-lg bg-slate-400" />
              </div>
              <div class="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                <div class="h-4 w-4 rounded-full bg-slate-400" />
                <div class="h-2 w-[15px] rounded-lg bg-slate-400" />
              </div>
              <div class="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                    <div class="h-4 w-4 rounded-full bg-slate-400" />
                    <div class="h-2 w-[15px] rounded-lg bg-slate-400" />
              </div>
            </div>
          </div>
        </div>
        <span class="block w-full p-2 text-center font-normal">
                System
              </span>
      </FormLabel>
    </FormItem>
        </RadioGroup>
      </FormItem>
    </FormField>
    <FormField name="ministate" type="boolean" v-slot="{ value,handleChange }">
      <FormItem class="flex flex-row items-center justify-between rounded-lg border p-4">
        <div class="space-y-0.5">
          <FormLabel class="text-base">Side Bar MiniState</FormLabel>
          <FormDescription>View Side Bar In MiniState.</FormDescription>
        </div>
        <FormControl>
          <Switch
          :checked="value"
           @update:checked="handleChange"
        />
        </FormControl>
      </FormItem>
    </FormField>
    <FormField v-slot="{ handleChange, value }" type="checkbox" name="enlarge_hover">
          <FormItem class="flex flex-row items-center justify-between rounded-lg border p-4">
            <div class="space-y-0.5">
              <FormLabel class="text-base">
                Side Bar Auto Resize
              </FormLabel>
              <FormDescription>
                Enlarge the side bar on Mouse Hover.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                :checked="value"
                @update:checked="handleChange"
              />
            </FormControl>
          </FormItem>
        </FormField>
    <div class="flex justify-start">
      <Button :disabled="storeSettings.loading" type="submit">
        <span v-if="storeSettings.loading" class="flex items-center space-x-2">
      <q-spinner color="grey-8" size="2em" class="inline-block" />
      <span>Please wait</span>
    </span>
    <span v-else>
      Update preferences
    </span>
      </Button>
    </div>
  </form>
</template>
