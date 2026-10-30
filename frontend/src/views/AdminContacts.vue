<template>
  <section class="admin-content">
    <h1>Danh sách liên hệ khách hàng</h1>

    <table class="contact-table">
      <thead>
        <tr>
          <th>Họ tên</th>
          <th>Email</th>
          <th>Số điện thoại</th>
          <th>Nội dung</th>
          <th>Ngày gửi</th>
          <th>Chức năng</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="contact in contacts" :key="contact._id">
          <td>{{ contact.name }}</td>
          <td>{{ contact.email }}</td>
          <td>{{ contact.phone }}</td>
          <td>{{ contact.message }}</td>
          <td>{{ formatDate(contact.createdAt) }}</td>
          <td>
            <button class="delete-btn" @click="deleteContact(contact._id)">
              Đã liên hệ
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../services/api";

const contacts = ref([]);

const getContacts = async () => {
  const res = await api.get("/admin/contacts");
  contacts.value = res.data;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("vi-VN");
};

onMounted(() => {
  getContacts();
});

const deleteContact = async (id) => {
  const confirmDelete = confirm(
    "Bạn có chắc muốn xác nhận đã liên hệ thành công?",
  );

  if (!confirmDelete) return;

  try {
    await api.delete(`/admin/contacts/${id}`);

    contacts.value = contacts.value.filter((item) => item._id !== id);
  } catch (error) {
    console.log(error);
    alert("Xác nhận liên hệ thất bại");
  }
};
</script>

<style scoped>
.admin-content {
  max-width: 1300px;
  margin: 50px auto;
  padding: 0 20px;
}

.admin-content h1 {
  font-size: 36px;
  color: #071739;
  margin-bottom: 12px;
}

.admin-content p {
  font-size: 18px;
  color: #374151;
  margin-bottom: 28px;
}

.contact-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
}

.contact-table thead {
  background: #071739;
  color: white;
}

.contact-table th,
.contact-table td {
  padding: 16px 18px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  font-size: 16px;
}

.contact-table tbody tr:hover {
  background: #f9fafb;
}

.delete-btn {
  background: #22c55e;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  transition: 0.3s;
}

.delete-btn:hover {
  background: #16a34a;
}
</style>
