import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../utils/API.js";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";


import {
    Upload,
    CheckCircle,
    Clock,
    TriangleAlert,
    TrendingUp,
    BarChart3,
    PieChart as PieChartIcon,
    Activity,
    Database,
    Cpu,
    Server,
    RefreshCw
} from "lucide-react";

const Stats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await API.get("/stats");
            setStats(res.data.summary);
            toast.success(res.data.message || "Dashboard updated");
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#001a1a] via-[#003F3A] to-[#001a1a] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 border-4 border-[#08cdbd] border-t-transparent rounded-full animate-spin"></div>

                    <p className="text-[#08cdbd] mt-4 text-sm font-medium tracking-wider animate-pulse text-center">
                        LOADING DASHBOARD
                    </p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#001a1a] via-[#003F3A] to-[#001a1a] flex items-center justify-center">
                <p className="text-white">No data available</p>
            </div>
        );
    }

    const statusData = [
        { name: "Completed", value: stats.completed || 0 },
        { name: "Processing", value: stats.processing || 0 },
        { name: "Failed", value: stats.failed || 0 }
    ];

    const colors = ["#08cdbd", "#fbbf24", "#ef4444"];

    const summaryCards = [
        {
            title: "Total Uploads (Excel)",
            value: stats.totalFiles || 0,
            icon: Upload,
            iconColor: "text-[#08cdbd]",
        },
        {
            title: "Completed",
            value: stats.completed || 0,
            icon: CheckCircle,
            iconColor: "text-[#10b981]",
        },
        {
            title: "Processing",
            value: stats.processing || 0,
            icon: Clock,
            iconColor: "text-[#f59e0b]",
        },
        {
            title: "Failed",
            value: stats.failed || 0,
            icon: TriangleAlert,
            iconColor: "text-[#ef4444]",
        },
    ];

    const performanceMetrics = [
    {
        label: "Success Rate",
        value: `${(stats.successRate || stats.succesRate || 0).toFixed(1)}%`,
        icon: TrendingUp,
        color: "text-[#08cdbd]",
        iconColor: "text-[#08cdbd]"
    },
    {
        label: "Total Records Processed",
        value: stats.totalRecordsProcessed?.toLocaleString() || "0",
        icon: Database,
        color: "text-[#fbbf24]",
        iconColor: "text-[#fbbf24]"
    },
    {
        label: "Avg. Processing Time(s)",
        value: stats.avgProcessingTime?.toLocaleString() || "N/A",
        icon: Cpu,
        color: "text-[#a78bfa]",
        iconColor: "text-[#a78bfa]"
    },
    {
        label: "Active Jobs",
        value: stats.activeJobsCount || 0,
        icon: Server,
        color: "text-[#60a5fa]",
        iconColor: "text-[#60a5fa]"
    }
];

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: (i) => ({
            opacity: 1,
            scale: 1,
            transition: { delay: i * 0.1, duration: 0.4 }
        })
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen bg-gradient-to-br from-[#001a1a] via-[#003F3A] to-[#001a1a] p-6 lg:p-8 relative overflow-x-hidden"
        >

            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#08cdbd] rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#fbbf24] rounded-full blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between mb-8"
            >
                <div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#08cdbd] via-[#06d4c0] to-[#04b8a6] bg-clip-text text-transparent flex items-center gap-3">
                        <BarChart3 className="text-[#08cdbd]" size={36} />
                        Analytics Dashboard
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm tracking-wide">
                        Real-time processing insights & performance metrics
                    </p>
                </div>
                <button
                    onClick={fetchStats}
                    className="mt-4 md:mt-0 px-6 py-2.5 bg-[#08cdbd]/20 hover:bg-[#08cdbd]/30 text-[#08cdbd] rounded-xl border border-[#08cdbd]/30 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
                >
                    <RefreshCw size={18} className="animate-pulse" />
                    <span className="text-sm font-medium">Refresh Data</span>
                </button>
            </motion.div>

            <motion.div
                variants={containerVariants}
                className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6"
            >
                {summaryCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        custom={index}
                        variants={cardVariants}
                        className="group relative overflow-hidden bg-gradient-to-br from-[#042f2b]/80 to-[#003f3a]/80 backdrop-blur-sm rounded-2xl p-6 border border-white/5 hover:border-[#08cdbd]/30 transition-all duration-500 hover:shadow-2xl hover:shadow-[#08cdbd]/10"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium tracking-wider uppercase">
                                    {card.title}
                                </p>
                                <p className="text-3xl lg:text-4xl font-bold text-white mt-2">
                                    {card.value}
                                </p>
                                <div className="mt-3 h-1 w-16 bg-gradient-to-r from-[#08cdbd] to-[#06d4c0] rounded-full"></div>
                            </div>
                            <div className={`p-3 rounded-xl`}>
                                <card.icon className={`text-2xl ${card.iconColor}`} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6"
            >
                {performanceMetrics.map((metric, index) => (
                    <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="bg-gradient-to-br from-[#042f2b]/60 to-[#003f3a]/60 backdrop-blur-sm rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                                    {metric.label}
                                </p>
                                <p className={`text-2xl font-bold mt-1 ${metric.color}`}>
                                    {metric.value}
                                </p>
                            </div>
                            <metric.icon className={`text-3xl  ${metric.iconColor}`} />
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="relative z-10 grid lg:grid-cols-2 gap-6"
            >
                <div className="bg-gradient-to-br from-[#042f2b]/80 to-[#003f3a]/80 backdrop-blur-sm rounded-2xl p-6 border border-white/5 hover:border-[#08cdbd]/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <PieChartIcon className="text-[#08cdbd]" size={20} />
                                Status Distribution
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">Workbook processing breakdown</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {statusData.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-xs">
                                    <div className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: colors[idx] }}></div>
                                    <span className="text-gray-300">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={{ stroke: '#666', strokeWidth: 1 }}
                            >
                                {statusData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={colors[index % colors.length]}
                                        className="hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: '#003F3A',
                                    border: '1px solid rgba(8,205,189,0.2)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    padding: '12px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-gradient-to-br from-[#042f2b]/80 to-[#003f3a]/80 backdrop-blur-sm rounded-2xl p-6 border border-white/5 hover:border-[#08cdbd]/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <BarChart3 className="text-[#08cdbd]" size={20} />
                                Processing Overview
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">Job completion metrics</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={statusData} barGap={8}>
                            <defs>
                                {statusData.map((entry, index) => (
                                    <linearGradient key={index} id={`barGrad${index}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={colors[index]} stopOpacity={0.8} />
                                        <stop offset="100%" stopColor={colors[index]} stopOpacity={0.3} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a4a45" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: '#003F3A',
                                    border: '1px solid rgba(8,205,189,0.2)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    padding: '12px'
                                }}
                                itemStyle={{
                                    color: '#08cdbd',
                                    padding: '4px 0',
                                    fontSize: '13px'
                                }}

                                cursor={{ fill: 'rgba(8,205,189,0.1)' }}
                            />
                            <Bar
                                dataKey="value"
                                radius={[8, 8, 0, 0]}
                                animationDuration={1500}
                            >
                                {statusData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={`url(#barGrad${index})`}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="relative z-10 grid md:grid-cols-3 gap-6 mt-6"
            ></motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="relative z-10 mt-8 text-center text-gray-500 text-xs tracking-wider"
            >
                <p className="border-t border-white/5 pt-6">
                    © 2024 Secure File Management • Real-time Analytics Dashboard
                </p>
            </motion.div>
        </motion.div>
    );
};

export default Stats;