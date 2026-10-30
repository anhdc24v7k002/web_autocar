<template>
  <div class="form-box">
    <h2>Đăng nhập</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label>Email</label><input v-model="form.email" type="email" required />
      </div>
      <div class="form-group">
        <label>Mật khẩu</label
        ><input v-model="form.password" type="password" required />
      </div>
      <button class="btn" style="width: 100%">Đăng nhập</button>

      <p v-if="error" class="error-message">
        {{ error }}
      </p>
    </form>
    <div class="divider">
      <span>Hoặc</span>
    </div>

    <div class="google-login-wrapper">
      <div class="google-login-wrapper">
        <GoogleLogin :callback="loginWithGoogle" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";
import { GoogleLogin } from "vue3-google-login";

const router = useRouter();
const error = ref("");

const form = reactive({
  email: "",
  password: "",
});

const handleLogin = async () => {
  error.value = "";

  try {
    const res = await api.post("/auth/login", {
      email: form.email,
      password: form.password,
    });

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.user.role);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    if (res.data.user.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/";
    }
  } catch (err) {
    error.value =
      err.response?.data?.message || "Email hoặc mật khẩu không đúng.";
  }
};

//đăng nhập GG
const loginWithGoogle = async (response) => {
  try {
    console.log("Google response:", response);

    const res = await api.post("/auth/google", {
      credential: response.credential,
    });

    console.log("Backend Google login:", res.data);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.user.role);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    if (res.data.user.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/";
    }
  } catch (error) {
    console.log("Google login error:", error.response?.data || error);
    alert(error.response?.data?.message || "Đăng nhập Google thất bại.");
  }
};
</script>

<style scoped>
.google-login-wrapper {
  margin-top: 10px;
}

.google-login-btn {
  width: 100%;
  height: 55px;

  border: 1px solid #ddd;
  border-radius: 12px;

  background: white;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  cursor: pointer;

  font-size: 16px;
  font-weight: 600;

  transition: all 0.3s ease;
}

.google-login-btn:hover {
  background: #f5f5f5;
  transform: translateY(-2px);
}

.google-login-btn img {
  width: 24px;
  height: 24px;
}

.or-text {
  text-align: center;
  margin: 18px 0;
  color: #666;
  font-weight: 600;
}

.error-message {
  color: red;
  margin-top: 14px;
  text-align: center;
  font-weight: 700;
}
</style>
