<template>
  <section class="admin-content">
    <h1>Thêm đơn thuê xe</h1>

    <form class="rental-form" @submit.prevent="addRental">
      <!-- Xe -->
      <div class="form-group">
        <label>Xe</label>

        <select v-model="form.car" required>
          <option value="">Chọn xe</option>

          <option v-for="car in cars" :key="car._id" :value="car._id">
            {{ car.name }}
          </option>
        </select>
      </div>

      <!-- Khách hàng -->
      <div class="form-group">
        <label>Khách hàng</label>

        <input
          v-model.trim="form.customerName"
          type="text"
          placeholder="Tên khách hàng"
          required
        />
      </div>

      <!-- Điện thoại -->
      <div class="form-group">
        <label>Số điện thoại</label>

        <input
          v-model.trim="form.phone"
          type="text"
          placeholder="Số điện thoại"
          required
        />
      </div>

      <!-- Địa chỉ -->
      <div class="form-group">
        <label>Địa chỉ giao/trả xe</label>

        <input
          v-model.trim="form.address"
          type="text"
          placeholder="Địa chỉ giao/trả xe"
          required
        />
      </div>

      <!-- Ngày nhận -->
      <div class="form-group">
        <label>Ngày nhận xe</label>

        <input v-model="form.startDate" type="date" :min="today" required />
      </div>

      <!-- Thời gian nhận -->
      <div class="form-group">
        <label>Thời gian nhận xe</label>

        <input v-model="startTime" type="time" required />
      </div>

      <!-- Ngày trả -->
      <div class="form-group">
        <label>Ngày trả xe</label>

        <input
          v-model="form.endDate"
          type="date"
          :min="form.startDate || today"
          required
        />
      </div>

      <!-- Thời gian trả -->
      <div class="form-group">
        <label>Thời gian trả xe</label>

        <input v-model="endTime" type="time" required />
      </div>

      <!-- Tổng tiền -->
      <div class="form-group">
        <label>Tổng tiền</label>

        <input
          :value="formatMoney(form.totalPrice)"
          type="text"
          class="price-input"
          readonly
        />
      </div>

      <!-- Thanh toán -->
      <div class="form-group">
        <label>Phương thức thanh toán</label>

        <select v-model="form.paymentMethod" required>
          <option value="" disabled>Chọn phương thức thanh toán</option>

          <option
            v-for="method in activePaymentMethods"
            :key="method._id"
            :value="method._id"
          >
            {{ method.name }}
          </option>
        </select>
      </div>

      <!-- Trạng thái -->
      <div class="form-group">
        <label>Status</label>

        <select v-model="form.status" required>
          <option value="pending">pending</option>
          <option value="approved">approved</option>
          <option value="completed">completed</option>
        </select>
      </div>

      <div class="form-group empty-group"></div>

      <p v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>

      <div class="form-actions">
        <button type="button" class="calculate-btn" @click="calculateTotal">
          Tính tiền
        </button>

        <button type="submit" class="save-btn" :disabled="submitting">
          {{ submitting ? "Đang thêm..." : "Thêm đơn thuê" }}
        </button>

        <router-link to="/admin/rentals" class="cancel-btn"> Hủy </router-link>
      </div>
    </form>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";

const router = useRouter();

const cars = ref([]);
const paymentMethods = ref([]);

const fetchPaymentMethods = async () => {
  try {
    const response = await api.get("/payment-methods");

    paymentMethods.value = Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (error) {
    console.error("Không thể tải phương thức thanh toán:", error);

    paymentMethods.value = [];
  }
};

const startTime = ref("");
const endTime = ref("");

const submitting = ref(false);
const errorMessage = ref("");

const today = new Date().toISOString().slice(0, 10);

const form = reactive({
  car: "",
  customerName: "",
  phone: "",
  address: "",
  startDate: "",
  endDate: "",
  totalPrice: 0,
  paymentMethod: "",
  status: "pending",
});

const activePaymentMethods = computed(() => {
  return paymentMethods.value.filter((method) => method.active);
});

const selectedCar = computed(() => {
  return cars.value.find((car) => car._id === form.car) || null;
});

const getArrayData = (response) => {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }

  return [];
};

const loadCars = async () => {
  try {
    const response = await api.get("/cars");
    cars.value = getArrayData(response);
  } catch (error) {
    console.error("Lỗi tải danh sách xe:", error);

    errorMessage.value =
      error.response?.data?.message || "Không thể tải danh sách xe.";
  }
};

const loadPaymentMethods = async () => {
  try {
    const response = await api.get("/payment-methods");

    paymentMethods.value = Array.isArray(response.data)
      ? response.data
      : response.data.data || [];

    form.paymentMethod = "";
  } catch (error) {
    console.error("Lỗi tải phương thức thanh toán:", error);

    errorMessage.value =
      error.response?.data?.message || "Không thể tải phương thức thanh toán.";
  }
};

const calculateTotal = () => {
  errorMessage.value = "";

  if (!selectedCar.value) {
    errorMessage.value = "Vui lòng chọn xe.";
    return false;
  }

  if (!form.startDate || !form.endDate || !startTime.value || !endTime.value) {
    errorMessage.value = "Vui lòng chọn đầy đủ ngày và thời gian thuê.";
    return false;
  }

  const start = new Date(`${form.startDate}T${startTime.value}`);

  const end = new Date(`${form.endDate}T${endTime.value}`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    errorMessage.value = "Ngày nhận hoặc ngày trả không hợp lệ.";
    return false;
  }

  if (start >= end) {
    errorMessage.value = "Thời gian trả xe phải sau thời gian nhận xe.";
    return false;
  }

  const milliseconds = end - start;

  const numberOfDays = Math.ceil(milliseconds / (1000 * 60 * 60 * 24));

  form.totalPrice = numberOfDays * Number(selectedCar.value.pricePerDay);

  return true;
};

const addRental = async () => {
  errorMessage.value = "";

  if (
    !form.car ||
    !form.customerName ||
    !form.phone ||
    !form.address ||
    !form.startDate ||
    !form.endDate ||
    !startTime.value ||
    !endTime.value ||
    !form.paymentMethod
  ) {
    errorMessage.value = "Vui lòng nhập đầy đủ thông tin.";
    return;
  }

  const calculated = calculateTotal();

  if (!calculated) {
    return;
  }

  const startDateTime = `${form.startDate}T${startTime.value}`;

  const endDateTime = `${form.endDate}T${endTime.value}`;

  submitting.value = true;

  try {
    await api.post("/admin/rentals", {
      car: form.car,
      customerName: form.customerName,
      phone: form.phone,
      address: form.address,
      startDate: startDateTime,
      endDate: endDateTime,
      totalPrice: Number(form.totalPrice),
      paymentMethod: form.paymentMethod,
      status: form.status,
    });

    alert("Thêm đơn thuê thành công.");

    router.push("/admin/rentals");
  } catch (error) {
    console.error("Lỗi thêm đơn thuê:", error);
    console.error("Dữ liệu lỗi:", error.response?.data);

    errorMessage.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Không thể thêm đơn thuê.";
  } finally {
    submitting.value = false;
  }
};

const formatMoney = (value) => {
  return Number(value || 0).toLocaleString("vi-VN") + " đ";
};

onMounted(async () => {
  await Promise.allSettled([loadCars(), loadPaymentMethods()]);
});
</script>

<style scoped>
.admin-content {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 60px 24px;
}

.admin-content h1 {
  font-size: 36px;
  margin-bottom: 24px;
}

.rental-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: 32px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 10px 30px rgb(0 0 0 / 8%);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.form-group label {
  color: #111827;
  font-size: 15px;
  font-weight: 700;
}

.form-group input,
.form-group select {
  box-sizing: border-box;
  width: 100%;
  height: 52px;
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  background: white;
  color: #111827;
  font-family: inherit;
  font-size: 15px;
  outline: none;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #ff6b1a;
  box-shadow: 0 0 0 3px rgb(255 107 26 / 12%);
}

.price-input {
  color: #ff5c00 !important;
  font-weight: 800;
  background: #f8fafc !important;
}

.empty-group {
  visibility: hidden;
}

.form-actions {
  display: flex;
  grid-column: 1 / -1;
  align-items: center;
  gap: 12px;
  margin-top: 5px;
}

.calculate-btn,
.save-btn,
.cancel-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 20px;
  border: 0;
  border-radius: 9px;
  color: white;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.calculate-btn {
  background: #16a34a;
}

.calculate-btn:hover {
  background: #15803d;
}

.save-btn {
  background: #ff6b1a;
}

.save-btn:hover {
  background: #ea580c;
}

.save-btn:disabled {
  background: #fdba74;
  cursor: not-allowed;
}

.cancel-btn {
  background: #6b7280;
}

.cancel-btn:hover {
  background: #4b5563;
}

.error-message {
  grid-column: 1 / -1;
  margin: 0;
  padding: 12px 14px;
  border-radius: 8px;
  background: #fee2e2;
  color: #991b1b;
  font-weight: 600;
}

@media (max-width: 700px) {
  .admin-content {
    padding: 35px 16px;
  }

  .admin-content h1 {
    font-size: 30px;
  }

  .rental-form {
    grid-template-columns: 1fr;
    padding: 22px;
  }

  .empty-group {
    display: none;
  }

  .form-actions {
    flex-wrap: wrap;
  }
}
</style>
