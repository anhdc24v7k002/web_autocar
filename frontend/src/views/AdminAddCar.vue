<template>
  <section class="admin-content">
    <h1>Thêm xe mới</h1>

    <form class="form-box" @submit.prevent="addCar">
      <input v-model="form.name" placeholder="Tên xe" required />
      <select v-model="form.brand" required>
        <option value="">Chọn hãng xe</option>

        <option v-for="brand in brands" :key="brand._id" :value="brand._id">
          {{ brand.name }}
        </option>
      </select>
      <select v-model="form.type" required>
        <option value="">Chọn loại xe</option>

        <option
          v-for="carType in carTypes"
          :key="carType._id"
          :value="carType._id"
        >
          {{ carType.name }}
        </option>
      </select>
      <input
        v-model.number="form.seats"
        type="number"
        placeholder="Số ghế"
        required
      />
      <select v-model="form.transmission" required>
        <option value="">Chọn hộp số</option>

        <option
          v-for="transmission in transmissions"
          :key="transmission._id"
          :value="transmission._id"
        >
          {{ transmission.name }}
        </option>
      </select>
      <input
        v-model.number="form.pricePerDay"
        type="number"
        placeholder="Giá thuê/ngày"
        required
      />
      <input v-model="form.image" placeholder="Link hình ảnh" required />
      <textarea
        v-model="form.description"
        placeholder="Mô tả xe"
        required
      ></textarea>

      <div class="form-actions">
        <button class="save-btn" type="submit">Thêm xe</button>
        <router-link to="/admin/cars" class="cancel-btn">Hủy</router-link>
      </div>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";

const router = useRouter();

const brands = ref([]);
const carTypes = ref([]);
const transmissions = ref([]);

const form = reactive({
  name: "",
  brand: "",
  type: "",
  seats: "",
  transmission: "",
  pricePerDay: "",
  image: "",
  description: "",
  status: "available",
});

const loadBrands = async () => {
  try {
    const response = await api.get("/car-brands");

    brands.value = Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (error) {
    console.error("Không thể tải danh sách hãng xe:", error);

    alert(error.response?.data?.message || "Không thể tải danh sách hãng xe");
  }
};

const loadCarTypes = async () => {
  try {
    const response = await api.get("/car-types");

    carTypes.value = Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (error) {
    console.error("Không thể tải danh sách loại xe:", error);

    alert(error.response?.data?.message || "Không thể tải danh sách loại xe");
  }
};

const loadTransmissions = async () => {
  try {
    const response = await api.get("/transmissions");

    transmissions.value = Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (error) {
    console.error("Không thể tải danh sách hộp số:", error);
    alert("Không thể tải danh sách hộp số");
  }
};

const addCar = async () => {
  try {
    if (!form.brand) {
      alert("Vui lòng chọn hãng xe");
      return;
    }

    const payload = {
      name: form.name.trim(),
      brand: form.brand,
      type: form.type.trim(),
      seats: Number(form.seats),
      transmission: form.transmission.trim(),
      pricePerDay: Number(form.pricePerDay),
      image: form.image.trim(),
      description: form.description.trim(),
      status: form.status,
    };

    await api.post("/cars", payload);

    alert("Thêm xe thành công");
    router.push("/admin/cars");
  } catch (error) {
    console.error("Lỗi thêm xe:", error);

    alert(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Không thể thêm xe",
    );
  }
};

onMounted(() => {
  loadBrands();
  loadCarTypes();
  loadTransmissions();
});
</script>

<style scoped>
.admin-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 50px 24px;
}

.admin-content h1 {
  font-size: 36px;
  margin-bottom: 24px;
}

.form-box {
  background: white;
  padding: 28px;
  border-radius: 14px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.form-box input,
.form-box select,
.form-box textarea {
  padding: 13px;
  border: 1px solid #ccd2dc;
  border-radius: 8px;
  font-size: 15px;
}

.form-box textarea {
  grid-column: span 2;
  min-height: 100px;
}

.form-actions {
  grid-column: span 2;
}

.save-btn {
  background: #ff6b1a;
  color: white;
  border: none;
  padding: 12px 18px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.cancel-btn {
  display: inline-block;
  background: #6b7280;
  color: white;
  text-decoration: none;
  padding: 12px 18px;
  border-radius: 8px;
  font-weight: 700;
  margin-left: 10px;
}
</style>
