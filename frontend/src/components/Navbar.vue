<template>
  <header class="header">
    <div class="container nav">
      <h1 class="logo">Auto <span>Car</span></h1>

      <ul class="menu">
        <li>
          <router-link to="/">Trang chủ</router-link>
        </li>

        <li>
          <router-link to="/cars">Danh sách xe</router-link>
        </li>

        <template v-if="isLoggedIn">
          <li v-if="isAdmin">
            <router-link to="/admin">Quản trị viên</router-link>
          </li>
          <li>
            <router-link to="/schedule">Lịch thuê xe</router-link>
          </li>

          <li v-if="!isAdmin">
            <router-link to="/rented-status">Xe của tôi</router-link>
          </li>

          <li v-if="!isAdmin">
            <router-link to="/my-account"> Tài khoản của tôi </router-link>
          </li>

          <li v-if="!isAdmin">
            <router-link to="/contact">Liên hệ</router-link>
          </li>

          <li>
            <a href="#" @click.prevent="logout">Đăng xuất</a>
          </li>
        </template>

        <template v-else>
          <li>
            <router-link to="/login">Đăng nhập</router-link>
          </li>

          <li>
            <router-link to="/register">Đăng ký</router-link>
          </li>
        </template>
      </ul>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const isLoggedIn = ref(false);
const isAdmin = ref(false);

const checkLogin = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  isLoggedIn.value = !!token;
  isAdmin.value = user?.role === "admin";
};

onMounted(() => {
  checkLogin();
  window.addEventListener("storage", checkLogin);
});

onUnmounted(() => {
  window.removeEventListener("storage", checkLogin);
});

watch(
  () => route.fullPath,
  () => {
    checkLogin();
  },
);

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");

  checkLogin();
  router.push("/login");
};
</script>
