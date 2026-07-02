import { z } from "zod";
import prisma from "../../config/prisma.js";
import asyncHandler from "../../shared/asyncHandler.js";
import { successResponse } from "../../shared/apiResponse.js";
import {
  createRazorpayOrderRequest,
  getRazorpayConfig,
  verifyRazorpayPaymentSignature,
} from "../../services/razorpay.service.js";

const userWhere = (req) => ({ userId: req.prismaUserId });

const PLAN_CONFIG = {
  basic: {
    plan: "BASIC",
    amount: 900,
    currency: "USD",
    credits: 150,
    monthlyCreditLimit: 150,
    interviewLimit: 5,
    resumeAnalysisLimit: 5,
    roadmapLimit: 2,
  },
  pro: {
    plan: "PRO",
    amount: 2900,
    currency: "USD",
    credits: 650,
    monthlyCreditLimit: 650,
    interviewLimit: 25,
    resumeAnalysisLimit: 25,
    roadmapLimit: 10,
    videoAnalysisEnabled: true,
    projectAnalyzerEnabled: true,
  },
  premium: {
    plan: "PREMIUM",
    amount: 5900,
    currency: "USD",
    credits: 1500,
    monthlyCreditLimit: 1500,
    interviewLimit: 100,
    resumeAnalysisLimit: 100,
    roadmapLimit: 25,
    videoAnalysisEnabled: true,
    projectAnalyzerEnabled: true,
  },
};

const orderSchema = z.object({
  plan: z.string().optional(),
  planId: z.string().optional(),
  credits: z.coerce.number().int().positive().optional(),
  amount: z.coerce.number().positive().optional(),
});

const verificationSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

const resolvePlan = (payload) => {
  const planId = String(payload.plan || payload.planId || "basic").toLowerCase();
  const config = PLAN_CONFIG[planId];

  if (!config) {
    const error = new Error("Invalid Razorpay plan.");
    error.statusCode = 400;
    throw error;
  }

  return { planId, config };
};

const getRazorpayErrorMessage = (error) =>
  error.response?.data?.error?.description || error.response?.data?.message || error.message || "Razorpay request failed.";

const createRazorpayOrder = async ({ req, payload }) => {
  const { keyId } = getRazorpayConfig();
  const { planId, config } = resolvePlan(payload);
  const user = req.prismaUser || await prisma.user.findUnique({ where: { id: req.userId } });

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 401;
    throw error;
  }

  const amount = Math.round(payload.amount ? payload.amount * 100 : config.amount);
  const credits = payload.credits || config.credits;
  const currency = config.currency;
  let payment;

  try {
    payment = await prisma.payment.create({
      data: {
        userId: user.id,
        provider: "razorpay",
        plan: planId,
        amount,
        currency,
        credits,
        status: "CREATED",
        metadata: { source: "checkout", planId },
      },
    });

    const order = await createRazorpayOrderRequest({
      amount,
      currency,
      receipt: payment.id,
      notes: {
        userId: user.id,
        paymentId: payment.id,
        planId,
        credits: String(credits),
      },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerId: order.id,
        metadata: { source: "checkout", order, planId, credits },
      },
    });

    return {
      provider: "razorpay",
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: planId,
      credits,
      name: "HirePilot-AI",
      description: `${config.plan} plan credits`,
    };
  } catch (error) {
    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          metadata: { source: "checkout", planId, error: getRazorpayErrorMessage(error) },
        },
      });
    }

    const wrappedError = new Error(`Razorpay order creation failed: ${getRazorpayErrorMessage(error)}`);
    wrappedError.statusCode = error.response?.status || 502;
    throw wrappedError;
  }
};

const activatePaidOrder = async ({ orderId, paymentId, signature, verifiedBy = "client" }) => {
  const payment = await prisma.payment.findFirst({ where: { providerId: orderId, provider: "razorpay" } });

  if (!payment) {
    const error = new Error("Payment order not found.");
    error.statusCode = 404;
    throw error;
  }

  if (payment.status === "PAID") {
    return payment;
  }

  const planId = payment.plan;
  const config = PLAN_CONFIG[planId];

  if (!config) {
    const error = new Error("Invalid payment plan.");
    error.statusCode = 400;
    throw error;
  }

  const credits = payment.credits || config.credits;
  const [, updatedPayment] = await prisma.$transaction([
    prisma.user.update({
      where: { id: payment.userId },
      data: { credits: { increment: credits } },
    }),
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        metadata: {
          ...(payment.metadata || {}),
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          verifiedBy,
        },
      },
    }),
    prisma.subscription.create({
      data: {
        userId: payment.userId,
        plan: config.plan,
        status: "ACTIVE",
        monthlyCreditLimit: config.monthlyCreditLimit,
        interviewLimit: config.interviewLimit,
        resumeAnalysisLimit: config.resumeAnalysisLimit,
        roadmapLimit: config.roadmapLimit,
        videoAnalysisEnabled: config.videoAnalysisEnabled || false,
        projectAnalyzerEnabled: config.projectAnalyzerEnabled || false,
      },
    }),
  ]);

  return updatedPayment;
};

export const createOrder = asyncHandler(async (req, res) => {
  const payload = orderSchema.parse(req.body);
  const order = await createRazorpayOrder({ req, payload });
  return successResponse(res, "Razorpay order created", order, 201);
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const payload = verificationSchema.parse(req.body);

  const isValid = verifyRazorpayPaymentSignature({
    orderId: payload.razorpay_order_id,
    paymentId: payload.razorpay_payment_id,
    signature: payload.razorpay_signature,
  });

  if (!isValid) {
    await prisma.payment.updateMany({
      where: { providerId: payload.razorpay_order_id, provider: "razorpay" },
      data: { status: "FAILED", metadata: { source: "checkout", verificationError: "Invalid Razorpay signature" } },
    });
    return res.status(400).json({ message: "Invalid Razorpay payment signature." });
  }

  await activatePaidOrder({
    orderId: payload.razorpay_order_id,
    paymentId: payload.razorpay_payment_id,
    signature: payload.razorpay_signature,
  });

  const user = await prisma.user.findUnique({ where: { id: req.userId } });

  return res.json({
    success: true,
    message: "Payment verified and credits added",
    user,
  });
});

export const getMySubscription = asyncHandler(async (req, res) => successResponse(res, "Subscription fetched", await prisma.subscription.findFirst({ where: userWhere(req), orderBy: { createdAt: "desc" } })));

export const getCreditUsage = asyncHandler(async (req, res) => successResponse(res, "Credit usage fetched", await prisma.aICreditUsage.findMany({ where: userWhere(req), orderBy: { createdAt: "desc" } })));
