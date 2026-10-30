<template>
  <section class="admin-content">
    <h2>Quản lý danh sách thuê xe</h2>

    <div class="rental-toolbar">
      <input
        v-model="searchCustomer"
        type="text"
        placeholder="Tìm kiếm theo tên khách hàng..."
        class="search-input"
      />

      <router-link to="/admin/rentals/add" class="admin-btn">
        Thêm đơn thuê
      </router-link>
    </div>

    <table>
      <thead>
        <tr>
          <th>Xe</th>
          <th>Khách hàng</th>
          <th>Ngày nhận</th>
          <th>Ngày trả</th>
          <th>Tổng tiền</th>
          <th>Thanh toán</th>
          <th>Trạng thái</th>
          <th>Chức năng</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="rental in unfinishedRentals" :key="rental._id">
          <td>{{ rental.car?.name }}</td>
          <td>{{ rental.customerName }}</td>
          <td>{{ formatDate(rental.startDate) }}</td>
          <td>{{ formatDate(rental.endDate) }}</td>
          <td>{{ formatMoney(rental.totalPrice) }}</td>
          <td>
            {{ rental.paymentMethod?.name || "Chưa cập nhật" }}
          </td>
          <td>{{ rental.status }}</td>
          <td>
            <router-link
              :to="`/admin/rentals/edit/${rental._id}`"
              class="edit-btn"
            >
              Sửa
            </router-link>
            <button class="delete-btn" @click="deleteRental(rental._id)">
              Xóa
            </button>
            <button class="complete-btn" @click="completeRental(rental._id)">
              Hoàn tất
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
  <section class="completed-section">
    <h2 class="completed-title">Danh sách đơn thuê đã giao dịch thành công</h2>

    <div class="table-wrapper">
      <table class="rental-table">
        <thead>
          <tr>
            <th>Xe</th>
            <th>Khách hàng</th>
            <th>Ngày nhận</th>
            <th>Ngày trả</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="rental in completedRentals" :key="rental._id">
            <td>{{ rental.car?.name }}</td>
            <td>{{ rental.customerName }}</td>
            <td>{{ formatDate(rental.startDate) }}</td>
            <td>{{ formatDate(rental.endDate) }}</td>
            <td>{{ formatMoney(rental.totalPrice) }}</td>
            <td>{{ rental.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../services/api";

const rentals = ref([]);

const searchCustomer = ref("");

const getRentals = async () => {
  const res = await api.get("/admin/rentals");
  rentals.value = res.data;
};

const formatMoney = (value) => {
  return Number(value || 0).toLocaleString("vi-VN") + " đ";
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("vi-VN");
};

onMounted(() => {
  getRentals();
});
const deleteRental = async (id) => {
  const confirmDelete = confirm("Bạn có chắc muốn xóa đơn thuê này không?");
  if (!confirmDelete) return;

  await api.delete(`/admin/rentals/${id}`);
  alert("Xóa đơn thuê thành công.");
  getRentals();
};

const unfinishedRentals = computed(() => {
  return rentals.value.filter((item) => {
    const matchStatus = item.status !== "completed";
    const matchName = item.customerName
      ?.toLowerCase()
      .includes(searchCustomer.value.toLowerCase());

    return matchStatus && matchName;
  });
});

const completedRentals = computed(() => {
  return rentals.value.filter((item) => {
    const matchStatus = item.status === "completed";
    const matchName = item.customerName
      ?.toLowerCase()
      .includes(searchCustomer.value.toLowerCase());

    return matchStatus && matchName;
  });
});

const completeRental = async (id) => {
  if (!confirm("Xác nhận đơn thuê này đã giao dịch thành công?")) return;

  await api.put(`/admin/rentals/${id}`, {
    status: "completed",
  });

  alert("Đơn thuê đã được chuyển sang trạng thái thành công.");
  getRentals();
};

//thanh toán
const formatPayment = (method) => {
  const methods = {
    cash: "Tiền mặt",
    bank_transfer: "Chuyển khoản",
    momo: "MoMo",
    zalopay: "ZaloPay",
  };

  return methods[method] || "Chưa cập nhật";
};
</script>
<style scoped>
.admin-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: 50px 24px;
}

.admin-content h1 {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 14px;
  color: #0f172a;
}

.admin-content p {
  font-size: 20px;
  margin-bottom: 28px;
  color: #374151;
}

.admin-btn {
  display: inline-block;
  background: #ff6b1a;
  color: white;
  text-decoration: none;
  border: none;
  padding: 14px 22px;
  border-radius: 10px;
  font-weight: 700;
  margin-bottom: 24px;
  transition: 0.3s;
  cursor: pointer;
}

.admin-btn:hover {
  background: #ea580c;
  transform: translateY(-2px);
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

thead {
  background: #020f2d;
  color: white;
}

th {
  padding: 16px;
  font-size: 18px;
  font-weight: 700;
  text-align: left;
}

td {
  padding: 14px 16px;
  font-size: 16px;
  border-bottom: 1px solid #e5e7eb;
  color: #1f2937;
}

tbody tr {
  transition: 0.3s;
}

tbody tr:hover {
  background: #f8fafc;
}

.edit-btn {
  display: inline-block;
  background: #2563eb;
  color: white;
  text-decoration: none;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 700;
  margin-right: 10px;
  transition: 0.3s;
  cursor: pointer;
  font-size: 14px;
}

.edit-btn:hover {
  background: #1d4ed8;
}

.delete-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 700;
  transition: 0.3s;
  cursor: pointer;
  font-size: 14px;
}

.delete-btn:hover {
  background: #b91c1c;
}

.status-pending {
  color: #d97706;
  font-weight: 700;
}

.status-approved {
  color: #16a34a;
  font-weight: 700;
}

.status-cancelled {
  color: #dc2626;
  font-weight: 700;
}

@media (max-width: 992px) {
  .admin-content {
    padding: 30px 16px;
  }

  table {
    display: block;
    overflow-x: auto;
  }

  th,
  td {
    white-space: nowrap;
  }

  .admin-content h1 {
    font-size: 36px;
  }
}

.completed-section {
  max-width: 1300px;
  margin: 60px auto 0;
  padding: 50px 24px;
}

.completed-title {
  font-size: 26px;
  color: #071739;
  margin-bottom: 24px;
}

.completed-badge {
  background: #16a34a;
  color: white;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
}

.complete-btn {
  background: #16a34a;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.3s;
  margin-right: 8px;
  font-size: 14px;
}

.complete-btn:hover {
  background: #15803d;
}

.table-wrapper {
  width: 100%;
}

.rental-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.rental-table thead {
  background: #071739;
}

.rental-table th {
  color: white;
  padding: 18px;
  text-align: left;
  font-size: 17px;
}

.rental-table td {
  padding: 18px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 16px;
}

.rental-table tbody tr:hover {
  background: #f9fafb;
}

.rental-toolbar {
  max-width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.search-input {
  width: 360px;
  padding: 14px 16px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 16px;
}

.search-input:focus {
  outline: none;
  border-color: #ff6b1a;
}

.rental-toolbar .admin-btn {
  margin-bottom: 0;
}
</style>
