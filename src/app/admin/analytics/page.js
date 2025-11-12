"use client";

import { useState, useEffect } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminAnalytics() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [callDetailsModal, setCallDetailsModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Pagination and filtering
  const [allActivity, setAllActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month, year, custom
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;
  // Fetch analytics data
  const fetchAnalytics = async (pwd) => {
    setLoading(true);
    setError("");

    try {
      const [analyticsRes, dailyRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/analytics`, {
          headers: {
            "x-admin-password": pwd || password,
          },
        }),
        fetch(`${API_URL}/api/admin/daily-stats?days=30`, {
          headers: {
            "x-admin-password": pwd || password,
          },
        }),
      ]);

      if (!analyticsRes.ok || !dailyRes.ok) {
        throw new Error("Invalid password or server error");
      }

      const analyticsData = await analyticsRes.json();
      const dailyData = await dailyRes.json();

      setAnalytics(analyticsData.data);
      setDailyStats(dailyData.data);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.message);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    fetchAnalytics(password);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (autoRefresh && isAuthenticated) {
      const interval = setInterval(() => {
        fetchAnalytics();
      }, 30000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, isAuthenticated]);

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Fetch all activity with filters
  const fetchAllActivity = async () => {
    setLoadingActivity(true);
    try {
      const params = new URLSearchParams();
      const now = Date.now();

      if (dateFilter === "custom" && customStartDate && customEndDate) {
        const startDate = new Date(customStartDate);
        const endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999);

        // Client-side validation: prevent future dates
        if (startDate.getTime() > now || endDate.getTime() > now) {
          alert("Cannot select future dates");
          setLoadingActivity(false);
          return;
        }

        // Ensure start date is not after end date
        if (startDate.getTime() > endDate.getTime()) {
          alert("Start date cannot be after end date");
          setLoadingActivity(false);
          return;
        }

        params.append("startDate", startDate.getTime());
        params.append("endDate", endDate.getTime());
      } else if (dateFilter !== "all") {
        let startDate;

        switch (dateFilter) {
          case "today":
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
            break;
          case "month":
            startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
            break;
          case "year":
            startDate = new Date(now - 365 * 24 * 60 * 60 * 1000);
            break;
        }

        if (startDate) {
          params.append("startDate", startDate.getTime());
          params.append("endDate", now);
        }
      }

      const response = await fetch(
        `${API_URL}/api/admin/all-activity?${params.toString()}`,
        {
          headers: {
            "x-admin-password": password,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch activity");
      }

      const data = await response.json();
      setAllActivity(data.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching all activity:", err);
      alert(err.message || "Failed to load activity data");
    } finally {
      setLoadingActivity(false);
    }
  };

  // Fetch call details
  const fetchCallDetails = async (callId) => {
    setLoadingDetails(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/call/${callId}`, {
        headers: {
          "x-admin-password": password,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch call details");
      }

      const data = await response.json();
      setSelectedCall(data.data);
      setCallDetailsModal(true);
    } catch (err) {
      console.error("Error fetching call details:", err);
      alert("Failed to load call details");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-orange-500/10 pointer-events-none"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-700 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
              <span className="text-3xl">📊</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Admin{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Analytics
              </span>
            </h1>
            <p className="text-gray-400">AceMind Analytics Dashboard</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold py-3 px-6 rounded-lg transition-all hover:shadow-lg hover:shadow-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating..." : "🔓 Access Dashboard"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Analytics dashboard
  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  // Chart options with whole numbers for Y axis (for count charts)
  const chartOptionsWholeNumbers = {
    maintainAspectRatio: true,
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#D1D5DB", // gray-300
          font: { family: "system-ui" },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function (value) {
            if (Math.floor(value) === value) {
              return value;
            }
          },
          color: "#9CA3AF", // gray-400
        },
        grid: {
          color: "rgba(75, 85, 99, 0.2)", // gray-600/20
        },
      },
      x: {
        ticks: {
          color: "#9CA3AF", // gray-400
        },
        grid: {
          color: "rgba(75, 85, 99, 0.2)", // gray-600/20
        },
      },
    },
  };

  // Chart options with decimals allowed (for cost, time, etc.)
  const chartOptionsWithDecimals = {
    maintainAspectRatio: true,
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#D1D5DB", // gray-300
          font: { family: "system-ui" },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "#9CA3AF", // gray-400
        },
        grid: {
          color: "rgba(75, 85, 99, 0.2)", // gray-600/20
        },
      },
      x: {
        ticks: {
          color: "#9CA3AF", // gray-400
        },
        grid: {
          color: "rgba(75, 85, 99, 0.2)", // gray-600/20
        },
      },
    },
  };

  // Helper function to format date as dd/mm
  const formatDateLabel = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}`;
  };

  // Chart data
  const dailyCallsChart = {
    labels: dailyStats.map((d) => formatDateLabel(d.date)),
    datasets: [
      {
        label: "API Calls",
        data: dailyStats.map((d) => d.calls),
        borderColor: "rgb(147, 51, 234)",
        backgroundColor: "rgba(147, 51, 234, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const dailyUsersChart = {
    labels: dailyStats.map((d) => formatDateLabel(d.date)),
    datasets: [
      {
        label: "Active Users",
        data: dailyStats.map((d) => d.users),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const dailyCostChart = {
    labels: dailyStats.map((d) => formatDateLabel(d.date)),
    datasets: [
      {
        label: "Cost (₹)",
        data: dailyStats.map((d) => d.costINR),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const dailyTokensChart = {
    labels: dailyStats.map((d) => formatDateLabel(d.date)),
    datasets: [
      {
        label: "Tokens",
        data: dailyStats.map((d) => d.tokens),
        borderColor: "rgb(251, 191, 36)",
        backgroundColor: "rgba(251, 191, 36, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const dailyErrorsChart = {
    labels: dailyStats.map((d) => formatDateLabel(d.date)),
    datasets: [
      {
        label: "Errors",
        data: dailyStats.map((d) => d.errors || 0),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const dailyResponseTimeChart = {
    labels: dailyStats.map((d) => formatDateLabel(d.date)),
    datasets: [
      {
        label: "Avg Response Time (ms)",
        data: dailyStats.map((d) => d.avgResponseTime || 0),
        borderColor: "rgb(6, 182, 212)",
        backgroundColor: "rgba(6, 182, 212, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const endpointsChart = {
    labels: analytics.topEndpoints.map((e) => e.endpoint.replace("/api/", "")),
    datasets: [
      {
        data: analytics.topEndpoints.map((e) => e.count),
        backgroundColor: [
          "rgba(147, 51, 234, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(234, 179, 8, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
      },
    ],
  };

  const hourlyChart = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: "Requests by Hour (Last 24h)",
        data: analytics.hourlyDistribution,
        backgroundColor: "rgba(147, 51, 234, 0.8)",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white">
      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 w-full bg-[#111827]/95 backdrop-blur-md border-b border-[#1F2937] z-50 shadow-lg">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-r from-[#FBBF24] to-[#F97316] rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-xl">🧠</span>
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-base font-bold bg-gradient-to-r from-[#FBBF24] to-[#F97316] bg-clip-text text-transparent">
                  AceMind Analytics
                </span>
                <span className="text-[10px] text-[#6B7280]">
                  Admin Dashboard
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 items-center">
              <label className="flex items-center gap-2 px-3 py-1.5 bg-[#1F2937] border border-[#374151] rounded-lg cursor-pointer hover:border-[#FBBF24]/50 transition-all text-xs group">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#FBBF24]"
                />
                <span className="text-[#D1D5DB] group-hover:text-white transition-colors">
                  Auto-refresh
                </span>
              </label>
              <button
                onClick={() => fetchAnalytics()}
                className="px-3 py-1.5 bg-[#1F2937] border border-[#374151] hover:border-[#FBBF24]/50 hover:bg-[#374151] rounded-lg text-xs transition-all"
              >
                <span className="mr-1">🔄</span>Refresh
              </button>
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  setPassword("");
                }}
                className="px-3 py-1.5 bg-[#EF4444]/10 border border-[#EF4444]/30 hover:border-[#EF4444] hover:bg-[#EF4444]/20 rounded-lg text-xs text-[#FCA5A5] transition-all"
              >
                <span className="mr-1">🚪</span>Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Compact Layout */}
      <div className="max-w-[1280px] mx-auto px-6 pt-20 pb-8">
        {/* Compact Overview Cards - 6 columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {/* Total API Calls */}
          <div className="bg-[#1F2937]/50 backdrop-blur-sm rounded-xl p-4 border border-[#374151] hover:border-[#9333EA]/50 hover:shadow-lg hover:shadow-[#9333EA]/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-[#9333EA]/20 rounded-lg flex items-center justify-center border border-[#9333EA]/30 group-hover:scale-110 transition-transform">
                <span className="text-base">📞</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-[#9333EA] mb-1">
              {analytics.overview.totalApiCalls.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#9CA3AF] mb-0.5">
              Total API Calls
            </div>
            <div className="text-[9px] text-[#6B7280]">
              24h:{" "}
              <span className="text-[#9333EA]">{analytics.calls.last24h}</span>
            </div>
          </div>

          {/* Registered Users */}
          <div className="bg-[#1F2937]/50 backdrop-blur-sm rounded-xl p-4 border border-[#374151] hover:border-[#3B82F6]/50 hover:shadow-lg hover:shadow-[#3B82F6]/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center border border-[#3B82F6]/30 group-hover:scale-110 transition-transform">
                <span className="text-base">👥</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-[#3B82F6] mb-1">
              {analytics.overview.totalRegisteredUsers || 0}
            </div>
            <div className="text-[10px] text-[#9CA3AF] mb-0.5">
              Registered Users
            </div>
            <div className="text-[9px] text-[#6B7280]">Signed Up</div>
          </div>

          {/* Active Users */}
          <div className="bg-[#1F2937]/50 backdrop-blur-sm rounded-xl p-4 border border-[#374151] hover:border-[#06B6D4]/50 hover:shadow-lg hover:shadow-[#06B6D4]/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-[#06B6D4]/20 rounded-lg flex items-center justify-center border border-[#06B6D4]/30 group-hover:scale-110 transition-transform">
                <span className="text-base">⚡</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-[#06B6D4] mb-1">
              {analytics.overview.activeUsers || 0}
            </div>
            <div className="text-[10px] text-[#9CA3AF] mb-0.5">
              Active Users
            </div>
            <div className="text-[9px] text-[#6B7280]">
              {analytics.overview.period}
            </div>
          </div>

          {/* Total Cost */}
          <div className="bg-[#1F2937]/50 backdrop-blur-sm rounded-xl p-4 border border-[#374151] hover:border-[#22C55E]/50 hover:shadow-lg hover:shadow-[#22C55E]/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-[#22C55E]/20 rounded-lg flex items-center justify-center border border-[#22C55E]/30 group-hover:scale-110 transition-transform">
                <span className="text-base">💰</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-[#22C55E] mb-1">
              ₹{analytics.costs.totalINR.toFixed(5)}
            </div>
            <div className="text-[10px] text-[#9CA3AF] mb-0.5">Total Cost</div>
            <div className="text-[9px] text-[#6B7280]">
              Avg:{" "}
              <span className="text-[#22C55E]">
                ₹{analytics.costs.avgPerCall.toFixed(5)}
              </span>
            </div>
          </div>

          {/* Total Tokens */}
          <div className="bg-[#1F2937]/50 backdrop-blur-sm rounded-xl p-4 border border-[#374151] hover:border-[#FBBF24]/50 hover:shadow-lg hover:shadow-[#FBBF24]/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-[#FBBF24]/20 rounded-lg flex items-center justify-center border border-[#FBBF24]/30 group-hover:scale-110 transition-transform">
                <span className="text-base">🪙</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-[#FBBF24] mb-1">
              {analytics.overview.totalTokens.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#9CA3AF] mb-0.5">
              Total Tokens
            </div>
            <div className="text-[9px] text-[#6B7280]">
              Avg:{" "}
              <span className="text-[#FBBF24]">
                {analytics.tokens.avgPerCall.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Error Rate */}
          <div className="bg-[#1F2937]/50 backdrop-blur-sm rounded-xl p-4 border border-[#374151] hover:border-[#EF4444]/50 hover:shadow-lg hover:shadow-[#EF4444]/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-[#EF4444]/20 rounded-lg flex items-center justify-center border border-[#EF4444]/30 group-hover:scale-110 transition-transform">
                <span className="text-base">❌</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-[#EF4444] mb-1">
              {analytics.overview.errorRate || 0}%
            </div>
            <div className="text-[10px] text-[#9CA3AF] mb-0.5">Error Rate</div>
            <div className="text-[9px] text-[#6B7280]">
              Errors:{" "}
              <span className="text-[#EF4444]">
                {analytics.overview.totalErrors || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Compact Charts Grid - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Daily API Calls */}
          <div className="bg-[#1F2937]/50 backdrop-blur-sm rounded-xl p-4 border border-[#374151] hover:border-[#9333EA]/50 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-[#9333EA]/20 rounded-lg flex items-center justify-center border border-[#9333EA]/30">
                <span className="text-xs">📈</span>
              </div>
              <h3 className="text-sm font-bold text-[#D1D5DB]">
                Daily API Calls (30d)
              </h3>
            </div>
            <div className="h-[180px]">
              <Line data={dailyCallsChart} options={chartOptionsWholeNumbers} />
            </div>
          </div>

          {/* Daily Active Users */}
          <div className="bg-[#1F2937]/50 backdrop-blur-sm rounded-xl p-4 border border-[#374151] hover:border-[#3B82F6]/50 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center border border-[#3B82F6]/30">
                <span className="text-xs">👥</span>
              </div>
              <h3 className="text-sm font-bold text-[#D1D5DB]">
                Active Users (30d)
              </h3>
            </div>
            <div className="h-[180px]">
              <Line data={dailyUsersChart} options={chartOptionsWholeNumbers} />
            </div>
          </div>

          {/* Daily Costs */}
          <div className="bg-[#1F2937]/50 backdrop-blur-sm rounded-xl p-4 border border-[#374151] hover:border-[#22C55E]/50 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-[#22C55E]/20 rounded-lg flex items-center justify-center border border-[#22C55E]/30">
                <span className="text-xs">💰</span>
              </div>
              <h3 className="text-sm font-bold text-[#D1D5DB]">
                Daily Costs (30d)
              </h3>
            </div>
            <div className="h-[180px]">
              <Line data={dailyCostChart} options={chartOptionsWithDecimals} />
            </div>
          </div>

          {/* Daily Tokens */}
          <div className="bg-[#1F2937]/50 backdrop-blur-sm rounded-xl p-4 border border-[#374151] hover:border-[#FBBF24]/50 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-[#FBBF24]/20 rounded-lg flex items-center justify-center border border-[#FBBF24]/30">
                <span className="text-xs">🪙</span>
              </div>
              <h3 className="text-sm font-bold text-[#D1D5DB]">
                Daily Tokens (30d)
              </h3>
            </div>
            <div className="h-[180px]">
              <Line
                data={dailyTokensChart}
                options={chartOptionsWholeNumbers}
              />
            </div>
          </div>

          {/* Daily Errors */}
          <div className="bg-[#1F2937]/50 backdrop-blur-sm rounded-xl p-4 border border-[#374151] hover:border-[#EF4444]/50 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-[#EF4444]/20 rounded-lg flex items-center justify-center border border-[#EF4444]/30">
                <span className="text-xs">❌</span>
              </div>
              <h3 className="text-sm font-bold text-[#D1D5DB]">
                Daily Errors (30d)
              </h3>
            </div>
            <div className="h-[180px]">
              <Line
                data={dailyErrorsChart}
                options={chartOptionsWholeNumbers}
              />
            </div>
          </div>

          {/* Avg Response Time */}
          <div className="bg-[#1F2937]/50 backdrop-blur-sm rounded-xl p-4 border border-[#374151] hover:border-[#06B6D4]/50 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-[#06B6D4]/20 rounded-lg flex items-center justify-center border border-[#06B6D4]/30">
                <span className="text-xs">⚡</span>
              </div>
              <h3 className="text-sm font-bold text-[#D1D5DB]">
                Avg Response Time (30d)
              </h3>
            </div>
            <div className="h-[180px]">
              <Line
                data={dailyResponseTimeChart}
                options={chartOptionsWithDecimals}
              />
            </div>
          </div>
        </div>

        {/* Distribution Charts Row - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Top Endpoints */}
          <div className="bg-[#1F2937]/50 backdrop-blur-sm rounded-xl p-4 border border-[#374151] hover:border-[#FBBF24]/50 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-[#FBBF24]/20 rounded-lg flex items-center justify-center border border-[#FBBF24]/30">
                <span className="text-xs">🎯</span>
              </div>
              <h3 className="text-sm font-bold text-[#D1D5DB]">
                Top Endpoints
              </h3>
            </div>
            <div className="h-[200px]">
              <Doughnut
                data={endpointsChart}
                options={{ maintainAspectRatio: true, responsive: true }}
              />
            </div>
          </div>

          {/* Models Used */}
          <div className="bg-[#1F2937]/50 backdrop-blur-sm rounded-xl p-4 border border-[#374151] hover:border-[#9333EA]/50 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-[#9333EA]/20 rounded-lg flex items-center justify-center border border-[#9333EA]/30">
                <span className="text-xs">🤖</span>
              </div>
              <h3 className="text-sm font-bold text-[#D1D5DB]">Models Used</h3>
            </div>
            <div className="h-[200px]">
              <Doughnut
                data={{
                  labels: analytics.topModels?.map((m) => m.model) || [],
                  datasets: [
                    {
                      data: analytics.topModels?.map((m) => m.count) || [],
                      backgroundColor: [
                        "rgba(34, 197, 94, 0.8)",
                        "rgba(147, 51, 234, 0.8)",
                        "rgba(59, 130, 246, 0.8)",
                      ],
                    },
                  ],
                }}
                options={{ maintainAspectRatio: true, responsive: true }}
              />
            </div>
          </div>
        </div>

        {/* Top Users - Compact Table */}
        <div className="bg-[#1F2937]/50 backdrop-blur-sm rounded-xl p-4 border border-[#374151] hover:border-[#FBBF24]/50 transition-all duration-300 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-[#FBBF24]/20 rounded-lg flex items-center justify-center border border-[#FBBF24]/30">
              <span className="text-xs">🏆</span>
            </div>
            <h3 className="text-sm font-bold text-[#D1D5DB]">
              Top Users (Last 30d)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#374151]">
                  <th className="text-left py-2 px-3 font-medium text-[#9CA3AF]">
                    User ID
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-[#9CA3AF]">
                    Calls
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-[#9CA3AF]">
                    Tokens
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-[#9CA3AF]">
                    Cost (₹)
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-[#9CA3AF]">
                    Last Seen
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.topUsers.map((user, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-[#374151] hover:bg-[#374151]/30 transition-colors"
                  >
                    <td className="py-2 px-3 font-mono text-[#D1D5DB]">
                      {user.userId}
                    </td>
                    <td className="py-2 px-3 text-white font-medium">
                      {user.totalCalls}
                    </td>
                    <td className="py-2 px-3 text-[#FBBF24] font-medium">
                      {user.totalTokens?.toLocaleString() || 0}
                    </td>
                    <td className="py-2 px-3 text-[#22C55E] font-medium">
                      ₹{(user.costINR || 0).toFixed(5)}
                    </td>
                    <td className="py-2 px-3 text-[#9CA3AF]">
                      {formatTimeAgo(user.lastSeen)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity - Compact Table */}
        <div className="bg-[#1F2937]/50 backdrop-blur-sm rounded-xl p-4 border border-[#374151] hover:border-[#9333EA]/50 transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-[#9333EA]/20 rounded-lg flex items-center justify-center border border-[#9333EA]/30">
              <span className="text-xs">🔔</span>
            </div>
            <h3 className="text-sm font-bold text-[#D1D5DB]">
              Recent Activity (Last 100)
            </h3>
          </div>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[#1F2937]/95 backdrop-blur-sm">
                <tr className="border-b border-[#374151]">
                  <th className="text-left py-2 px-2 font-medium text-[#9CA3AF]">
                    Time
                  </th>
                  <th className="text-left py-2 px-2 font-medium text-[#9CA3AF]">
                    Endpoint
                  </th>
                  <th className="text-left py-2 px-2 font-medium text-[#9CA3AF]">
                    User
                  </th>
                  <th className="text-left py-2 px-2 font-medium text-[#9CA3AF]">
                    Time
                  </th>
                  <th className="text-left py-2 px-2 font-medium text-[#9CA3AF]">
                    Cost
                  </th>
                  <th className="text-left py-2 px-2 font-medium text-[#9CA3AF]">
                    Status
                  </th>
                  <th className="text-left py-2 px-2 font-medium text-[#9CA3AF]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentCalls.map((call, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-[#374151] hover:bg-[#374151]/30 cursor-pointer transition-colors"
                    onClick={() => fetchCallDetails(call.id)}
                  >
                    <td className="py-1.5 px-2 text-[#9CA3AF]">
                      {formatTimeAgo(call.timestamp)}
                    </td>
                    <td className="py-1.5 px-2 font-mono text-[#9333EA]">
                      {call.endpoint}
                    </td>
                    <td className="py-1.5 px-2 text-[#9CA3AF] truncate max-w-[120px]">
                      {call.userId}
                    </td>
                    <td className="py-1.5 px-2 text-[#06B6D4]">
                      {call.responseTime ? `${call.responseTime}ms` : "N/A"}
                    </td>
                    <td className="py-1.5 px-2 text-[#22C55E]">
                      ₹{(call.costINR || 0).toFixed(5)}
                    </td>
                    <td className="py-1.5 px-2">
                      {call.error ? (
                        <span className="px-1.5 py-0.5 bg-[#EF4444]/10 text-[#FCA5A5] border border-[#EF4444]/30 rounded text-[10px]">
                          ❌
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-[#22C55E]/10 text-[#86EFAC] border border-[#22C55E]/30 rounded text-[10px]">
                          ✅
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 px-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchCallDetails(call.id);
                        }}
                        className="text-[#3B82F6] hover:text-[#93C5FD] text-[10px] underline"
                        disabled={loadingDetails}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Activity with Filters - Compact */}
        <div className="bg-[#1F2937]/50 backdrop-blur-sm rounded-xl p-4 border border-[#374151] hover:border-[#FBBF24]/50 transition-all duration-300 mt-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#FBBF24]/20 rounded-lg flex items-center justify-center border border-[#FBBF24]/30">
                <span className="text-xs">📋</span>
              </div>
              <h3 className="text-sm font-bold text-[#D1D5DB]">
                All Activity History
              </h3>
            </div>
            <button
              onClick={fetchAllActivity}
              disabled={loadingActivity}
              className="bg-gradient-to-r from-[#FBBF24] to-[#F97316] hover:shadow-lg hover:shadow-[#FBBF24]/30 text-[#111827] font-bold px-4 py-1.5 rounded-lg text-xs transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingActivity ? "Loading..." : "🔍 Load Activity"}
            </button>
          </div>

          {/* Compact Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="block text-[#9CA3AF] text-[10px] mb-1 font-medium">
                📅 Time Period
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-2 py-1.5 bg-[#374151] border border-[#4B5563] rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#FBBF24] transition-all"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {dateFilter === "custom" && (
              <>
                <div>
                  <label className="block text-[#9CA3AF] text-[10px] mb-1 font-medium">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      const today = new Date();
                      today.setHours(23, 59, 59, 999);
                      if (selectedDate <= today) {
                        setCustomStartDate(e.target.value);
                      }
                    }}
                    className="w-full px-2 py-1.5 bg-[#374151] border border-[#4B5563] rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#FBBF24] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[#9CA3AF] text-[10px] mb-1 font-medium">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    max={new Date().toISOString().split("T")[0]}
                    min={customStartDate}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      const today = new Date();
                      today.setHours(23, 59, 59, 999);
                      if (selectedDate <= today) {
                        setCustomEndDate(e.target.value);
                      }
                    }}
                    className="w-full px-2 py-1.5 bg-[#374151] border border-[#4B5563] rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#FBBF24] transition-all"
                  />
                </div>
              </>
            )}
          </div>

          {/* Activity Table */}
          {loadingActivity ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-gray-400">Loading activity data...</p>
              </div>
            </div>
          ) : allActivity.length > 0 ? (
            <>
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-800">
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-3">Time</th>
                      <th className="text-left py-2 px-3">Endpoint</th>
                      <th className="text-left py-2 px-3">User</th>
                      <th className="text-left py-2 px-3">Response Time</th>
                      <th className="text-left py-2 px-3">Cost</th>
                      <th className="text-left py-2 px-3">Status</th>
                      <th className="text-left py-2 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allActivity
                      .slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage
                      )
                      .map((call, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer"
                          onClick={() => fetchCallDetails(call.id)}
                        >
                          <td className="py-2 px-3 text-gray-400">
                            {formatDate(call.timestamp)}
                          </td>
                          <td className="py-2 px-3 font-mono text-purple-400">
                            {call.endpoint}
                          </td>
                          <td className="py-2 px-3 text-gray-400 truncate max-w-[150px]">
                            {call.userId}
                          </td>
                          <td className="py-2 px-3 text-cyan-400">
                            {call.responseTime
                              ? `${call.responseTime}ms`
                              : "N/A"}
                          </td>
                          <td className="py-2 px-3 text-green-400">
                            ₹{(call.costINR || 0).toFixed(5)}
                          </td>
                          <td className="py-2 px-3">
                            {call.error ? (
                              <span className="px-2 py-1 bg-red-900/50 text-red-300 rounded text-xs">
                                ❌ Error
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs">
                                ✅ Success
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchCallDetails(call.id);
                              }}
                              className="text-blue-400 hover:text-blue-300 text-xs"
                              disabled={loadingDetails}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-700">
                <div className="text-gray-400 text-sm">
                  Showing{" "}
                  <span className="text-yellow-400 font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="text-yellow-400 font-medium">
                    {Math.min(currentPage * itemsPerPage, allActivity.length)}
                  </span>{" "}
                  of{" "}
                  <span className="text-yellow-400 font-medium">
                    {allActivity.length}
                  </span>{" "}
                  calls
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-yellow-500/50 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  <div className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm font-medium">
                    Page <span className="text-yellow-400">{currentPage}</span>{" "}
                    of{" "}
                    <span className="text-yellow-400">
                      {Math.ceil(allActivity.length / itemsPerPage)}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(
                          Math.ceil(allActivity.length / itemsPerPage),
                          p + 1
                        )
                      )
                    }
                    disabled={
                      currentPage >=
                      Math.ceil(allActivity.length / itemsPerPage)
                    }
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-yellow-500/50 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              Click &quot;Load Activity&quot; to view all historical data
            </div>
          )}
        </div>

        {/* Call Details Modal */}
        {(callDetailsModal || loadingDetails) && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            {loadingDetails ? (
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-12 border border-yellow-500 shadow-2xl">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
                  <p className="text-white text-lg font-medium">
                    Loading call details...
                  </p>
                </div>
              </div>
            ) : selectedCall ? (
              <div className="bg-gray-800/95 backdrop-blur-sm rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-yellow-500 shadow-2xl shadow-yellow-500/20">
                <div className="sticky top-0 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 p-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <span className="text-3xl">📊</span>
                    <span>Call Details</span>
                  </h2>
                  <button
                    onClick={() => setCallDetailsModal(false)}
                    className="w-10 h-10 bg-gray-700 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <span className="text-xl">✕</span>
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-gray-400 text-sm mb-1">Status</div>
                      <div className="text-xl font-bold">
                        {selectedCall.error ? (
                          <span className="text-red-400">❌ Error</span>
                        ) : (
                          <span className="text-green-400">✅ Success</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-gray-400 text-sm mb-1">
                        Response Time
                      </div>
                      <div className="text-xl font-bold text-cyan-400">
                        {selectedCall.responseTime || 0}ms
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-gray-400 text-sm">Endpoint</div>
                        <div className="font-mono text-purple-400">
                          {selectedCall.endpoint}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Model</div>
                        <div className="text-white">{selectedCall.model}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">User ID</div>
                        <div className="font-mono text-sm">
                          {selectedCall.userId}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Timestamp</div>
                        <div className="text-sm">
                          {formatDate(selectedCall.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tokens & Cost */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-gray-400 text-sm mb-1">
                        Input Tokens
                      </div>
                      <div className="text-lg font-bold text-yellow-400">
                        {selectedCall.inputTokens?.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-gray-400 text-sm mb-1">
                        Output Tokens
                      </div>
                      <div className="text-lg font-bold text-yellow-400">
                        {selectedCall.outputTokens?.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-gray-400 text-sm mb-1">
                        Total Tokens
                      </div>
                      <div className="text-lg font-bold text-yellow-400">
                        {selectedCall.totalTokens?.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-gray-400 text-sm mb-1">Cost</div>
                      <div className="text-lg font-bold text-green-400">
                        ₹{(selectedCall.costINR || 0).toFixed(5)}
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {selectedCall.error && selectedCall.errorMessage && (
                    <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                      <div className="text-red-400 font-bold mb-2">
                        Error Message:
                      </div>
                      <div className="text-red-300 font-mono text-sm">
                        {selectedCall.errorMessage}
                      </div>
                    </div>
                  )}

                  {/* Request Data */}
                  {selectedCall.requestData && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-gray-400 text-sm mb-2">
                        Request Data (Preview):
                      </div>
                      <div className="bg-gray-900 rounded p-3 font-mono text-xs text-green-400 overflow-x-auto max-h-40 overflow-y-auto">
                        {selectedCall.requestData}
                      </div>
                    </div>
                  )}

                  {/* Response Data */}
                  {selectedCall.responseData && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-gray-400 text-sm mb-2">
                        Response Data (Preview):
                      </div>
                      <div className="bg-gray-900 rounded p-3 font-mono text-xs text-blue-400 overflow-x-auto max-h-40 overflow-y-auto">
                        {selectedCall.responseData}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-2">Metadata:</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Method:</span>{" "}
                        <span className="text-white">
                          {selectedCall.metadata?.method}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Status Code:</span>{" "}
                        <span className="text-white">
                          {selectedCall.statusCode}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-400">User Agent:</span>{" "}
                        <span className="text-white text-xs">
                          {selectedCall.metadata?.userAgent}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
