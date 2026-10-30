<template>
  <section class="auth-section">
    <div class="auth-box">
      <h2>Đăng ký tài khoản</h2>

      <form @submit.prevent="register">
        <input v-model="form.name" type="text" placeholder="Họ tên" />
        <input v-model="form.email" type="email" placeholder="Email" />
        <input v-model="form.phone" type="text" placeholder="Số điện thoại" />
        <input v-model="form.password" type="password" placeholder="Mật khẩu" />
        <input
          v-model="form.confirmPassword"
          type="password"
          placeholder="Xác nhận mật khẩu"
        />

        <button type="submit">Đăng ký</button>

        <p v-if="errorMessage" class="error">
          {{ errorMessage }}
        </p>

        <p v-if="successMessage" class="success">
          {{ successMessage }}
        </p>
      </form>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();

const form = reactive({
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
});

const errorMessage = ref("");
const successMessage = ref("");

const register = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (
    !form.name.trim() ||
    !form.email.trim() ||
    !form.phone.trim() ||
    !form.password.trim() ||
    !form.confirmPassword.trim()
  ) {
    errorMessage.value = "Vui lòng nhập đầy đủ thông tin.";
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(form.email)) {
    errorMessage.value = "Email không hợp lệ.";
    return;
  }

  if (form.password.length < 8) {
    errorMessage.value = "Mật khẩu phải có ít nhất 8 ký tự.";
    return;
  }

  if (form.password !== form.confirmPassword) {
    errorMessage.value = "Xác nhận mật khẩu không khớp.";
    return;
  }

  try {
    await axios.post("http://localhost:5000/api/auth/register", {
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });

    successMessage.value = "Đăng ký thành công.";

    setTimeout(() => {
      router.push("/login");
    }, 1000);
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Đăng ký thất bại.";
  }
};
</script>

<style scoped>
.auth-section {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}

.auth-box {
  width: 400px;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.auth-box h2 {
  margin-bottom: 20px;
  text-align: center;
}

.auth-box form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-box input {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.auth-box button {
  background: #ff6b1a;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.error {
  color: red;
  font-size: 14px;
}

.success {
  color: green;
  font-size: 14px;
}
</style>
