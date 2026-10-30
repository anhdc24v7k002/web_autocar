<template>
  <section class="admin-content">
    <h1>Quản lý tài khoản khách hàng</h1>
    <p>Danh sách tài khoản khách hàng trong hệ thống.</p>
    <router-link to="/admin/customers/add" class="admin-btn">
      Thêm khách hàng
    </router-link>
    <table class="customer-table">
      <thead>
        <tr>
          <th>Họ tên</th>
          <th>Email</th>
          <th>Số điện thoại</th>
          <th>Vai trò</th>
          <th>Ngày tạo</th>
          <th>Ngày cập nhật</th>
          <th>Chức năng</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="user in customers" :key="user._id">
          <td>{{ user.fullName }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.phone || "Chưa cập nhật" }}</td>
          <td>{{ user.role }}</td>
          <td>{{ formatDate(user.createdAt) }}</td>
          <td>{{ formatDate(user.updatedAt) }}</td>
          <td>
            <div class="action-buttons">
              <router-link
                :to="`/admin/customers/${user._id}/rentals`"
                class="view-btn"
              >
                Xem đơn
              </router-link>

              <router-link
                :to="`/admin/customers/edit/${user._id}`"
                class="edit-btn"
              >
                Sửa
              </router-link>

              <button class="delete-btn" @click="deleteCustomer(user._id)">
                Xóa
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../services/api";

const customers = ref([]);

const getCustomers = async () => {
  const res = await api.get("/admin/customers");
  customers.value = res.data;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("vi-VN");
};

onMounted(() => {
  getCustomers();
});

const deleteCustomer = async (id) => {
  if (!confirm("Bạn có chắc muốn xóa tài khoản này không?")) return;

  await api.delete(`/admin/customers/${id}`);
  alert("Xóa khách hàng thành công.");
  getCustomers();
};
</script>

<style scoped>
.admin-content {
  max-width: 1300px;
  margin: 40px auto;
}

h1 {
  margin-bottom: 14px;
  color: #071739;
}

p {
  margin-bottom: 25px;
  color: #374151;
}

.admin-btn {
  display: inline-block;
  margin-bottom: 20px;
  background: #ff6b1a;
  color: white;
  padding: 12px 18px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  transition: 0.3s;
}

.admin-btn:hover {
  background: #ea580c;
}

.customer-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.customer-table thead {
  background: #071739;
  color: white;
}

.customer-table th,
.customer-table td {
  padding: 18px;
  text-align: left;
}

.customer-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
}

.customer-table tbody tr:hover {
  background: #f9fafb;
}

.action-buttons {
  display: flex;
  gap: 14px;
  align-items: center;
}

.view-btn,
.edit-btn,
.delete-btn {
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  color: white;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  font-weight: 600;
}

.view-btn {
  background: #16a34a;
}

.view-btn:hover {
  background: #15803d;
}

.edit-btn {
  background: #2563eb;
}

.edit-btn:hover {
  background: #1d4ed8;
}

.delete-btn {
  background: #ef4444;
}

.delete-btn:hover {
  background: #dc2626;
}
</style>
