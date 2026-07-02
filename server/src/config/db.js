import prisma from "./prisma.js";

const connectDb = async () => {
  try {
    await prisma.$connect();
    console.log("PostgreSQL database connected");
  } catch (error) {
    console.error("PostgreSQL database connection error:", error);
    throw error;
  }
};

export const disconnectDb = async () => prisma.$disconnect();

export default connectDb;
