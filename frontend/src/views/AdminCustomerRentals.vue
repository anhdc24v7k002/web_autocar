<template>
  <section class="admin-content">
    <h1>Đơn thuê xe của khách hàng</h1>

    <table class="rental-table">
      <thead>
        <tr>
          <th>Xe</th>
          <th>Ngày nhận</th>
          <th>Thời gian nhận</th>
          <th>Ngày trả</th>
          <th>Thời gian trả</th>
          <th>Tổng tiền</th>
          <th>Trạng thái</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="rental in rentals" :key="rental._id">
          <td>{{ rental.car?.name }}</td>
          <td>{{ formatDate(rental.startDate) }}</td>
          <td>{{ formatTime(rental.startDate) }}</td>
          <td>{{ formatDate(rental.endDate) }}</td>
          <td>{{ formatTime(rental.endDate) }}</td>
          <td>{{ formatMoney(rental.totalPrice) }}</td>
          <td>{{ rental.status }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "../services/api";

const route = useRoute();

const rentals = ref([]);

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

const getRentals = async () => {
  const res = await api.get(`/admin/customers/${route.params.id}/rentals`);

  rentals.value = res.data;
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN");
};

const formatTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(() => {
  getRentals();
});
</script>

<style scoped>
.admin-content {
  max-width: 1200px;
  margin: 40px auto;
}

h1 {
  margin-bottom: 30px;
  color: #0b163f;
}

.rental-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 14px;
  overflow: hidden;
}

.rental-table thead {
  background: #071739;
  color: white;
}

.rental-table th,
.rental-table td {
  padding: 16px;
  text-align: left;
}

.rental-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
}
</style>
