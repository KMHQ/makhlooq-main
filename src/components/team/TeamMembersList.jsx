"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Badge, Crown, Sword, Shield, Users, ArrowUpRight } from "lucide-react";

/**
 * ▸ TEAM MEMBERS LIST COMPONENT
 * Displays organization members in a sortable, filterable table/card layout
 * Similar to: https://robertsspaceindustries.com/en/orgs/KMHQ/members
 */
export default function TeamMembersList({ members, onSelect, searchQuery = "", activeFilter = "all" }) {
    const [sortBy, setSortBy] = useState("role"); // 'role', 'name', 'joined'
    const [sortOrder, setSortOrder] = useState("asc");

    // Get role icon and color
    const getRoleIcon = (role) => {
        const roleStr = role?.toLowerCase() || "";
        if (roleStr.includes("admiral") || roleStr.includes("founder")) return { Icon: Crown, color: "text-yellow-500" };
        if (roleStr.includes("commander") || roleStr.includes("captain")) return { Icon: Sword, color: "text-red-500" };
        if (roleStr.includes("lead") || roleStr.includes("lieutenant")) return { Icon: Shield, color: "text-blue-500" };
        return { Icon: Users, color: "text-emerald-500" };
    };

    // Get status dot color
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "active":
                return "bg-green-500";
            default:
                return "bg-gray-500";
        }
    };

    // Sort members
    const sortedMembers = [...members].sort((a, b) => {
        let aVal, bVal;

        if (sortBy === "role") {
            aVal = a.role?.toLowerCase() || "";
            bVal = b.role?.toLowerCase() || "";
        } else if (sortBy === "name") {
            aVal = a.name?.toLowerCase() || "";
            bVal = b.name?.toLowerCase() || "";
        } else if (sortBy === "joined") {
            aVal = new Date(a.joined_at) || new Date(0);
            bVal = new Date(b.joined_at) || new Date(0);
        }

        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    const toggleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("asc");
        }
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };

    return (
        <div className="w-full">
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-white/5 border border-white/10 rounded-t-2xl sticky top-0 z-10">
                <button
                    onClick={() => toggleSort("role")}
                    className="col-span-3 text-left text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                >
                    Role
                    {sortBy === "role" && <span className={`transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`}>↑</span>}
                </button>
                <button
                    onClick={() => toggleSort("name")}
                    className="col-span-4 text-left text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                >
                    Name
                    {sortBy === "name" && <span className={`transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`}>↑</span>}
                </button>
                <button
                    onClick={() => toggleSort("joined")}
                    className="col-span-3 text-left text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                >
                    Joined
                    {sortBy === "joined" && <span className={`transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`}>↑</span>}
                </button>
                <div className="col-span-2 text-left text-xs uppercase tracking-widest font-bold text-gray-400">Status</div>
            </div>

            {/* Member Rows */}
            <div className="space-y-2">
                {sortedMembers.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <p className="mb-2">No members found</p>
                        <p className="text-xs">Try adjusting your search filters</p>
                    </div>
                ) : (
                    sortedMembers.map((member, index) => {
                        const { Icon, color } = getRoleIcon(member.role);
                        const statusColor = getStatusColor(member.status);

                        return (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => onSelect?.(member)}
                                className="group cursor-pointer hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.05] rounded-xl transition-all duration-200"
                            >
                                {/* Role */}
                                <div className="col-span-3 flex items-center gap-3">
                                    <Icon size={18} className={color} />
                                    <span className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                                        {member.role || "Member"}
                                    </span>
                                </div>

                                {/* Name */}
                                <div className="col-span-4 flex items-center gap-3">
                                    {member.avatar_url && (
                                        <img
                                            src={member.avatar_url}
                                            alt={member.name}
                                            className="w-8 h-8 rounded-full border border-white/10 object-cover"
                                        />
                                    )}
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <span className="text-sm font-medium text-white truncate">
                                            {member.name || member.discord_tag || "Unknown"}
                                        </span>
                                        {member.discord_tag && <span className="text-xs text-gray-500 truncate">{member.discord_tag}</span>}
                                    </div>
                                </div>

                                {/* Joined */}
                                <div className="col-span-3 flex items-center">
                                    <span className="text-sm text-gray-400">{formatDate(member.joined_at)}</span>
                                </div>

                                {/* Status */}
                                <div className="col-span-2 flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`} />
                                    <span className="text-xs text-gray-400 capitalize">{member.status || "inactive"}</span>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
                {sortedMembers.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <p className="mb-2">No members found</p>
                        <p className="text-xs">Try adjusting your search filters</p>
                    </div>
                ) : (
                    sortedMembers.map((member, index) => {
                        const { Icon, color } = getRoleIcon(member.role);
                        const statusColor = getStatusColor(member.status);

                        return (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => onSelect?.(member)}
                                className="group cursor-pointer p-4 bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.05] rounded-lg transition-all"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    {member.avatar_url && (
                                        <img
                                            src={member.avatar_url}
                                            alt={member.name}
                                            className="w-10 h-10 rounded-full border border-white/10 object-cover"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon size={16} className={color} />
                                            <h3 className="text-sm font-semibold text-white truncate">
                                                {member.name || member.discord_tag || "Unknown"}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{member.role || "Member"}</p>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse shrink-0`} />
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-400 px-0">
                                    <span>{formatDate(member.joined_at)}</span>
                                    <span className="capitalize">{member.status || "inactive"}</span>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Footer Stats */}
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                <span>
                    {sortedMembers.length} member{sortedMembers.length !== 1 ? "s" : ""}
                </span>
                <span>{sortedMembers.filter((m) => m.status?.toLowerCase() === "active").length} active</span>
            </div>
        </div>
    );
}
