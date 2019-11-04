var FILLUPSTORAGE_KEY = 'gascan-fillups'
import _ from 'lodash'
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';


var fillupStorage = {
  fetch: function(){
    return JSON.parse(localStorage.getItem(FILLUPSTORAGE_KEY) || '[]')
  },
  save: function (fillups){
    localStorage.setItem(FILLUPSTORAGE_KEY, JSON.stringify(fillups))
  }
}


export default {
  name: 'app',
  data: function () {
    return {
      fillups: fillupStorage.fetch(),
      fillup_gallons: '',
      fillup_car: '',
      fillup_date: new Date(),
      flatpickr_config: {
        altInput: true,
        altFormat: 'M j, Y h:i K',
        enableTime: true
      },
      fillup_starting_odo: '',
      fillup_ending_odo: '',
      new_car: '',
      show_new_fillup: false,
      cache: {},
      record: {}
    }
  },
  watch: {
    fillups: {
      deep: true,
      handler: fillupStorage.save
    }
  },
  components: {
    flatPickr
  },
  computed: {
    total_avgMPG: function() {

      let cars = {}
      this.fillups.forEach(function (item) {
        var list = cars[item.car]

        if (list) {
          list.push(item)
        } else {
          cars[item.car] = [item]
        }
      })

      let output = {}

      Object.keys(cars).forEach(function (key) {
        let name = ''
        let gallons = 0
        let miles = 0

        cars[key].forEach(function (car) {
          name = car.car
          let miles_driven = Number(car.ending_odo - car.starting_odo)
          let gallons_filled = Number(car.gallons)
          miles += miles_driven
          gallons += gallons_filled
        })

        output[name] = (miles/gallons).toFixed(3)

      })

      return(output)
    },
    uniqueCars() {
      return this.fillups.reduce((seed, current) => {
        return Object.assign(seed, {
          [current.car]: current
        });
      }, {});      
    }, 
    recentFillups() {
      return _.sortBy(this.fillups, 'date').reverse()
    },
  },
  methods: {

    fillup_avgMPG: function(miles, gallons) {
      return (miles/gallons).toFixed(1)
    },

    pluralize: function (word, count) {
      return word + (count === 1 ? '' : 's');
    },

    addFillup: function() {
      let car = this.fillup_car
      let date = this.fillup_date
      let gallons = this.fillup_gallons
      let ending_odo = this.fillup_ending_odo
      let starting_odo = this.fillup_starting_odo

      this.fillups.push({
        id: this.fillups.length + 1,
        car: car,
        date: date,
        gallons: gallons,
        ending_odo: ending_odo,
        starting_odo: starting_odo,
        editing: false
      })
      this.fillup_gallons = ''
      this.fillup_date = new Date()
      this.fillup_ending_odo = ''
      this.fillup_starting_odo = this.recentFillups[0].ending_odo
      this.show_new_fillup = false
    },
    addNewCarEdit: function(item) {
      this.new_car = window.prompt('Nickname for Car:')
      item.car = this.new_car
    },
    addNewCar: function() {
      this.new_car = window.prompt('Nickname for Car:')
      this.fillup_car = this.new_car
    },
    isValid: function(fillup) {
      if (
        fillup.car != '' && 
        fillup.gallons != '' && 
        fillup.ending_odo != '' && 
        fillup.starting_odo != '' && 
        fillup.date != '') {
        return true
      } else {
        return false
      }
    },
    isValidNew: function() {
      if (
        this.fillup_car != '' && 
        this.fillup_gallons != '' && 
        this.fillup_ending_odo != '' && 
        this.fillup_starting_odo != '' && 
        this.fillup_date != '') {
        return true
      } else {
        return false
      }
    },    

    removeFillup: function(fillup) {
      let index = this.fillups.indexOf(fillup)
      this.fillups.splice(index, 1)
    },

    editFillup: function(record) {
      record.editing = true
      this.record = _.cloneDeep(record);
      this.cache = record;
    },

    cancelFillupEdit: function(record) {
      Object.assign(record, this.record)
      record.editing = false
      this.cache = {}
      this.record = {}
    },

    doFillupEdit: function (record) {
      record.editing = false
      var index = _.indexOf(this.fillups, this.cache);
      this.fillups.splice(index, 1, record);
    },
    dateString: function(date) {
      let options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric'
      }
      return new Date(date).toLocaleString('en-US', options)
    }
  },
  created() {
    if (this.recentFillups[0].car) {
      this.fillup_car = this.recentFillups[0].car
    }

    this.fillup_starting_odo = this.recentFillups[0].ending_odo
  }

}