<template>
  <div class="admin-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Quản lý hãng xe</h1>
        <p>Quản lý danh sách các hãng xe trong hệ thống</p>
      </div>

      <button class="btn btn-add" @click="openAddModal">+ Thêm hãng xe</button>
    </div>

    <!-- Thông báo -->
    <div
      v-if="message"
      class="alert"
      :class="messageType === 'success' ? 'alert-success' : 'alert-error'"
    >
      <span>{{ message }}</span>
      <button type="button" class="alert-close" @click="message = ''">×</button>
    </div>

    <!-- Thanh tìm kiếm -->
    <div class="filter-card">
      <div class="search-group">
        <label for="brand-search">Tìm kiếm hãng xe</label>

        <div class="search-row">
          <input
            id="brand-search"
            v-model.trim="searchKeyword"
            type="text"
            placeholder="Nhập tên hãng xe hoặc mô tả..."
          />

          <button
            type="button"
            class="btn btn-refresh"
            :disabled="loading"
            @click="fetchBrands"
          >
            {{ loading ? "Đang tải..." : "Làm mới" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Bảng hãng xe -->
    <div class="table-card">
      <div class="table-header">
        <h2>Danh sách hãng xe</h2>

        <span class="total">
          Tổng cộng: {{ filteredBrands.length }} hãng xe
        </span>
      </div>

      <div v-if="loading" class="loading">Đang tải danh sách hãng xe...</div>

      <div v-else class="table-responsive">
        <table>
          <thead>
            <tr>
              <th class="column-index">STT</th>
              <th>Tên hãng xe</th>
              <th>Mô tả</th>
              <th>Ngày tạo</th>
              <th>Ngày cập nhật</th>
              <th class="column-actions">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(brand, index) in paginatedBrands" :key="brand._id">
              <td>{{ startIndex + index + 1 }}</td>

              <td>
                <strong class="brand-name">
                  {{ brand.name }}
                </strong>
              </td>

              <td class="description-cell">
                {{ brand.description || "Chưa có mô tả" }}
              </td>

              <td>{{ formatDate(brand.createdAt) }}</td>

              <td>{{ formatDate(brand.updatedAt) }}</td>

              <td>
                <div class="action-buttons">
                  <button
                    type="button"
                    class="btn-action btn-edit"
                    @click="openEditModal(brand)"
                  >
                    Sửa
                  </button>

                  <button
                    type="button"
                    class="btn-action btn-delete"
                    @click="confirmDelete(brand)"
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="paginatedBrands.length === 0">
              <td colspan="6" class="empty-data">
                {{
                  searchKeyword
                    ? "Không tìm thấy hãng xe phù hợp"
                    : "Chưa có hãng xe nào"
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Phân trang -->
      <div
        v-if="!loading && filteredBrands.length > itemsPerPage"
        class="pagination"
      >
        <button
          type="button"
          class="page-button"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          Trước
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          type="button"
          class="page-button"
          :class="{ active: currentPage === page }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>

        <button
          type="button"
          class="page-button"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          Sau
        </button>
      </div>
    </div>

    <!-- Modal thêm/sửa -->
    <div
      v-if="showFormModal"
      class="modal-overlay"
      @click.self="closeFormModal"
    >
      <div class="modal-container">
        <div class="modal-header">
          <h2>
            {{ isEditing ? "Cập nhật hãng xe" : "Thêm hãng xe" }}
          </h2>

          <button type="button" class="modal-close" @click="closeFormModal">
            ×
          </button>
        </div>

        <form @submit.prevent="submitForm">
          <div class="modal-body">
            <div class="form-group">
              <label for="brand-name">
                Tên hãng xe
                <span class="required">*</span>
              </label>

              <input
                id="brand-name"
                v-model.trim="form.name"
                type="text"
                maxlength="255"
                placeholder="Ví dụ: Toyota"
                :class="{ invalid: formErrors.name }"
                autocomplete="off"
              />

              <small v-if="formErrors.name" class="error-text">
                {{ formErrors.name }}
              </small>
            </div>

            <div class="form-group">
              <label for="brand-description">Mô tả</label>

              <textarea
                id="brand-description"
                v-model.trim="form.description"
                rows="5"
                maxlength="255"
                placeholder="Nhập mô tả về hãng xe..."
              ></textarea>

              <div class="character-count">
                {{ form.description.length }}/255
              </div>
            </div>

            <div v-if="formErrorMessage" class="form-error">
              {{ formErrorMessage }}
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-cancel"
              :disabled="submitting"
              @click="closeFormModal"
            >
              Hủy
            </button>

            <button type="submit" class="btn btn-save" :disabled="submitting">
              {{
                submitting
                  ? "Đang lưu..."
                  : isEditing
                    ? "Cập nhật"
                    : "Thêm hãng xe"
              }}
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
      <div class="modal-container delete-modal">
        <div class="modal-header">
          <h2>Xác nhận xóa</h2>

          <button type="button" class="modal-close" @click="closeDeleteModal">
            ×
          </button>
        </div>

        <div class="modal-body">
          <p>
            Bạn có chắc chắn muốn xóa hãng xe
            <strong> "{{ selectedBrand?.name }}" </strong>
            không?
          </p>

          <p class="delete-warning">Hành động này không thể hoàn tác.</p>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-cancel"
            :disabled="deleting"
            @click="closeDeleteModal"
          >
            Hủy
          </button>

          <button
            type="button"
            class="btn btn-confirm-delete"
            :disabled="deleting"
            @click="deleteBrand"
          >
            {{ deleting ? "Đang xóa..." : "Xóa hãng xe" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../services/api.js";

export default {
  name: "AdminCarBrands",

  data() {
    return {
      brands: [],
      searchKeyword: "",

      loading: false,
      submitting: false,
      deleting: false,

      showFormModal: false,
      showDeleteModal: false,

      selectedBrand: null,
      editingId: null,

      currentPage: 1,
      itemsPerPage: 10,

      message: "",
      messageType: "success",
      formErrorMessage: "",

      form: {
        name: "",
        description: "",
      },

      formErrors: {
        name: "",
      },
    };
  },

  computed: {
    isEditing() {
      return Boolean(this.editingId);
    },

    filteredBrands() {
      const keyword = this.searchKeyword.toLowerCase().trim();

      if (!keyword) {
        return this.brands;
      }

      return this.brands.filter((brand) => {
        const name = brand.name?.toLowerCase() || "";
        const description = brand.description?.toLowerCase() || "";

        return name.includes(keyword) || description.includes(keyword);
      });
    },

    totalPages() {
      return Math.ceil(this.filteredBrands.length / this.itemsPerPage);
    },

    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },

    paginatedBrands() {
      return this.filteredBrands.slice(
        this.startIndex,
        this.startIndex + this.itemsPerPage,
      );
    },
  },

  watch: {
    searchKeyword() {
      this.currentPage = 1;
    },

    filteredBrands() {
      if (this.totalPages > 0 && this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
    },
  },

  mounted() {
    this.fetchBrands();
  },

  methods: {
    async fetchBrands() {
      this.loading = true;

      try {
        const response = await api.get("/car-brands");

        /*
         * Hỗ trợ các kiểu phản hồi:
         * 1. { success: true, data: [...] }
         * 2. { brands: [...] }
         * 3. [...]
         */
        if (Array.isArray(response.data)) {
          this.brands = response.data;
        } else if (Array.isArray(response.data.data)) {
          this.brands = response.data.data;
        } else if (Array.isArray(response.data.brands)) {
          this.brands = response.data.brands;
        } else {
          this.brands = [];
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách hãng xe:", error);

        this.showMessage(
          this.getErrorMessage(error, "Không thể tải danh sách hãng xe"),
          "error",
        );
      } finally {
        this.loading = false;
      }
    },

    openAddModal() {
      this.resetForm();
      this.editingId = null;
      this.showFormModal = true;
    },

    openEditModal(brand) {
      this.resetForm();

      this.editingId = brand._id;

      this.form = {
        name: brand.name || "",
        description: brand.description || "",
      };

      this.showFormModal = true;
    },

    closeFormModal() {
      if (this.submitting) {
        return;
      }

      this.showFormModal = false;
      this.resetForm();
    },

    resetForm() {
      this.editingId = null;

      this.form = {
        name: "",
        description: "",
      };

      this.formErrors = {
        name: "",
      };

      this.formErrorMessage = "";
    },

    validateForm() {
      this.formErrors.name = "";
      this.formErrorMessage = "";

      if (!this.form.name) {
        this.formErrors.name = "Tên hãng xe không được để trống";
        return false;
      }

      if (this.form.name.length < 2) {
        this.formErrors.name = "Tên hãng xe phải có ít nhất 2 ký tự";
        return false;
      }

      if (this.form.name.length > 255) {
        this.formErrors.name = "Tên hãng xe không được vượt quá 255 ký tự";
        return false;
      }

      return true;
    },

    async submitForm() {
      if (!this.validateForm()) {
        return;
      }

      this.submitting = true;
      this.formErrorMessage = "";

      const payload = {
        name: this.form.name.trim(),
        description: this.form.description.trim(),
      };

      try {
        if (this.isEditing) {
          await api.put(`/car-brands/${this.editingId}`, payload);

          this.showMessage("Cập nhật hãng xe thành công", "success");
        } else {
          await api.post("/car-brands", payload);

          this.showMessage("Thêm hãng xe thành công", "success");
        }

        this.showFormModal = false;
        this.resetForm();
        await this.fetchBrands();
      } catch (error) {
        console.error("Lỗi lưu hãng xe:", error);

        this.formErrorMessage = this.getErrorMessage(
          error,
          this.isEditing
            ? "Không thể cập nhật hãng xe"
            : "Không thể thêm hãng xe",
        );
      } finally {
        this.submitting = false;
      }
    },

    confirmDelete(brand) {
      this.selectedBrand = brand;
      this.showDeleteModal = true;
    },

    closeDeleteModal() {
      if (this.deleting) {
        return;
      }

      this.showDeleteModal = false;
      this.selectedBrand = null;
    },

    async deleteBrand() {
      if (!this.selectedBrand?._id) {
        return;
      }

      this.deleting = true;

      try {
        await api.delete(`/car-brands/${this.selectedBrand._id}`);

        this.showMessage("Xóa hãng xe thành công", "success");

        this.showDeleteModal = false;
        this.selectedBrand = null;

        await this.fetchBrands();
      } catch (error) {
        console.error("Lỗi xóa hãng xe:", error);

        this.showMessage(
          this.getErrorMessage(error, "Không thể xóa hãng xe"),
          "error",
        );
      } finally {
        this.deleting = false;
      }
    },

    changePage(page) {
      if (page < 1 || page > this.totalPages) {
        return;
      }

      this.currentPage = page;
    },

    formatDate(dateValue) {
      if (!dateValue) {
        return "—";
      }

      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return "—";
      }

      return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    getErrorMessage(error, defaultMessage) {
      return (
        error.response?.data?.message ||
        error.response?.data?.error ||
        defaultMessage
      );
    },

    showMessage(content, type = "success") {
      this.message = content;
      this.messageType = type;

      window.clearTimeout(this.messageTimer);

      this.messageTimer = window.setTimeout(() => {
        this.message = "";
      }, 4000);
    },
  },

  beforeUnmount() {
    window.clearTimeout(this.messageTimer);
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.admin-page {
  min-height: 100vh;
  padding: 30px;
  background: #f5f6fa;
  color: #1f2937;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 7px;
  color: #111827;
  font-size: 28px;
  font-weight: 700;
}

.page-header p {
  margin: 0;
  color: #6b7280;
  font-size: 15px;
}

.btn {
  border: none;
  border-radius: 7px;
  padding: 11px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease,
    opacity 0.2s ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.btn-add,
.btn-save {
  background: #f97316;
  color: #ffffff;
}

.btn-add:hover:not(:disabled),
.btn-save:hover:not(:disabled) {
  background: #ea580c;
}

.btn-refresh {
  background: #111827;
  color: #ffffff;
  white-space: nowrap;
}

.btn-refresh:hover:not(:disabled) {
  background: #000000;
}

.btn-cancel {
  background: #e5e7eb;
  color: #374151;
}

.btn-cancel:hover:not(:disabled) {
  background: #d1d5db;
}

.btn-confirm-delete {
  background: #dc2626;
  color: #ffffff;
}

.btn-confirm-delete:hover:not(:disabled) {
  background: #b91c1c;
}

.alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 20px;
  border-radius: 7px;
  padding: 13px 16px;
  font-size: 14px;
}

.alert-success {
  border: 1px solid #86efac;
  background: #dcfce7;
  color: #166534;
}

.alert-error {
  border: 1px solid #fca5a5;
  background: #fee2e2;
  color: #991b1b;
}

.alert-close {
  border: none;
  background: transparent;
  color: inherit;
  font-size: 22px;
  cursor: pointer;
}

.filter-card,
.table-card {
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 2px 10px rgb(0 0 0 / 5%);
}

.filter-card {
  margin-bottom: 22px;
  padding: 20px;
}

.search-group {
  max-width: 700px;
}

.search-group label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
}

.search-row {
  display: flex;
  gap: 12px;
}

.search-row input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 7px;
  padding: 11px 13px;
  font-size: 14px;
  outline: none;
}

.search-row input:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgb(249 115 22 / 12%);
}

.table-card {
  padding: 22px;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 18px;
}

.table-header h2 {
  margin: 0;
  color: #111827;
  font-size: 20px;
}

.total {
  color: #6b7280;
  font-size: 14px;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
}

thead {
  background: #f9fafb;
}

th,
td {
  border-bottom: 1px solid #e5e7eb;
  padding: 14px 13px;
  text-align: left;
  vertical-align: middle;
  font-size: 14px;
}

th {
  color: #374151;
  font-weight: 700;
  white-space: nowrap;
}

td {
  color: #4b5563;
}

tbody tr:hover {
  background: #fafafa;
}

.column-index {
  width: 70px;
}

.column-actions {
  width: 150px;
}

.brand-name {
  color: #111827;
}

.description-cell {
  max-width: 340px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 7px;
}

.btn-action {
  border: none;
  border-radius: 6px;
  padding: 7px 12px;
  color: #ffffff;
  font-size: 13px;
  cursor: pointer;
}

.btn-edit {
  background: #2563eb;
}

.btn-edit:hover {
  background: #1d4ed8;
}

.btn-delete {
  background: #dc2626;
}

.btn-delete:hover {
  background: #b91c1c;
}

.loading,
.empty-data {
  padding: 40px 20px;
  color: #6b7280;
  text-align: center;
}

.empty-data {
  font-style: italic;
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 7px;
  margin-top: 20px;
}

.page-button {
  min-width: 38px;
  height: 38px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  color: #374151;
  cursor: pointer;
}

.page-button:hover:not(:disabled) {
  border-color: #f97316;
  color: #f97316;
}

.page-button.active {
  border-color: #f97316;
  background: #f97316;
  color: #ffffff;
}

.page-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
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

.modal-container {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 20px 50px rgb(0 0 0 / 20%);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px 22px;
}

.modal-header h2 {
  margin: 0;
  color: #111827;
  font-size: 21px;
}

.modal-close {
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
}

.modal-close:hover {
  color: #111827;
}

.modal-body {
  padding: 22px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #e5e7eb;
  padding: 17px 22px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
}

.required {
  color: #dc2626;
}

.form-group input,
.form-group textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 7px;
  padding: 11px 13px;
  color: #111827;
  font-family: inherit;
  font-size: 14px;
  outline: none;
}

.form-group textarea {
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgb(249 115 22 / 12%);
}

.form-group input.invalid {
  border-color: #dc2626;
}

.error-text {
  display: block;
  margin-top: 6px;
  color: #dc2626;
  font-size: 13px;
}

.character-count {
  margin-top: 5px;
  color: #9ca3af;
  font-size: 12px;
  text-align: right;
}

.form-error {
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 11px 13px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 13px;
}

.delete-modal {
  max-width: 470px;
}

.delete-modal p {
  margin: 0 0 10px;
  color: #374151;
  line-height: 1.6;
}

.delete-warning {
  color: #dc2626 !important;
  font-size: 14px;
}

@media (max-width: 768px) {
  .admin-page {
    padding: 18px;
  }

  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .btn-add {
    width: 100%;
  }

  .search-row {
    flex-direction: column;
  }

  .table-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .pagination {
    justify-content: center;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .modal-footer .btn {
    width: 100%;
  }
}
</style>
