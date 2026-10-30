<template>
  <section class="admin-page">
    <div class="page-header">
      <div>
        <h1>Quản lý phương thức thanh toán</h1>
      </div>

      <button class="add-btn" @click="openAddModal">+ Thêm phương thức</button>
    </div>

    <div
      v-if="message"
      class="alert"
      :class="messageType === 'success' ? 'success' : 'error'"
    >
      {{ message }}
    </div>

    <div class="search-box">
      <label>Tìm kiếm phương thức thanh toán</label>

      <div class="search-row">
        <input
          v-model.trim="keyword"
          type="text"
          placeholder="Nhập mã, tên hoặc mô tả..."
        />

        <button type="button" @click="fetchPaymentMethods">Làm mới</button>
      </div>
    </div>

    <div class="table-box">
      <div class="table-header">
        <h2>Danh sách phương thức thanh toán</h2>

        <span>
          Tổng cộng: {{ filteredPaymentMethods.length }} phương thức
        </span>
      </div>

      <div v-if="loading" class="empty">Đang tải dữ liệu...</div>

      <div v-else class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã</th>
              <th>Tên phương thức</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in filteredPaymentMethods" :key="item._id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.code }}</td>
              <td>
                <strong>{{ item.name }}</strong>
              </td>
              <td>{{ item.description || "Chưa có mô tả" }}</td>
              <td>
                <span
                  class="status"
                  :class="item.active ? 'active' : 'inactive'"
                >
                  {{ item.active ? "Đang hoạt động" : "Ngừng hoạt động" }}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  class="edit-btn"
                  @click="openEditModal(item)"
                >
                  Sửa
                </button>

                <button
                  type="button"
                  class="delete-btn"
                  @click="confirmDelete(item)"
                >
                  Xóa
                </button>
              </td>
            </tr>

            <tr v-if="filteredPaymentMethods.length === 0">
              <td colspan="6" class="empty">
                Chưa có phương thức thanh toán nào
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="showFormModal"
      class="modal-overlay"
      @click.self="closeFormModal"
    >
      <div class="modal">
        <h2>
          {{
            editingId
              ? "Cập nhật phương thức thanh toán"
              : "Thêm phương thức thanh toán"
          }}
        </h2>

        <form @submit.prevent="submitForm">
          <label>Mã phương thức</label>
          <input
            v-model.trim="form.code"
            type="text"
            placeholder="Mã phương thức"
          />

          <label>Tên phương thức</label>
          <input
            v-model.trim="form.name"
            type="text"
            placeholder="Tên phương thức"
          />

          <label>Mô tả</label>
          <textarea
            v-model.trim="form.description"
            rows="4"
            placeholder="Nhập mô tả"
          ></textarea>

          <label>Ảnh QR</label>

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            @change="handleImageChange"
          />

          <img v-if="imagePreview" :src="imagePreview" class="qr-preview" />

          <label class="checkbox-row">
            <input v-model="form.active" type="checkbox" />
            Đang hoạt động
          </label>

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

    <div
      v-if="showDeleteModal"
      class="modal-overlay"
      @click.self="closeDeleteModal"
    >
      <div class="modal">
        <h2>Xác nhận xóa</h2>

        <p>
          Bạn có chắc muốn xóa phương thức
          <strong>"{{ selectedPaymentMethod?.name }}"</strong>
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
            @click="deletePaymentMethod"
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

const paymentMethods = ref([]);
const keyword = ref("");

const loading = ref(false);
const submitting = ref(false);
const deleting = ref(false);

const showFormModal = ref(false);
const showDeleteModal = ref(false);

const editingId = ref(null);
const selectedPaymentMethod = ref(null);

const message = ref("");
const messageType = ref("success");
const formError = ref("");

const selectedImage = ref(null);
const imagePreview = ref("");

const form = reactive({
  code: "",
  name: "",
  description: "",
  active: true,
});

const handleImageChange = (event) => {
  const file = event.target.files?.[0];

  if (!file) {
    selectedImage.value = null;
    imagePreview.value = "";
    return;
  }

  selectedImage.value = file;
  imagePreview.value = URL.createObjectURL(file);
};

const filteredPaymentMethods = computed(() => {
  const value = keyword.value.toLowerCase().trim();

  if (!value) return paymentMethods.value;

  return paymentMethods.value.filter((item) => {
    return (
      item.code?.toLowerCase().includes(value) ||
      item.name?.toLowerCase().includes(value) ||
      item.description?.toLowerCase().includes(value)
    );
  });
});

const fetchPaymentMethods = async () => {
  loading.value = true;

  try {
    const response = await api.get("/payment-methods");

    paymentMethods.value = Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (error) {
    showMessage(
      error.response?.data?.message ||
        "Không thể tải danh sách phương thức thanh toán",
      "error",
    );
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  editingId.value = null;
  form.code = "";
  form.name = "";
  form.description = "";
  form.qrImage = "";
  form.active = true;

  selectedImage.value = null;
  imagePreview.value = "";

  formError.value = "";
};
const openAddModal = () => {
  resetForm();
  showFormModal.value = true;
};

const openEditModal = (item) => {
  editingId.value = item._id;
  form.code = item.code || "";
  form.name = item.name || "";
  form.description = item.description || "";
  form.qrImage = item.qrImage || "";
  form.active = item.active !== false;
  formError.value = "";
  showFormModal.value = true;
  imagePreview.value = item.qrImage
    ? `http://localhost:5000${item.qrImage}`
    : "";

  selectedImage.value = null;
};

const closeFormModal = () => {
  if (submitting.value) return;

  showFormModal.value = false;
  resetForm();
};

const submitForm = async () => {
  if (!form.code.trim() || !form.name.trim()) {
    formError.value = "Mã và tên phương thức không được để trống";
    return;
  }

  submitting.value = true;
  formError.value = "";

  try {
    const formData = new FormData();

    formData.append("code", form.code.trim());
    formData.append("name", form.name.trim());
    formData.append("description", form.description.trim());
    formData.append("active", form.active);

    if (selectedImage.value) {
      formData.append("qrImage", selectedImage.value);
    }

    if (editingId.value) {
      await api.put(`/payment-methods/${editingId.value}`, formData);

      showMessage("Cập nhật phương thức thanh toán thành công", "success");
    } else {
      await api.post("/payment-methods", formData);

      showMessage("Thêm phương thức thanh toán thành công", "success");
    }

    showFormModal.value = false;
    resetForm();
    await fetchPaymentMethods();
  } catch (error) {
    formError.value =
      error.response?.data?.message || "Không thể lưu phương thức thanh toán";
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = (item) => {
  selectedPaymentMethod.value = item;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  if (deleting.value) return;

  showDeleteModal.value = false;
  selectedPaymentMethod.value = null;
};

const deletePaymentMethod = async () => {
  if (!selectedPaymentMethod.value?._id) return;

  deleting.value = true;

  try {
    await api.delete(`/payment-methods/${selectedPaymentMethod.value._id}`);

    showMessage("Xóa phương thức thanh toán thành công", "success");

    showDeleteModal.value = false;
    selectedPaymentMethod.value = null;

    await fetchPaymentMethods();
  } catch (error) {
    showMessage(
      error.response?.data?.message || "Không thể xóa phương thức thanh toán",
      "error",
    );
  } finally {
    deleting.value = false;
  }
};

const formatMessage = (content, type) => {
  message.value = content;
  messageType.value = type;
};

const showMessage = (content, type) => {
  formatMessage(content, type);

  setTimeout(() => {
    message.value = "";
  }, 4000);
};

onMounted(() => {
  fetchPaymentMethods();
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
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 950px;
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

.status {
  display: inline-block;
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 13px;
  font-weight: 700;
}

.status.active {
  background: #dcfce7;
  color: #166534;
}

.status.inactive {
  background: #fee2e2;
  color: #991b1b;
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
  max-width: 500px;
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

.checkbox-row {
  display: flex !important;
  align-items: center;
  gap: 8px;
}

.checkbox-row input {
  width: auto;
}

.modal-actions {
  justify-content: flex-end;
  margin-top: 20px;
}

.form-error {
  color: #dc2626;
}
.qr-preview {
  display: block;
  width: 180px;
  height: 180px;
  margin-top: 12px;
  object-fit: contain;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
}
</style>
