import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "motion/react";
import { BsCoin, BsClockHistory } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../../constants/api";
import { setUserData } from "../../redux/userSlice";
import AuthModel from "../../features/auth/components/AuthModal";

const MotionDiv = motion.div;

function Navbar() {
  const { userData } = useSelector((state) => state.user);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showAuth, setShowAuth] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + "/api/auth/logout", {
        withCredentials: true,
      });
      dispatch(setUserData(null));
      setShowCreditPopup(false);
      setShowUserPopup(false);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="absolute inset-x-0 top-0 z-40 flex justify-center px-4 pt-4 sm:pt-6">
      <MotionDiv
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-panel w-full max-w-6xl rounded-2xl px-3 py-3 sm:px-5 sm:py-4 flex justify-between items-center relative"
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 rounded-full text-left focus-ring"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg shadow-emerald-900/10 ring-1 ring-slate-200">
            <img
              src="/logo.png"
              alt="HirePilot-AI logo"
              className="h-8 w-8 rounded-lg object-contain"
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg leading-none text-slate-950">
              HirePilot-AI
            </h1>
            <p className="text-[11px] font-semibold text-emerald-700 mt-1">
              Premium AI interview studio
            </p>
          </div>
        </button>

        <div className="flex items-center gap-3 sm:gap-4 relative">
          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={() => navigate("/career")}
              className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
            >
              Career Hub
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
            >
              Pricing
            </button>
            <button
              onClick={() => navigate("/admin")}
              className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
            >
              Admin
            </button>
          </div>
          <div className="relative">
            <button
              onClick={() => {
                if (!userData) {
                  setShowAuth(true);
                  return;
                }
                setShowCreditPopup(!showCreditPopup);
                setShowUserPopup(false);
              }}
              className="flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-sm font-bold text-slate-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 sm:px-4"
            >
              <BsCoin size={20} />
              {userData?.credits || 0}
            </button>

            {showCreditPopup && (
              <div className="surface-card absolute right-13 mt-3 w-64 p-5 z-50 sm:right-0">
                <p className="text-sm font-medium text-slate-600 mb-4">
                  Need more credits to continue practice sessions?
                </p>
                <button
                  onClick={() => navigate("/pricing")}
                  className="btn-primary w-full px-4 py-2 text-sm"
                >
                  Buy more credits
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                if (!userData) {
                  setShowAuth(true);
                  return;
                }
                setShowUserPopup(!showUserPopup);
                setShowCreditPopup(false);
              }}
              className="w-10 h-10 bg-slate-950 text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-slate-950/15 transition hover:bg-emerald-700"
            >
              {userData ? (
                userData?.name.slice(0, 1).toUpperCase()
              ) : (
                <FaUserAstronaut size={16} />
              )}
            </button>

            {showUserPopup && (
              <div className="surface-card absolute right-0 mt-3 w-56 p-4 z-50">
                <p className="text-sm text-slate-500">Signed in as</p>
                <p className="text-md text-slate-950 font-bold mb-2 truncate">
                  {userData?.name}
                </p>

                <button
                  onClick={() => navigate("/history")}
                  className="w-full text-left text-sm py-2.5 hover:text-emerald-700 text-slate-600 flex items-center gap-2 rounded-md transition"
                >
                  <BsClockHistory size={15} /> Interview History
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-sm py-2.5 flex items-center gap-2 text-red-500 rounded-md transition hover:text-red-600"
                >
                  <HiOutlineLogout size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </MotionDiv>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default Navbar;
