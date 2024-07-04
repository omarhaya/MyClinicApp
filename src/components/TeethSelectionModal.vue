<template>
  <!-- Palmer notation
 Permanent Dentition
 upper right	                         upper left
 8⏌	7⏌	6⏌	5⏌	4⏌	3⏌	2⏌	1⏌	⎿1	⎿2	⎿3	⎿4	⎿5	⎿6	⎿7	⎿8
 8⏋	7⏋	6⏋	5⏋	4⏋	3⏋	2⏋	1⏋	⎾1	⎾2	⎾3	⎾4	⎾5	⎾6	⎾7	⎾8
 lower right	lower left
 Primary Dentition
 upper right	upper left
 E⏌	D⏌	C⏌	B⏌	A⏌	⎿A	⎿B	⎿C	⎿D	⎿E
 E⏋	D⏋	C⏋	B⏋	A⏋	⎾A	⎾B	⎾C	⎾D	⎾E
 lower right	lower left -->
   <q-card style="min-width: 350px">
      <q-toolbar class="bg-primary text-white" style="min-width: 340px;,background-color=red;">
            <q-toolbar-title >
              Add New Appointment
            </q-toolbar-title>
            <q-btn flat round color="white" icon="close" v-close-popup></q-btn>
          </q-toolbar>
 <div class="q-pa-md">
    <div class="row">

      <!--
        Rendering a <label> tag (notice tag="label")
        so QCheckboxes will respond to clicks on QItems to
        change Toggle state.
      -->
      <q-item
        class="col"

        v-ripple
        :active="workItem.teeth.includes('8⏌')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="8⏌" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">8⏌</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('7⏌')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="7⏌" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">7⏌</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('6⏌')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="6⏌" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">6⏌</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('5⏌')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="5⏌" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">5⏌</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('4⏌')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="4⏌" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">4⏌</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('3⏌')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="3⏌" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">3⏌</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('2⏌')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="2⏌" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">2⏌</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('1⏌')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="1⏌" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">1⏌</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('⎿1')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="⎿1" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">⎿1</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('⎿2')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="⎿2" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">⎿2</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('⎿3')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="⎿3" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">⎿3</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('⎿4')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="⎿4" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">⎿4</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('⎿5')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="⎿5" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">⎿5</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('⎿6')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="⎿6" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">⎿6</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('⎿7')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="⎿7" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">⎿7</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('⎿8')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="⎿8" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">⎿8</q-item-label>

      </q-item>


    </div>
    <div class="row">

<!--
Decidious Teeth
-->

<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('8⏋')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="8⏋" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">8⏋</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('7⏋')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="7⏋" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">7⏋</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('6⏋')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="6⏋" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">6⏋</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('5⏋')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="5⏋" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">5⏋</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('4⏋')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="4⏋" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">4⏋</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('3⏋')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="3⏋" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">3⏋</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('2⏋')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="2⏋" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">2⏋</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('1⏋')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="1⏋" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">1⏋</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('⎾1')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="⎾1" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">⎾1</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('⎾2')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="⎾2" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">⎾2</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('⎾3')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="⎾3" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">⎾3</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('⎾4')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="⎾4" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">⎾4</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('⎾5')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="⎾5" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">⎾5</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('⎾6')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="⎾6" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">⎾6</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('⎾7')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="⎾7" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">⎾7</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('⎾8')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="⎾8" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">⎾8</q-item-label>

</q-item>


</div>

    <div class="q-px-sm q-mt-sm">
      Your selection is: <strong>{{ workItem.teeth }}</strong>
    </div>
  </div>

 <div class="q-pa-md">
    <div class="row">

      <!--
Decidious
      -->


      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('E⏌')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="E⏌" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">E⏌</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('D⏌')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="D⏌" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">D⏌</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('C⏌')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="C⏌" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">C⏌</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('B⏌')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="B⏌" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">B⏌</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('A⏌')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="A⏌" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">A⏌</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('⎿A')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="⎿A" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">⎿A</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('⎿B')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="⎿B" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">⎿B</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('⎿C')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="⎿C" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">⎿C</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('⎿D')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="⎿D" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">⎿D</q-item-label>

      </q-item>
      <q-item
        class="col"
        v-ripple
        :active="workItem.teeth.includes('⎿E')"
        tag="label"
        active-class="selected-tooth"
      >
        <q-item-section avatar>
          <q-checkbox v-show="false" v-model="workItem.teeth" val="⎿E" color="teal" />
        </q-item-section>
          <q-item-label class="absolute">⎿E</q-item-label>

      </q-item>



    </div>
    <div class="row">

<!--
  Rendering a <label> tag (notice tag="label")
  so QCheckboxes will respond to clicks on QItems to
  change Toggle state.
-->

<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('E⏋')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="E⏋" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">E⏋</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('D⏋')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="D⏋" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">D⏋</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('C⏋')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="C⏋" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">C⏋</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('B⏋')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="B⏋" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">B⏋</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('A⏋')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="A⏋" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">A⏋</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('⎾A')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="⎾A" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">⎾A</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('⎾B')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="⎾B" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">⎾B</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('⎾C')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="⎾C" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">⎾C</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('⎾D')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="⎾D" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">⎾D</q-item-label>

</q-item>
<q-item
  class="col"
  v-ripple
  :active="workItem.teeth.includes('⎾E')"
  tag="label"
  active-class="selected-tooth"
>
  <q-item-section avatar>
    <q-checkbox v-show="false" v-model="workItem.teeth" val="⎾E" color="teal" />
  </q-item-section>
    <q-item-label class="absolute">⎾E</q-item-label>

</q-item>


</div>

  </div>
</q-card>
</template>

 <script setup>
import { ref,getCurrentInstance,watch } from 'vue'
const props = defineProps({
  workItem:{
    type : Object,
    required:true
  }
})
const tooth=ref([])
const instance = getCurrentInstance()
// Emitting the 'tooth' value to the parent component
watch(props.workItem.teeth, (newValue, oldValue) => {
  if(newValue){
    instance.emit('toothSelected', props.workItem.teeth)
  }
})

 </script>

<style lang="sass">
.selected-tooth
  color: white
  background: #8a89858a
</style>
