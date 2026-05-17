import { PrismaClient, RoleName } from "@prisma/client";

const prisma = new PrismaClient();

const permissions = [
  { key: "admin:dashboard", description: "Access admin dashboard" },
  { key: "admin:logs", description: "View admin logs" },
  { key: "admin:moderate", description: "Moderate accounts" },
  { key: "admin:permissions", description: "Manage feature toggles" },
  { key: "chat:direct", description: "Use direct chat" },
  { key: "chat:delete", description: "Delete messages" },
  { key: "chat:edit", description: "Edit messages" },
  { key: "chat:voice", description: "Use voice call" },
  { key: "chat:video", description: "Use video call" }
];

async function main() {
  const createdPermissions = new Map<string, string>();

  for (const permission of permissions) {
    const record = await prisma.permission.upsert({
      where: { key: permission.key },
      create: permission,
      update: permission
    });
    createdPermissions.set(record.key, record.id);
  }

  const roles = [RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.MODERATOR, RoleName.VERIFIED_USER, RoleName.PREMIUM_USER, RoleName.NORMAL_USER];

  for (const roleName of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      create: { name: roleName },
      update: {}
    });

    const permissionKeys =
      roleName === RoleName.SUPER_ADMIN
        ? permissions.map((item) => item.key)
        : roleName === RoleName.ADMIN
          ? ["admin:dashboard", "admin:logs", "admin:moderate", "admin:permissions", "chat:direct", "chat:delete", "chat:edit", "chat:voice", "chat:video"]
          : roleName === RoleName.MODERATOR
            ? ["admin:logs", "admin:moderate", "chat:direct", "chat:delete", "chat:edit"]
            : ["chat:direct", "chat:delete", "chat:edit"];

    for (const permissionKey of permissionKeys) {
      const permissionId = createdPermissions.get(permissionKey);
      if (!permissionId) continue;

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        create: { roleId: role.id, permissionId },
        update: {}
      });
    }
  }

  const tags = [
    { key: "friend", label: "Friend" },
    { key: "close_friend", label: "Close Friend" },
    { key: "best_friend", label: "Best Friend" },
    { key: "bf", label: "BF" },
    { key: "gf", label: "GF" },
    { key: "partner", label: "Partner" },
    { key: "family", label: "Family" }
  ];

  for (const tag of tags) {
    await prisma.relationshipTag.upsert({
      where: { key: tag.key },
      create: tag,
      update: tag
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
