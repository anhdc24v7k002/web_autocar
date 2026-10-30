import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Cars from "../views/Cars.vue";
import CarDetail from "../views/CarDetail.vue";
import RentCar from "../views/RentCar.vue";
import RentedStatus from "../views/RentedStatus.vue";
import Schedule from "../views/Schedule.vue";
import Contact from "../views/Contact.vue";
import AdminDashboard from "../views/AdminDashboard.vue";
import AdminCars from "../views/AdminCars.vue";
import AdminRentals from "../views/AdminRentals.vue";
import AdminAddCar from "../views/AdminAddCar.vue";
import AdminEditCar from "../views/AdminEditCar.vue";
import AdminAddRental from "../views/AdminAddRental.vue";
import AdminEditRental from "../views/AdminEditRental.vue";
import AdminCustomers from "../views/AdminCustomers.vue";
import AdminAddCustomer from "../views/AdminAddCustomer.vue";
import AdminEditCustomer from "../views/AdminEditCustomer.vue";
import AdminCustomerRentals from "../views/AdminCustomerRentals.vue";
import AdminContacts from "../views/AdminContacts.vue";
import AdminCarBrands from "../views/AdminCarBrands.vue";
import AdminCarTypes from "../views/AdminCarTypes.vue";
import AdminTransmissions from "../views/AdminTransmissions.vue";
import AdminPaymentMethods from "../views/AdminPaymentMethods.vue";
import MyAccount from "../views/MyAccount.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/login", name: "login", component: Login },
  { path: "/register", name: "register", component: Register },
  { path: "/cars", name: "cars", component: Cars },
  { path: "/cars/:id", name: "car-detail", component: CarDetail },
  {
    path: "/rent/:id",
    name: "rent",
    component: RentCar,
    meta: { requiresAuth: true },
  },
  {
    path: "/rented-status",
    name: "rented-status",
    component: RentedStatus,
    meta: { requiresAuth: true },
  },
  {
    path: "/schedule",
    name: "schedule",
    component: Schedule,
    meta: { requiresAuth: true },
  },
  { path: "/contact", name: "contact", component: Contact },
  {
    path: "/admin",
    name: "admin",
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin",
    name: "admin",
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/cars",
    name: "admin-cars",
    component: AdminCars,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/rentals",
    name: "admin-rentals",
    component: AdminRentals,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/cars/add",
    name: "admin-add-car",
    component: AdminAddCar,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/cars/edit/:id",
    name: "admin-edit-car",
    component: AdminEditCar,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/rentals/add",
    name: "admin-add-rental",
    component: AdminAddRental,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/rentals/edit/:id",
    name: "admin-edit-rental",
    component: AdminEditRental,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/customers",
    name: "admin-customers",
    component: AdminCustomers,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/customers/add",
    component: AdminAddCustomer,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/customers/edit/:id",
    component: AdminEditCustomer,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/customers/:id/rentals",
    component: AdminCustomerRentals,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/contacts",
    name: "admin-contacts",
    component: AdminContacts,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/car-brands",
    component: AdminCarBrands,
  },
  {
    path: "/admin/car-types",
    name: "AdminCarTypes",
    component: AdminCarTypes,
  },
  {
    path: "/admin/transmissions",
    name: "AdminTransmissions",
    component: AdminTransmissions,
  },
  {
    path: "/admin/payment-methods",
    name: "AdminPaymentMethods",
    component: AdminPaymentMethods,
  },
  {
    path: "/my-account",
    name: "MyAccount",
    component: MyAccount,
  },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (to.meta.requiresAuth && !token) {
    return "/login";
  }

  if (to.meta.requiresAdmin && user.role !== "admin") {
    return "/";
  }
});

export default router;
