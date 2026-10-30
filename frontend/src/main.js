import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./assets/style.css";
import vue3GoogleLogin from "vue3-google-login";

const app = createApp(App);

app.use(router);

app.use(vue3GoogleLogin, {
  clientId:
    "1062490519733-entrk6hv21jknmnp5kpv2b06lncavr07.apps.googleusercontent.com",
});

app.mount("#app");
