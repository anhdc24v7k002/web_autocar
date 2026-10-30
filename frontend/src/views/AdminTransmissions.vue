<template>
  <section class="admin-page">
    <div class="page-header">
      <div>
        <h1>Quản lý hộp số</h1>
        <p>Quản lý danh sách hộp số của các xe trong hệ thống</p>
      </div>

      <button class="add-btn" @click="openAddModal">+ Thêm hộp số</button>
    </div>

    <div
      v-if="message"
      class="alert"
      :class="messageType === 'success' ? 'success' : 'error'"
    >
      {{ message }}
    </div>

    <div class="search-box">
      <label>Tìm kiếm hộp số</label>

      <div class="search-row">
        <input
          v-model.trim="keyword"
          type="text"
          placeholder="Nhập tên hộp số hoặc mô tả..."
        />

        <button type="button" @click="fetchTransmissions">Làm mới</button>
      </div>
    </div>

    <div class="table-box">
      <div class="table-header">
        <h2>Danh sách hộp số</h2>

        <span> Tổng cộng: {{ filteredTransmissions.length }} hộp số </span>
      </div>

      <div v-if="loading" class="empty">Đang tải dữ liệu...</div>

      <div v-else class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên hộp số</th>
              <th>Mô tả</th>
              <th>Ngày tạo</th>
              <th>Ngày cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(transmission, index) in filteredTransmissions"
              :key="transmission._id"
            >
              <td>{{ index + 1 }}</td>

              <td>
                <strong>{{ transmission.name }}</strong>
              </td>

              <td>
                {{ transmission.description || "Chưa có mô tả" }}
              </td>

              <td>{{ formatDate(transmission.createdAt) }}</td>

              <td>{{ formatDate(transmission.updatedAt) }}</td>

              <td>
                <button
                  type="button"
                  class="edit-btn"
                  @click="openEditModal(transmission)"
                >
                  Sửa
                </button>

                <button
                  type="button"
                  class="delete-btn"
                  @click="confirmDelete(transmission)"
                >
                  Xóa
                </button>
              </td>
            </tr>

            <tr v-if="filteredTransmissions.length === 0">
              <td colspan="6" class="empty">Chưa có hộp số nào</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal thêm/sửa -->
    <div
      v-if="showFormModal"
      class="modal-overlay"
      @click.self="closeFormModal"
    >
      <div class="modal">
        <h2>
          {{ editingId ? "Cập nhật hộp số" : "Thêm hộp số" }}
        </h2>

        <form @submit.prevent="submitForm">
          <label>Tên hộp số</label>

          <input
            v-model.trim="form.name"
            type="text"
            placeholder="Ví dụ: Số tự động"
            required
          />

          <label>Mô tả</label>

          <textarea
            v-model.trim="form.description"
            rows="4"
            placeholder="Nhập mô tả hộp số"
          ></textarea>

          <p v-if="formError" class="form-error">
            {{ formError }}
          </p>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="closeFormModal">
              Hủy
            </button>

            <button type="submit" class="save-btn" :disabled="submitting">
              {{ submitting ? "Đang lưu..." : "Lưu" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal xác nhận xóa -->
    <div
      v-if="showDeleteModal"
      class="modal-overlay"
      @click.self="closeDeleteModal"
    >
      <div class="modal">
        <h2>Xác nhận xóa</h2>

        <p>
          Bạn có chắc muốn xóa hộp số
          <strong>"{{ selectedTransmission?.name }}"</strong>
          không?
        </p>

        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="closeDeleteModal">
            Hủy
          </button>

          <button
            type="button"
            class="delete-btn"
            :disabled="deleting"
            @click="deleteTransmission"
          >
            {{ deleting ? "Đang xóa..." : "Xóa" }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import api from "../services/api";

const transmissions = ref([]);
const keyword = ref("");

const loading = ref(false);
const submitting = ref(false);
const deleting = ref(false);

const showFormModal = ref(false);
const showDeleteModal = ref(false);

const editingId = ref(null);
const selectedTransmission = ref(null);

const message = ref("");
const messageType = ref("success");
const formError = ref("");

const form = reactive({
  name: "",
  description: "",
});

const filteredTransmissions = computed(() => {
  const value = keyword.value.toLowerCase().trim();

  if (!value) {
    return transmissions.value;
  }

  return transmissions.value.filter((transmission) => {
    const name = transmission.name?.toLowerCase() || "";
    const description = transmission.description?.toLowerCase() || "";

    return name.includes(value) || description.includes(value);
  });
});

const fetchTransmissions = async () => {
  loading.value = true;

  try {
    const response = await api.get("/transmissions");

    transmissions.value = Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (error) {
    showMessage(
      error.response?.data?.message || "Không thể tải danh sách hộp số",
      "error",
    );
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  editingId.value = null;
  form.name = "";
  form.description = "";
  formError.value = "";
  showFormModal.value = true;
};

const openEditModal = (transmission) => {
  editingId.value = transmission._id;
  form.name = transmission.name || "";
  form.description = transmission.description || "";
  formError.value = "";
  showFormModal.value = true;
};

const closeFormModal = () => {
  if (submitting.value) return;

  showFormModal.value = false;
  editingId.value = null;
  form.name = "";
  form.description = "";
  formError.value = "";
};

const submitForm = async () => {
  if (!form.name.trim()) {
    formError.value = "Tên hộp số không được để trống";
    return;
  }

  submitting.value = true;
  formError.value = "";

  try {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
    };

    if (editingId.value) {
      await api.put(`/transmissions/${editingId.value}`, payload);

      showMessage("Cập nhật hộp số thành công", "success");
    } else {
      await api.post("/transmissions", payload);

      showMessage("Thêm hộp số thành công", "success");
    }

    showFormModal.value = false;
    editingId.value = null;
    form.name = "";
    form.description = "";

    await fetchTransmissions();
  } catch (error) {
    formError.value = error.response?.data?.message || "Không thể lưu hộp số";
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = (transmission) => {
  selectedTransmission.value = transmission;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  if (deleting.value) return;

  selectedTransmission.value = null;
  showDeleteModal.value = false;
};

const deleteTransmission = async () => {
  if (!selectedTransmission.value?._id) return;

  deleting.value = true;

  try {
    await api.delete(`/transmissions/${selectedTransmission.value._id}`);

    showMessage("Xóa hộp số thành công", "success");

    showDeleteModal.value = false;
    selectedTransmission.value = null;

    await fetchTransmissions();
  } catch (error) {
    showMessage(
      error.response?.data?.message || "Không thể xóa hộp số",
      "error",
    );
  } finally {
    deleting.value = false;
  }
};

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("vi-VN");
};

let messageTimer;

const showMessage = (content, type) => {
  message.value = content;
  messageType.value = type;

  clearTimeout(messageTimer);

  messageTimer = setTimeout(() => {
    message.value = "";
  }, 4000);
};

onMounted(() => {
  fetchTransmissions();
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.admin-page {
  min-height: 100vh;
  padding: 36px;
  background: #f4f6fb;
}

.page-header,
.table-header,
.search-row,
.modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 6px;
  font-size: 32px;
}

.page-header p {
  margin: 0;
  color: #6b7280;
}

.add-btn,
.save-btn {
  border: 0;
  border-radius: 8px;
  padding: 12px 18px;
  background: #ff6b14;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.search-box,
.table-box {
  margin-bottom: 24px;
  border-radius: 12px;
  padding: 24px;
  background: white;
  box-shadow: 0 5px 18px rgb(0 0 0 / 6%);
}

.search-box label {
  display: block;
  margin-bottom: 10px;
  font-weight: 700;
}

.search-row {
  justify-content: flex-start;
}

.search-row input {
  width: 650px;
  max-width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}

.search-row button {
  border: 0;
  border-radius: 8px;
  padding: 12px 18px;
  background: #081426;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.table-header {
  margin-bottom: 18px;
}

.table-header h2 {
  margin: 0;
}

.table-header span {
  color: #6b7280;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 850px;
  border-collapse: collapse;
}

th,
td {
  border-bottom: 1px solid #e5e7eb;
  padding: 14px;
  text-align: left;
}

th {
  background: #f8fafc;
}

.edit-btn,
.delete-btn,
.cancel-btn {
  margin-right: 8px;
  border: 0;
  border-radius: 7px;
  padding: 8px 13px;
  color: white;
  cursor: pointer;
}

.edit-btn {
  background: #2563eb;
}

.delete-btn {
  background: #dc2626;
}

.cancel-btn {
  background: #6b7280;
}

.alert {
  margin-bottom: 20px;
  border-radius: 8px;
  padding: 14px;
}

.alert.success {
  background: #dcfce7;
  color: #166534;
}

.alert.error {
  background: #fee2e2;
  color: #991b1b;
}

.empty {
  padding: 35px;
  color: #6b7280;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(0 0 0 / 50%);
}

.modal {
  width: 100%;
  max-width: 480px;
  border-radius: 12px;
  padding: 24px;
  background: white;
}

.modal h2 {
  margin-top: 0;
}

.modal label {
  display: block;
  margin: 16px 0 8px;
  font-weight: 700;
}

.modal input,
.modal textarea {
  width: 100%;
  padding: 11px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: inherit;
}

.modal textarea {
  resize: vertical;
}

.modal-actions {
  justify-content: flex-end;
  margin-top: 20px;
}

.form-error {
  color: #dc2626;
}

@media (max-width: 768px) {
  .admin-page {
    padding: 18px;
  }

  .page-header,
  .table-header,
  .search-row {
    align-items: stretch;
    flex-direction: column;
  }

  .search-row input {
    width: 100%;
  }
}
</style>
