import { useEffect, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface GoogleSignInProps {
  onSuccess: (idToken: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
}

// Declare global google object
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select: boolean;
            cancel_on_tap_outside: boolean;
            use_fedcm_for_prompt: boolean;
          }) => void;
          renderButton: (element: HTMLElement, options: {
            theme: string;
            size: string;
            width: number;
            text: string;
            shape: string;
            logo_alignment: string;
          }) => void;
          disableAutoSelect: () => void;
          prompt: (callback?: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            getNotDisplayedReason: () => string;
            getSkippedReason: () => string;
          }) => void) => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            prompt?: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
    googleSignInCallback: (response: { credential?: string }) => void;
  }
}

export default function GoogleSignIn({
  onSuccess,
  onError,
  disabled = false,
  className = ""
}: GoogleSignInProps) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleAuthEnabled = import.meta.env.VITE_ENABLE_GOOGLE_AUTH === 'true';
  const [isIncognito, setIsIncognito] = useState<boolean | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  // Detect incognito/private browsing mode
  const detectIncognito = useCallback(async (): Promise<boolean> => {
    try {
      // Method 1: Storage quota check
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        // Incognito mode typically has very limited quota (< 120MB)
        if (estimate.quota && estimate.quota < 120000000) {
          return true;
        }
      }

      // Method 2: IndexedDB check
      return new Promise((resolve) => {
        const db = indexedDB.open('test');
        db.onerror = () => resolve(true); // Likely incognito
        db.onsuccess = () => {
          indexedDB.deleteDatabase('test');
          resolve(false);
        };
      });
    } catch {
      // Fallback: assume normal mode
      return false;
    }
  }, []);

  // Handle OAuth2 token response (for popup flow)
  const handleTokenResponse = useCallback(async (response: { access_token?: string; error?: string }) => {
    if (response.error) {
      toast.error('Đăng nhập Google thất bại');
      if (onError) {
        onError(new Error(response.error));
      }
      return;
    }

    if (response.access_token) {
      try {
        // Get user info from Google API using access token
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
          },
        });

        if (!userInfoResponse.ok) {
          throw new Error('Failed to get user info');
        }

        const userInfo = await userInfoResponse.json();

        // Create a mock JWT token with user info (for compatibility)
        const mockCredential = btoa(JSON.stringify({
          iss: 'https://accounts.google.com',
          sub: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          given_name: userInfo.given_name,
          family_name: userInfo.family_name,
          picture: userInfo.picture,
          email_verified: userInfo.verified_email,
        }));

        onSuccess(mockCredential);
      } catch (error) {
        toast.error('Không thể lấy thông tin người dùng');
        if (onError) {
          onError(error instanceof Error ? error : new Error('Failed to get user info'));
        }
      }
    }
  }, [onSuccess, onError]);

  const handleCredentialResponse = useCallback((response: { credential?: string }) => {
    try {
      if (response.credential) {
        onSuccess(response.credential);
      } else {
        throw new Error('Không nhận được thông tin đăng nhập từ Google');
      }
    } catch (error) {
      toast.error('Đăng nhập Google thất bại');
      if (onError) {
        onError(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  }, [onSuccess, onError]);

  // Initialize incognito detection and Google SDK
  useEffect(() => {
    if (!clientId) {
      return;
    }

    // Detect incognito mode first
    detectIncognito().then(setIsIncognito);

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google) {
        try {
          // Initialize Google Sign-In
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false,
          });

          // Disable auto-select to ensure account picker shows
          window.google.accounts.id.disableAutoSelect();
          setIsGoogleLoaded(true);
        } catch {
          toast.error('Không thể khởi tạo Google Sign-In');
        }
      } else {
        toast.error('Không thể tải Google Sign-In');
      }
    };

    script.onerror = () => {
      toast.error('Không thể tải Google Sign-In');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [clientId, handleCredentialResponse, detectIncognito]);



  // OAuth2 popup flow (for incognito mode and account selection)
  const showOAuth2PopupFlow = useCallback(() => {
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      toast.error('Google Sign-In chưa sẵn sàng');
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile',
        prompt: 'select_account', // Force account selection
        callback: handleTokenResponse,
      });

      client.requestAccessToken();
    } catch {
      toast.error('Không thể hiển thị danh sách tài khoản Google');
    }
  }, [clientId, handleTokenResponse]);

  // One Tap flow (for normal mode)
  const showOneTapFlow = useCallback(() => {
    if (!window.google || !window.google.accounts) {
      toast.error('Google Sign-In chưa sẵn sàng');
      return;
    }

    try {
      // Disable auto-select to force account chooser
      window.google.accounts.id.disableAutoSelect();

      // Re-initialize with prompt settings
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: false,
      });

      // Try One Tap first, fallback to OAuth2 if fails
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // One Tap failed, use OAuth2 popup as fallback
          showOAuth2PopupFlow();
        }
      });
    } catch {
      // Fallback to OAuth2 popup
      showOAuth2PopupFlow();
    }
  }, [clientId, handleCredentialResponse, showOAuth2PopupFlow]);

  // Main sign-in handler with hybrid approach
  const handleManualSignIn = useCallback(() => {
    if (!isGoogleLoaded) {
      toast.error('Google Sign-In chưa sẵn sàng');
      return;
    }

    // Use different flow based on browser mode
    if (isIncognito === true) {
      // Incognito mode: Use OAuth2 popup flow
      showOAuth2PopupFlow();
    } else if (isIncognito === false) {
      // Normal mode: Use One Tap flow with OAuth2 fallback
      showOneTapFlow();
    } else {
      // Unknown mode: Try One Tap first, fallback to OAuth2
      showOneTapFlow();
    }
  }, [isIncognito, isGoogleLoaded, showOAuth2PopupFlow, showOneTapFlow]);

  if (!clientId || !isGoogleAuthEnabled) {
    return (
      <Button
        variant="outline"
        disabled
        className={`w-full ${className}`}
      >
        {!isGoogleAuthEnabled ? 'Google Sign-In not available' : 'Không thể đăng nhập bằng Google'}
      </Button>
    );
  }

  // Get button text based on mode
  const getButtonText = () => {
    if (!isGoogleLoaded) return 'Đang tải...';
    if (isIncognito === true) return 'Chọn tài khoản Google';
    if (isIncognito === false) return 'Đăng nhập Google';
    return 'Chọn tài khoản Google';
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Custom Google Sign-In Button to match QLDT button style */}
      <Button
        type="button"
        variant="outline"
        onClick={handleManualSignIn}
        disabled={disabled || !isGoogleLoaded}
        className="w-full h-12 text-sm font-medium border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
      >
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {getButtonText()}
      </Button>

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-gray-500">
          Mode: {isIncognito === null ? 'Detecting...' : isIncognito ? 'Incognito' : 'Normal'} |
          Google: {isGoogleLoaded ? 'Ready' : 'Loading...'}
        </div>
      )}
    </div>
  );
}
