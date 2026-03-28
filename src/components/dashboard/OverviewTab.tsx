"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Grid,
  SimpleGrid,
  Text,
  Badge,
  Spinner,
  Button,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Heart,
  Users,
  Eye,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  Award,
  BarChart3,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from "lucide-react";
import type {
  InstagramDashboardData,
  BrandStrengthMetrics,
  ContentPerformance,
  AudienceDemographics,
  InstagramMedia,
} from "@/types/instagram.types";
import { useInstagramDashboard } from "@/hooks/useInstagramDashboard";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface OverviewTabProps {
  brandId: string;
  session?: any;
  // Legacy props (kept for backward compatibility, not used)
  metrics?: any;
  campaigns?: any;
  dna?: any;
  logs?: any;
  schedule?: any;
  agentStatus?: any;
  headerData?: any;
  isLoading?: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: number;
  trendLabel?: string;
  isHighlighted?: boolean;
  tooltip?: string;
}

interface BrandStrengthGaugeProps {
  score: number;
  label: string;
  sublabel?: string;
  size?: "sm" | "md" | "lg";
}

interface ContentPerformanceCardProps {
  data: ContentPerformance | null;
}

interface AudienceInsightsCardProps {
  data: AudienceDemographics | null;
}

interface RecentMediaGridProps {
  media: InstagramMedia[];
  isLoading: boolean;
  isConnected?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Color Palette - Professional Light Theme
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = {
  // Primary brand colors
  primary: "#6366F1",
  primaryLight: "#818CF8",
  primaryDark: "#4F46E5",
  primarySoft: "#EEF2FF",
  primaryHover: "#E0E7FF",
  
  // Background colors
  bgPrimary: "#FAFAFA",
  bgSecondary: "#FFFFFF",
  bgElevated: "#FFFFFF",
  
  // Text colors
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  textLight: "#F9FAFB",
  
  // Border colors
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  
  // Status colors
  success: "#10B981",
  successSoft: "#D1FAE5",
  warning: "#F59E0B",
  warningSoft: "#FEF3C7",
  error: "#EF4444",
  errorSoft: "#FEE2E2",
  info: "#3B82F6",
  infoSoft: "#DBEAFE",
  
  // Icon backgrounds
  iconBg: "#EEF2FF",
  
  // Brand strength colors
  strengthExcellent: "#10B981",
  strengthGood: "#3B82F6",
  strengthAverage: "#F59E0B",
  strengthBelow: "#EF4444",
};

// ─────────────────────────────────────────────────────────────────────────────
// Keyframes
// ─────────────────────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "—";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatPercentage(num: number | null | undefined): string {
  if (num === null || num === undefined) return "—";
  return `${num > 0 ? "+" : ""}${num.toFixed(1)}%`;
}

function getScoreColor(score: number): string {
  if (score >= 80) return COLORS.strengthExcellent;
  if (score >= 60) return COLORS.strengthGood;
  if (score >= 40) return COLORS.strengthAverage;
  return COLORS.strengthBelow;
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  return "Needs Improvement";
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton Loader Component
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonLoader({
  height = "20px",
  width = "100%",
  borderRadius = "8px",
  ...rest
}: {
  height?: string;
  width?: string;
  borderRadius?: string;
  [key: string]: any;
}) {
  return (
    <Box
      w={width}
      h={height}
      borderRadius={borderRadius}
      bg="linear-gradient(90deg, #F3F4F6 0%, #E5E7EB 50%, #F3F4F6 100%)"
      backgroundSize="200% 100%"
      animation={`${shimmer} 1.5s infinite`}
      {...rest}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card Component
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sublabel,
  trend,
  trendLabel,
  isHighlighted,
  tooltip,
}: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0;
  
  return (
    <Box
      bg={COLORS.bgSecondary}
      borderRadius="20px"
      p={6}
      border="1px solid"
      borderColor={isHighlighted ? COLORS.primary : COLORS.border}
      transition="all 0.2s"
      _hover={{
        borderColor: COLORS.primary,
        boxShadow: "0 4px 12px rgba(99, 102, 241, 0.12)",
        transform: "translateY(-2px)",
      }}
      animation={`${fadeUp} 0.4s ease-out`}
      position="relative"
    >
      {tooltip && (
        <Tooltip content={tooltip} showArrow>
          <Box
            position="absolute"
            top={4}
            right={4}
            color={COLORS.textMuted}
            cursor="help"
          >
            <Info size={16} />
          </Box>
        </Tooltip>
      )}
      
      <Flex align="flex-start" justify="space-between" mb={5}>
        <Box
          w="48px"
          h="48px"
          borderRadius="14px"
          bg={COLORS.iconBg}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color={COLORS.primary}
        >
          {icon}
        </Box>
        
        {trend !== undefined && (
          <Badge
            px={3}
            py={1.5}
            borderRadius="20px"
            fontSize="12px"
            fontWeight="600"
            bg={isPositive ? COLORS.successSoft : COLORS.errorSoft}
            color={isPositive ? COLORS.success : COLORS.error}
            display="flex"
            alignItems="center"
            gap={1}
          >
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{formatPercentage(trend)}</span>
          </Badge>
        )}
        
        {trendLabel && (
          <Badge
            px={3}
            py={1.5}
            borderRadius="20px"
            fontSize="12px"
            fontWeight="600"
            bg={COLORS.primarySoft}
            color={COLORS.primary}
          >
            {trendLabel}
          </Badge>
        )}
      </Flex>
      
      <Text 
        fontSize="13px" 
        fontWeight="500" 
        color={COLORS.textSecondary} 
        mb={2}
        textTransform="uppercase"
        letterSpacing="0.03em"
      >
        {label}
      </Text>
      
      <Text 
        fontSize="36px" 
        fontWeight="700" 
        color={COLORS.textPrimary} 
        lineHeight="1.1" 
        mb={2}
      >
        {value}
      </Text>
      
      {sublabel && (
        <Text 
          fontSize="13px" 
          color={COLORS.textMuted}
          fontWeight="400"
        >
          {sublabel}
        </Text>
      )}
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Brand Strength Gauge Component
// ─────────────────────────────────────────────────────────────────────────────

function BrandStrengthGauge({ score, label, sublabel, size = "md" }: BrandStrengthGaugeProps) {
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);
  
  const sizeConfig = {
    sm: { width: "120px", fontSize: "24px" },
    md: { width: "160px", fontSize: "32px" },
    lg: { width: "200px", fontSize: "42px" },
  };
  
  const config = sizeConfig[size];
  
  // Calculate stroke dasharray for SVG circle
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      animation={`${fadeUp} 0.4s ease-out`}
    >
      <Box
        position="relative"
        w={config.width}
        h={config.width}
      >
        <svg
          width={config.width}
          height={config.width}
          viewBox="0 0 160 160"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={COLORS.border}
            strokeWidth="12"
          />
          
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>
        
        {/* Center content */}
        <Flex
          position="absolute"
          inset={0}
          direction="column"
          align="center"
          justify="center"
        >
          <Text
            fontSize={config.fontSize}
            fontWeight="700"
            color={scoreColor}
            lineHeight="1"
          >
            {score}
          </Text>
          <Text
            fontSize="11px"
            color={COLORS.textMuted}
            textTransform="uppercase"
            letterSpacing="0.05em"
            mt={1}
          >
            / 100
          </Text>
        </Flex>
      </Box>
      
      <Text
        fontSize="14px"
        fontWeight="600"
        color={COLORS.textPrimary}
        mt={4}
        textAlign="center"
      >
        {label}
      </Text>
      
      <Badge
        mt={2}
        px={3}
        py={1}
        borderRadius="20px"
        fontSize="11px"
        fontWeight="600"
        bg={`${scoreColor}20`}
        color={scoreColor}
      >
        {scoreLabel}
      </Badge>
      
      {sublabel && (
        <Text
          fontSize="12px"
          color={COLORS.textMuted}
          mt={2}
          textAlign="center"
        >
          {sublabel}
        </Text>
      )}
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Brand Strength Section Component
// ─────────────────────────────────────────────────────────────────────────────

function BrandStrengthSection({ data }: { data: BrandStrengthMetrics | null }) {
  if (!data) {
    return (
      <Box
        bg={COLORS.bgSecondary}
        borderRadius="20px"
        p={8}
        border="1px solid"
        borderColor={COLORS.border}
      >
        <Flex justify="space-between" align="center" mb={6}>
          <Text fontSize="18px" fontWeight="700" color={COLORS.textPrimary}>
            Brand Strength
          </Text>
        </Flex>
        <Grid templateColumns={{ base: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }} gap={6}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Box key={i} display="flex" flexDirection="column" alignItems="center">
              <SkeletonLoader height="120px" width="120px" borderRadius="60px" />
              <SkeletonLoader height="20px" width="80px" mt={4} />
            </Box>
          ))}
        </Grid>
      </Box>
    );
  }
  
  return (
    <Box
      bg={COLORS.bgSecondary}
      borderRadius="20px"
      p={8}
      border="1px solid"
      borderColor={COLORS.border}
      animation={`${fadeUp} 0.4s ease-out`}
    >
      <Flex justify="space-between" align="center" mb={8}>
        <Flex gap={3} align="center">
          <Box
            w="40px"
            h="40px"
            borderRadius="12px"
            bg={COLORS.iconBg}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color={COLORS.primary}
          >
            <Award size={20} />
          </Box>
          <Box>
            <Text fontSize="18px" fontWeight="700" color={COLORS.textPrimary}>
              Brand Strength
            </Text>
            <Text fontSize="13px" color={COLORS.textMuted}>
              Overall performance score
            </Text>
          </Box>
        </Flex>
        
        <Badge
          px={4}
          py={2}
          borderRadius="20px"
          fontSize="13px"
          fontWeight="600"
          bg={getScoreColor(data.overall_score) + "20"}
          color={getScoreColor(data.overall_score)}
        >
          {getScoreLabel(data.overall_score)}
        </Badge>
      </Flex>
      
      {/* Main Score */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap={8} mb={8}>
        <Flex flexDirection="column" alignItems="center" justify="center">
          <BrandStrengthGauge score={data.overall_score} label="Overall" size="lg" />
        </Flex>
        
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <Box
            p={4}
            borderRadius="12px"
            bg={COLORS.bgPrimary}
            border="1px solid"
            borderColor={COLORS.border}
          >
            <Flex align="center" gap={2} mb={2}>
              <Heart size={16} color={COLORS.success} />
              <Text fontSize="12px" color={COLORS.textSecondary}>Engagement</Text>
            </Flex>
            <Text fontSize="24px" fontWeight="700" color={COLORS.textPrimary}>
              {data.engagement_score}
            </Text>
            <Flex align="center" gap={1} mt={1}>
              {data.engagement_trend >= 0 ? (
                <ArrowUpRight size={12} color={COLORS.success} />
              ) : (
                <ArrowDownRight size={12} color={COLORS.error} />
              )}
              <Text fontSize="11px" color={data.engagement_trend >= 0 ? COLORS.success : COLORS.error}>
                {formatPercentage(data.engagement_trend)}
              </Text>
            </Flex>
          </Box>
          
          <Box
            p={4}
            borderRadius="12px"
            bg={COLORS.bgPrimary}
            border="1px solid"
            borderColor={COLORS.border}
          >
            <Flex align="center" gap={2} mb={2}>
              <Users size={16} color={COLORS.info} />
              <Text fontSize="12px" color={COLORS.textSecondary}>Growth</Text>
            </Flex>
            <Text fontSize="24px" fontWeight="700" color={COLORS.textPrimary}>
              {data.growth_score}
            </Text>
            <Flex align="center" gap={1} mt={1}>
              {data.follower_growth_trend >= 0 ? (
                <ArrowUpRight size={12} color={COLORS.success} />
              ) : (
                <ArrowDownRight size={12} color={COLORS.error} />
              )}
              <Text fontSize="11px" color={data.follower_growth_trend >= 0 ? COLORS.success : COLORS.error}>
                {formatPercentage(data.follower_growth_trend)}
              </Text>
            </Flex>
          </Box>
          
          <Box
            p={4}
            borderRadius="12px"
            bg={COLORS.bgPrimary}
            border="1px solid"
            borderColor={COLORS.border}
          >
            <Flex align="center" gap={2} mb={2}>
              <Eye size={16} color={COLORS.warning} />
              <Text fontSize="12px" color={COLORS.textSecondary}>Reach</Text>
            </Flex>
            <Text fontSize="24px" fontWeight="700" color={COLORS.textPrimary}>
              {data.reach_score}
            </Text>
            <Flex align="center" gap={1} mt={1}>
              {data.reach_trend >= 0 ? (
                <ArrowUpRight size={12} color={COLORS.success} />
              ) : (
                <ArrowDownRight size={12} color={COLORS.error} />
              )}
              <Text fontSize="11px" color={data.reach_trend >= 0 ? COLORS.success : COLORS.error}>
                {formatPercentage(data.reach_trend)}
              </Text>
            </Flex>
          </Box>
          
          <Box
            p={4}
            borderRadius="12px"
            bg={COLORS.bgPrimary}
            border="1px solid"
            borderColor={COLORS.border}
          >
            <Flex align="center" gap={2} mb={2}>
              <Star size={16} color={COLORS.primary} />
              <Text fontSize="12px" color={COLORS.textSecondary}>Quality</Text>
            </Flex>
            <Text fontSize="24px" fontWeight="700" color={COLORS.textPrimary}>
              {data.content_quality_score}
            </Text>
            <Text fontSize="11px" color={COLORS.textMuted} mt={1}>
              Content score
            </Text>
          </Box>
        </Grid>
      </Grid>
      
      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <Box>
          <Text fontSize="14px" fontWeight="600" color={COLORS.textPrimary} mb={3}>
            💡 Recommendations
          </Text>
          <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={3}>
            {data.recommendations.slice(0, 4).map((rec, index) => (
              <Flex
                key={index}
                gap={3}
                p={3}
                borderRadius="10px"
                bg={COLORS.bgPrimary}
                border="1px solid"
                borderColor={COLORS.border}
              >
                <Box
                  w="6px"
                  h="6px"
                  borderRadius="50%"
                  bg={COLORS.primary}
                  mt={1.5}
                  flexShrink={0}
                />
                <Text fontSize="13px" color={COLORS.textSecondary}>
                  {rec}
                </Text>
              </Flex>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Content Performance Card
// ─────────────────────────────────────────────────────────────────────────────

function ContentPerformanceCard({ data }: ContentPerformanceCardProps) {
  if (!data) {
    return (
      <Box
        bg={COLORS.bgSecondary}
        borderRadius="20px"
        p={6}
        border="1px solid"
        borderColor={COLORS.border}
      >
        <SkeletonLoader height="24px" width="200px" mb={4} />
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonLoader key={i} height="60px" />
          ))}
        </Grid>
      </Box>
    );
  }
  
  return (
    <Box
      bg={COLORS.bgSecondary}
      borderRadius="20px"
      p={6}
      border="1px solid"
      borderColor={COLORS.border}
      animation={`${fadeUp} 0.4s ease-out`}
    >
      <Flex justify="space-between" align="center" mb={5}>
        <Flex gap={3} align="center">
          <Box
            w="40px"
            h="40px"
            borderRadius="12px"
            bg={COLORS.iconBg}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color={COLORS.primary}
          >
            <BarChart3 size={20} />
          </Box>
          <Box>
            <Text fontSize="16px" fontWeight="700" color={COLORS.textPrimary}>
              Content Performance
            </Text>
            <Text fontSize="12px" color={COLORS.textMuted}>
              Last 28 days
            </Text>
          </Box>
        </Flex>
      </Flex>
      
      <Grid templateColumns={{ base: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
        <Box p={4} borderRadius="12px" bg={COLORS.bgPrimary}>
          <Text fontSize="12px" color={COLORS.textMuted} mb={1}>
            Total Posts
          </Text>
          <Text fontSize="24px" fontWeight="700" color={COLORS.textPrimary}>
            {data.total_posts}
          </Text>
        </Box>
        
        <Box p={4} borderRadius="12px" bg={COLORS.bgPrimary}>
          <Text fontSize="12px" color={COLORS.textMuted} mb={1}>
            Avg Likes
          </Text>
          <Text fontSize="24px" fontWeight="700" color={COLORS.textPrimary}>
            {formatNumber(data.avg_likes)}
          </Text>
        </Box>
        
        <Box p={4} borderRadius="12px" bg={COLORS.bgPrimary}>
          <Text fontSize="12px" color={COLORS.textMuted} mb={1}>
            Avg Comments
          </Text>
          <Text fontSize="24px" fontWeight="700" color={COLORS.textPrimary}>
            {formatNumber(data.avg_comments)}
          </Text>
        </Box>
        
        <Box p={4} borderRadius="12px" bg={COLORS.bgPrimary}>
          <Text fontSize="12px" color={COLORS.textMuted} mb={1}>
            Engagement Rate
          </Text>
          <Text fontSize="24px" fontWeight="700" color={COLORS.success}>
            {data.avg_engagement_rate.toFixed(1)}%
          </Text>
        </Box>
      </Grid>
      
      {/* Posts by Type */}
      <Box mt={5}>
        <Text fontSize="13px" fontWeight="600" color={COLORS.textSecondary} mb={3}>
          Posts by Type
        </Text>
        <Flex gap={3} flexWrap="wrap">
          {Object.entries(data.posts_by_type).map(([type, count]) => (
            count > 0 && (
              <Badge
                key={type}
                px={3}
                py={1.5}
                borderRadius="20px"
                fontSize="12px"
                fontWeight="600"
                bg={COLORS.primarySoft}
                color={COLORS.primary}
              >
                {type.replace("_", " ")}: {count}
              </Badge>
            )
          ))}
        </Flex>
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Audience Insights Card
// ─────────────────────────────────────────────────────────────────────────────

function AudienceInsightsCard({ data }: AudienceInsightsCardProps) {
  if (!data) {
    return (
      <Box
        bg={COLORS.bgSecondary}
        borderRadius="20px"
        p={6}
        border="1px solid"
        borderColor={COLORS.border}
      >
        <SkeletonLoader height="24px" width="200px" mb={4} />
        <SkeletonLoader height="150px" mb={4} />
        <SkeletonLoader height="100px" />
      </Box>
    );
  }
  
  return (
    <Box
      bg={COLORS.bgSecondary}
      borderRadius="20px"
      p={6}
      border="1px solid"
      borderColor={COLORS.border}
      animation={`${fadeUp} 0.4s ease-out`}
    >
      <Flex justify="space-between" align="center" mb={5}>
        <Flex gap={3} align="center">
          <Box
            w="40px"
            h="40px"
            borderRadius="12px"
            bg={COLORS.iconBg}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color={COLORS.primary}
          >
            <Users size={20} />
          </Box>
          <Box>
            <Text fontSize="16px" fontWeight="700" color={COLORS.textPrimary}>
              Audience Insights
            </Text>
            <Text fontSize="12px" color={COLORS.textMuted}>
              Demographics & activity
            </Text>
          </Box>
        </Flex>
      </Flex>
      
      {/* Follower Growth */}
      <Grid templateColumns="repeat(3, 1fr)" gap={4} mb={6}>
        <Box>
          <Text fontSize="12px" color={COLORS.textMuted} mb={1}>
            Total Followers
          </Text>
          <Text fontSize="22px" fontWeight="700" color={COLORS.textPrimary}>
            {formatNumber(data.total_followers)}
          </Text>
        </Box>
        
        <Box>
          <Text fontSize="12px" color={COLORS.textMuted} mb={1}>
            7D Growth
          </Text>
          <Text 
            fontSize="22px" 
            fontWeight="700" 
            color={data.follower_growth_7d >= 0 ? COLORS.success : COLORS.error}
          >
            {formatPercentage(data.follower_growth_7d)}
          </Text>
        </Box>
        
        <Box>
          <Text fontSize="12px" color={COLORS.textMuted} mb={1}>
            28D Growth
          </Text>
          <Text 
            fontSize="22px" 
            fontWeight="700" 
            color={data.follower_growth_28d >= 0 ? COLORS.success : COLORS.error}
          >
            {formatPercentage(data.follower_growth_28d)}
          </Text>
        </Box>
      </Grid>
      
      {/* Top Locations */}
      {data.top_locations.length > 0 && (
        <Box mb={6}>
          <Flex gap={2} align="center" mb={3}>
            <MapPin size={16} color={COLORS.textMuted} />
            <Text fontSize="13px" fontWeight="600" color={COLORS.textSecondary}>
              Top Locations
            </Text>
          </Flex>
          <Flex gap={2} flexWrap="wrap">
            {data.top_locations.slice(0, 5).map((location, index) => (
              <Badge
                key={index}
                px={3}
                py={1.5}
                borderRadius="20px"
                fontSize="12px"
                fontWeight="600"
                bg={COLORS.bgPrimary}
                color={COLORS.textPrimary}
                border="1px solid"
                borderColor={COLORS.border}
              >
                {location.name} {location.percentage > 0 && `(${location.percentage}%)`}
              </Badge>
            ))}
          </Flex>
        </Box>
      )}
      
      {/* Best Time to Post */}
      <Box>
        <Flex gap={2} align="center" mb={3}>
          <Clock size={16} color={COLORS.textMuted} />
          <Text fontSize="13px" fontWeight="600" color={COLORS.textSecondary}>
            Best Time to Post
          </Text>
        </Flex>
        <Flex gap={4}>
          <Box>
            <Text fontSize="20px" fontWeight="700" color={COLORS.textPrimary}>
              {data.online_activity.peak_day}
            </Text>
            <Text fontSize="12px" color={COLORS.textMuted}>Best Day</Text>
          </Box>
          <Box>
            <Text fontSize="20px" fontWeight="700" color={COLORS.textPrimary}>
              {data.online_activity.peak_hour}:00
            </Text>
            <Text fontSize="12px" color={COLORS.textMuted}>Best Hour</Text>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recent Media Grid
// ─────────────────────────────────────────────────────────────────────────────

function RecentMediaGrid({ media, isLoading, isConnected = true }: RecentMediaGridProps) {
  if (isLoading) {
    return (
      <Box
        bg={COLORS.bgSecondary}
        borderRadius="20px"
        p={5}
        border="1px solid"
        borderColor={COLORS.border}
      >
        <Flex justify="space-between" align="center" mb={5}>
          <SkeletonLoader height="24px" width="150px" />
          <SkeletonLoader height="20px" width="80px" />
        </Flex>
        <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={4}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonLoader key={i} height="200px" borderRadius="16px" />
          ))}
        </Grid>
      </Box>
    );
  }

  const hasScheduledPosts = media.some(m => !m.permalink);
  const displayMedia = media.slice(0, 6);

  return (
    <Box
      bg={COLORS.bgSecondary}
      borderRadius="20px"
      p={5}
      border="1px solid"
      borderColor={COLORS.border}
      animation={`${fadeUp} 0.4s ease-out`}
    >
      <Flex justify="space-between" align="center" mb={5}>
        <Text fontSize="16px" fontWeight="700" color={COLORS.textPrimary}>
          {hasScheduledPosts && !isConnected ? "📋 Scheduled Posts" : "Recent Media"}
        </Text>
        {isConnected && (
          <Text as="a" color={COLORS.primary} fontSize="13px" fontWeight="600" _hover={{ opacity: 0.7 }} cursor="pointer">
            View All →
          </Text>
        )}
      </Flex>

      {displayMedia.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="14px" color={COLORS.textSecondary}>
            {isConnected ? "No posts yet" : "No scheduled posts"}
          </Text>
        </Box>
      ) : (
        <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={4}>
          {displayMedia.map((post) => {
            const isScheduled = !post.permalink;
            return (
              <Box
                key={post.id}
                aspectRatio="1"
                borderRadius="16px"
                position="relative"
                overflow="hidden"
                cursor="pointer"
                transition="all 0.3s"
                _hover={{
                  transform: "scale(1.03)",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
                }}
              >
                {/* Scheduled badge */}
                {isScheduled && (
                  <Badge
                    position="absolute"
                    top={2}
                    right={2}
                    px={2}
                    py={0.5}
                    borderRadius="8px"
                    fontSize="9px"
                    fontWeight="700"
                    bg={COLORS.warning}
                    color="white"
                    textTransform="uppercase"
                    zIndex={2}
                  >
                    Scheduled
                  </Badge>
                )}
                
                {post.media_type === "VIDEO" || post.media_type === "REELS" ? (
                  <Box
                    w="full"
                    h="full"
                    bg={post.thumbnail_url || post.media_url ? "transparent" : "linear-gradient(135deg, #E0E7FF, #C7D2FE)"}
                    bgImage={(post.thumbnail_url || post.media_url) ? `url(${post.thumbnail_url || post.media_url})` : undefined}
                    bgSize="cover"
                    backgroundPosition="center"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Box
                      w="60px"
                      h="60px"
                      borderRadius="50%"
                      bg="rgba(255,255,255,0.9)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Box
                        w="0"
                        h="0"
                        borderLeft="16px solid"
                        borderLeftColor={COLORS.primary}
                        borderTop="10px solid transparent"
                        borderBottom="10px solid transparent"
                        ml={2}
                      />
                    </Box>
                  </Box>
                ) : (
                  <Box
                    w="full"
                    h="full"
                    bg={post.media_url ? "transparent" : "linear-gradient(135deg, #E0E7FF, #C7D2FE)"}
                    bgImage={post.media_url ? `url(${post.media_url})` : undefined}
                    bgSize="cover"
                    backgroundPosition="center"
                  />
                )}

                {/* Overlay with stats - only for published posts */}
                {!isScheduled && (
                  <Flex
                    position="absolute"
                    inset={0}
                    bg="linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 70%)"
                    direction="column"
                    justify="flex-end"
                    p={4}
                    opacity={0}
                    transition="opacity 0.3s"
                    _hover={{ opacity: 1 }}
                  >
                    <Flex gap={4} color="white" fontSize="13px" fontWeight="600">
                      {post.like_count !== undefined && (
                        <Flex align="center" gap={1.5}>
                          <Heart size={16} fill="white" />
                          <Text>{formatNumber(post.like_count)}</Text>
                        </Flex>
                      )}
                      {post.comments_count !== undefined && (
                        <Flex align="center" gap={1.5}>
                          <Box as="span" fontSize="14px">💬</Box>
                          <Text>{formatNumber(post.comments_count)}</Text>
                        </Flex>
                      )}
                    </Flex>
                  </Flex>
                )}

                {/* Media type badge */}
                {post.media_type !== "IMAGE" && (
                  <Badge
                    position="absolute"
                    top={3}
                    left={3}
                    px={2}
                    py={1}
                    borderRadius="8px"
                    fontSize="10px"
                    fontWeight="700"
                    bg="rgba(0,0,0,0.6)"
                    color="white"
                    textTransform="uppercase"
                  >
                    {post.media_type.replace("_", " ")}
                  </Badge>
                )}
              </Box>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard Component
// ─────────────────────────────────────────────────────────────────────────────

export default function OverviewTab({
  brandId,
  session,
}: OverviewTabProps) {
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  const [recentAssets, setRecentAssets] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  // Use the Instagram dashboard hook to fetch data
  const { data: instagramData, isLoading: isInstagramLoading } = useInstagramDashboard(session);

  // Extract data from instagramData or use defaults
  const profile = instagramData?.profile;
  const insights = instagramData?.insights;
  const brandStrength = instagramData?.brand_strength;
  const contentPerformance = instagramData?.content_performance;
  const audience = instagramData?.audience;
  // Include scheduled posts from Instagram data (they're included even when disconnected)
  const recentMedia = instagramData?.recent_media || [];
  const isConnected = instagramData?.connected ?? false;

  // Calculate metrics
  const followersCount = profile?.followers_count || insights?.follower_count || 0;
  const reach = insights?.reach || 0;
  const impressions = insights?.impressions || 0;

  // Fetch scheduled posts and recent assets
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.access_token || !brandId) return;

      setLoadingAssets(true);
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        
        // Fetch scheduled posts
        const scheduledRes = await fetch(
          `${API_BASE}/dashboard/scheduled-posts?brand_id=${brandId}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        if (scheduledRes.ok) {
          const scheduledData = await scheduledRes.json();
          setScheduledPosts(scheduledData.posts || []);
        }

        // Fetch recent assets (saved images)
        const assetsRes = await fetch(
          `${API_BASE}/dashboard/assets?brand_id=${brandId}&limit=6`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        if (assetsRes.ok) {
          const assetsData = await assetsRes.json();
          setRecentAssets((assetsData.images || []).slice(0, 6));
        }
      } catch (error) {
        console.error("Error fetching assets:", error);
      } finally {
        setLoadingAssets(false);
      }
    };

    fetchData();
  }, [session?.access_token, brandId]);

  return (
    <Box
      bg={COLORS.bgPrimary}
      minH="100%"
      animation={`${slideIn} 0.4s ease-out`}
    >
      {/* Header */}
      <Box mb={10}>
        <Flex justify="space-between" align="flex-start" mb={2}>
          <Box>
            <Text fontSize="14px" color={COLORS.textSecondary}>
              {isConnected 
                ? "Real-time insights and performance metrics" 
                : "Connect Instagram to view full analytics"}
            </Text>
          </Box>

          {profile && (
            <Flex gap={3} align="center">
              {profile.profile_picture_url && (
                <Box
                  w="40px"
                  h="40px"
                  borderRadius="50%"
                  bgImage={`url(${profile.profile_picture_url})`}
                  bgSize="cover"
                  backgroundPosition="center"
                  border="2px solid"
                  borderColor={COLORS.primary}
                />
              )}
              <Box textAlign="right">
                <Text fontSize="14px" fontWeight="600" color={COLORS.textPrimary}>
                  @{profile.username}
                </Text>
                <Text fontSize="12px" color={COLORS.success}>
                  ● Connected
                </Text>
              </Box>
            </Flex>
          )}
          
        </Flex>
      </Box>

      {/* Loading State */}
      {(isInstagramLoading) && (
        <Flex minH="400px" align="center" justify="center">
          <Spinner size="lg" color={COLORS.primary} borderWidth="3px" />
        </Flex>
      )}

      {(!isInstagramLoading) && (
        <>
          {/* Not Connected State - Show limited view with scheduled posts and assets */}
          {!isConnected && (
            <>
              <Box
                bg={COLORS.bgSecondary}
                borderRadius="20px"
                p={8}
                border="1px solid"
                borderColor={COLORS.border}
                mb={8}
                textAlign="center"
              >
                <Flex
                  w="64px"
                  h="64px"
                  borderRadius="16px"
                  bg={COLORS.primarySoft}
                  color={COLORS.primary}
                  align="center"
                  justify="center"
                  mx="auto"
                  mb={4}
                >
                  <BarChart3 size={32} />
                </Flex>
                <Text fontSize="18px" fontWeight="700" color={COLORS.textPrimary} mb={2}>
                  Instagram Not Connected
                </Text>
                <Text fontSize="14px" color={COLORS.textSecondary} mb={6} maxW="500px" mx="auto">
                  Connect your Instagram account to unlock full analytics including engagement metrics,
                  audience insights, and performance tracking.
                </Text>
                <Button
                  size="md"
                  bg={COLORS.primary}
                  color="white"
                  fontSize="14px"
                  fontWeight="600"
                  px={6}
                  h="42px"
                  borderRadius="12px"
                  _hover={{ bg: COLORS.primaryDark }}
                  onClick={() => window.location.href = "/dashboard?tab=integrations"}
                >
                  Connect Instagram
                </Button>
              </Box>

              {/* Scheduled Posts Section */}
              <Box mb={8}>
                <Flex justify="space-between" align="center" mb={4}>
                  <Text fontSize="16px" fontWeight="700" color={COLORS.textPrimary}>
                    📋 Scheduled Posts
                  </Text>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => window.location.href = "/dashboard?tab=content"}
                    color={COLORS.primary}
                    _hover={{ bg: COLORS.primarySoft }}
                  >
                    View All
                  </Button>
                </Flex>

                {loadingAssets ? (
                  <Box
                    bg={COLORS.bgSecondary}
                    borderRadius="16px"
                    p={6}
                    textAlign="center"
                  >
                    <Spinner size="md" color={COLORS.primary} />
                  </Box>
                ) : scheduledPosts.length === 0 ? (
                  <Box
                    bg={COLORS.bgSecondary}
                    borderRadius="16px"
                    p={6}
                    textAlign="center"
                    border="1px dashed"
                    borderColor={COLORS.border}
                  >
                    <Text fontSize="14px" color={COLORS.textMuted}>
                      No scheduled posts yet
                    </Text>
                    <Text fontSize="13px" color={COLORS.textMuted} mt={1}>
                      Create and schedule posts from the Content tab
                    </Text>
                  </Box>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                    {scheduledPosts.slice(0, 6).map((post) => (
                      <Box
                        key={post.id}
                        bg={COLORS.bgSecondary}
                        borderRadius="14px"
                        p={4}
                        border="1px solid"
                        borderColor={COLORS.border}
                      >
                        <Flex align="center" gap={2} mb={3}>
                          <Box
                            w="8px"
                            h="8px"
                            borderRadius="50%"
                            bg={COLORS.warning}
                          />
                          <Text fontSize="12px" fontWeight="600" color={COLORS.textSecondary}>
                            {post.status?.toUpperCase() || "SCHEDULED"}
                          </Text>
                        </Flex>
                        {post.caption && (
                          <Text
                            fontSize="13px"
                            color={COLORS.textPrimary}
                            mb={2}
                            lineClamp={2}
                          >
                            {post.caption}
                          </Text>
                        )}
                        <Text fontSize="11px" color={COLORS.textMuted} suppressHydrationWarning>
                          📅 {new Date(post.scheduled_at).toLocaleString()}
                        </Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                )}
              </Box>

              {/* Recent Assets Section */}
              <Box mb={8}>
                <Flex justify="space-between" align="center" mb={4}>
                  <Text fontSize="16px" fontWeight="700" color={COLORS.textPrimary}>
                    🎨 Recent Assets
                  </Text>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => window.location.href = "/dashboard?tab=assets"}
                    color={COLORS.primary}
                    _hover={{ bg: COLORS.primarySoft }}
                  >
                    View All
                  </Button>
                </Flex>

                {loadingAssets ? (
                  <Box
                    bg={COLORS.bgSecondary}
                    borderRadius="16px"
                    p={6}
                    textAlign="center"
                  >
                    <Spinner size="md" color={COLORS.primary} />
                  </Box>
                ) : recentAssets.length === 0 ? (
                  <Box
                    bg={COLORS.bgSecondary}
                    borderRadius="16px"
                    p={6}
                    textAlign="center"
                    border="1px dashed"
                    borderColor={COLORS.border}
                  >
                    <Text fontSize="14px" color={COLORS.textMuted}>
                      No assets yet
                    </Text>
                    <Text fontSize="13px" color={COLORS.textMuted} mt={1}>
                      Generated images will appear here
                    </Text>
                  </Box>
                ) : (
                  <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} gap={3}>
                    {recentAssets.map((asset) => (
                      <Box
                        key={asset.id}
                        borderRadius="12px"
                        overflow="hidden"
                        border="1px solid"
                        borderColor={COLORS.border}
                        aspectRatio="1"
                        position="relative"
                      >
                        {asset.image_url ? (
                          <Box
                            w="full"
                            h="full"
                            bgImage={`url(${asset.image_url})`}
                            bgSize="cover"
                            objectFit="cov  er"
                          />
                        ) : (
                          <Flex
                            w="full"
                            h="full"
                            bg={COLORS.primarySoft}
                            align="center"
                            justify="center"
                          >
                            <Box color={COLORS.primary} fontSize="24px">🖼️</Box>
                          </Flex>
                        )}
                      </Box>
                    ))}
                  </SimpleGrid>
                )}
              </Box>
            </>
          )}

          {/* Connected State - Show full dashboard */}
          {isConnected && (
            <>
              {/* Brand Strength Section */}
              <Box mb={8}>
                <BrandStrengthSection data={brandStrength || null} />
              </Box>

              {/* Stats Row */}
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={5} mb={8}>
                <StatCard
                  icon={<Users size={24} />}
                  label="Total Followers"
                  value={formatNumber(followersCount)}
                  sublabel={`${formatNumber(audience?.follower_growth_28d || 0)} this month`}
                  trend={audience?.follower_growth_28d || 0}
                  tooltip="Total number of followers on Instagram"
                />

                <StatCard
                  icon={<Heart size={24} />}
                  label="Engagement Rate"
                  value={`${contentPerformance?.avg_engagement_rate.toFixed(1) || "0.0"}%`}
                  sublabel="Avg. per post"
                  trend={brandStrength?.engagement_trend || 0}
                  isHighlighted={true}
                  tooltip="Average engagement rate across all posts"
                />

                <StatCard
                  icon={<Eye size={24} />}
                  label="Reach (28 days)"
                  value={formatNumber(reach)}
                  sublabel="Unique accounts reached"
                  trend={brandStrength?.reach_trend || 0}
                  tooltip="Number of unique accounts that saw your content"
                />

                <StatCard
                  icon={<BarChart3 size={24} />}
                  label="Impressions"
                  value={formatNumber(impressions)}
                  sublabel="Total views"
                  trendLabel={`${contentPerformance?.total_posts || 0} posts`}
                  tooltip="Total number of times your content was displayed"
                />
              </Grid>
            </>
          )}

          {/* Content Grid - Shows for both connected and disconnected */}
          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={5} mb={8}>
            {/* Recent Media */}
            <RecentMediaGrid media={recentMedia} isLoading={isInstagramLoading || false} isConnected={isConnected} />

            {/* Audience Insights - Only show when connected */}
            {isConnected && (
              <AudienceInsightsCard data={audience || null} />
            )}
          </Grid>

          {/* Content Performance - Only show when connected */}
          {isConnected && (
            <Box mb={8}>
              <ContentPerformanceCard data={contentPerformance || null} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}