<template>
  <section class="admin-content">
    <h1>Chỉnh sửa khách hàng</h1>

    <form class="form-box" @submit.prevent="updateCustomer">
      <input v-model="form.fullName" placeholder="Họ tên" required />
      <input v-model="form.email" type="email" placeholder="Email" required />
      <input v-model="form.phone" placeholder="Số điện thoại" required />

      <div class="form-actions">
        <button class="save-btn" type="submit">Lưu thay đổi</button>

        <router-link to="/admin/customers" class="cancel-btn">
          Hủy
        </router-link>
      </div>
    </form>
  </section>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";

const route = useRoute();
const router = useRouter();

const form = reactive({
  fullName: "",
  email: "",
  phone: "",
});

const getCustomer = async () => {
  const res = await api.get("/admin/customers");

  const customer = res.data.find((item) => item._id === route.params.id);

  if (customer) {
    form.fullName = customer.fullName;
    form.email = customer.email;
    form.phone = customer.phone || "";
  }
};

const updateCustomer = async () => {
  await api.put(`/admin/customers/${route.params.id}`, form);

  alert("Cập nhật khách hàng thành công.");

  router.push("/admin/customers");
};

onMounted(() => {
  getCustomer();
});
</script>

<style scoped>
.admin-content {
  max-width: 700px;
  margin: 40px auto;
}

h1 {
  margin-bottom: 30px;
  color: #0b163f;
}

.form-box {
  background: white;
  padding: 30px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-box input {
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.save-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 12px 18px;
  border-radius: 10px;
  cursor: pointer;
}

.cancel-btn {
  background: #6b7280;
  color: white;
  padding: 12px 18px;
  border-radius: 10px;
  text-decoration: none;
}
</style>
