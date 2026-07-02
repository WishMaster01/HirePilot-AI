import React, { useEffect, useState } from 'react'
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { motion } from "motion/react";
import { useDispatch } from 'react-redux';
import { setUserData } from '../../../redux/userSlice';
import { createRazorpayOrder, verifyRazorpayPayment } from '../billingApi';

const MotionDiv = motion.div

const loadRazorpayCheckout = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error("Unable to load Razorpay Checkout. Please check your connection."))
    document.body.appendChild(script)
  })

function Pricing() {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [checkoutError, setCheckoutError] = useState("");
  const dispatch = useDispatch()

  useEffect(() => {
    if (window.location.search.includes("payment=")) {
      navigate("/pricing", { replace: true })
    }
  }, [navigate])

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      credits: 100,
      description: "Perfect for beginners starting interview preparation.",
      features: [
        "100 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
      default: true,
    },
    {
      id: "basic",
      name: "Basic",
      price: "$9",
      credits: 150,
      description: "Great for focused practice and skill improvement.",
      features: [
        "150 AI Interview Credits",
        "Detailed Feedback",
        "Performance Analytics",
        "Full Interview History",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: "$29",
      credits: 650,
      description: "Best value for serious job preparation.",
      features: [
        "650 AI Interview Credits",
        "Advanced AI Feedback",
        "Skill Trend Analysis",
        "Priority AI Processing",
      ],
      badge: "Best Value",
    },
    {
      id: "premium",
      name: "Premium",
      price: "$59",
      credits: 1500,
      description: "Built for intensive placement prep and complete AI coaching.",
      features: [
        "1500 AI Interview Credits",
        "Premium AI Feedback",
        "Video and Project Analysis",
        "Priority Practice Insights",
      ],
      badge: "Premium",
    },
  ];



  const handlePayment = async (plan) => {
    try {
      setLoadingPlan(plan.id)
      setCheckoutError("")

      const planAmounts = {
        basic: 9,
        pro: 29,
        premium: 59,
      };
      const amount = planAmounts[plan.id] || 0;

      await loadRazorpayCheckout()

      const result = await createRazorpayOrder({
        planId: plan.id,
        plan: plan.id,
        amount,
        credits: plan.credits,
      })

      const order = result.data?.data || result.data

      if (!order?.keyId || !order?.orderId) {
        throw new Error("Razorpay order details were not returned.")
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "HirePilot-AI",
        description: order.description || `${plan.name} credits`,
        image: "/logo.png",
        order_id: order.orderId,
        theme: {
          color: "#059669",
        },
        handler: async (response) => {
          try {
            setLoadingPlan("verifying")
            const verification = await verifyRazorpayPayment(response)
            if (verification.data?.user) {
              dispatch(setUserData(verification.data.user))
            }
            setCheckoutError("")
            navigate("/pricing", { replace: true })
          } catch (error) {
            console.log(error)
            setCheckoutError(error.response?.data?.message || "Payment verification failed. Please try again.")
          } finally {
            setLoadingPlan(null)
          }
        },
        modal: {
          ondismiss: () => setLoadingPlan(null),
        },
      })

      checkout.open()
    } catch (error) {
     console.log(error)
     setCheckoutError(error.response?.data?.message || error.message || "Unable to start Razorpay checkout. Please try again.")
     setLoadingPlan(null);
    }
  }



  return (
    <div className='page-shell min-h-screen py-10 px-4 sm:px-6 lg:py-16'>

      <div className='max-w-6xl mx-auto mb-14 flex items-start gap-4'>

        <button onClick={() => navigate("/")} className='btn-secondary mt-2 h-11 w-11 min-h-0 rounded-full p-0'>
          <FaArrowLeft className='text-slate-600' />
        </button>

        <div className="text-center w-full">
          <p className='eyebrow mx-auto mb-4'>Credits and practice plans</p>
          <h1 className="text-4xl font-black text-slate-950">
            Choose your HirePilot-AI plan
          </h1>
          <p className="text-slate-500 mt-3 text-lg">
            Flexible pricing to match your interview preparation goals.
          </p>
          {checkoutError && (
            <div className='mx-auto mt-5 max-w-2xl rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100'>
              {checkoutError}
            </div>
          )}
        </div>
      </div>


      <div className='grid md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto'>

        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id

          return (
            <MotionDiv key={plan.id}
              whileHover={!plan.default && { scale: 1.03 }}
              onClick={() => !plan.default && setSelectedPlan(plan.id)}

              className={`relative rounded-2xl p-8 transition-all duration-300 border 
                ${isSelected
                  ? "border-emerald-500 shadow-2xl shadow-emerald-900/10 bg-white"
                  : "border-slate-200 bg-white/90 shadow-lg shadow-slate-900/5"
                }
                ${plan.default ? "cursor-default" : "cursor-pointer"}
              `}
            >

              {plan.badge && (
                <div className="absolute top-6 right-6 bg-slate-950 text-white text-xs font-bold px-4 py-1 rounded-full shadow">
                  {plan.badge}
                </div>
              )}

              {plan.default && (
                <div className="absolute top-6 right-6 bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
                  Default
                </div>
              )}

              <h3 className="text-xl font-black text-slate-950">
                {plan.name}
              </h3>

              <div className="mt-4">
                <span className="text-4xl font-black text-emerald-700">
                  {plan.price}
                </span>
                <p className="text-slate-500 mt-1 font-semibold">
                  {plan.credits} Credits
                </p>
              </div>

              <p className="text-slate-500 mt-4 text-sm leading-relaxed">
                {plan.description}
              </p>

              <div className="mt-6 space-y-3 text-left">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <FaCheckCircle className="text-emerald-500 text-sm" />
                    <span className="text-slate-700 text-sm font-medium">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {!plan.default &&
                <button
                disabled={loadingPlan === plan.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSelected) {
                      setSelectedPlan(plan.id)
                    } else {
                      handlePayment(plan)
                    }
                  }} className={`w-full mt-8 py-3 rounded-xl font-semibold transition ${isSelected
                    ? "btn-primary"
                    : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                    }`}>
                  {loadingPlan === plan.id
                    ? "Processing..."
                    : loadingPlan === "verifying"
                      ? "Verifying..."
                    : isSelected
                      ? "Proceed to Pay"
                      : "Select Plan"}

                </button>
              }
            </MotionDiv>
          )
        })}
      </div>

    </div>
  )
}

export default Pricing
