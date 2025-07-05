import { useState, useEffect } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithCredential,
  User
} from "firebase/auth";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Separator } from "./ui/separator";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "register" | "phone";
}

export default function AuthModal({ open, onOpenChange, defaultTab = "login" }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register" | "phone">(defaultTab);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Close modal if authentication was successful
        onOpenChange(false);
        toast.success("Authentication successful");
      }
    });

    return () => unsubscribe();
  }, [onOpenChange]);

  useEffect(() => {
    // Reset phone verification state when the modal closes
    if (!open) {
      setCodeSent(false);
      setVerificationId("");
      setVerificationCode("");
      setPhoneNumber("");
    }
  }, [open]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      setError("");
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      resetForm();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError("");
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      resetForm();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setGoogleLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      resetForm();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      setError("Please enter a valid phone number");
      return;
    }

    try {
      setError("");
      setPhoneLoading(true);

      // Initialize reCAPTCHA
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': () => {
          // reCAPTCHA solved, allow sending verification code
        },
        'expired-callback': () => {
          setError("reCAPTCHA expired. Please solve it again.");
        }
      });

      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, window.recaptchaVerifier);
      
      // Save verification ID
      setVerificationId(confirmationResult.verificationId);
      setCodeSent(true);
      toast.success("Verification code sent!");
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      
      // Reset reCAPTCHA
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
      return;
    }

    try {
      setError("");
      setPhoneLoading(true);
      
      // Create credential with verification ID and code
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      
      // Sign in with credential
      await signInWithCredential(auth, credential);
      
      setCodeSent(false);
      setVerificationId("");
      setVerificationCode("");
      setPhoneNumber("");
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setPhoneLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>
            Sign in or create an account to continue
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register" | "phone")} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {/* Google Sign-In Button (only on login and register tabs) */}
          {activeTab !== "phone" && (
            <>
              <div className="my-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-gray-300 flex items-center justify-center space-x-2"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    "Connecting..."
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 1.66663C5.39999 1.66663 1.66666 5.39996 1.66666 9.99996C1.66666 14.6 5.39999 18.3333 10 18.3333C14.6 18.3333 18.3333 14.6 18.3333 9.99996C18.3333 5.39996 14.6 1.66663 10 1.66663ZM14.2 10.85C14.15 11.2 14.0833 11.5167 14 11.8333H9.16666V8.31663H13.6C13.65 8.63329 13.6833 8.94996 13.6833 9.28329C13.8 9.81663 14.0833 10.35 14.2 10.85ZM10.5 15.4C8.78333 15.4 7.28333 14.6333 6.33333 13.4833L8.35 11.8333L10.5 13.3167L12.6667 11.8333L14.6833 13.4833C13.7167 14.6333 12.2167 15.4 10.5 15.4ZM5.75 7.81663L7.76666 9.46663L5.75 11.1166L3.73333 9.46663L5.75 7.81663ZM10.5 4.59996C12.2333 4.59996 13.7333 5.36663 14.6833 6.51663L12.6667 8.16663L10.5 6.68329L8.33333 8.16663L6.31666 6.51663C7.28333 5.36663 8.78333 4.59996 10.5 4.59996ZM15.25 7.81663L17.2667 9.46663L15.25 11.1166L13.2333 9.46663L15.25 7.81663Z" fill="#4285F4"/>
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </Button>
              </div>
              
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            </>
          )}
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleSignUp} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="phone">
            {!codeSent ? (
              <form onSubmit={handleSendVerificationCode} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-number">Phone Number</Label>
                  <Input
                    id="phone-number"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for USA)</p>
                </div>
                
                {/* reCAPTCHA container */}
                <div id="recaptcha-container" className="flex justify-center my-4"></div>
                
                <Button type="submit" className="w-full" disabled={phoneLoading}>
                  {phoneLoading ? "Sending code..." : "Send Verification Code"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                  />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button type="submit" className="w-full" disabled={phoneLoading}>
                    {phoneLoading ? "Verifying..." : "Verify Code"}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setCodeSent(false)} 
                    className="text-sm"
                  >
                    Change Phone Number
                  </Button>
                </div>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 