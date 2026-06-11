import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './styles/lay-theme.css'
import './styles/lay-frontend.css'
import './styles/lay-site.css'
import './styles/wp-custom.css'
import './styles/grids.css'
import './styles/grids-subpages.css'
import './styles/ninja-forms.css'
import './styles/site-extra.css'
import './styles/optimizations.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
