<template>
  <section class="section container">
    <h2 class="section-title">Lịch thuê của các xe</h2>

    <p class="note">Lưu ý: Chọn ngày để xem lịch thuê vào ngày đó.</p>

    <div class="search-box">
      <label>Chọn ngày/tháng/năm:</label>

      <input
        type="date"
        v-model="selectedDate"
        :min="today"
        @change="filterByDate"
      />
    </div>

    <template v-if="selectedDate">
      <h3 class="sub-title">
        Xe còn trống ngày {{ formatDate(selectedDate) }}
      </h3>

      <table class="table">
        <thead>
          <tr>
            <th>Tên xe</th>
            <th>Loại xe</th>
            <th>Số ghế</th>
            <th>Giá thuê/ngày</th>
            <th>Tình trạng</th>
            <th>Chức năng</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="car in availableCars" :key="car._id">
            <td>{{ car.name }}</td>
            <td>{{ car.type?.name }}</td>
            <td>{{ car.seats }}</td>
            <td>{{ Number(car.pricePerDay).toLocaleString("vi-VN") }} VNĐ</td>
            <td>Còn trống</td>
            <td>
              <button class="rent-btn" @click="goToRent(car)">Thuê xe</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-if="availableCars.length === 0" class="empty-text">
        Không có xe trống trong ngày này.
      </p>

      <h3 class="sub-title">
        Xe đã được thuê ngày {{ formatDate(selectedDate) }}
      </h3>

      <table class="table">
        <thead>
          <tr>
            <th>Tên xe</th>
            <th>Ngày bắt đầu thuê</th>
            <th>Ngày kết thúc</th>
            <th>Tình trạng</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="booking in bookedBookings" :key="booking._id">
            <td>{{ getBookingCarName(booking) }}</td>
            <td>{{ formatDate(booking.startDate) }}</td>
            <td>{{ formatDate(booking.endDate) }}</td>
            <td>Đã có lịch thuê</td>
          </tr>
        </tbody>
      </table>

      <p v-if="bookedBookings.length === 0" class="empty-text">
        Chưa có xe nào được thuê trong ngày này.
      </p>
    </template>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();

const cars = ref([]);
const bookings = ref([]);
const selectedDate = ref("");

const availableCars = ref([]);
const bookedBookings = ref([]);

const getCars = async () => {
  const res = await axios.get("http://localhost:5000/api/cars");
  cars.value = res.data;
};

const getBookings = async () => {
  const res = await axios.get("http://localhost:5000/api/rentals/schedule", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  bookings.value = res.data;
};

const getDateOnly = (dateValue) => {
  if (!dateValue) return "";

  // Nếu là ngày từ input type="date"
  if (String(dateValue).length === 10) {
    return dateValue;
  }

  // Chuyển ngày trong MongoDB về đúng ngày Việt Nam
  const date = new Date(dateValue);

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year").value;
  const month = parts.find((p) => p.type === "month").value;
  const day = parts.find((p) => p.type === "day").value;

  return `${year}-${month}-${day}`;
};

const getBookingCarId = (booking) => {
  if (booking.car?._id) {
    return booking.car._id;
  }

  if (booking.car) {
    return booking.car;
  }

  if (booking.carId?._id) {
    return booking.carId._id;
  }

  if (booking.carId) {
    return booking.carId;
  }

  return "";
};

const getBookingCarName = (booking) => {
  if (booking.car?.name) {
    return booking.car.name;
  }

  if (booking.carId?.name) {
    return booking.carId.name;
  }

  const carId = getBookingCarId(booking);
  const car = cars.value.find((item) => item._id === carId);

  return car ? car.name : "Không tìm thấy xe";
};

const isBookingOnSelectedDate = (booking) => {
  const selected = selectedDate.value;
  const start = getDateOnly(booking.startDate);
  const end = getDateOnly(booking.endDate);

  return selected >= start && selected <= end;
};

const filterByDate = () => {
  if (!selectedDate.value) {
    availableCars.value = [];
    bookedBookings.value = [];
    return;
  }

  bookedBookings.value = bookings.value.filter((booking) => {
    return isBookingOnSelectedDate(booking);
  });

  const bookedCarIds = bookedBookings.value.map((booking) => {
    return getBookingCarId(booking);
  });

  availableCars.value = cars.value.filter((car) => {
    return !bookedCarIds.includes(car._id);
  });
};

const goToRent = (car) => {
  router.push(`/rent/${car._id}`);
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN");
};

onMounted(async () => {
  await getCars();
  await getBookings();

  if (selectedDate.value) {
    filterByDate();
  }
});
//Thời gian thực
const today = new Date().toISOString().slice(0, 10);
</script>

<style scoped>
.note {
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.search-box label {
  font-weight: 600;
}

.search-box input {
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.sub-title {
  margin-top: 25px;
  margin-bottom: 15px;
}

.empty-text {
  margin-top: 15px;
  color: red;
  font-weight: 600;
}

.rent-btn {
  background: #ff6b1a;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.rent-btn:hover {
  opacity: 0.9;
}
</style>
