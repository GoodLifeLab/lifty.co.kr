const { PrismaClient } = require("@prisma/client");

async function testPrismaConnection() {
  const prisma = new PrismaClient();

  try {
    console.log("Prisma 연결 시도 중...");

    // 간단한 쿼리 실행
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    console.log("✅ Prisma 연결 성공!");
    console.log("현재 시간:", result[0].current_time);
  } catch (error) {
    console.error("❌ Prisma 연결 실패:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaConnection();
