import { Router } from "express";
import { prisma } from "../index";
import { requireAuth, AuthRequest } from "../middleware/auth";
import bcrypt from "bcryptjs";

const router = Router();

// GET /api/users — get my downline users
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const callerId = req.userId!;
    console.log(`[GET /api/users] callerId: ${callerId}`);
    
    const myProfile = await prisma.profile.findUnique({ where: { userId: callerId } });
    if (!myProfile) {
      console.log(`[GET /api/users] Profile not found for callerId: ${callerId}`);
      return res.status(404).json({ error: "Profile not found" });
    }

    const myRole = await prisma.userRole.findFirst({ where: { userId: callerId } });
    console.log(`[GET /api/users] callerRole: ${myRole?.role}`);

    // Admin sees all
    const whereClause = myRole?.role === "admin" ? {} : { parentId: myProfile.id };
    console.log(`[GET /api/users] whereClause: ${JSON.stringify(whereClause)}`);

    const profiles = await prisma.profile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            email: true,
            roles: { select: { role: true } },
            wallet: { select: { balance: true } },
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`[GET /api/users] Profiles found: ${profiles.length}`);

    const result = profiles.map(p => ({
      id: p.id,
      userId: p.userId,       // <-- actual User ID for wallet/QR operations
      mid: `MID-${p.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`,
      fullName: p.fullName,
      businessName: p.businessName,
      phone: p.phone,
      address: p.address,
      city: p.city,
      state: p.state,
      pincode: p.pincode,
      panNumber: p.panNumber,
      aadhaarNumber: p.aadhaarNumber,
      callbackUrl: p.callbackUrl,
      status: p.status,
      email: p.user?.email,
      role: p.user?.roles[0]?.role,
      walletBalance: Number(p.user?.wallet?.balance ?? 0),
    }));

    res.json(result);
  } catch (e: any) {
    console.error(`[GET /api/users] Error: ${e.message}`, e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/users/profile — get my own profile
router.get("/profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: { profile: true, roles: true, wallet: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      ...user.profile,
      email: user.email,
      role: user.roles[0]?.role,
      walletBalance: Number(user.wallet?.balance ?? 0),
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/users/profile — update own profile
router.patch("/profile", requireAuth, async (req: AuthRequest, res) => {
  const {
    fullName,
    phone,
    businessName,
    address,
    city,
    state,
    pincode,
    panNumber,
    aadhaarNumber,
    callbackUrl,
  } = req.body;
  try {
    const profile = await prisma.profile.update({
      where: { userId: req.userId! },
      data: {
        fullName,
        phone,
        businessName,
        address,
        city,
        state,
        pincode,
        panNumber,
        aadhaarNumber,
        callbackUrl,
      },
    });
    res.json(profile);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/users — creation of a new user
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { email, password, full_name, role, parent_id, ...extra } = req.body;
  try {
    const callerId = req.userId!;
    const callerRole = await prisma.userRole.findFirst({ where: { userId: callerId } });
    if (!callerRole) return res.status(403).json({ error: "Forbidden" });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    const passwordHash = await bcrypt.hash(password || "Password123!", 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          profile: {
            create: {
              fullName: full_name,
              phone: extra.phone,
              businessName: extra.business_name,
              address: extra.address,
              city: extra.city,
              state: extra.state,
              pincode: extra.pincode,
              panNumber: extra.pan_number || extra.panNumber,
              aadhaarNumber: extra.aadhaar_number || extra.aadhaarNumber,
              callbackUrl: extra.callback_url || null,
              parentId: parent_id,
              status: "active",
              kycStatus: "pending",
            },
          },
          roles: {
            create: {
              role: role || "retailer",
            },
          },
          wallet: {
            create: {
              balance: 0,
            },
          },
        },
        include: {
          profile: true,
        },
      });
      return user;
    });

    res.json({ success: true, user: { id: result.id, email: result.email }, profile: result.profile });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/users/:id — update a user/profile
router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const {
    email,
    password,
    full_name,
    phone,
    business_name,
    address,
    city,
    state,
    pincode,
    pan_number,
    aadhaar_number,
    callback_url,
    status,
  } = req.body;

  try {
    const callerId = req.userId!;
    const myRole = await prisma.userRole.findFirst({ where: { userId: callerId } });
    const targetProfile = await prisma.profile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!targetProfile) return res.status(404).json({ error: "Profile not found" });

    if (myRole?.role !== "admin") {
      const myProfile = await prisma.profile.findUnique({ where: { userId: callerId } });
      if (targetProfile.parentId !== myProfile?.id && targetProfile.userId !== callerId) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    if (email && email !== targetProfile.user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(400).json({ error: "Email already exists" });
    }

    const userData: Record<string, unknown> = {};
    if (typeof email !== "undefined") userData.email = email;
    if (password) userData.passwordHash = await bcrypt.hash(password, 10);

    const profileData: Record<string, unknown> = {};
    if (typeof full_name !== "undefined") profileData.fullName = full_name;
    if (typeof phone !== "undefined") profileData.phone = phone || null;
    if (typeof business_name !== "undefined") profileData.businessName = business_name || null;
    if (typeof address !== "undefined") profileData.address = address || null;
    if (typeof city !== "undefined") profileData.city = city || null;
    if (typeof state !== "undefined") profileData.state = state || null;
    if (typeof pincode !== "undefined") profileData.pincode = pincode || null;
    if (typeof pan_number !== "undefined") profileData.panNumber = pan_number || null;
    if (typeof aadhaar_number !== "undefined") profileData.aadhaarNumber = aadhaar_number || null;
    if (typeof callback_url !== "undefined") profileData.callbackUrl = callback_url || null;
    if (typeof status !== "undefined") profileData.status = status;

    const [, updatedProfile] = await prisma.$transaction([
      Object.keys(userData).length
        ? prisma.user.update({
            where: { id: targetProfile.userId },
            data: userData,
          })
        : prisma.user.findUniqueOrThrow({ where: { id: targetProfile.userId } }),
      Object.keys(profileData).length
        ? prisma.profile.update({
            where: { id },
            data: profileData,
          })
        : prisma.profile.findUniqueOrThrow({ where: { id } }),
    ]);

    res.json({ success: true, profile: updatedProfile });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/users/:id/status — Toggle user status
router.patch("/:id/status", requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const callerId = req.userId!;
    const myRole = await prisma.userRole.findFirst({ where: { userId: callerId } });
    if (myRole?.role !== "admin") {
      // Non-admins can only toggle their downline
      const profile = await prisma.profile.findUnique({ where: { id } });
      const myProfile = await prisma.profile.findUnique({ where: { userId: callerId } });
      if (profile?.parentId !== myProfile?.id) return res.status(403).json({ error: "Forbidden" });
    }

    const updated = await prisma.profile.update({
      where: { id },
      data: { status },
    });
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/users/:id — Delete user
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    const callerId = req.userId!;
    const myRole = await prisma.userRole.findFirst({ where: { userId: callerId } });
    if (myRole?.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    // Find the profile to get the userId
    const profile = await prisma.profile.findUnique({ where: { id } });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    await prisma.user.delete({ where: { id: profile.userId } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
