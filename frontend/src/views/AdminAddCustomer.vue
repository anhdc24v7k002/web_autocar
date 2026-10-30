<template>
  <section class="admin-content">
    <h1>Thêm tài khoản khách hàng</h1>

    <form class="form-box" @submit.prevent="addCustomer">
      <input v-model="form.fullName" placeholder="Họ tên" required />
      <input v-model="form.email" type="email" placeholder="Email" required />
      <input v-model="form.phone" placeholder="Số điện thoại" required />
      <input
        v-model="form.password"
        type="password"
        placeholder="Mật khẩu"
        required
      />
      <input
        v-model="form.confirmPassword"
        type="password"
        placeholder="Xác nhận mật khẩu"
      />

      <div class="form-actions">
        <button class="save-btn" type="submit">Thêm khách hàng</button>
        <router-link to="/admin/customers" class="cancel-btn">Hủy</router-link>
      </div>
    </form>
  </section>
</template>

<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";

const router = useRouter();

const form = reactive({
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
});

const addCustomer = async () => {
  if (form.password !== form.confirmPassword) {
    alert("Xác nhận mật khẩu không khớp");
    return;
  }

  try {
    await api.post("/auth/register", {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });

    alert("Thêm khách hàng thành công");

    router.push("/admin/customers");
  } catch (error) {
    console.log(error);

    alert(error.response?.data?.message || "Thêm khách hàng thất bại");
  }
};
</script>
<style scoped>
.admin-content {
  max-width: 700px;
  margin: 50px auto;
  padding: 0 20px;
}

.admin-content h1 {
  font-size: 36px;
  margin-bottom: 25px;
  color: #071739;
}

.form-box {
  background: white;
  padding: 32px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
}

.form-box input {
  padding: 14px 16px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 16px;
}

.form-box input:focus {
  outline: none;
  border-color: #ff6b1a;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.save-btn {
  background: #ff6b1a;
  color: white;
  border: none;
  padding: 13px 20px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.save-btn:hover {
  background: #ea580c;
}

.cancel-btn {
  background: #6b7280;
  color: white;
  text-decoration: none;
  padding: 13px 20px;
  border-radius: 10px;
  font-weight: 700;
}

.cancel-btn:hover {
  background: #4b5563;
}
</style>
