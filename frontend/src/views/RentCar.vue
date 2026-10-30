<template>
  <section class="auth-section">
    <div class="auth-box rent-box">
      <h2>Thông tin thuê xe</h2>

      <form @submit.prevent="submitRental">
        <label>Họ tên khách hàng</label>
        <input v-model="form.customerName" type="text" />

        <label>Số điện thoại</label>
        <input v-model="form.phone" type="text" />

        <label>Địa chỉ giao/trả xe</label>
        <input v-model="form.address" type="text" />

        <label>Thời gian nhận xe</label>
        <input v-model="startTime" type="time" />

        <label>Ngày nhận xe</label>
        <input v-model="form.startDate" type="date" :min="today" required />

        <label>Thời gian trả xe</label>
        <input v-model="endTime" type="time" />

        <label>Ngày trả xe</label>
        <input
          v-model="form.endDate"
          type="date"
          :min="form.startDate || today"
          required
        />

        <label>Phương thức thanh toán</label>
        <select v-model="form.paymentMethod">
          <option value="" disabled>Chọn phương thức thanh toán</option>

          <option
            v-for="method in paymentMethods"
            :key="method._id"
            :value="method._id"
          >
            {{ method.name }}
            {{ method.active ? "" : " - Tạm ngưng" }}
          </option>
        </select>

        <div
          v-if="selectedPaymentMethod && !selectedPaymentMethod.active"
          class="payment-disabled-message"
        >
          Thanh toán
          {{ selectedPaymentMethod.name.toLowerCase() }}
          tạm thời ngưng hoạt động. Xin lỗi vì sự bất tiện này!
        </div>

        <div
          v-if="
            selectedPaymentMethod &&
            selectedPaymentMethod.active &&
            selectedPaymentMethod.code !== 'CASH'
          "
          class="qr-box"
        >
          <p class="qr-title">Quét mã QR để thanh toán</p>

          <img
            v-if="selectedPaymentMethod.qrImage"
            :src="getQrImageUrl(selectedPaymentMethod.qrImage)"
            :alt="`Mã QR ${selectedPaymentMethod.name}`"
          />

          <p v-else class="qr-empty">
            Phương thức thanh toán này chưa có ảnh QR.
          </p>
        </div>

        <p class="note">
          <strong>Lưu ý:</strong> Quý khách hàng trả xe không đúng thời gian
          trên, phí thuê xe sẽ được tính thêm. Xin lỗi vì sự bất tiện này!
        </p>

        <button
          type="submit"
          :disabled="!selectedPaymentMethod || !selectedPaymentMethod.active"
        >
          Xác nhận thuê xe
        </button>

        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="success" class="success">{{ success }}</p>
      </form>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";

const route = useRoute();
const router = useRouter();

const paymentMethods = ref([]);
const getQrImageUrl = (imagePath) => {
  if (!imagePath) return "";

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("blob:")
  ) {
    return imagePath;
  }

  return `http://localhost:5000${imagePath}`;
};

const loadPaymentMethods = async () => {
  try {
    const response = await api.get("/payment-methods");

    paymentMethods.value = Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (error) {
    console.error("Không thể tải phương thức thanh toán:", error);

    alert(
      error.response?.data?.message ||
        "Không thể tải danh sách phương thức thanh toán",
    );
  }
};

const selectedPaymentMethod = computed(() => {
  return paymentMethods.value.find(
    (method) => method._id === form.paymentMethod,
  );
});

const error = ref("");
const success = ref("");

const form = reactive({
  customerName: "",
  phone: "",
  address: "",
  startDate: "",
  endDate: "",
  paymentMethod: "",
});

const startTime = ref("");
const endTime = ref("");

const submitRental = async () => {
  error.value = "";
  success.value = "";

  if (
    !form.customerName ||
    !form.phone ||
    !form.address ||
    !form.startDate ||
    !form.endDate ||
    !startTime.value ||
    !endTime.value
  ) {
    error.value = "Vui lòng nhập đầy đủ thông tin.";
    return;
  }

  if (!selectedPaymentMethod.value) {
    error.value = "Vui lòng chọn phương thức thanh toán.";
    return;
  }

  if (!selectedPaymentMethod.value.active) {
    error.value =
      `Thanh toán ${selectedPaymentMethod.value.name.toLowerCase()} ` +
      "tạm thời ngưng hoạt động. Xin lỗi vì sự bất tiện này!";
    return;
  }

  const startDateTime = `${form.startDate}T${startTime.value}`;
  const endDateTime = `${form.endDate}T${endTime.value}`;

  if (new Date(startDateTime) >= new Date(endDateTime)) {
    error.value = "Thời gian trả xe phải sau thời gian nhận xe.";
    return;
  }

  try {
    await api.post("/rentals", {
      customerName: form.customerName,
      phone: form.phone,
      address: form.address,
      startDate: startDateTime,
      endDate: endDateTime,
      carId: route.params.id,
      paymentMethod: form.paymentMethod,
    });

    success.value = "Thuê xe thành công. Bạn có thể xem tình trạng xe đã thuê.";

    setTimeout(() => {
      router.push("/rented-status");
    }, 900);
  } catch (err) {
    error.value = err.response?.data?.message || "Thuê xe thất bại.";
  }
};

//thời gian thực
const today = new Date().toISOString().slice(0, 10);

onMounted(() => {
  loadPaymentMethods();

  // Giữ các hàm cũ khác của bạn ở đây
});
</script>

<style scoped>
.auth-section {
  display: flex;
  justify-content: center;
  padding: 80px 20px;
}

.auth-box {
  width: 520px;
  background: white;
  padding: 45px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.auth-box button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.75;
}

.auth-box h2 {
  text-align: center;
  margin-bottom: 25px;
}

.auth-box form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.auth-box label {
  font-weight: 700;
}

.auth-box input {
  width: 100%;
  padding: 13px;
  border: 1px solid #ccd2dc;
  border-radius: 8px;
  font-size: 15px;
}

.auth-box button {
  margin-top: 12px;
  background: #ff6b1a;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.note {
  background: #fff4e8;
  color: #7a3b00;
  padding: 14px;
  border-radius: 8px;
  line-height: 1.5;
  margin-top: 10px;
  font-size: 15px;
}

.error {
  color: red;
  margin-top: 10px;
}

.success {
  color: green;
  margin-top: 10px;
}

.auth-box select {
  width: 100%;
  padding: 13px;
  border: 1px solid #ccd2dc;
  border-radius: 8px;
  font-size: 15px;
  background: white;
  height: 54px;
}

.auth-box select:focus {
  outline: none;
  border-color: #071739;
}

.qr-box {
  grid-column: span 2;
  margin-top: 8px;
  padding: 18px;
  border: 1px dashed #ff6b1a;
  border-radius: 12px;
  background: #fff7ed;
  text-align: center;
}

.qr-title {
  font-weight: 700;
  color: #071739;
  margin-bottom: 12px;
}

.qr-box img {
  width: 180px;
  height: 180px;
  object-fit: contain;
  background: white;
  padding: 10px;
  border-radius: 10px;
}

.qr-amount {
  margin-top: 12px;
  font-weight: 800;
  color: #ff6b1a;
}

.payment-disabled-message {
  margin-top: 8px;
  padding: 13px 15px;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  background: #fee2e2;
  color: #991b1b;
  font-weight: 600;
  line-height: 1.5;
}
.qr-empty {
  margin: 10px 0 0;
  color: #991b1b;
  font-weight: 600;
}
</style>
