async function seed() {
  try {
    const { default: connectDB } = await import(
      "../limo-booking/lib/mongodb.js"
    );
    const { default: Car } = await import("../limo-booking/models/cars.js");
    await connectDB();

    const cars = await Car.insertMany([
      {
        type: "sedan",
        name: "mercedes e class",
        image: "/images/mercedes e class.png",
        capacity: 4,
        luggage: 2,
        pricePerHour: 50,
        pricePermile: 2,
        minprice: 100,
        minHours: 2,
        isAvailable: true,
        features: ["air conditioning", "leather seats", "bluetooth"],
      },
      {
        type: "suv",
        name: "cadillac escalade",
        image: "/images/mercedes e class.png",
        capacity: 6,
        luggage: 4,
        pricePerHour: 80,
        pricePermile: 3,
        minprice: 150,
        minHours: 2,
        isAvailable: true,
        features: ["air conditioning", "leather seats", "bluetooth", "wifi"],
      },
      {
        type: "van",
        name: "ford transit",
        image: "/images/mercedes e class.png",
        capacity: 12,
        luggage: 8,
        pricePerHour: 120,
        pricePermile: 4,
        minprice: 200,
        minHours: 2,
        isAvailable: true,
        features: ["air conditioning", "bluetooth", "wifi"],
      },
    ]);
    console.log("\n📋 Cars added to database:");
    cars.forEach((car, index) => {
      console.log(`\n${index + 1}. ${car.name}`);
      console.log(`   Type: ${car.type}`);
      console.log(`   Capacity: ${car.capacity} passengers`);
      console.log(
        `   Price: $${car.pricePerHour}/hour or $${car.pricePermile}/mile`
      );
      console.log(`url Image: ${car.image}`);
    });
  } catch (error) {
    console.log("seeding error", error);
  }
}

seed();
