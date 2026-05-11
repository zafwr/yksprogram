import prisma from "./prisma";

export async function getMockUser() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "ogrenci@yksprogram.com",
        name: "Öğrenci",
      },
    });
  }
  return user;
}
