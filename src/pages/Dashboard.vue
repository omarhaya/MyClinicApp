<template>
</template>

<script setup>

import {ref,reactive,computed,onMounted,watch} from 'vue'
import { useRouter } from 'vue-router'

const router=useRouter()
onMounted(() => {
  router.push('/Invoices')

      })

</script>
