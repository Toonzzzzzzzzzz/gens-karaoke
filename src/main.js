import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'vuetify/styles' // 💡 Vuetify CSS
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
    },
})

const app = createApp(App)

app.use(router)
app.use(vuetify)
app.use(Toast)
app.use(VueSweetalert2)
app.config.globalProperties.$router = router

app.mount('#app')
