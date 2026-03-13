"use client";

import { useState } from "react";
import { Box, Button, Flex, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

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

// ─── Main component ───────────────────────────────────────────────────────────

export default function CalendarTab() {
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);

  const displayDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const displayYear = displayDate.getFullYear();
  const displayMonth = displayDate.getMonth();

  const calendarDays = buildCalendarDays(displayYear, displayMonth);

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
          {calendarDays.map((day, idx) => (
            <Box
              key={idx}
              bg={day.isToday ? "#EEF2FF" : "white"}
              border={day.isToday ? "2px solid" : "none"}
              borderColor={day.isToday ? "#4F46E5" : "transparent"}
              minH={{ base: "52px", md: "72px" }}
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
              >
                {day.dayNumber}
              </Text>
            </Box>
          ))}
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
          >
            <Flex align="center" gap={2}>
              <Plus size={16} strokeWidth={2.5} />
              Schedule Post
            </Flex>
          </Button>
        </Flex>

        {/* Empty state */}
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
            <Plus size={22} strokeWidth={2} />
          </Flex>
          <Text fontSize="15px" fontWeight="600" color="#374151">
            No posts scheduled
          </Text>
          <Text fontSize="13px" color="#9CA3AF" textAlign="center" maxW="280px">
            Schedule your first post for this month to see it here.
          </Text>
        </Flex>
      </Box>
    </VStack>
  );
}
