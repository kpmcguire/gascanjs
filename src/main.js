import Vue from 'vue'
import App from './App.vue'
import "@/assets/scss/tailwind.min.css";

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
