<template>
  <section class="account-page">
    <div class="account-container">
      <h1>Tài khoản của tôi</h1>

      <div v-if="message" class="message" :class="messageType">
        {{ message }}
      </div>

      <div class="account-grid">
        <div class="account-card">
          <h2>Thông tin tài khoản</h2>

          <form @submit.prevent="updateProfile">
            <label>Họ và tên</label>
            <input
              v-model.trim="profileForm.fullName"
              type="text"
              placeholder="Nhập họ và tên"
            />

            <label>Email</label>
            <input
              v-model.trim="profileForm.email"
              type="email"
              placeholder="Nhập email"
            />

            <label>Số điện thoại</label>
            <input
              v-model.trim="profileForm.phone"
              type="text"
              placeholder="Nhập số điện thoại"
            />

            <button type="submit" :disabled="updatingProfile">
              {{ updatingProfile ? "Đang cập nhật..." : "Cập nhật thông tin" }}
            </button>
          </form>
        </div>

        <div class="account-card">
          <h2>Đổi mật khẩu</h2>

          <form @submit.prevent="changePassword">
            <label>Mật khẩu hiện tại</label>
            <input
              v-model="passwordForm.currentPassword"
              type="password"
              placeholder="Nhập mật khẩu hiện tại"
            />

            <label>Mật khẩu mới</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="Nhập mật khẩu mới"
            />

            <label>Xác nhận mật khẩu mới</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
            />

            <button type="submit" :disabled="changingPassword">
              {{ changingPassword ? "Đang đổi mật khẩu..." : "Đổi mật khẩu" }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import api from "../services/api";

const updatingProfile = ref(false);
const changingPassword = ref(false);

const message = ref("");
const messageType = ref("success");

const profileForm = reactive({
  fullName: "",
  email: "",
  phone: "",
});

const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const showMessage = (content, type = "success") => {
  message.value = content;
  messageType.value = type;

  setTimeout(() => {
    message.value = "";
  }, 4000);
};

const fetchProfile = async () => {
  try {
    const response = await api.get("/auth/me");

    profileForm.fullName = response.data.fullName || "";
    profileForm.email = response.data.email || "";
    profileForm.phone = response.data.phone || "";
  } catch (error) {
    showMessage(
      error.response?.data?.message || "Không thể tải thông tin tài khoản.",
      "error",
    );
  }
};

const updateProfile = async () => {
  if (!profileForm.fullName.trim() || !profileForm.email.trim()) {
    showMessage("Họ tên và email không được để trống.", "error");
    return;
  }

  updatingProfile.value = true;

  try {
    const response = await api.put("/auth/profile", {
      fullName: profileForm.fullName,
      email: profileForm.email,
      phone: profileForm.phone,
    });

    localStorage.setItem("user", JSON.stringify(response.data.user));

    showMessage(
      response.data.message || "Cập nhật thông tin thành công.",
      "success",
    );
  } catch (error) {
    showMessage(
      error.response?.data?.message || "Không thể cập nhật thông tin.",
      "error",
    );
  } finally {
    updatingProfile.value = false;
  }
};

const changePassword = async () => {
  if (
    !passwordForm.currentPassword ||
    !passwordForm.newPassword ||
    !passwordForm.confirmPassword
  ) {
    showMessage("Vui lòng nhập đầy đủ thông tin mật khẩu.", "error");
    return;
  }

  changingPassword.value = true;

  try {
    const response = await api.put("/auth/change-password", {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword,
    });

    passwordForm.currentPassword = "";
    passwordForm.newPassword = "";
    passwordForm.confirmPassword = "";

    showMessage(response.data.message || "Đổi mật khẩu thành công.", "success");
  } catch (error) {
    showMessage(
      error.response?.data?.message || "Không thể đổi mật khẩu.",
      "error",
    );
  } finally {
    changingPassword.value = false;
  }
};

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.account-page {
  min-height: calc(100vh - 90px);
  padding: 50px 20px;
  background: #f4f6fb;
}

.account-container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.account-container h1 {
  margin-bottom: 28px;
  color: #081426;
  font-size: 34px;
}

.account-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.account-card {
  border-radius: 14px;
  padding: 28px;
  background: white;
  box-shadow: 0 6px 20px rgb(0 0 0 / 8%);
}

.account-card h2 {
  margin: 0 0 22px;
  color: #081426;
}

.account-card label {
  display: block;
  margin: 14px 0 8px;
  font-weight: 700;
}

.account-card input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 9px;
  padding: 12px;
  font-size: 15px;
}

.account-card button {
  width: 100%;
  margin-top: 22px;
  border: 0;
  border-radius: 9px;
  padding: 13px;
  background: #ff6b14;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.account-card button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.message {
  margin-bottom: 22px;
  border-radius: 9px;
  padding: 14px;
  font-weight: 600;
}

.message.success {
  background: #dcfce7;
  color: #166534;
}

.message.error {
  background: #fee2e2;
  color: #991b1b;
}

@media (max-width: 768px) {
  .account-grid {
    grid-template-columns: 1fr;
  }
}
</style>
