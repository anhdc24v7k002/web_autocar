<template>
  <section class="section container">
    <h2 class="section-title">Xe đã thuê</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Xe</th>
          <th>Khách hàng</th>
          <th>Ngày nhận</th>
          <th>Thời gian nhận</th>
          <th>Ngày trả</th>
          <th>Thời gian trả</th>
          <th>Tổng tiền</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="rental in rentals" :key="rental._id">
          <td>{{ rental.car?.name }}</td>
          <td>{{ rental.customerName }}</td>
          <td>{{ formatDate(rental.startDate) }}</td>
          <td>{{ formatTime(rental.startDate) }}</td>
          <td>{{ formatDate(rental.endDate) }}</td>
          <td>{{ formatTime(rental.endDate) }}</td>
          <td>{{ Number(rental.totalPrice).toLocaleString("vi-VN") }} đ</td>
          <td>{{ rental.status }}</td>
          <td>
            <button
              v-if="rental.status === 'pending'"
              class="cancel-btn"
              @click="cancelRental(rental._id)"
            >
              Hủy đơn
            </button>

            <span v-else>-</span>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
<script setup>
import { ref, onMounted } from "vue";
import api from "../services/api";

const rentals = ref([]);

const getRentals = async () => {
  const res = await api.get("/rentals/my-rentals");
  rentals.value = res.data;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("vi-VN");
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(() => {
  getRentals();
});

const cancelRental = async (id) => {
  if (!confirm("Bạn có chắc muốn hủy đơn thuê này?")) return;

  try {
    await api.put(`/rentals/${id}/cancel`);

    alert("Hủy đơn thành công.");

    getRentals();
  } catch (err) {
    alert(err.response?.data?.message || "Không thể hủy đơn.");
  }
};
</script>

<style>
.cancel-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 7px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}

.cancel-btn:hover {
  background: #bb2d3b;
}
</style>
