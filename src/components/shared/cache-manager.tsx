"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Database,
  Zap,
  Trash2,
  BarChart3,
  Clock,
  AlertCircle,
} from "lucide-react";

interface CacheStats {
  totalKeys: number;
  memoryUsage: string;
  hitRate: number;
}

interface DatabaseStats {
  totalProducts: number;
  expiredProducts: number;
  activeProducts: number;
  lastRefresh: string;
}

interface CacheManagerProps {
  className?: string;
}

export default function CacheManager({ className }: CacheManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(
    null
  );
  const [lastAction, setLastAction] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/cron/refresh-discounts?action=stats");
      if (response.ok) {
        const data = await response.json();
        setCacheStats(data.results.stats);
        setDatabaseStats(data.results.database);
      } else {
        throw new Error("Failed to fetch stats");
      }
    } catch (error) {
      setError("خطا در دریافت آمار کش");
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const performAction = async (action: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setLastAction("");

      const response = await fetch(
        `/api/cron/refresh-discounts?action=${action}`
      );
      if (response.ok) {
        const data = await response.json();
        setLastAction(`عملیات ${action} با موفقیت انجام شد`);

        // Refresh stats after action
        setTimeout(() => {
          fetchStats();
        }, 2000);
      } else {
        throw new Error(`Failed to perform ${action}`);
      }
    } catch (error) {
      setError(`خطا در انجام عملیات ${action}`);
      console.error(`Error performing ${action}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("fa-IR");
    } catch {
      return dateString;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            مدیریت کش محصولات تخفیف
          </CardTitle>
          <CardDescription>
            نظارت و کنترل سیستم کش محصولات زیر ۶ میلیون ریال
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={() => performAction("refresh")}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              تازه‌سازی
            </Button>

            <Button
              onClick={() => performAction("warmup")}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              گرم کردن کش
            </Button>

            <Button
              onClick={() => performAction("cleanup")}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              پاک‌سازی
            </Button>

            <Button
              onClick={() => performAction("invalidate")}
              disabled={isLoading}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              باطل کردن
            </Button>
          </div>

          {/* Status Messages */}
          {lastAction && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">{lastAction}</p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Refresh Stats Button */}
          <div className="flex justify-end">
            <Button
              onClick={fetchStats}
              disabled={isLoading}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              تازه‌سازی آمار
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cache Statistics */}
      {cacheStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              آمار کش Redis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {cacheStats.totalKeys}
                </div>
                <div className="text-sm text-blue-600">کل کلیدها</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {cacheStats.memoryUsage}
                </div>
                <div className="text-sm text-green-600">استفاده حافظه</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {cacheStats.hitRate}%
                </div>
                <div className="text-sm text-purple-600">نرخ موفقیت</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Database Statistics */}
      {databaseStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              آمار دیتابیس
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {databaseStats.totalProducts}
                </div>
                <div className="text-sm text-gray-600">کل محصولات</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {databaseStats.activeProducts}
                </div>
                <div className="text-sm text-green-600">محصولات فعال</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {databaseStats.expiredProducts}
                </div>
                <div className="text-sm text-red-600">محصولات منقضی</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600">آخرین تازه‌سازی</div>
                <div className="text-xs text-blue-600 mt-1">
                  {formatDate(databaseStats.lastRefresh)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cache Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            اطلاعات کش
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">
                محصولات زیر ۶ میلیون ریال
              </span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                ۷۲ ساعت
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">محصولات تخفیف</span>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                ۲۴ ساعت
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium">کش ترکیبی</span>
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800"
              >
                ۱۲ ساعت
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium">کش سمت کلاینت</span>
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800"
              >
                ۳۰ دقیقه
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
