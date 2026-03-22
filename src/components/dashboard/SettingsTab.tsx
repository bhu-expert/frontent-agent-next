"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  VStack,
  Link,
  Input as ChakraInput,
  Spinner,
} from "@chakra-ui/react";
import {
  Check,
  User,
  Mail,
  Bell,
  CreditCard,
  ShieldAlert,
  Camera,
  Save,
  X,
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
  Link2,
  Link2Off,
  Instagram,
  Facebook,
  RefreshCw,
} from "lucide-react";
import NextLink from "next/link";
import { SUPPORT_EMAIL } from "@/constants/contact";
import { useAuth } from "@/store/AuthProvider";
import { toaster } from "@/components/ui/toaster";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  getUserStats,
  changePassword,
  type UserProfile,
  type UserStats,
} from "@/api/settings/routes";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConnectedAccount {
  platform: "instagram" | "facebook";
  connected: boolean;
  username?: string | null;
  connectedAt?: string | null;
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const CARD_STYLE = {
  bg: "white",
  border: "1px solid",
  borderColor: "#ECECEC",
  borderRadius: "24px",
  p: { base: 5, md: 8 } as Record<string, number>,
  boxShadow: "0 12px 48px rgba(0,0,0,0.04)",
} as const;

const INPUT_STYLE = {
  border: "1px solid",
  borderColor: "#E5E7EB",
  borderRadius: "12px",
  px: "14px",
  py: "10px",
  fontSize: "14px",
  color: "#374151",
  bg: "#FAFAFA",
  w: "full",
} as const;

const SECTION_LABEL_STYLE = {
  fontSize: "11px" as const,
  fontWeight: "700" as const,
  textTransform: "uppercase" as const,
  color: "#9CA3AF",
  letterSpacing: "0.06em",
  mb: 1,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReadOnlyInput({ label, value }: { label: string; value: string }) {
  return (
    <Box w="full">
      <Text {...SECTION_LABEL_STYLE}>{label}</Text>
      <Box {...INPUT_STYLE} cursor="default" userSelect="none">
        {value}
      </Box>
    </Box>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Flex align="center" justify="space-between" gap={4}>
      <Box flex={1} minW={0}>
        <Text fontSize="14px" fontWeight="600" color="#111111">
          {label}
        </Text>
        <Text fontSize="13px" color="#9CA3AF" mt={0.5}>
          {description}
        </Text>
      </Box>
      <Box
        as="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        w="44px"
        h="24px"
        borderRadius="999px"
        bg={checked ? "#4F46E5" : "#E5E7EB"}
        position="relative"
        flexShrink={0}
        transition="background 0.2s ease"
        border="none"
        cursor="pointer"
      >
        <Box
          position="absolute"
          top="3px"
          left={checked ? "23px" : "3px"}
          w="18px"
          h="18px"
          borderRadius="full"
          bg="white"
          boxShadow="0 1px 4px rgba(0,0,0,0.18)"
          transition="left 0.2s ease"
        />
      </Box>
    </Flex>
  );
}

function PlanFeatureRow({ label }: { label: string }) {
  return (
    <Flex align="center" gap={2.5}>
      <Flex
        w="18px"
        h="18px"
        borderRadius="full"
        bg="#ECFDF5"
        align="center"
        justify="center"
        flexShrink={0}
      >
        <Check size={11} strokeWidth={3} color="#16A34A" />
      </Flex>
      <Text fontSize="14px" color="#374151">
        {label}
      </Text>
    </Flex>
  );
}

function SectionDivider() {
  return <Box h="1px" bg="#F3F4F6" my={2} />;
}

// ─── Password input with show/hide ────────────────────────────────────────────

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <Box w="full">
      <Text {...SECTION_LABEL_STYLE}>{label}</Text>
      <Box position="relative">
        <ChakraInput
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          {...INPUT_STYLE}
          bg="white"
          pr="44px"
          borderColor={error ? "#FCA5A5" : "#E5E7EB"}
          _focus={{
            borderColor: error ? "#EF4444" : "#4F46E5",
            boxShadow: error
              ? "0 0 0 3px rgba(239,68,68,0.1)"
              : "0 0 0 3px rgba(79,70,229,0.1)",
          }}
          transition="all 0.2s"
        />
        <Box
          as="button"
          position="absolute"
          right="12px"
          top="50%"
          transform="translateY(-50%)"
          onClick={() => setShow((s) => !s)}
          color="#9CA3AF"
          _hover={{ color: "#4F46E5" }}
          transition="color 0.15s"
          border="none"
          bg="transparent"
          cursor="pointer"
          p={0}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </Box>
      </Box>
      {error && (
        <Text fontSize="12px" color="#EF4444" mt={1}>
          {error}
        </Text>
      )}
    </Box>
  );
}

// ─── Connected account row ────────────────────────────────────────────────────

function ConnectedAccountRow({
  account,
  onDisconnect,
  onConnect,
  isLoading,
}: {
  account: ConnectedAccount;
  onDisconnect: (platform: string) => void;
  onConnect: (platform: string) => void;
  isLoading: boolean;
}) {
  const isInstagram = account.platform === "instagram";
  const platformColor = isInstagram ? "#E1306C" : "#1877F2";
  const platformBg = isInstagram ? "#FFF0F5" : "#F0F6FF";
  const PlatformIcon = isInstagram ? Instagram : Facebook;
  const platformLabel = isInstagram ? "Instagram" : "Facebook";

  return (
    <Flex align="center" justify="space-between" gap={4} py={1}>
      <Flex align="center" gap={3}>
        {/* Platform icon */}
        <Flex
          w="40px"
          h="40px"
          borderRadius="12px"
          bg={platformBg}
          align="center"
          justify="center"
          flexShrink={0}
        >
          <PlatformIcon size={20} color={platformColor} />
        </Flex>

        <Box>
          <Text fontSize="14px" fontWeight="600" color="#111111">
            {platformLabel}
          </Text>
          {account.connected && account.username ? (
            <Text fontSize="12px" color="#6B7280">
              @{account.username}
            </Text>
          ) : (
            <Text fontSize="12px" color="#9CA3AF">
              Not connected
            </Text>
          )}
        </Box>
      </Flex>

      <Flex align="center" gap={2}>
        {/* Status dot */}
        <Box
          w="7px"
          h="7px"
          borderRadius="full"
          flexShrink={0}
          bg={account.connected ? "#16A34A" : "#D1D5DB"}
        />

        {account.connected ? (
          <Button
            size="sm"
            variant="outline"
            borderColor="#E5E7EB"
            color="#6B7280"
            bg="white"
            borderRadius="10px"
            h="34px"
            px={4}
            fontSize="13px"
            fontWeight="600"
            onClick={() => onDisconnect(account.platform)}
            disabled={isLoading}
            _hover={{ bg: "#FEF2F2", borderColor: "#FCA5A5", color: "#DC2626" }}
            transition="all 0.2s"
          >
            <Link2Off size={13} style={{ marginRight: "5px" }} />
            Disconnect
          </Button>
        ) : (
          <Button
            size="sm"
            bg="#4F46E5"
            color="white"
            borderRadius="10px"
            h="34px"
            px={4}
            fontSize="13px"
            fontWeight="600"
            onClick={() => onConnect(account.platform)}
            disabled={isLoading}
            boxShadow="0 2px 8px rgba(79,70,229,0.2)"
            _hover={{ bg: "#4338CA" }}
            transition="all 0.2s"
          >
            <Link2 size={13} style={{ marginRight: "5px" }} />
            Connect
          </Button>
        )}
      </Flex>
    </Flex>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SettingsTab() {
  const router = useRouter();
  const { user: authUser, session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Profile & Stats ───────────────────────────────────────────────────────

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ── Notifications ─────────────────────────────────────────────────────────

  const [emailDigests, setEmailDigests] = useState(true);
  const [postAlerts, setPostAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  // ── Change password ───────────────────────────────────────────────────────

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // ── Connected accounts ────────────────────────────────────────────────────

  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([
    { platform: "instagram", connected: false, username: null },
    { platform: "facebook", connected: false, username: null },
  ]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);

  // ── Load data ─────────────────────────────────────────────────────────────

  const fetchSettingsData = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      setIsLoading(true);
      const [p, s] = await Promise.all([
        getProfile(session.access_token),
        getUserStats(session.access_token),
      ]);
      setProfile(p);
      setStats(s);
      setEditName(p.full_name || "");
    } catch (err) {
      toaster.create({
        title: "Error loading settings",
        description: "Please try again later.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token]);

  // Load connected accounts from your existing integrations endpoint
  const fetchConnections = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/data/integrations/status`,
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      );
      if (!res.ok) return;
      const data = await res.json();
      // Adjust shape based on what your integrations endpoint returns
      setConnectedAccounts([
        {
          platform: "instagram",
          connected: !!data?.instagram?.connected,
          username: data?.instagram?.username || null,
        },
        {
          platform: "facebook",
          connected: !!data?.facebook?.connected,
          username: data?.facebook?.username || null,
        },
      ]);
    } catch {
      // Silently fail — connections section degrades gracefully
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchSettingsData();
    fetchConnections();
  }, [fetchSettingsData, fetchConnections]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSaveProfile = async () => {
    if (!session?.access_token) return;
    if (!editName.trim()) {
      toaster.create({ title: "Name required", type: "warning" });
      return;
    }
    try {
      setIsSaving(true);
      const updated = await updateProfile(
        { full_name: editName },
        session.access_token,
      );
      setProfile(updated);
      setIsEditing(false);
      toaster.create({ title: "Profile updated", type: "success" });
    } catch {
      toaster.create({ title: "Failed to update profile", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.access_token) return;
    try {
      setIsUploading(true);
      const updated = await uploadAvatar(file, session.access_token);
      setProfile(updated);
      toaster.create({ title: "Avatar updated", type: "success" });
    } catch {
      toaster.create({
        title: "Upload failed",
        description: "Try a smaller image (max 2MB).",
        type: "error",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleChangePassword = async () => {
    const errors: Record<string, string> = {};
    if (!currentPassword) errors.current = "Current password is required";
    if (newPassword.length < 8) errors.new = "Must be at least 8 characters";
    if (newPassword !== confirmPassword)
      errors.confirm = "Passwords don't match";
    if (Object.keys(errors).length) {
      setPasswordErrors(errors);
      return;
    }

    try {
      setIsSavingPassword(true);
      await changePassword(newPassword, session!.access_token);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});
      setShowPasswordSection(false);
      toaster.create({
        title: "Password changed successfully",
        type: "success",
        duration: 3000,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to change password";
      toaster.create({ title: msg, type: "error" });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDisconnect = async (platform: string) => {
    if (!session?.access_token) return;
    setConnectionsLoading(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/data/integrations/${platform}/disconnect`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        },
      );
      setConnectedAccounts((prev) =>
        prev.map((a) =>
          a.platform === platform
            ? { ...a, connected: false, username: null }
            : a,
        ),
      );
      toaster.create({
        title: `${platform} disconnected`,
        type: "success",
        duration: 3000,
      });
    } catch {
      toaster.create({ title: "Failed to disconnect", type: "error" });
    } finally {
      setConnectionsLoading(false);
    }
  };

  const handleConnect = (platform: string) => {
    // Route to your existing OAuth connection flow
    router.push(`/dashboard/integrations?connect=${platform}`);
  };

  // ── Loading state ──────────────────────────────────────────────────────────

  if (isLoading && !profile) {
    return (
      <Flex h="400px" align="center" justify="center">
        <Spinner size="xl" color="blue.500" borderWidth="4px" />
      </Flex>
    );
  }

  const USER_DISPLAY_NAME = profile?.full_name || authUser?.name || "User";
  const USER_EMAIL = profile?.email || authUser?.email || "No email";
  const AVATAR_URL = profile?.avatar_url;
  const AVATAR_INITIALS = USER_DISPLAY_NAME.charAt(0).toUpperCase();

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <VStack align="stretch" gap={8}>
      {/* Page heading */}
      <Box>
        <Text
          fontSize={{ base: "3xl", md: "4xl" }}
          fontWeight="700"
          color="#111111"
          lineHeight="1.05"
          mb={2}
        >
          Settings
        </Text>
        <Text fontSize="15px" color="#6B7280">
          Manage your profile, notifications, billing, and account.
        </Text>
      </Box>

      {/* ── 1. Profile ── */}
      <Box
        {...CARD_STYLE}
        bgGradient="linear(to-br, #FFFFFF, #F8F9FF)"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="-60px"
          right="-60px"
          w="160px"
          h="160px"
          borderRadius="full"
          bg="rgba(79,70,229,0.04)"
          pointerEvents="none"
        />

        <Flex align="center" justify="space-between" mb={6}>
          <Flex align="center" gap={2}>
            <User size={18} color="#4F46E5" />
            <Text fontSize="18px" fontWeight="700" color="#111111">
              Profile
            </Text>
          </Flex>
          {stats && (
            <Box
              px={3}
              py={1}
              bg="#EEF2FF"
              border="1px solid"
              borderColor="#C7D2FE"
              borderRadius="999px"
            >
              <Text
                fontSize="11px"
                fontWeight="700"
                color="#4F46E5"
                textTransform="uppercase"
              >
                {stats.brand_count} Brand{stats.brand_count !== 1 ? "s" : ""} ·{" "}
                {stats.plan}
              </Text>
            </Box>
          )}
        </Flex>

        <Flex align="center" gap={4} mb={6}>
          <Box position="relative">
            {AVATAR_URL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={AVATAR_URL}
                alt="Avatar"
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "20px",
                  objectFit: "cover",
                  border: "3px solid #E0E7FF",
                }}
              />
            ) : (
              <Flex
                w="64px"
                h="64px"
                borderRadius="20px"
                bg="linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
                color="white"
                fontSize="22px"
                fontWeight="800"
                align="center"
                justify="center"
                flexShrink={0}
                border="3px solid"
                borderColor="#E0E7FF"
              >
                {AVATAR_INITIALS}
              </Flex>
            )}
            <Flex
              as="button"
              position="absolute"
              bottom="-4px"
              right="-4px"
              w="28px"
              h="28px"
              borderRadius="full"
              bg="white"
              border="2px solid #E5E7EB"
              align="center"
              justify="center"
              cursor="pointer"
              transition="all 0.2s"
              _hover={{
                bg: "#F5F5FF",
                borderColor: "#C7D2FE",
                transform: "scale(1.1)",
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <Spinner size="xs" color="blue.500" />
              ) : (
                <Camera size={13} color="#4F46E5" />
              )}
            </Flex>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: "none" }}
              onChange={handleAvatarUpload}
            />
          </Box>

          <Box flex={1}>
            <Text fontSize="17px" fontWeight="700" color="#111111">
              {USER_DISPLAY_NAME}
            </Text>
            <Text fontSize="13px" color="#6B7280">
              {USER_EMAIL}
            </Text>
          </Box>
        </Flex>

        {isEditing ? (
          <VStack align="stretch" gap={4} mb={6}>
            <Box w="full">
              <Text {...SECTION_LABEL_STYLE}>Full Name</Text>
              <ChakraInput
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                {...INPUT_STYLE}
                bg="white"
                _focus={{
                  borderColor: "#4F46E5",
                  boxShadow: "0 0 0 3px rgba(79,70,229,0.1)",
                }}
                transition="all 0.2s"
              />
            </Box>
            <ReadOnlyInput label="Email Address" value={USER_EMAIL} />
            <HStack gap={3} mt={2}>
              <Button
                bg="#4F46E5"
                color="white"
                borderRadius="12px"
                h="42px"
                px={5}
                fontSize="14px"
                fontWeight="600"
                onClick={handleSaveProfile}
                loading={isSaving}
                loadingText="Saving..."
                boxShadow="0 4px 12px rgba(79,70,229,0.2)"
                _hover={{
                  bg: "#4338CA",
                  boxShadow: "0 6px 16px rgba(79,70,229,0.28)",
                }}
                transition="all 0.2s"
              >
                <Save size={14} style={{ marginRight: "6px" }} />
                Save Changes
              </Button>
              <Button
                variant="outline"
                borderColor="#D1D5DB"
                color="#6B7280"
                bg="white"
                borderRadius="12px"
                h="42px"
                px={5}
                fontSize="14px"
                fontWeight="600"
                onClick={() => {
                  setIsEditing(false);
                  setEditName(profile?.full_name || "");
                }}
                _hover={{ bg: "#F9FAFB" }}
              >
                <X size={14} style={{ marginRight: "6px" }} />
                Cancel
              </Button>
            </HStack>
          </VStack>
        ) : (
          <>
            <VStack align="stretch" gap={4} mb={6}>
              <ReadOnlyInput label="Full Name" value={USER_DISPLAY_NAME} />
              <ReadOnlyInput label="Email Address" value={USER_EMAIL} />
            </VStack>
            <Button
              variant="outline"
              borderColor="#D1D5DB"
              color="#4F46E5"
              bg="white"
              borderRadius="12px"
              h="42px"
              px={5}
              fontSize="14px"
              fontWeight="600"
              _hover={{
                bg: "#F5F5FF",
                borderColor: "#C7D2FE",
                transform: "translateY(-1px)",
              }}
              _active={{ transform: "translateY(0)" }}
              transition="all 0.2s"
              onClick={() => {
                setEditName(profile?.full_name || "");
                setIsEditing(true);
              }}
            >
              Edit Profile
              <ChevronRight size={14} style={{ marginLeft: "4px" }} />
            </Button>
          </>
        )}
      </Box>

      <SectionDivider />

      {/* ── 2. Change Password ── */}
      <Box {...CARD_STYLE}>
        <Flex
          align="center"
          justify="space-between"
          mb={showPasswordSection ? 6 : 0}
        >
          <Flex align="center" gap={2}>
            <Lock size={18} color="#4F46E5" />
            <Text fontSize="18px" fontWeight="700" color="#111111">
              Password
            </Text>
          </Flex>
          <Button
            size="sm"
            variant="outline"
            borderColor="#D1D5DB"
            color="#4F46E5"
            bg="white"
            borderRadius="10px"
            h="36px"
            px={4}
            fontSize="13px"
            fontWeight="600"
            onClick={() => {
              setShowPasswordSection((v) => !v);
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setPasswordErrors({});
            }}
            _hover={{ bg: "#F5F5FF", borderColor: "#C7D2FE" }}
            transition="all 0.2s"
          >
            {showPasswordSection ? "Cancel" : "Change password"}
          </Button>
        </Flex>

        {!showPasswordSection && (
          <Text fontSize="14px" color="#9CA3AF" mt={3}>
            Use a strong password to keep your account secure.
          </Text>
        )}

        {showPasswordSection && (
          <VStack align="stretch" gap={4}>
            <PasswordInput
              label="Current password"
              value={currentPassword}
              onChange={(v) => {
                setCurrentPassword(v);
                setPasswordErrors((e) => ({ ...e, current: "" }));
              }}
              placeholder="Enter current password"
              error={passwordErrors.current}
            />
            <Box h="1px" bg="#F3F4F6" />
            <PasswordInput
              label="New password"
              value={newPassword}
              onChange={(v) => {
                setNewPassword(v);
                setPasswordErrors((e) => ({ ...e, new: "" }));
              }}
              placeholder="At least 8 characters"
              error={passwordErrors.new}
            />
            <PasswordInput
              label="Confirm new password"
              value={confirmPassword}
              onChange={(v) => {
                setConfirmPassword(v);
                setPasswordErrors((e) => ({ ...e, confirm: "" }));
              }}
              placeholder="Re-enter new password"
              error={passwordErrors.confirm}
            />

            {/* Password strength indicator */}
            {newPassword.length > 0 && (
              <Box>
                <Text {...SECTION_LABEL_STYLE} mb={1.5}>
                  Strength
                </Text>
                <HStack gap={1.5}>
                  {[1, 2, 3, 4].map((level) => {
                    const strength =
                      newPassword.length >= 12 &&
                      /[A-Z]/.test(newPassword) &&
                      /[0-9]/.test(newPassword) &&
                      /[^A-Za-z0-9]/.test(newPassword)
                        ? 4
                        : newPassword.length >= 10 &&
                            /[A-Z]/.test(newPassword) &&
                            /[0-9]/.test(newPassword)
                          ? 3
                          : newPassword.length >= 8
                            ? 2
                            : 1;
                    const color =
                      strength === 4
                        ? "#16A34A"
                        : strength === 3
                          ? "#CA8A04"
                          : strength === 2
                            ? "#F97316"
                            : "#EF4444";
                    return (
                      <Box
                        key={level}
                        h="4px"
                        flex={1}
                        borderRadius="full"
                        bg={level <= strength ? color : "#E5E7EB"}
                        transition="background 0.2s"
                      />
                    );
                  })}
                </HStack>
              </Box>
            )}

            <Button
              bg="#4F46E5"
              color="white"
              borderRadius="12px"
              h="42px"
              px={6}
              fontSize="14px"
              fontWeight="600"
              alignSelf="flex-start"
              onClick={handleChangePassword}
              loading={isSavingPassword}
              loadingText="Updating..."
              disabled={!currentPassword || !newPassword || !confirmPassword}
              boxShadow="0 4px 12px rgba(79,70,229,0.2)"
              _hover={{
                bg: "#4338CA",
                boxShadow: "0 6px 16px rgba(79,70,229,0.28)",
              }}
              transition="all 0.2s"
            >
              <Lock size={14} style={{ marginRight: "6px" }} />
              Update Password
            </Button>
          </VStack>
        )}
      </Box>

      <SectionDivider />

      {/* ── 3. Connected Accounts ── */}
      <Box {...CARD_STYLE}>
        <Flex align="center" justify="space-between" mb={6}>
          <Flex align="center" gap={2}>
            <Link2 size={18} color="#4F46E5" />
            <Text fontSize="18px" fontWeight="700" color="#111111">
              Connected Accounts
            </Text>
          </Flex>
          <Box
            as="button"
            onClick={fetchConnections}
            color="#9CA3AF"
            _hover={{ color: "#4F46E5" }}
            transition="color 0.15s"
            border="none"
            bg="transparent"
            cursor="pointer"
            title="Refresh connection status"
          >
            <RefreshCw size={15} />
          </Box>
        </Flex>

        <Text fontSize="13px" color="#9CA3AF" mb={5} lineHeight="1.55">
          Connect your social accounts to enable automated posting and
          analytics.
        </Text>

        <VStack align="stretch" gap={4}>
          {connectedAccounts.map((account, i) => (
            <Box key={account.platform}>
              {i > 0 && <Box h="1px" bg="#F3F4F6" mb={4} />}
              <ConnectedAccountRow
                account={account}
                onDisconnect={handleDisconnect}
                onConnect={handleConnect}
                isLoading={connectionsLoading}
              />
            </Box>
          ))}
        </VStack>

        {/* Connection note */}
        <Box
          mt={5}
          p={3}
          bg="#F8F9FF"
          borderRadius="12px"
          border="1px solid #EEF2FF"
        >
          <Text fontSize="12px" color="#6B7280" lineHeight="1.55">
            Connecting your accounts allows Plug and Play Agent to publish
            content on your behalf. You can disconnect at any time.
          </Text>
        </Box>
      </Box>

      <SectionDivider />

      {/* ── 4. Notifications ── */}
      <Box {...CARD_STYLE}>
        <Flex align="center" gap={2} mb={6}>
          <Bell size={18} color="#4F46E5" />
          <Text fontSize="18px" fontWeight="700" color="#111111">
            Notifications
          </Text>
        </Flex>
        <VStack align="stretch" gap={5}>
          <ToggleRow
            label="Email digests"
            description="Receive a weekly summary of your content performance."
            checked={emailDigests}
            onToggle={() => setEmailDigests((v) => !v)}
          />
          <Box h="1px" bg="#F3F4F6" />
          <ToggleRow
            label="Post published alerts"
            description="Get notified when a scheduled post is successfully published."
            checked={postAlerts}
            onToggle={() => setPostAlerts((v) => !v)}
          />
          <Box h="1px" bg="#F3F4F6" />
          <ToggleRow
            label="Weekly performance report"
            description="A curated report on reach, engagement, and top-performing posts."
            checked={weeklyReport}
            onToggle={() => setWeeklyReport((v) => !v)}
          />
        </VStack>
      </Box>

      <SectionDivider />

      {/* ── 5. Plan & Billing ── */}
      <Box {...CARD_STYLE}>
        <Flex
          align={{ base: "flex-start", sm: "center" }}
          justify="space-between"
          direction={{ base: "column", sm: "row" }}
          gap={3}
          mb={6}
        >
          <Flex align="center" gap={2}>
            <CreditCard size={18} color="#4F46E5" />
            <Text fontSize="18px" fontWeight="700" color="#111111">
              Plan &amp; Billing
            </Text>
          </Flex>
          <Box
            px={3}
            py={1}
            bg="#F3F4F6"
            border="1px solid"
            borderColor="#E5E7EB"
            borderRadius="999px"
          >
            <Text
              fontSize="12px"
              fontWeight="700"
              color="#374151"
              textTransform="capitalize"
            >
              {stats?.plan || "Free"} Plan
            </Text>
          </Box>
        </Flex>
        <VStack align="stretch" gap={2.5} mb={6}>
          <PlanFeatureRow label="Up to 3 brand profiles" />
          <PlanFeatureRow label="10 posts per month" />
          <PlanFeatureRow label="Basic analytics" />
        </VStack>
        <Button
          bg="#4F46E5"
          color="white"
          borderRadius="12px"
          h="44px"
          px={6}
          fontSize="14px"
          fontWeight="600"
          boxShadow="0 6px 16px rgba(79,70,229,0.22)"
          _hover={{
            bg: "#4338CA",
            boxShadow: "0 10px 24px rgba(79,70,229,0.28)",
          }}
        >
          Upgrade to Pro
        </Button>
      </Box>

      <SectionDivider />

      {/* ── 6. Danger Zone ── */}
      <Box
        bg="white"
        border="1px solid"
        borderColor="#FECACA"
        borderRadius="24px"
        p={{ base: 5, md: 8 }}
        boxShadow="0 12px 48px rgba(0,0,0,0.04)"
      >
        <Flex align="center" gap={2} mb={2}>
          <ShieldAlert size={18} color="#991B1B" />
          <Text fontSize="18px" fontWeight="700" color="#991B1B">
            Danger Zone
          </Text>
        </Flex>
        <Text fontSize="14px" color="#9CA3AF" mb={6} lineHeight="1.55">
          Deleting your account is permanent and irreversible. All your brands,
          generated content, and connected integrations will be removed
          immediately.
        </Text>
        <VStack align="stretch" gap={3}>
          <Button
            variant="outline"
            borderColor="#FECACA"
            color="#DC2626"
            bg="white"
            borderRadius="12px"
            h="42px"
            px={5}
            fontSize="14px"
            fontWeight="600"
            _hover={{ bg: "#FEF2F2", borderColor: "#FCA5A5" }}
            onClick={() => router.push("/settings/delete-account")}
          >
            Delete Account
          </Button>
          <Text fontSize="12px" color="#9CA3AF" textAlign="center">
            Or use our{" "}
            <Link
              as={NextLink}
              href="/settings/delete-account"
              color="#DC2626"
              textDecoration="underline"
            >
              direct account deletion link
            </Link>
          </Text>
          <Box h="1px" bg="#F3F4F6" my={2} />
          <Text fontSize="12px" color="#6B7280" textAlign="center">
            Need help? Contact{" "}
            <Link
              href={`mailto:${SUPPORT_EMAIL}`}
              color="#4F46E5"
              textDecoration="underline"
            >
              {SUPPORT_EMAIL}
            </Link>
          </Text>
        </VStack>
      </Box>
    </VStack>
  );
}
