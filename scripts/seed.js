import dotenv from "dotenv";
import Car from "../models/cars.js";
import connectDB from "../lib/mongodb.js";

dotenv.config();

const cars = [
  {
    type: "Sports",
    name: "Mercedes amg gt",
    imageUrl: "https://res.cloudinary.com/dpxnw7x1f/image/upload/v1779804087/download_2_wfu2dx.jpg",
    capacity: 2,
    luggage: 1,
    pricePerHour: 150,
    pricePermile: 10,
    minprice: 200,
    minHours: 2,
    isAvailable: true,
    quantity: 1,
    status: "active",
  },
  {
    type: "Hatchback",
    name: "Cupra Leon",
    imageUrl: "https://res.cloudinary.com/dpxnw7x1f/image/upload/v1779803955/Cupra_Leon_Roof_Bars___Thule_z1aks6.jpg",
    capacity: 4,
    luggage: 2,
    pricePerHour: 50,
    pricePermile: 5,
    minprice: 70,
    minHours: 2,
    isAvailable: true,
    quantity: 2,
    status: "active",
  },
];

async function seed() {
  try {
    await connectDB();




    await Car.insertMany(cars);



    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();