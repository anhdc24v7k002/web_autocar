<template>
  <section class="section container">
    <h2 class="section-title">Liên hệ Auto Car</h2>
    <div class="detail">
      <div class="contact-info">
        <h3>Thông tin liên hệ</h3>
        <p><b>Địa chỉ:</b> Đường 3/2, Ninh Kiều, Cần Thơ</p>
        <p><b>Điện thoại:</b> 0859 144 277</p>
        <p><b>Email:</b> autocar@gmail.com</p>
        <p><b>Thời gian:</b> 8:00 - 21:00 mỗi ngày</p>
      </div>
      <div class="form-box" style="margin: 0; max-width: none">
        <p v-if="message" class="success">{{ message }}</p>
        <form @submit.prevent="sendContact">
          <div class="form-group">
            <label>Họ tên</label><input v-model="form.name" required />
          </div>
          <div class="form-group">
            <label>Email</label
            ><input v-model="form.email" type="email" required />
          </div>
          <div class="form-group">
            <label>Số điện thoại</label><input v-model="form.phone" />
          </div>
          <div class="form-group">
            <label>Nội dung</label
            ><textarea v-model="form.message" rows="5" required></textarea>
          </div>
          <button class="btn">Gửi liên hệ</button>
        </form>
      </div>
    </div>
  </section>
</template>
<script setup>
import { reactive, ref } from "vue";
import api from "../services/api";
const message = ref("");
const form = reactive({ name: "", email: "", phone: "", message: "" });
const sendContact = async () => {
  const res = await api.post("/contacts", form);
  message.value = res.data.message;
  form.name = "";
  form.email = "";
  form.phone = "";
  form.message = "";
};
</script>
