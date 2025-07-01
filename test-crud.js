const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testCRUD() {
  try {
    console.log("🔍 데이터 조작 테스트 시작...");

    // 1. 사용자 생성 (CREATE)
    console.log("\n1️⃣ 사용자 생성 중...");
    const newUser = await prisma.user.create({
      data: {
        email: "test@example.com",
        password: "hashedpassword123",
        name: "테스트 사용자",
        phone: "010-1234-5678",
      },
    });
    console.log("✅ 사용자 생성 성공:", newUser.id);

    // 2. 사용자 조회 (READ)
    console.log("\n2️⃣ 사용자 조회 중...");
    const user = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    });
    console.log("✅ 사용자 조회 성공:", user.name);

    // 3. 사용자 수정 (UPDATE)
    console.log("\n3️⃣ 사용자 수정 중...");
    const updatedUser = await prisma.user.update({
      where: { email: "test@example.com" },
      data: { name: "수정된 사용자" },
    });
    console.log("✅ 사용자 수정 성공:", updatedUser.name);

    // 4. 사용자 삭제 (DELETE)
    console.log("\n4️⃣ 사용자 삭제 중...");
    await prisma.user.delete({
      where: { email: "test@example.com" },
    });
    console.log("✅ 사용자 삭제 성공");

    console.log("\n🎉 모든 CRUD 작업 성공!");
  } catch (error) {
    console.error("❌ 오류 발생:", error.message);
    console.error("상세 오류:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testCRUD();
