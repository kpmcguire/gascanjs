<template lang="pug">
  div.flex.flex-col.h-full
    .header.bg-bg
      .max-w-6xl.mx-auto
        h1 
          img.logo(src="/images/gascan.svg" alt="Gascan - Gas Mileage Tracker")
    .main.max-w-6xl.mx-auto.flex-1.p-5.w-full
      h2.font-bold.text-2xl.mb-3 Your Cars
      ul.mb-3.-m-2.flex.content-between
        li.m-2(v-for="(mpg, car) in total_avgMPG") 
          div.text-gray-600.mb-1 {{car}} 
          div.text-white.bg-bg.px-3.py-1.rounded.leading-tight
            div.text-sm MPG
            div.text-2xl.font-bold {{mpg}}

      section.fillupsapp(v-cloak)
        a(href="#" v-if="!show_new_fillup" @click="show_new_fillup = !show_new_fillup" class="inline-block mb-5 bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full") Add new fillup
        form.border-solid.border-red-500.border-2.px-4.py-4.rounded(v-on:submit.prevent v-if="show_new_fillup")
          .flex.flex-wrap.-m-3
          
            div.flex.flex-wrap.w-40.items-center.m-3
              label(for="new_car")
                span.text-gray-700 Car                 
              button.new-car(@click="addNewCar" class="bg-blue-400 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-full text-xs ml-2") add car
              select#new_car(v-model="fillup_car" class="bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline block w-full mt-2")
                option(value='' disabled) -- Select a Car --
                option(v-if="new_car" :value="fillup_car") {{fillup_car}}
                option(v-for="car in uniqueCars" :value="car.car") {{car.car}}

            label.m-3
              p.text-gray-700.mb-2 Date
              flat-pickr(v-model="fillup_date" :config="flatpickr_config" class="bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline w-56")
            label.m-3
              p.text-gray-700.mb-2 Starting Odometer
              input.fillup-starting-odo(type="text" v-model="fillup_starting_odo" pattern="[0-9]*" class="w-40 bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline")
            label.m-3
              p.text-gray-700.mb-2 Ending Odometer
              input.fillup-ending-odo(type="text" v-model="fillup_ending_odo" pattern="[0-9]*" class="w-40 bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline") 
            label.m-3
              p.text-gray-700.mb-2 Miles      
              div.leading-tight.py-2(v-if="fillup_ending_odo && fillup_starting_odo") {{(fillup_ending_odo - fillup_starting_odo).toFixed(2)}}
            label.m-3
              p.text-gray-700.mb-2 Gallons
              input.fillup-gallons(type="text" v-model="fillup_gallons" pattern="[0-9]*" class="w-40 bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline")
          div
            button.fillup-submit.block.mt-5(type="button" :disabled="!isValidNew()" @click="addFillup()" :class="{'opacity-50 pointer-events-none': !isValidNew(), 'hover:bg-orange-700': isValidNew() }" class="inline-block bg-orange-500 text-white font-bold py-2 px-4 rounded-full") Save
            button(@click="show_new_fillup = !show_new_fillup" class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full ml-2") Cancel
          
        div(v-for="fillup in recentFillups").border-t-2.border-gray-500.border-solid
          form.border-solid.border-red-500.border-2.px-4.py-4.rounded.my-5(v-if="fillup.editing" v-on:submit.prevent="doFillupEdit(fillup)")
            .flex.flex-wrap.-m-3
            
              div.flex.flex-wrap.w-40.items-center.m-3
                label(for="new_car")
                  span.text-gray-700 Car                 
                button.new-car(@click="addNewCarEdit" class="bg-blue-400 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-full text-xs ml-2") add car
                select#new_car(v-model="fillup.car" class="bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline block w-full mt-2")
                  option(value='' disabled) -- Select a Car --
                  option(v-for="car in uniqueCars" :value="car.car") {{car.car}}

              label.m-3
                p.text-gray-700.mb-2 Date

                flat-pickr(v-model="fillup.date" :config="flatpickr_config" class="bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline w-56")
              label.m-3
                p.text-gray-700.mb-2 Starting Odometer
                input(type="text" v-model="fillup.starting_odo" pattern="[0-9]*" class="bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline w-40") 
              label.m-3
                p.text-gray-700.mb-2 Ending Odometer            
                input(type="text" v-model="fillup.ending_odo" pattern="[0-9]*" class="bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline w-40") 
              label.m-3
                p.text-gray-700.mb-2 Miles
                div.leading-tight.py-2(v-if="fillup.ending_odo && fillup.starting_odo") {{(fillup.ending_odo - fillup.starting_odo).toFixed(2)}}

              label.m-3
                p.text-gray-700.mb-2 Starting Odometer              
                input(type="text" v-model="fillup.gallons" pattern="[0-9]*" class="bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline w-40 mr-4") 

              .m-3.self-end
                button.save(:disabled="!isValid(fillup)" :class="{'opacity-50 pointer-events-none': !isValid(fillup), 'hover:bg-orange-700': isValid(fillup) }" class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-1 px-3 rounded-full text-xs") Save

                button.cancel(@click="cancelFillupEdit(fillup)" class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded-full text-xs ml-2") Cancel
            
          div(v-else)
            ul.mb-5.pt-5
              .flex
                div
                  li 
                    div.rounded.text-bg.px-2.py-1.leading-tight.mr-2.border-solid.border-red-500.border-2
                      div MPG
                      span.text-2xl.font-bold {{fillup_avgMPG(fillup.ending_odo - fillup.starting_odo, fillup.gallons)}}            
                div.leading-relaxed
                  li {{dateString(fillup.date)}} 
                  div.flex.-m-1
                    li.m-1
                      span.font-bold Car: 
                      | {{fillup.car}} 
                    li.m-1
                      span.font-bold Miles: 
                      | {{(fillup.ending_odo - fillup.starting_odo).toFixed(2)}} 
                    li.m-1
                      span.font-bold Gallons: 
                      | {{fillup.gallons}} 
                  li.mt-1
                    button.destroy(@click="removeFillup(fillup)" class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded-full text-xs") Remove
                    button.edit(@click="editFillup(fillup)" class="bg-teal-500 hover:bg-teal-700 text-white font-bold py-1 px-3 rounded-full text-xs ml-2") Edit


    .footer.py-5.px-10.bg-fg
      .max-w-6xl.mx-auto
        .m.flex.items-center(class="lg:px-8")
          span.letter M
          p 
            a(href="https://kpmcguire.github.io") McGuire Gas Company


</template>

<script src="./app.js"></script>
<style lang="scss" src="./app.scss"></style>


