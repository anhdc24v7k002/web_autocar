<template>
  <section class="admin-content">
    <h1>Quản lý danh sách xe</h1>

    <router-link to="/admin/cars/add" class="admin-btn">
      + Thêm xe
    </router-link>

    <table>
      <thead>
        <tr>
          <th>Tên xe</th>
          <th>Hãng xe</th>
          <th>Loại xe</th>
          <th>Số ghế</th>
          <th>Giá thuê</th>
          <th>Chức năng</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="car in cars" :key="car._id">
          <td>{{ car.name }}</td>
          <td>{{ car.brand?.name || "Chưa có hãng" }}</td>
          <td>{{ car.type?.name || "Chưa có loại xe" }}</td>
          <td>{{ car.seats }}</td>
          <td>{{ formatMoney(car.pricePerDay) }}</td>
          <td>
            <router-link :to="`/admin/cars/edit/${car._id}`" class="edit-btn">
              Sửa
            </router-link>
            <button class="delete-btn" @click="deleteCar(car._id)">Xóa</button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../services/api";

const cars = ref([]);

const getCars = async () => {
  const res = await api.get("/cars");
  cars.value = res.data;
};

const getBrandName = (brand) => {
  if (!brand) return "Chưa có hãng";

  if (typeof brand === "object") {
    return brand.name || "Chưa có hãng";
  }

  return brand;
};

const formatMoney = (value) => {
  return Number(value || 0).toLocaleString("vi-VN") + " đ";
};

const deleteCar = async (id) => {
  const confirmDelete = confirm("Bạn có chắc muốn xóa xe này không?");
  if (!confirmDelete) return;

  await api.delete(`/admin/cars/${id}`);
  alert("Xóa xe thành công.");
  getCars();
};

onMounted(() => {
  getCars();
});
</script>
<style scoped>
.admin-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 50px 24px;
}

.admin-content h1 {
  font-size: 36px;
  margin-bottom: 12px;
}

.admin-content p {
  font-size: 18px;
  margin-bottom: 24px;
}

.admin-btn {
  display: inline-block;
  background: #ff6b1a;
  color: white;
  text-decoration: none;
  border: none;
  padding: 12px 18px;
  border-radius: 8px;
  font-weight: 700;
  margin-bottom: 20px;
  cursor: pointer;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

thead {
  background: #081225;
  color: white;
}

th,
td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.edit-btn {
  display: inline-block;
  background: #2563eb;
  color: white;
  text-decoration: none;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  margin-right: 8px;
  cursor: pointer;
}

.delete-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}
</style>
