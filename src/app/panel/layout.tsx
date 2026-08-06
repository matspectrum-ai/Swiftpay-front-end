import type { UserInfo } from '@/types/auth';
import type { MinimalMerchant } from '@/types/merchant/crud';
import {
  getAccessToken,
  getDeviceIdCookie,
  getSelectedMerchant,
  getSessionData,
  getSidebarExpanded,
} from '@/auth/session';
import { listMerchants } from '@/app/actions/merchant/crud';
import { getApiUrl } from '@/app/actions/auth';
import { resolveDocsUrl } from '@/constants/useful-links';
import { SignalRProvider } from '@/contexts/signalr-context';
import { AuthHubProvider } from '@/providers/auth-hub-provider';
import { PanelProviders } from '@/components/panel/panel-providers';
import { UserRole, UserStatus, PaymentEnvironment } from '@/types/enums';
import { MerchantStatus, MerchantKycStatus, MerchantOnboardingStep } from '@/types/merchant/crud';

// Usuário mock para visualização do painel sem autenticação (modo auditoria)
const MOCK_USER: UserInfo = {
  id: 'preview-user-id',
  name: 'Usuário Preview',
  email: 'preview@swiftpay.com',
  role: UserRole.Merchant,
  status: UserStatus.Active,
  emailVerified: true,
  profileImageUrl: null,
  selectedBorderImageUrl: null,
};

const MOCK_MERCHANT: MinimalMerchant = {
  id: 'preview-merchant-id',
  name: 'Loja Preview SwiftPay',
  email: 'loja@swiftpay.com',
  document: null,
  status: MerchantStatus.Active,
  kycStatus: MerchantKycStatus.Approved,
  onboardingStep: MerchantOnboardingStep.Completed,
  createdAt: new Date().toISOString(),
  onboardingCompletedAt: new Date().toISOString(),
  availableBalance: 15432.50,
  fees: null,
};

export default async function PanelRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Tenta usar sessão real; se não houver, usa mock para auditoria de design
  const [session, accessToken, apiUrl, deviceId, sidebarExpanded] = await Promise.all([
    getSessionData().catch(() => null),
    getAccessToken().catch(() => null),
    getApiUrl().catch(() => ''),
    getDeviceIdCookie().catch(() => null),
    getSidebarExpanded().catch(() => true),
  ]);

  const user: UserInfo = session
    ? {
        id: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
        status: session.status,
        emailVerified: session.emailVerified,
        profileImageUrl: session.profileImageUrl ?? null,
        selectedBorderImageUrl: session.selectedBorderImageUrl ?? null,
      }
    : MOCK_USER;

  let merchants: MinimalMerchant[] = [];
  let selectedMerchant: MinimalMerchant | null = null;

  if (session && accessToken) {
    const merchantsResponse = await listMerchants().catch(() => null);
    merchants = merchantsResponse?.data?.items ?? [];
    selectedMerchant = await getSelectedMerchant().catch(() => null);
  } else {
    merchants = [MOCK_MERCHANT];
    selectedMerchant = MOCK_MERCHANT;
  }

  const publicConfig = {
    docsUrl: resolveDocsUrl(),
    integrationUrl: null,
  };

  return (
    <SignalRProvider apiUrl={apiUrl ?? ''} accessToken={accessToken} deviceId={deviceId ?? ''}>
      <AuthHubProvider>
        <PanelProviders
          user={user}
          merchants={merchants}
          selectedMerchant={selectedMerchant}
          apiUrl={apiUrl ?? ''}
          accessToken={accessToken}
          publicConfig={publicConfig}
          initialEnvironment={session?.environment ?? PaymentEnvironment.Production}
          initialSidebarExpanded={sidebarExpanded}
          initialUnreadCount={0}
          initialUserUnreadCount={0}
        >
          {children}
        </PanelProviders>
      </AuthHubProvider>
    </SignalRProvider>
  );
}
