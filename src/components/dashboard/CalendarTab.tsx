"use client";

import { useState, useEffect } from "react";
import { Box, Button, Flex, SimpleGrid, Text, VStack, Image, Badge, IconButton, Dialog, Portal, Input } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Calendar, Clock } from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import { Tooltip } from "@/components/ui/tooltip";
import { Textarea } from "@chakra-ui/react";

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

export default function CalendarTab() {
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editCaption, setEditCaption] = useState("");
  const [editScheduledAt, setEditScheduledAt] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

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
        borderColor="#ECECEC"
        borderRadius="24px"
        p={{ base: 4, md: 6 }}
        boxShadow="0 12px 48px rgba(0,0,0,0.04)"
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
            _hover={{ bg: "#F3F4F6", color: "#111111" }}
            onClick={() => setMonthOffset((o) => o + 1)}
          >
            <ChevronRight size={18} strokeWidth={2.5} />
          </Button>
        </Flex>

        {/* Day-of-week labels */}
        <SimpleGrid columns={7} mb={2}>
          {DAY_LABELS.map((label) => (
            <Box key={label} textAlign="center" py={1}>
              <Text fontSize="12px" fontWeight="700" color="#9CA3AF" letterSpacing="0.04em">
                {label}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* Calendar grid */}
        <SimpleGrid columns={7} gap="1px" bg="#ECECEC" border="1px solid" borderColor="#ECECEC" borderRadius="16px" overflow="hidden">
          {calendarDays.map((day, idx) => {
            const dayPosts = getPostsForDay(day.date);
            return (
              <Box
                key={idx}
                bg={day.isToday ? "#EEF2FF" : "white"}
                border={day.isToday ? "2px solid" : "none"}
                borderColor={day.isToday ? "#4F46E5" : "transparent"}
                minH={{ base: "60px", md: "90px" }}
                p={{ base: 1, md: 2 }}
                position="relative"
                transition="background 0.15s ease"
                _hover={{ bg: day.isToday ? "#EEF2FF" : "#F8F8F6", cursor: "pointer" }}
              >
                <Text
                  fontSize="12px"
                  fontWeight={day.isToday ? "800" : "500"}
                  color={day.isToday ? "#4F46E5" : day.isCurrentMonth ? "#374151" : "#D1D5DB"}
                  textAlign="right"
                  lineHeight="1"
                  mb={1}
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
                        px={1}
                        py={0.5}
                        borderRadius="6px"
                        bg={
                          post.status === "failed" ? "#FEE2E2" :
                          post.status === "published" ? "#D1FAE5" :
                          "#DBEAFE"
                        }
                        border="1px solid"
                        borderColor={
                          post.status === "failed" ? "#FCA5A5" :
                          post.status === "published" ? "#6EE7B7" :
                          "#93C5FD"
                        }
                        fontSize="10px"
                        fontWeight="500"
                        color="#1F2937"
                        _hover={{ opacity: 0.8 }}
                        onClick={() => handleEditClick(post)}
                      >
                        <Text fontSize="9px">{getMediaIcon(post.media_type)}</Text>
                        <Text truncate flex={1} fontSize="9px">
                          {post.caption?.slice(0, 20) || "Untitled"}
                        </Text>
                      </Flex>
                    </Tooltip>
                  ))}
                  {dayPosts.length > 3 && (
                    <Text fontSize="9px" color="#6B7280" pl={1}>
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
        borderColor="#ECECEC"
        borderRadius="24px"
        p={{ base: 5, md: 8 }}
        boxShadow="0 12px 48px rgba(0,0,0,0.04)"
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
          <Button
            bg="#4F46E5"
            color="white"
            borderRadius="12px"
            h="40px"
            px={4}
            fontSize="14px"
            fontWeight="600"
            _hover={{ bg: "#4338CA" }}
            onClick={() => toaster.create({ title: "Navigate to Integrations", description: "Use the Integrations tab to schedule new posts", type: "info", duration: 3000 })}
          >
            <Flex align="center" gap={2}>
              <Plus size={16} strokeWidth={2.5} />
              Schedule Post
            </Flex>
          </Button>
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
            py={12}
            gap={3}
            border="1px dashed"
            borderColor="#E5E7EB"
            borderRadius="16px"
            bg="#FAFAFA"
          >
            <Flex
              w="48px"
              h="48px"
              borderRadius="14px"
              bg="#F3F4F6"
              align="center"
              justify="center"
              color="#9CA3AF"
            >
              <Calendar size={22} strokeWidth={2} />
            </Flex>
            <Text fontSize="15px" fontWeight="600" color="#374151">
              No posts scheduled
            </Text>
            <Text fontSize="13px" color="#9CA3AF" textAlign="center" maxW="280px">
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
                borderRadius="14px"
                border="1px solid"
                borderColor={
                  post.status === "failed" ? "#FCA5A5" :
                  post.status === "published" ? "#6EE7B7" :
                  "#93C5FD"
                }
                bg={
                  post.status === "failed" ? "#FEF2F2" :
                  post.status === "published" ? "#ECFDF5" :
                  "#EFF6FF"
                }
                _hover={{ shadow: "md", transform: "translateY(-1px)" }}
                transition="all 0.2s ease"
              >
                {/* Media thumbnail */}
                <Box
                  w="60px"
                  h="60px"
                  borderRadius="10px"
                  overflow="hidden"
                  flexShrink={0}
                  bg="#E5E7EB"
                  position="relative"
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
                    <Flex align="center" justify="center" w="100%" h="100%" fontSize="20px">
                      {getMediaIcon(post.media_type)}
                    </Flex>
                  )}
                  {/* Media type badge */}
                  <Badge
                    position="absolute"
                    bottom="0"
                    right="0"
                    bg="rgba(0,0,0,0.7)"
                    color="white"
                    fontSize="8px"
                    px={1}
                    py={0.5}
                    borderRadius="4px"
                  >
                    {post.media_type}
                  </Badge>
                </Box>

                {/* Post info */}
                <Flex flex={1} direction="column" gap={1}>
                  <Flex align="center" gap={2}>
                    <Text fontSize="13px" fontWeight="600" color="#1F2937">
                      {getMediaIcon(post.media_type)} {post.media_type}
                    </Text>
                    <Badge
                      fontSize="10px"
                      px={2}
                      py={0.5}
                      borderRadius="6px"
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
                      textTransform="capitalize"
                    >
                      {post.status}
                    </Badge>
                  </Flex>
                  <Text fontSize="12px" color="#6B7280" lineClamp={2}>
                    {post.caption || "No caption"}
                  </Text>
                  <Flex align="center" gap={3} mt={1}>
                    <Flex align="center" gap={1} fontSize="11px" color="#6B7280">
                      <Clock size={12} />
                      {formatDateTime(post.scheduled_at)}
                    </Flex>
                    {post.error_message && (
                      <Text fontSize="11px" color="#DC2626">
                        ⚠️ {post.error_message}
                      </Text>
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
                      _hover={{ bg: "#EEF2FF" }}
                      onClick={() => handleEditClick(post)}
                      aria-label="Edit post"
                    >
                      <Edit2 size={16} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content="Cancel post">
                    <IconButton
                      variant="ghost"
                      size="sm"
                      color="#DC2626"
                      _hover={{ bg: "#FEF2F2" }}
                      onClick={() => handleDeleteClick(post)}
                      aria-label="Cancel post"
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
          <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="auto" backdropBlur="sm" />
          <Dialog.Positioner>
            <Dialog.Content
              borderRadius="16px"
              borderWidth="1px"
              borderColor="#E5E7EB"
              boxShadow="xl"
            >
              <Dialog.Header pb="0">
                <Dialog.Title fontSize="18px" fontWeight="700" color="#111111">
                  Edit Scheduled Post
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body py="4">
                <VStack gap={4}>
                  <Box w="full">
                    <Text fontSize="14px" fontWeight="600" color="#111111" mb={2}>
                      Caption
                    </Text>
                    <Textarea
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      placeholder="Write a caption..."
                      rows={5}
                      resize="vertical"
                      borderRadius="10px"
                      borderColor="#E5E7EB"
                      _focus={{ borderColor: "#4F46E5", outline: "2px solid #C7D2FE" }}
                    />
                  </Box>
                  <Box w="full">
                    <Text fontSize="14px" fontWeight="600" color="#111111" mb={2}>
                      Schedule Date & Time
                    </Text>
                    <Input
                      type="datetime-local"
                      value={editScheduledAt}
                      onChange={(e) => setEditScheduledAt(e.target.value)}
                      borderRadius="10px"
                      borderColor="#E5E7EB"
                      _focus={{ borderColor: "#4F46E5", outline: "2px solid #C7D2FE" }}
                    />
                  </Box>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer gap={2}>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isUpdating}
                  borderRadius="10px"
                >
                  Cancel
                </Button>
                <Button
                  bg="#4F46E5"
                  color="white"
                  onClick={handleSaveEdit}
                  loading={isUpdating}
                  borderRadius="10px"
                  _hover={{ bg: "#4338CA" }}
                >
                  Save Changes
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}
