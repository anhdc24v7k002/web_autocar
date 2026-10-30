<template>
  <section class="section container" v-if="car">
    <div class="detail">
      <img :src="car.image" :alt="car.name" />
      <div>
        <h2>{{ car.name }}</h2>
        <p>
          <strong>Hãng xe:</strong>
          {{ car.brand?.name || "Chưa có hãng" }}
        </p>
        <p>
          <strong>Loại xe:</strong>
          {{ car.type?.name || "Chưa có loại xe" }}
        </p>
        <p><b>Số chỗ:</b> {{ car.seats }}</p>
        <p>
          <b>Giá thuê:</b>
          <span class="price">{{ formatMoney(car.pricePerDay) }}/ngày</span>
        </p>
        <p>{{ car.description }}</p>
        <router-link :to="`/rent/${car._id}`" class="btn"
          >Thuê xe này</router-link
        >
      </div>
    </div>
  </section>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import api from "../services/api";
const route = useRoute();
const car = ref(null);
const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value,
  );
onMounted(async () => {
  car.value = (await api.get(`/cars/${route.params.id}`)).data;
});
</script>
