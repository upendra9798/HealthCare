import { Outlet } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { motion } from "framer-motion";

function App() {
  return (
    <div className="app min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent" />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>

      {/* Main content area where routes will be rendered */}
      <div className="relative z-10">
        <Outlet />
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}

export default App;
