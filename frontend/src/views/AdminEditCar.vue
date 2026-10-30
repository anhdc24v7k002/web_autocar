<template>
  <section class="admin-content">
    <h1>Chỉnh sửa thông tin xe</h1>

    <form class="form-box" @submit.prevent="updateCar">
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

        <option v-for="item in transmissions" :key="item._id" :value="item._id">
          {{ item.name }}
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
        <button class="save-btn" type="submit">Cập nhật</button>
        <router-link to="/admin/cars" class="cancel-btn">Hủy</router-link>
      </div>
    </form>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api.js";

const route = useRoute();
const router = useRouter();

const brands = ref([]);
const carTypes = ref([]);
const transmissions = ref([]);
const loading = ref(true);

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

const getArrayData = (response) => {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }

  return [];
};

const loadBrands = async () => {
  const response = await api.get("/car-brands");
  brands.value = getArrayData(response);

  console.log("Hãng xe:", brands.value);
};

const loadCarTypes = async () => {
  const response = await api.get("/car-types");
  carTypes.value = getArrayData(response);

  console.log("Loại xe:", carTypes.value);
};

const loadTransmissions = async () => {
  const response = await api.get("/transmissions");
  transmissions.value = getArrayData(response);

  console.log("Hộp số:", transmissions.value);
};

const loadCar = async () => {
  const carId = route.params.id;

  if (!carId) {
    throw new Error("Không tìm thấy id xe trên URL");
  }

  const response = await api.get(`/cars/${carId}`);
  const car = response.data;

  console.log("Dữ liệu xe:", car);

  form.name = car.name || "";

  form.brand =
    car.brand && typeof car.brand === "object"
      ? car.brand._id
      : car.brand || "";

  form.type =
    car.type && typeof car.type === "object" ? car.type._id : car.type || "";

  form.transmission =
    car.transmission && typeof car.transmission === "object"
      ? car.transmission._id
      : car.transmission || "";

  form.seats = car.seats ?? "";
  form.pricePerDay = car.pricePerDay ?? "";
  form.image = car.image || "";
  form.description = car.description || "";
  form.status = car.status || "available";
};

const updateCar = async () => {
  try {
    if (!form.brand) {
      alert("Vui lòng chọn hãng xe");
      return;
    }

    if (!form.type) {
      alert("Vui lòng chọn loại xe");
      return;
    }

    if (!form.transmission) {
      alert("Vui lòng chọn hộp số");
      return;
    }

    const payload = {
      name: form.name.trim(),
      brand: form.brand,
      type: form.type,
      seats: Number(form.seats),
      transmission: form.transmission,
      pricePerDay: Number(form.pricePerDay),
      image: form.image.trim(),
      description: form.description.trim(),
      status: form.status,
    };

    await api.put(`/admin/cars/${route.params.id}`, payload);

    alert("Cập nhật xe thành công");
    router.push("/admin/cars");
  } catch (error) {
    console.error("Lỗi cập nhật xe:", error);

    alert(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Không thể cập nhật xe",
    );
  }
};

onMounted(async () => {
  loading.value = true;

  try {
    // Chạy tuần tự để biết chính xác API nào lỗi
    await loadBrands();
    await loadCarTypes();
    await loadTransmissions();
    await loadCar();

    console.log("Khởi tạo trang sửa xe thành công");
  } catch (error) {
    console.error("Lỗi khởi tạo trang sửa xe:", error);
    console.error("Status:", error.response?.status);
    console.error("Response:", error.response?.data);

    alert(
      error.response?.data?.message ||
        error.message ||
        "Không thể tải dữ liệu trang sửa xe",
    );
  } finally {
    loading.value = false;
  }
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
