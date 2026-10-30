<template>
  <section class="admin-content">
    <h1>Chỉnh sửa đơn thuê xe</h1>

    <form class="form-box" @submit.prevent="updateRental">
      <select v-model="form.car" required>
        <option value="">Chọn xe</option>
        <option v-for="car in cars" :key="car._id" :value="car._id">
          {{ car.name }}
        </option>
      </select>

      <input
        v-model="form.customerName"
        placeholder="Tên khách hàng"
        required
      />
      <input v-model="form.phone" placeholder="Số điện thoại" required />
      <input v-model="form.address" placeholder="Địa chỉ" required />

      <label>Ngày nhận xe</label>
      <input v-model="form.startDate" type="date" required />

      <label>Ngày trả xe</label>
      <input v-model="form.endDate" type="date" required />

      <input
        v-model.number="form.totalPrice"
        type="number"
        placeholder="Tổng tiền"
        required
      />

      <select v-model="form.status">
        <option value="pending">pending</option>
        <option value="approved">approved</option>
        <option value="cancelled">cancelled</option>
      </select>

      <div class="form-actions">
        <button class="save-btn" type="submit">Cập nhật</button>
        <router-link to="/admin/rentals" class="cancel-btn">Hủy</router-link>
      </div>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";

const route = useRoute();
const router = useRouter();
const cars = ref([]);

const form = reactive({
  car: "",
  customerName: "",
  phone: "",
  address: "",
  startDate: "",
  endDate: "",
  totalPrice: "",
  status: "pending",
});

const formatDateInput = (date) => {
  return String(date).slice(0, 10);
};

const getCars = async () => {
  const res = await api.get("/cars");
  cars.value = res.data;
};

const getRental = async () => {
  const res = await api.get("/admin/rentals");
  const rental = res.data.find((item) => item._id === route.params.id);

  form.car = rental.car?._id || rental.car;
  form.customerName = rental.customerName;
  form.phone = rental.phone;
  form.address = rental.address;
  form.startDate = formatDateInput(rental.startDate);
  form.endDate = formatDateInput(rental.endDate);
  form.totalPrice = rental.totalPrice;
  form.status = rental.status;
};

const updateRental = async () => {
  await api.put(`/admin/rentals/${route.params.id}`, form);
  alert("Cập nhật đơn thuê thành công.");
  router.push("/admin/rentals");
};

onMounted(async () => {
  await getCars();
  await getRental();
});
</script>

<style scoped>
.admin-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 50px 24px;
}

.admin-content h1 {
  font-size: 36px;
  margin-bottom: 24px;
}

.form-box {
  background: white;
  padding: 28px;
  border-radius: 14px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.form-box input,
.form-box select {
  padding: 13px;
  border: 1px solid #ccd2dc;
  border-radius: 8px;
  font-size: 15px;
}

.form-box label {
  font-weight: 700;
}

.form-actions {
  grid-column: span 2;
}

.save-btn {
  background: #ff6b1a;
  color: white;
  border: none;
  padding: 12px 18px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.cancel-btn {
  display: inline-block;
  background: #6b7280;
  color: white;
  text-decoration: none;
  padding: 12px 18px;
  border-radius: 8px;
  font-weight: 700;
  margin-left: 10px;
}
</style>
