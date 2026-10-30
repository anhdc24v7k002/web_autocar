import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Car from "./models/Car.js";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();
await connectDB();

const adminPassword = await bcrypt.hash("admin123456", 10);

await User.deleteOne({ email: "admin@autocar.com" });

await User.create({
  fullName: "Quản trị viên Auto Car",
  email: "admin@autocar.com",
  phone: "0859144277",
  password: adminPassword,
  role: "admin",
});

console.log("Admin account created");
await Car.deleteMany();
await Car.insertMany([
  {
    name: "Toyota Camry 2023",
    brand: "Toyota",
    type: "Sedan",
    seats: 5,
    transmission: "Số tự động",
    pricePerDay: 750000,
    image:
      "https://i.gaw.to/vehicles/photos/40/29/402979-2023-toyota-camry.jpg?1024x640",
    description:
      "Xe sedan sang trọng, tiết kiệm nhiên liệu, phù hợp đi công tác hoặc du lịch gia đình.",
    status: "available",
  },
  {
    name: "Honda Civic 2022",
    brand: "Honda",
    type: "Sedan",
    seats: 5,
    transmission: "Số tự động",
    pricePerDay: 800000,
    image:
      "https://eibach.com/storage/img/product-release/2022-honda-civic-si/featured_image.jpg",
    description: "Thiết kế thể thao, vận hành ổn định, nội thất hiện đại.",
    status: "available",
  },
  {
    name: "Ford Everest 2023",
    brand: "Ford",
    type: "SUV",
    seats: 7,
    transmission: "Số tự động",
    pricePerDay: 950000,
    image:
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEje-LME1yI7BnoUKRig1pUH5B5G92f6lYnmyEaOvXieuaMxy2ogKc0cMTomPRJhlGUb9jUlwiYTej2H2Mxi2BfffuMmVDHqqQcI5OGjiENQqEAGOP13pTivTzPrYt-hyU3YUjfHGpbVvI9hPx1IFuLt1Yz8XimAzOlMR5lIpJbMqvJp0u7NZn0ILDD2Ow/s1469/Screen%20Shot%202022-04-12%20at%2003.03.26.jpg",
    description:
      "SUV 7 chỗ mạnh mẽ, phù hợp đi xa, đi du lịch nhóm hoặc gia đình lớn.",
    status: "available",
  },
  {
    name: "Mercedes C300 2022",
    brand: "Mercedes-Benz",
    type: "Luxury",
    seats: 5,
    transmission: "Số tự động",
    pricePerDay: 1100000,
    image:
      "https://mercedesphumyhung.com.vn/wp-content/uploads/2025/06/Danh-Gia-Xe-Mercedes-C300-AMG-2022-1024x683.jpg",
    description:
      "Dòng xe cao cấp, sang trọng, phù hợp sự kiện, cưới hỏi và tiếp khách.",
    status: "available",
  },
  {
    name: "Mazda CX5 2024",
    brand: "Mazda",
    type: "SUV",
    seats: 5,
    transmission: "Số tự động",
    pricePerDay: 950000,
    image:
      "https://static1.topspeedimages.com/wordpress/wp-content/uploads/wm/2024/08/mazda-cx-5-27.jpg",
    description: "SUV hiện đại, rộng rãi, phù hợp gia đình và du lịch.",
  },
  {
    name: "Kia Seltos 2023",
    brand: "Kia",
    type: "SUV",
    seats: 5,
    transmission: "Số tự động",
    pricePerDay: 900000,
    image: "https://kiavietnam.com.vn/storage/360/seltos/trang.png",
    description: "Thiết kế trẻ trung, tiết kiệm nhiên liệu.",
  },

  {
    name: "Hyundai Accent 2023",
    brand: "Hyundai",
    type: "Sedan",
    seats: 5,
    transmission: "Số sàn",
    pricePerDay: 700000,
    image:
      "https://taneenrentacar.com/wp-content/uploads/2023/07/Hyundai-Accent-2023.png",
    description: "Xe sedan phổ thông phù hợp đi lại hằng ngày.",
  },

  {
    name: "Toyota Fortuner 2023",
    brand: "Toyota",
    type: "SUV",
    seats: 7,
    transmission: "Số tự động",
    pricePerDay: 1400000,
    image:
      "https://www.autopediame.com/storage/images/Toyota/Fortuner/fortuner1.jpg",
    description: "SUV 7 chỗ mạnh mẽ, phù hợp đường dài.",
  },

  {
    name: "BMW 520i",
    brand: "BMW",
    type: "Luxury",
    seats: 5,
    transmission: "Số tự động",
    pricePerDay: 3000000,
    image:
      "https://autos.yahoo.com.tw/p/r/w1200/car-trim/October2020/761f9bbcb2e3b084190e9f81d1553e33.jpeg?guccounter=1&guce_referrer=aHR0cHM6Ly9yLnNlYXJjaC55YWhvby5jb20vX3lsdD1Bd3IxUWpQeGVpTnFWdEFqSjBsMlV3eC47X3lsdT1jMlZqQTJad0xXbHRad1J6YkdzRGFXMW4vUlY9Mi9SRT0xNzgwNzM4OTI5L1JPPTExL1JVPWh0dHBzJTNhJTJmJTJmYXV0b3MueWFob28uY29tLnR3JTJmcCUyZnIlMmZ3MTIwMCUyZmNhci10cmltJTJmT2N0b2JlcjIwMjAlMmY3NjFmOWJiY2IyZTNiMDg0MTkwZTlmODFkMTU1M2UzMy5qcGVnL1JLPTIvUlM9RkpONzkuN0gzdnVUTEM2ZzJrUEtTMFN6QXFNLQ&guce_referrer_sig=AQAAAC6d7pdVMyZlnTexRBZ6PggR5v5Gvvi9Z_BawNbwZoTSuY0xqQjYN05mbxCsZFwK7rZmFK_ObQR2j9VS2Ve0gkDw1ewHWboLE6Ww-Y1JywFvWD9elaZ-CHvz4j76rpG_oRQlSCtYSgfyaGvzpl6SunriEmDbVFukTP8sx3Xr_xke",
    description: "Dòng sedan sang trọng, nội thất cao cấp.",
  },
  {
    name: "Audi A6 2022",
    brand: "Audi",
    type: "Luxury",
    seats: 5,
    transmission: "Số tự động",
    pricePerDay: 1700000,
    image:
      "https://www.motortrend.com/uploads/sites/5/2021/09/2022-Audi-A6-5081-1.jpg",
    description: "Thiết kế đẳng cấp, vận hành êm ái.",
  },
  {
    name: "Mitsubishi Xpander 2022",
    brand: "Mitsubishi",
    type: "MPV",
    seats: 7,
    transmission: "Số sàn",
    pricePerDay: 650000,
    image:
      "https://images2.thanhnien.vn/Uploaded/chicuong/2022_06_14/xpander-at-2022-5-9579.jpg",
    description: "MPV rộng rãi, phù hợp gia đình đông người.",
  },
  {
    name: "VinFast VF8 2022",
    brand: "VinFast",
    type: "Electric",
    seats: 5,
    transmission: "Xe điện",
    pricePerDay: 650000,
    image:
      "https://images.caradisiac.com/logos/3/3/1/5/273315/S8-mondial-de-paris-2022-vinfast-vf8-vf9-les-suv-electriques-garantis-10-ans-198095.jpg",
    description: "Xe điện hiện đại, công nghệ thông minh.",
  },
  {
    name: "VinFast VF3 2025",
    brand: "VinFast",
    type: "Electric",
    seats: 4,
    transmission: "Xe điện",
    pricePerDay: 450000,
    image:
      "https://motosaigon.vn/wp-content/uploads/2025/03/vinfast-vf3-gia-ban-2025-mau-sac-motosaigon-1.jpg",
    description:
      "VinFast VF3 là mẫu xe điện mini nhỏ gọn, thiết kế trẻ trung, phù hợp di chuyển trong đô thị với chi phí vận hành thấp.",
    status: "available",
  },
  {
    name: "VinFast VF5 2024",
    brand: "VinFast",
    type: "Electric",
    seats: 5,
    transmission: "Xe điện",
    pricePerDay: 500000,
    image: "https://vinfastauto.com/themes/porto/img/homepage-v2/vf5-green.png",
    description:
      "VinFast VF5 là xe điện cỡ nhỏ hiện đại, tiết kiệm chi phí vận hành, phù hợp di chuyển trong đô thị và các chuyến đi ngắn.",
    status: "available",
  },
]);

console.log("Seed cars successfully");
process.exit();
