"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { useOnboardingFlow } from "@/hooks";
import { AuthProvider, useAuth } from "@/store/AuthProvider";

import Footer from "@/components/layout/Footer";
import AuthModal from "@/components/onboarding/AuthModal";
import URLInput from "@/components/onboarding/URLInput";
import BrandAnalysis from "@/components/onboarding/BrandAnalysis";
import ContextResults from "@/components/onboarding/ContextResults";
import TemplateOptions from "@/components/onboarding/TemplateOptions";
import AdGeneration from "@/components/onboarding/AdGeneration";
import AdOutput from "@/components/onboarding/AdOutput";
import Navbar from "@/components/layout/Navbar";

// Skip static generation - this page requires runtime auth
export const dynamic = "force-dynamic";

function ToolContent() {
  const ts = useOnboardingFlow();
  const { isClaiming } = useAuth();

  // Handle successful authentication (triggers claim flow in AuthProvider)
  const handleAuthSuccess = () => {
    console.log("✓ onAuthSuccess called - user signed up/logged in");
    console.log("  Pending brand ID should be in localStorage");
    // Close modal after successful auth
    ts.closeModal();
  };

  return (
    <Box bg="white" minH="100vh" overflowX="hidden" pt="64px">
      {/* Tool Navbar */}
      <Navbar />

      {/* Auth Modal */}
      <AuthModal
        open={ts.modalOpen}
        mode={ts.modalMode}
        onClose={ts.closeModal}
        onSwitch={ts.setModalMode}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Pages */}
      {ts.curStep === 1 && <URLInput onAnalyse={ts.handleAnalyse} />}

      {ts.curStep === 2 && (
        <BrandAnalysis
          url={ts.url}
          brandName={ts.brandName}
          guardrails={ts.guardrails}
          description={ts.description}
          onDone={ts.handleAnalysisDone}
        />
      )}

      {ts.curStep === 3 && (
        <ContextResults
          url={ts.url}
          ctx={ts.ctx}
          ratings={ts.ratings}
          bm={ts.bm}
          likes={ts.likes}
          selCtx={ts.selCtx}
          onSelect={ts.selectCtx}
          onRate={ts.rateCtx}
          onToggleBm={ts.toggleBm}
          onToggleLike={ts.toggleLike}
          onUseSelected={ts.handleGoTemplates}
          onNewAnalysis={ts.newAnalysis}
          onCopy={ts.copyText}
          isClaiming={isClaiming}
        />
      )}

      {ts.curStep === 4 && (
        <TemplateOptions
          ctx={ts.ctx}
          selCtx={ts.selCtx}
          selTpl={ts.selTpl}
          selIgTpl={ts.selIgTpl}
          platform={ts.platform}
          tone={ts.tone}
          emoji={ts.emoji}
          cta={ts.cta}
          offer={ts.offer}
          slideN={ts.slideN}
          userBrief={ts.userBrief}
          isLoggedIn={false}
          onBack={ts.prev}
          onSelPlatform={ts.setPlatform}
          onSelTpl={ts.setSelTpl}
          onSelIgTpl={ts.setSelIgTpl}
          onSelTone={(t: string) => ts.setTone(t)}
          onSelEmoji={ts.setEmoji}
          onSetCta={ts.setCta}
          onSetOffer={ts.setOffer}
          onSetSlideN={ts.setSlideN}
          onSetUserBrief={ts.setUserBrief}
          onSetField={ts.setField}
          onGenerate={ts.handleGenerate}
          onOpenLogin={ts.openLogin}
        />
      )}

      {ts.curStep === 5 && <AdGeneration onDone={() => ts.goTo(6)} />}

      {ts.curStep === 6 && ts.gen && (
        <AdOutput
          gen={ts.gen}
          onCopy={ts.copyText}
          onBack={ts.prev}
          onNewAnalysis={ts.newAnalysis}
        />
      )}

      {/* Toast notification */}
      {ts.toastVisible && (
        <Flex
          position="fixed"
          bottom={6}
          left="50%"
          transform="translateX(-50%)"
          bg="#111827"
          color="white"
          px={5}
          py={3}
          rounded="full"
          boxShadow="0 10px 40px rgba(0,0,0,0.15)"
          align="center"
          gap={2}
          zIndex={1000}
          fontSize="sm"
          fontWeight="bold"
        >
          <Text>✓</Text>
          <Text>{ts.toastMsg}</Text>
        </Flex>
      )}

      {/* Footer */}
      <Footer />
    </Box>
  );
}

export default function OnboardingPage() {
  return (
    <AuthProvider
      redirectToDashboard={true}
      onClaimStart={() => {
        console.log("🔄 Claiming brand...");
      }}
      onClaimComplete={() => {
        console.log("✓ Brand claimed successfully!");
      }}
      onDelayedAuthComplete={() => {
        console.log("✓ Delayed auth complete - brand claimed and variations generated");
      }}
      onDelayedAuthError={(error) => {
        console.error("Delayed auth error:", error);
        // Error is handled in AuthProvider, but we can show UI feedback here
      }}
    >
      <ToolContent />
    </AuthProvider>
  );
}
