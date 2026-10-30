<template>
  <section class="section container">
    <h2 class="section-title">Danh sách xe</h2>

    <div class="filters">
      <select v-model="filterTransmission">
        <option value="">Tất cả hộp số</option>
        <option
          v-for="transmission in transmissions"
          :key="transmission._id"
          :value="transmission._id"
        >
          {{ transmission.name }}
        </option>
      </select>

      <select v-model="filterFuel">
        <option value="">Tất cả nhiên liệu</option>
        <option value="Xăng">Xe xăng</option>
        <option value="Điện">Xe điện</option>
      </select>

      <select v-model="filterBrand">
        <option value="">Tất cả hãng xe</option>
        <option v-for="brand in brands" :key="brand._id" :value="brand._id">
          {{ brand.name }}
        </option>
      </select>

      <select v-model="filterType">
        <option value="">Tất cả loại xe</option>

        <option v-for="type in carTypes" :key="type._id" :value="type._id">
          {{ type.name }}
        </option>
      </select>

      <select v-model="filterSeats">
        <option value="">Tất cả số ghế</option>
        <option value="4">4 chỗ</option>
        <option value="5">5 chỗ</option>
        <option value="7">7 chỗ</option>
      </select>

      <select v-model="sortPrice">
        <option value="">Sắp xếp giá thuê</option>
        <option value="asc">Giá thấp đến cao</option>
        <option value="desc">Giá cao đến thấp</option>
      </select>

      <button class="clear-btn" @click="clearFilters">Clear</button>
    </div>

    <div class="grid">
      <div v-for="car in filteredCars" :key="car._id" class="card">
        <img :src="car.image" :alt="car.name" />

        <div class="card-body">
          <h3>{{ car.name }}</h3>

          <p>
            {{ car.brand?.name || "Chưa có hãng" }} •
            {{ car.type?.name || "Chưa có loại xe" }} • {{ car.seats }} chỗ •
            {{ car.transmission?.name || "Chưa có hộp số" }}
          </p>

          <p class="price">{{ formatMoney(car.pricePerDay) }}/ngày</p>

          <router-link :to="`/cars/${car._id}`" class="btn secondary">
            Xem chi tiết
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import api from "../services/api";

const cars = ref([]);
const brands = ref([]);
const carTypes = ref([]);
const transmissions = ref([]);

const filterTransmission = ref("");
const filterFuel = ref("");
const filterBrand = ref("");
const filterType = ref("");
const filterSeats = ref("");
const sortPrice = ref("");

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

onMounted(async () => {
  try {
    const carResponse = await api.get("/cars");

    cars.value = Array.isArray(carResponse.data)
      ? carResponse.data
      : carResponse.data.data || [];

    await Promise.all([fetchBrands(), fetchCarTypes(), fetchTransmissions()]);
  } catch (error) {
    console.error("Không thể tải dữ liệu trang danh sách xe:", error);
  }
});

const fetchBrands = async () => {
  try {
    const response = await api.get("/car-brands");

    brands.value = Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (error) {
    console.error("Không thể tải danh sách hãng xe:", error);
    brands.value = [];
  }
};

const fetchCarTypes = async () => {
  try {
    const response = await api.get("/car-types");

    carTypes.value = Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (error) {
    console.error("Không thể tải danh sách loại xe:", error);
    carTypes.value = [];
  }
};

const fetchTransmissions = async () => {
  try {
    const response = await api.get("/transmissions");

    transmissions.value = Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (error) {
    console.error("Không thể tải danh sách hộp số:", error);
    transmissions.value = [];
  }
};

const filteredCars = computed(() => {
  let result = [...cars.value];

  if (filterFuel.value) {
    result = result.filter((car) => car.fuel === filterFuel.value);
  }

  if (filterBrand.value) {
    result = result.filter((car) => car.brand?._id === filterBrand.value);
  }

  if (filterType.value) {
    result = result.filter((car) => car.type?._id === filterType.value);
  }

  if (filterTransmission.value) {
    result = result.filter(
      (car) => car.transmission?._id === filterTransmission.value,
    );
  }

  if (filterSeats.value) {
    result = result.filter((car) => car.seats == filterSeats.value);
  }

  if (sortPrice.value === "asc") {
    result.sort((a, b) => a.pricePerDay - b.pricePerDay);
  }

  if (sortPrice.value === "desc") {
    result.sort((a, b) => b.pricePerDay - a.pricePerDay);
  }

  return result;
});

const clearFilters = () => {
  filterTransmission.value = "";
  filterFuel.value = "";
  filterBrand.value = "";
  filterType.value = "";
  filterSeats.value = "";
  sortPrice.value = "";
};
</script>

<style scoped>
.filters {
  display: flex;
  flex-wrap: nowrap;
  gap: 14px;
  margin-bottom: 30px;
  align-items: center;
}

.filters select {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: white;
  min-width: 170px;
  font-size: 15px;
  font-weight: 500;
}

.clear-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 12px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}

.clear-btn:hover {
  background: #dc2626;
}
</style>
