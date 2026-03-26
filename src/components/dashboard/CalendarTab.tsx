"use client";

import { useState, useEffect } from "react";
import { Box, Button, Flex, SimpleGrid, Text, VStack, Image, Badge, IconButton, Dialog, Portal, Input } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Calendar, Clock, Sparkles } from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import { Tooltip } from "@/components/ui/tooltip";
import { Textarea } from "@chakra-ui/react";
import BatchSchedulerPanel from "./BatchSchedulerPanel";

// ── Shared types ──────────────────────────────────────────────────────────────

interface AssetInventoryItem {
  asset_id: string;
  asset_url: string;
  format: "feed" | "stories" | "feed_4_5" | "carousel";
  ad_type: string;
  source: "campaign" | "library";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

interface ScheduledPost {
  id: string;
  media_type: "IMAGE" | "VIDEO" | "REELS" | "STORIES" | "CAROUSEL";
  media_url?: string;
  carousel_urls?: string[];
  caption?: string;
  scheduled_at: string;
  status: "scheduled" | "published" | "failed";
  ig_post_id?: string;
  error_message?: string;
}

function buildCalendarDays(year: number, month: number): CalendarDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  const startDay = firstOfMonth.getDay(); // 0 = Sunday
  const totalDays = lastOfMonth.getDate();

  const days: CalendarDay[] = [];

  // Prefix days from previous month
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    d.setHours(0, 0, 0, 0);
    days.push({ date: d, dayNumber: d.getDate(), isCurrentMonth: false, isToday: d.getTime() === today.getTime() });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    date.setHours(0, 0, 0, 0);
    days.push({ date, dayNumber: d, isCurrentMonth: true, isToday: date.getTime() === today.getTime() });
  }

  // Suffix days to complete last row (up to 42 cells = 6 rows × 7)
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    date.setHours(0, 0, 0, 0);
    days.push({ date, dayNumber: d, isCurrentMonth: false, isToday: date.getTime() === today.getTime() });
  }

  return days;
}

function getMediaIcon(mediaType: string): string {
  switch (mediaType) {
    case "VIDEO": return "🎬";
    case "REELS": return "🎵";
    case "STORIES": return "📖";
    case "CAROUSEL": return "🖼️";
    default: return "🖼️";
  }
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface CalendarTabProps {
  brandId?: string;
  brandName?: string;
  availableAssets?: AssetInventoryItem[];
}

export default function CalendarTab({ brandId = "", brandName = "", availableAssets = [] }: CalendarTabProps) {
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editCaption, setEditCaption] = useState("");
  const [editScheduledAt, setEditScheduledAt] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showBatchPanel, setShowBatchPanel] = useState(false);

  const displayDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const displayYear = displayDate.getFullYear();
  const displayMonth = displayDate.getMonth();

  const calendarDays = buildCalendarDays(displayYear, displayMonth);

  // Fetch scheduled posts on mount and when month changes
  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  const fetchScheduledPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch("/api/integrations/instagram/schedule");
      const data = await res.json();
      setScheduledPosts(data.posts || []);
    } catch (err) {
      console.error("Fetch scheduled posts error:", err);
      toaster.create({
        title: "Error loading posts",
        description: "Failed to load scheduled posts",
        type: "error",
        duration: 3000,
      });
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleEditClick = (post: ScheduledPost) => {
    setSelectedPost(post);
    setEditCaption(post.caption || "");
    // Convert ISO to datetime-local format
    const date = new Date(post.scheduled_at);
    const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setEditScheduledAt(localDateTime);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = async (post: ScheduledPost) => {
    if (!confirm("Cancel this scheduled post?")) return;
    try {
      const res = await fetch(`/api/integrations/instagram/schedule?id=${post.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setScheduledPosts(prev => prev.filter(p => p.id !== post.id));
      toaster.create({ title: "Post cancelled", type: "success", duration: 3000 });
    } catch (err: any) {
      toaster.create({ title: "Error", description: err.message, type: "error", duration: 4000 });
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedPost) return;
    if (!editScheduledAt) {
      toaster.create({ title: "Date required", description: "Please select a date and time", type: "warning", duration: 3000 });
      return;
    }

    setIsUpdating(true);
    try {
      // Delete old and create new (simple approach)
      const newDate = new Date(editScheduledAt).toISOString();
      
      // First delete the old one
      await fetch(`/api/integrations/instagram/schedule?id=${selectedPost.id}`, { method: "DELETE" });
      
      // Then create a new one with updated values
      const body: Record<string, any> = {
        media_type: selectedPost.media_type,
        caption: editCaption || undefined,
        scheduled_at: newDate,
      };
      
      if (selectedPost.media_type === "CAROUSEL") {
        body.carousel_urls = selectedPost.carousel_urls;
      } else {
        body.media_url = selectedPost.media_url;
      }

      const res = await fetch("/api/integrations/instagram/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Update failed");

      toaster.create({ title: "Post updated", type: "success", duration: 3000 });
      setIsEditDialogOpen(false);
      fetchScheduledPosts();
    } catch (err: any) {
      toaster.create({ title: "Error", description: err.message, type: "error", duration: 4000 });
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter posts for current month view
  const currentMonthPosts = scheduledPosts.filter(post => {
    const postDate = new Date(post.scheduled_at);
    return (
      postDate.getFullYear() === displayYear &&
      postDate.getMonth() === displayMonth
    );
  });

  // Get posts for a specific day
  const getPostsForDay = (date: Date): ScheduledPost[] => {
    return currentMonthPosts.filter(post => {
      const postDate = new Date(post.scheduled_at);
      return isSameDay(postDate, date);
    });
  };

  return (
    <VStack align="stretch" gap={8}>
      {/* Page heading */}
      <Box>
        <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="700" color="#111111" lineHeight="1.05" mb={2}>
          Content Calendar
        </Text>
        <Text fontSize="15px" color="#6B7280">
          Plan and visualise your publishing schedule month by month.
        </Text>
      </Box>

      {/* Calendar card */}
      <Box
        bg="white"
        border="1px solid"
        borderColor="#E5E7EB"
        borderRadius="24px"
        p={{ base: 4, md: 6 }}
        boxShadow="0 4px 24px rgba(0,0,0,0.06)"
      >
        {/* Month navigation */}
        <Flex align="center" justify="space-between" mb={6}>
          <Button
            variant="ghost"
            h="36px"
            w="36px"
            p={0}
            borderRadius="10px"
            color="#6B7280"
            bg="transparent"
            _hover={{ bg: "#F3F4F6", color: "#111111" }}
            onClick={() => setMonthOffset((o) => o - 1)}
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
          </Button>

          <Text fontSize="xl" fontWeight="700" color="#111111">
            {MONTH_NAMES[displayMonth]} {displayYear}
          </Text>

          <Button
            variant="ghost"
            h="36px"
            w="36px"
            p={0}
            borderRadius="10px"
            color="#6B7280"
            bg="transparent"
            _hover={{ bg: "#F3F4F6", color: "#111111" }}
            onClick={() => setMonthOffset((o) => o + 1)}
          >
            <ChevronRight size={18} strokeWidth={2.5} />
          </Button>
        </Flex>

        {/* Day-of-week labels */}
        <SimpleGrid columns={7} mb={3}>
          {DAY_LABELS.map((label) => (
            <Box key={label} textAlign="center" py={2}>
              <Text fontSize="12px" fontWeight="700" color="#6B7280" letterSpacing="0.04em">
                {label}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* Calendar grid */}
        <SimpleGrid columns={7} gap="1px" bg="#E5E7EB" border="1px solid" borderColor="#E5E7EB" borderRadius="16px" overflow="hidden">
          {calendarDays.map((day, idx) => {
            const dayPosts = getPostsForDay(day.date);
            return (
              <Box
                key={idx}
                bg={day.isToday ? "#EEF2FF" : "white"}
                minH={{ base: "70px", md: "100px" }}
                p={{ base: 1.5, md: 2 }}
                position="relative"
                transition="background 0.15s ease"
                _hover={{ bg: day.isToday ? "#EEF2FF" : "#F9FAFB", cursor: "pointer" }}
              >
                {/* Today indicator */}
                {day.isToday && (
                  <Flex
                    position="absolute"
                    top="2px"
                    left="2px"
                    w="6px"
                    h="6px"
                    bg="#4F46E5"
                    borderRadius="50%"
                  />
                )}
                <Text
                  fontSize="13px"
                  fontWeight={day.isToday ? "700" : "500"}
                  color={day.isToday ? "#4F46E5" : day.isCurrentMonth ? "#1F2937" : "#9CA3AF"}
                  textAlign="right"
                  lineHeight="1"
                  mb={2}
                >
                  {day.dayNumber}
                </Text>
                {/* Post indicators */}
                <VStack gap={1} align="stretch">
                  {dayPosts.slice(0, 3).map((post) => (
                    <Tooltip key={post.id} content={post.caption?.slice(0, 50) || "No caption"}>
                      <Flex
                        align="center"
                        gap={1}
                        px={1.5}
                        py={1}
                        borderRadius="8px"
                        bg={
                          post.status === "failed" ? "#FEF2F2" :
                          post.status === "published" ? "#ECFDF5" :
                          "#EFF6FF"
                        }
                        border="1px solid"
                        borderColor={
                          post.status === "failed" ? "#FECACA" :
                          post.status === "published" ? "#A7F3D0" :
                          "#BFDBFE"
                        }
                        fontSize="10px"
                        fontWeight="600"
                        color="#1F2937"
                        _hover={{ 
                          opacity: 0.9,
                          transform: "scale(1.02)",
                          shadow: "sm"
                        }}
                        onClick={() => handleEditClick(post)}
                        cursor="pointer"
                        transition="all 0.15s ease"
                      >
                        <Text fontSize="10px">{getMediaIcon(post.media_type)}</Text>
                        <Text truncate flex={1} fontSize="9px" lineHeight="1.2">
                          {post.caption?.slice(0, 18) || "Untitled"}
                        </Text>
                      </Flex>
                    </Tooltip>
                  ))}
                  {dayPosts.length > 3 && (
                    <Text fontSize="9px" fontWeight="600" color="#6B7280" pl={1.5}>
                      +{dayPosts.length - 3} more
                    </Text>
                  )}
                </VStack>
              </Box>
            );
          })}
        </SimpleGrid>
      </Box>

      {/* Scheduled Posts section */}
      <Box
        bg="white"
        border="1px solid"
        borderColor="#E5E7EB"
        borderRadius="24px"
        p={{ base: 5, md: 8 }}
        boxShadow="0 4px 24px rgba(0,0,0,0.06)"
      >
        <Flex align="center" justify="space-between" mb={6}>
          <Box>
            <Text fontSize="xl" fontWeight="700" color="#111111">
              Scheduled Posts
            </Text>
            <Text fontSize="14px" color="#6B7280" mt={0.5}>
              {MONTH_NAMES[displayMonth]} {displayYear}
            </Text>
          </Box>
          <Flex gap={2}>
            <Button
              bg="#F3F4F6"
              color="#374151"
              borderRadius="12px"
              h="40px"
              px={4}
              fontSize="14px"
              fontWeight="600"
              _hover={{ bg: "#E5E7EB" }}
              onClick={() => toaster.create({ title: "Navigate to Integrations", description: "Use the Integrations tab to schedule new posts", type: "info", duration: 3000 })}
            >
              <Flex align="center" gap={2}>
                <Plus size={16} strokeWidth={2.5} />
                Schedule Post
              </Flex>
            </Button>
            <Button
              bg="#4F46E5"
              color="white"
              borderRadius="12px"
              h="40px"
              px={4}
              fontSize="14px"
              fontWeight="600"
              shadow="sm"
              _hover={{ bg: "#4338CA", shadow: "md" }}
              onClick={() => setShowBatchPanel(true)}
            >
              <Flex align="center" gap={2}>
                <Sparkles size={16} strokeWidth={2.5} />
                AI Batch
              </Flex>
            </Button>
          </Flex>
        </Flex>

        {/* Loading state */}
        {loadingPosts ? (
          <Flex align="center" justify="center" py={12} gap={3}>
            <Box w="20px" h="20px" borderRadius="50%" border="2px solid #E5E7EB" borderTopColor="#4F46E5" animation="spin 1s linear infinite" />
            <Text fontSize="14px" color="#6B7280">Loading scheduled posts...</Text>
          </Flex>
        ) : currentMonthPosts.length === 0 ? (
          /* Empty state */
          <Flex
            direction="column"
            align="center"
            justify="center"
            py={16}
            gap={4}
            border="2px dashed"
            borderColor="#E5E7EB"
            borderRadius="16px"
            bg="#F9FAFB"
          >
            <Flex
              w="64px"
              h="64px"
              borderRadius="16px"
              bg="#F3F4F6"
              align="center"
              justify="center"
              color="#9CA3AF"
            >
              <Calendar size={28} strokeWidth={2} />
            </Flex>
            <Text fontSize="16px" fontWeight="700" color="#1F2937">
              No posts scheduled
            </Text>
            <Text fontSize="14px" color="#6B7280" textAlign="center" maxW="320px">
              Schedule your first post for this month to see it here.
            </Text>
          </Flex>
        ) : (
          /* Posts list */
          <VStack gap={3}>
            {currentMonthPosts.map((post) => (
              <Flex
                key={post.id}
                align="center"
                gap={4}
                p={4}
                borderRadius="16px"
                border="1px solid"
                borderColor={
                  post.status === "failed" ? "#FECACA" :
                  post.status === "published" ? "#A7F3D0" :
                  "#BFDBFE"
                }
                bg={
                  post.status === "failed" ? "#FEF2F2" :
                  post.status === "published" ? "#ECFDF5" :
                  "#EFF6FF"
                }
                _hover={{ 
                  shadow: "lg", 
                  transform: "translateY(-2px)",
                  borderColor: post.status === "failed" ? "#F87171" :
                    post.status === "published" ? "#34D399" :
                    "#60A5FA"
                }}
                transition="all 0.2s ease"
              >
                {/* Media thumbnail */}
                <Box
                  w="64px"
                  h="64px"
                  borderRadius="12px"
                  overflow="hidden"
                  flexShrink={0}
                  bg="#F3F4F6"
                  position="relative"
                  border="1px solid"
                  borderColor="#E5E7EB"
                >
                  {post.media_url ? (
                    <Image
                      src={post.media_url}
                      alt="Post media"
                      w="100%"
                      h="100%"
                      objectFit="cover"
                    />
                  ) : (
                    <Flex align="center" justify="center" w="100%" h="100%" fontSize="24px">
                      {getMediaIcon(post.media_type)}
                    </Flex>
                  )}
                  {/* Media type badge */}
                  <Badge
                    position="absolute"
                    bottom="0"
                    right="0"
                    bg="rgba(0,0,0,0.75)"
                    color="white"
                    fontSize="9px"
                    px={1.5}
                    py={1}
                    borderRadius="6px"
                    fontWeight="600"
                  >
                    {post.media_type}
                  </Badge>
                </Box>

                {/* Post info */}
                <Flex flex={1} direction="column" gap={1.5}>
                  <Flex align="center" gap={2}>
                    <Text fontSize="13px" fontWeight="700" color="#1F2937">
                      {getMediaIcon(post.media_type)} {post.media_type}
                    </Text>
                    <Badge
                      fontSize="10px"
                      px={2.5}
                      py={1}
                      borderRadius="8px"
                      bg={
                        post.status === "scheduled" ? "#DBEAFE" :
                        post.status === "published" ? "#D1FAE5" :
                        "#FEE2E2"
                      }
                      color={
                        post.status === "scheduled" ? "#1E40AF" :
                        post.status === "published" ? "#065F46" :
                        "#991B1B"
                      }
                      fontWeight="600"
                      textTransform="capitalize"
                    >
                      {post.status}
                    </Badge>
                  </Flex>
                  <Text fontSize="13px" color="#4B5563" lineClamp={2}>
                    {post.caption || "No caption"}
                  </Text>
                  <Flex align="center" gap={4} mt={1}>
                    <Flex align="center" gap={1.5} fontSize="12px" color="#6B7280">
                      <Clock size={14} />
                      <Text fontWeight="500">{formatDateTime(post.scheduled_at)}</Text>
                    </Flex>
                    {post.error_message && (
                      <Flex align="center" gap={1} fontSize="12px" color="#DC2626" bg="#FEF2F2" px={2} py={1} borderRadius="6px">
                        <Text>⚠️</Text>
                        <Text fontWeight="500">{post.error_message}</Text>
                      </Flex>
                    )}
                  </Flex>
                </Flex>

                {/* Actions */}
                <Flex gap={2}>
                  <Tooltip content="Edit post">
                    <IconButton
                      variant="ghost"
                      size="sm"
                      color="#4F46E5"
                      bg="#EEF2FF"
                      _hover={{ bg: "#E0E7FF" }}
                      onClick={() => handleEditClick(post)}
                      aria-label="Edit post"
                      borderRadius="10px"
                      w="36px"
                      h="36px"
                    >
                      <Edit2 size={16} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content="Cancel post">
                    <IconButton
                      variant="ghost"
                      size="sm"
                      color="#DC2626"
                      bg="#FEF2F2"
                      _hover={{ bg: "#FEE2E2" }}
                      onClick={() => handleDeleteClick(post)}
                      aria-label="Cancel post"
                      borderRadius="10px"
                      w="36px"
                      h="36px"
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Tooltip>
                </Flex>
              </Flex>
            ))}
          </VStack>
        )}
      </Box>

      {/* Edit Dialog */}
      <Dialog.Root
        lazyMount
        open={isEditDialogOpen}
        onOpenChange={(e) => setIsEditDialogOpen(e.open)}
        size="md"
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop bg="rgba(0, 0, 0, 0.6)" backdropFilter="auto" backdropBlur="6px" />
          <Dialog.Positioner>
            <Dialog.Content
              bg="white"
              borderRadius="20px"
              borderWidth="1px"
              borderColor="#E5E7EB"
              boxShadow="2xl"
              p={0}
              minW="480px"
            >
              <Dialog.Header py="5" px="6" borderBottom="1px solid" borderColor="#F3F4F6" bg="#F9FAFB" borderTopRadius="20px">
                <Dialog.Title fontSize="18px" fontWeight="700" color="#111111">
                  Edit Scheduled Post
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body py="6" px="6" bg="white">
                <VStack gap={4}>
                  <Box w="full">
                    <Text fontSize="14px" fontWeight="600" color="#374151" mb={2}>
                      Caption
                    </Text>
                    <Textarea
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      placeholder="Write a caption..."
                      rows={5}
                      resize="vertical"
                      borderRadius="12px"
                      borderColor="#D1D5DB"
                      bg="white"
                      fontSize="14px"
                      p={3}
                      _focus={{ 
                        borderColor: "#4F46E5", 
                        outline: "2px solid #C7D2FE",
                        boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)"
                      }}
                      _placeholder={{ color: "#9CA3AF" }}
                    />
                  </Box>
                  <Box w="full">
                    <Text fontSize="14px" fontWeight="600" color="#374151" mb={2}>
                      Schedule Date & Time
                    </Text>
                    <Input
                      type="datetime-local"
                      value={editScheduledAt}
                      onChange={(e) => setEditScheduledAt(e.target.value)}
                      borderRadius="12px"
                      borderColor="#D1D5DB"
                      bg="white"
                      fontSize="14px"
                      p={3}
                      h="44px"
                      _focus={{ 
                        borderColor: "#4F46E5", 
                        outline: "2px solid #C7D2FE",
                        boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)"
                      }}
                    />
                  </Box>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer gap={3} py="5" px="6" borderTop="1px solid" borderColor="#F3F4F6" bg="#F9FAFB" borderBottomRadius="20px">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isUpdating}
                  borderRadius="12px"
                  borderColor="#D1D5DB"
                  bg="white"
                  color="#374151"
                  fontSize="14px"
                  fontWeight="600"
                  px={5}
                  h="44px"
                  _hover={{ 
                    bg: "#F3F4F6", 
                    borderColor: "#9CA3AF",
                    transform: "translateY(-1px)",
                    boxShadow: "sm"
                  }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.15s ease"
                >
                  Cancel
                </Button>
                <Button
                  bg="#4F46E5"
                  color="white"
                  onClick={handleSaveEdit}
                  loading={isUpdating}
                  borderRadius="12px"
                  fontSize="14px"
                  fontWeight="600"
                  px={5}
                  h="44px"
                  shadow="md"
                  _hover={{ 
                    bg: "#4338CA", 
                    shadow: "lg",
                    transform: "translateY(-1px)"
                  }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.15s ease"
                  _disabled={{
                    opacity: 0.6,
                    cursor: "not-allowed"
                  }}
                >
                  Save Changes
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {showBatchPanel && (
        <BatchSchedulerPanel
          brandId={brandId}
          brandName={brandName}
          availableAssets={availableAssets}
          onClose={() => setShowBatchPanel(false)}
          onBatchCreated={() => {
            setShowBatchPanel(false);
            fetchScheduledPosts();
          }}
        />
      )}
    </VStack>
  );
}
