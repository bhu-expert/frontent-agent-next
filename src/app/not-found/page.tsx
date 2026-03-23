import { Box } from "@chakra-ui/react"
import NotFoundContent from "@/components/error/NotFoundContent"
import { NOT_FOUND_WATERMARK } from "@/constants/error-page"

export default function NotFoundPage() {
  return (
    <Box
      h="100vh"
      w="100vw"
      bg="#F8F8F6"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
    >
      {/* Ghost watermark */}
      <Box
        position="absolute"
        fontSize="280px"
        fontWeight={900}
        color="#ECECEC"
        opacity={0.5}
        top="50%"
        left="50%"
        transform="translate(-50%, -60%)"
        zIndex={0}
        userSelect="none"
        letterSpacing="-0.05em"
        lineHeight={1}
        pointerEvents="none"
        aria-hidden="true"
      >
        {NOT_FOUND_WATERMARK}
      </Box>

      <NotFoundContent />
    </Box>
  )
}