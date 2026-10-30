<template>
  <section class="admin-page">
    <aside class="sidebar">
      <h2>Auto Car</h2>

      <router-link to="/"> Trang chủ </router-link>

      <router-link to="/admin/cars"> Quản lý danh sách xe </router-link>
      <router-link to="/admin/car-brands"> Quản lý hãng xe </router-link>
      <router-link to="/admin/car-types"> Quản lý loại xe </router-link>
      <router-link to="/admin/transmissions"> Quản lý hộp số </router-link>
      <router-link to="/admin/payment-methods">
        Quản lý phương thức thanh toán
      </router-link>

      <router-link to="/admin/rentals"> Quản lý danh sách thuê xe </router-link>
      <router-link to="/admin/customers">
        Quản lý tài khoản khách hàng
      </router-link>
      <router-link to="/admin/contacts"> Danh sách liên hệ </router-link>
    </aside>

    <main class="admin-content">
      <h1>Quản Trị Viên</h1>
      <p class="breadcrumb">Auto Car / Thống kê doanh thu</p>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Doanh thu hôm nay</h3>
          <p>{{ formatMoney(revenueToday) }}</p>
        </div>

        <div class="stat-card">
          <h3>Doanh thu tuần</h3>
          <p>{{ formatMoney(revenueWeek) }}</p>
        </div>

        <div class="stat-card">
          <h3>Doanh thu tháng</h3>
          <p>{{ formatMoney(revenueMonth) }}</p>
        </div>

        <div class="stat-card">
          <h3>Doanh thu năm</h3>
          <p>{{ formatMoney(revenueYear) }}</p>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="panel">
          <h2>Đơn thuê xe gần đây</h2>

          <table>
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
              <tr v-for="rental in rentals" :key="rental._id">
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

        <div class="panel">
          <h2>Thống kê nhanh</h2>

          <div class="summary-item">
            <span>Tổng đơn thuê</span>
            <strong>{{ rentals.length }}</strong>
          </div>

          <div class="summary-item">
            <span>Tổng doanh thu</span>
            <strong>{{ formatMoney(totalRevenue) }}</strong>
          </div>

          <div class="summary-item">
            <span>Đơn đang chờ</span>
            <strong>{{ pendingCount }}</strong>
          </div>

          <div class="summary-item">
            <span>Đơn đã duyệt</span>
            <strong>{{ approvedCount }}</strong>
          </div>

          <div class="summary-item">
            <span>Đơn đã hoàn tất</span>
            <strong>{{ completedCount }}</strong>
          </div>
          <div class="summary-item">
            <span>Cần liên hệ</span>
            <strong>{{ contacts.length }}</strong>
          </div>
        </div>
      </div>
    </main>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import api from "../services/api";

const rentals = ref([]);
const activeTab = ref("dashboard");

const now = new Date();
const contacts = ref([]);

const getRentals = async () => {
  const res = await api.get("/admin/rentals");
  rentals.value = res.data;
};

onMounted(async () => {
  const contactRes = await api.get("/admin/contacts");
  contacts.value = contactRes.data;
});

const formatMoney = (value) => {
  return Number(value || 0).toLocaleString("vi-VN") + " đ";
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("vi-VN");
};

const isSameDay = (date) => {
  const d = new Date(date);
  const now = new Date();

  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
};

const isSameWeek = (date) => {
  const d = new Date(date);
  const now = new Date();

  const firstDayOfWeek = new Date(now);
  firstDayOfWeek.setDate(now.getDate() - now.getDay());

  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

  return d >= firstDayOfWeek && d <= lastDayOfWeek;
};

const isSameMonth = (date) => {
  const d = new Date(date);
  const now = new Date();

  return (
    d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  );
};

const isSameYear = (date) => {
  const d = new Date(date);
  const now = new Date();

  return d.getFullYear() === now.getFullYear();
};

const totalRevenue = computed(() => {
  return completedRentals.value.reduce(
    (sum, item) => sum + Number(item.totalPrice || 0),
    0,
  );
});

const revenueToday = computed(() => {
  const now = new Date();

  return completedRentals.value
    .filter((item) => {
      const date = new Date(item.updatedAt);

      return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
});

const revenueWeek = computed(() => {
  const firstDay = new Date(now);
  firstDay.setDate(now.getDate() - now.getDay());

  return completedRentals.value
    .filter((item) => {
      const date = new Date(item.createdAt);
      return date >= firstDay && date <= now;
    })
    .reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
});

const revenueMonth = computed(() => {
  return completedRentals.value
    .filter((item) => {
      const date = new Date(item.createdAt);

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
});

const revenueYear = computed(() => {
  return completedRentals.value
    .filter((item) => {
      const date = new Date(item.createdAt);

      return date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
});

const pendingCount = computed(() => {
  return rentals.value.filter((item) => item.status === "pending").length;
});

const approvedCount = computed(() => {
  return rentals.value.filter((item) => item.status === "approved").length;
});

const completedCount = computed(() => {
  return rentals.value.filter((item) => item.status === "completed").length;
});

const completedRentals = computed(() => {
  return rentals.value.filter((item) => item.status === "completed");
});

onMounted(() => {
  getRentals();
});
</script>

<style scoped>
.admin-page {
  display: flex;
  min-height: calc(100vh - 90px);
  background: #f4f6fb;
}

.sidebar {
  width: 240px;
  background: #080f2a;
  color: white;
  padding: 30px 22px;
}

.sidebar h2 {
  margin-bottom: 30px;
  color: white;
}

.sidebar a {
  display: block;
  color: white;
  text-decoration: none;
  padding: 13px 14px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.sidebar a:hover {
  background: #ff6b1a;
}

.sidebar-link {
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: white;
  text-align: left;
  padding: 14px;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 16px;
  cursor: pointer;
}

.sidebar-link:hover,
.sidebar-link.active {
  background: #ff6b1a;
}

.admin-content {
  flex: 1;
  padding: 35px;
}

.admin-content h1 {
  font-size: 32px;
  margin-bottom: 5px;
}

.breadcrumb {
  color: #777;
  margin-bottom: 25px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
  margin-bottom: 28px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 14px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.06);
}

.stat-card h3 {
  color: #666;
  font-size: 16px;
  margin-bottom: 14px;
}

.stat-card p {
  font-size: 26px;
  font-weight: 800;
  color: #ff6b1a;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
}

.panel {
  background: white;
  padding: 25px;
  border-radius: 14px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.06);
}

.panel h2 {
  margin-bottom: 18px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #081225;
  color: white;
  padding: 14px;
  text-align: left;
}

td {
  padding: 14px;
  border-bottom: 1px solid #eee;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.summary-item strong {
  color: #ff6b1a;
}
</style>
