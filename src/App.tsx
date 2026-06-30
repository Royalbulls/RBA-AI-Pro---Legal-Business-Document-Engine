import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Mail, 
  Settings, 
  HelpCircle, 
  Plus, 
  ClipboardList,
  Search, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  AlertTriangle, 
  ChevronRight,
  Menu,
  X,
  Loader2,
  Printer,
  Trash2,
  User as UserIcon,
  Calendar,
  Video,
  Clock,
  FileCheck,
  DollarSign,
  Bell,
  Activity,
  Bot,
  Folder,
  RefreshCw,
  TrendingUp,
  Share2,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  DocumentType, 
  DocumentParams, 
  DOCUMENT_FIELDS, 
  DOCUMENT_TOGGLES, 
  MultiOutput,
  Profile,
  GeneratedDocument,
  AGREEMENT_CATEGORIES
} from './types';
import { 
  generateDocument, 
  smartBundle, 
  autoSuggest, 
  validateDocument,
  generateMultiOutput,
  getSmartWarnings,
  askLegalAssistant
} from './services/gemini';
import { 
  fetchUpcomingEvents, 
  createCalendarEvent, 
  deleteCalendarEvent, 
  type CalendarEvent 
} from './services/googleCalendar';
import { 
  auth, 
  loginAnonymously, 
  loginWithGoogle, 
  logOutUser, 
  fetchUserProfiles, 
  fetchUserDocuments, 
  saveGeneratedDocToFirebase, 
  deleteDocumentFromFirebase,
  testConnection,
  getCachedToken,
  saveFormIntakeToFirebase,
  fetchUserFormIntakes,
  deleteFormIntakeFromFirebase
} from './services/firebase';
import { exportToGoogleDocs } from './services/googleDocs';
import { 
  createGoogleFormIntake, 
  getGoogleFormResponses, 
  FormIntake, 
  FormResponseSubmission 
} from './services/googleForms';
import { onAuthStateChanged, type User } from 'firebase/auth';
import ProfileManager from './components/ProfileManager';
import { PURPOSE_TEMPLATES, INDUSTRY_CATEGORIES, type IndustryCategory } from './data/purposeTemplates';
import { ChevronDown, FolderClosed, ExternalLink, Upload } from 'lucide-react'; // extra helper icons

// RBA AI PRO SaaS Modules and Metadata Presets
import { INITIAL_WORKSPACES, SUBSCRIPTION_PLANS, WORKSPACE_ROLE_PERMISSIONS, type TenantWorkspace, type TeamMember } from './components/SaaSData';
import AutomationBuilderModule from './components/AutomationBuilderModule';
import WhiteLabelModule from './components/WhiteLabelModule';
import GoogleWorkspaceModule from './components/GoogleWorkspaceModule';
import MarketplaceModule from './components/MarketplaceModule';
import PublisherOSModule from './components/PublisherOSModule';
import MarketingOSModule from './components/MarketingOSModule';
import FinanceOSModule from './components/FinanceOSModule';
import LoanOSModule from './components/LoanOSModule';
import BusinessOSModule from './components/BusinessOSModule';


const DOCUMENT_ICONS: any = {
  'NDA': <ShieldCheck className="w-4 h-4" />,
  'Client Onboarding Form': <ClipboardList className="w-4 h-4" />,
  '500 Plus Agreement': <Sparkles className="w-4 h-4 text-amber-500" />,
  'Founder Agreement': <Users className="w-4 h-4" />,
  'Shareholder Agreement': <Users className="w-4 h-4" />,
  'Employment Agreement': <Briefcase className="w-4 h-4" />,
  'Offer Letter': <Mail className="w-4 h-4" />,
  'Client Service Agreement': <FileText className="w-4 h-4" />,
  'Freelancer/Agent Agreement': <Briefcase className="w-4 h-4" />,
  'Referral Partner Agreement': <Users className="w-4 h-4" />,
  'Investor Pitch Legal Disclaimer': <ShieldCheck className="w-4 h-4" />,
  'Digital Marketing Compliance Policy': <FileText className="w-4 h-4" />,
  'Privacy Policy': <ShieldCheck className="w-4 h-4" />,
  'Website Terms & Conditions': <FileText className="w-4 h-4" />,
  'Pitch Deck': <Sparkles className="w-4 h-4" />,
  'Financial Model': <FileText className="w-4 h-4" />,
  'Application Letter': <Mail className="w-4 h-4" />,
};

export default function App() {
  const [selectedType, setSelectedType] = useState<DocumentType>('NDA');
  const [params, setParams] = useState<DocumentParams>({});
  
  // Auto-Save States
  const [savedDraft, setSavedDraft] = useState<{
    params: DocumentParams;
    selectedType: DocumentType;
    timestamp: number;
  } | null>(null);
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);

  const [generatedText, setGeneratedText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [suggestion, setSuggestion] = useState<string>('');
  const [validation, setValidation] = useState<string>('');
  const [smartWarnings, setSmartWarnings] = useState<string[]>([]);
  const [multiOutput, setMultiOutput] = useState<MultiOutput | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  const [isExportingToGoogle, setIsExportingToGoogle] = useState(false);

  // Print Preview Customization States
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printFontFamily, setPrintFontFamily] = useState<'font-serif' | 'font-sans' | 'font-mono'>('font-serif');
  const [printLineHeight, setPrintLineHeight] = useState<'leading-normal' | 'leading-relaxed' | 'leading-loose'>('leading-relaxed');
  const [printPaddingSize, setPrintPaddingSize] = useState<'p-6 sm:p-12' | 'p-10 sm:p-16' | 'p-4 sm:p-8'>('p-10 sm:p-16');
  const [printPageMargins, setPrintPageMargins] = useState<'Normal' | 'Narrow' | 'Legal'>('Normal');
  const [showDraftWatermark, setShowDraftWatermark] = useState(false);

  // Google Forms Brand Customizer States
  const [selectedFormThemeStyle, setSelectedFormThemeStyle] = useState<'royal-platinum' | 'classic-gold' | 'corporate-indigo' | 'custom-image'>('royal-platinum');
  const [customFormHeaderUri, setCustomFormHeaderUri] = useState('');
  const [customFormHeaderTitle, setCustomFormHeaderTitle] = useState('Client Intake Parameters & Assessment');
  const [customFormHeaderDesc, setCustomFormHeaderDesc] = useState('Pre-drafting checklist managed securely via Google Workspace.');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [smartIntent, setSmartIntent] = useState('');
  const [activeTab, setActiveTab] = useState<'crm' | 'generator' | 'bundle' | 'history' | 'profiles' | 'intake' | 'calendar' | 'kyc' | 'esign' | 'payments' | 'renewals' | 'ai_assistant'>('crm');
  const [history, setHistory] = useState<{id: string, type: string, title: string, date: string, text: string}[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryCategory>('SaaS & AI Technology');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'founder': true,
    'hr': true
  });

  // Google Calendar Integration states
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isFetchingCalendar, setIsFetchingCalendar] = useState(false);
  const [isBookingEvent, setIsBookingEvent] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [calendarSuccess, setCalendarSuccess] = useState<string | null>(null);

  // Calendar Booking Form States
  const [bookingSummary, setBookingSummary] = useState('');
  const [bookingDescription, setBookingDescription] = useState('');
  const [bookingStartDate, setBookingStartDate] = useState(new Date(Date.now() + 86400000).toISOString().substring(0, 10)); // default tomorrow
  const [bookingStartTime, setBookingStartTime] = useState('11:00');
  const [bookingDuration, setBookingDuration] = useState(30);
  const [bookingClientEmail, setBookingClientEmail] = useState('');
  const [bookingClientName, setBookingClientName] = useState('');
  const [bookingLocation, setBookingLocation] = useState('');
  const [bookingEnableMeet, setBookingEnableMeet] = useState(true);

  // Legal OS Multi-Module States
  const [kycRecords, setKycRecords] = useState<Record<string, { pan: string, aadhaar: string, gstin: string, status: 'unverified' | 'approved' | 'pending' | 'rejected', verifiedAt?: string }>>(() => {
    const saved = localStorage.getItem('rba_kyc');
    return saved ? JSON.parse(saved) : {
      'p1': { pan: 'AAACD1234F', aadhaar: '321456987412', gstin: '27AAACD1234F1Z1', status: 'approved', verifiedAt: '2026-06-15' },
      'p2': { pan: 'BKZPK9876Q', aadhaar: '895623124578', gstin: '07BKZPK9876Q2Z4', status: 'pending' },
    };
  });

  const [esignDocs, setEsignDocs] = useState<{ id: string, title: string, signeeName: string, signeeEmail: string, status: 'pending' | 'signed', signedAt?: string, method?: string }[]>(() => {
    const saved = localStorage.getItem('rba_esign');
    return saved ? JSON.parse(saved) : [
      { id: 'es-1', title: 'Mutual Non-Disclosure Agreement (Beta-Tech)', signeeName: 'Aman Sharma', signeeEmail: 'aman@betatech.in', status: 'signed', signedAt: '2026-06-28', method: 'Aadhaar e-Sign OTP' },
      { id: 'es-2', title: 'Founder Vesting Covenant', signeeName: 'Rohan Malhotra', signeeEmail: 'rohan@malhotralaw.com', status: 'pending' }
    ];
  });

  const [paymentInvoices, setPaymentInvoices] = useState<{ id: string, clientName: string, description: string, amount: number, stampDuty: number, status: 'unpaid' | 'paid', date: string }[]>(() => {
    const saved = localStorage.getItem('rba_payments');
    return saved ? JSON.parse(saved) : [
      { id: 'inv-101', clientName: 'Aman Sharma', description: 'Stamp Duty + Incorporation Advisory SLA', amount: 15000, stampDuty: 500, status: 'paid', date: '2026-06-15' },
      { id: 'inv-102', clientName: 'Rohan Malhotra', description: 'Omnibus Founder Advisory Retainer', amount: 45000, stampDuty: 1000, status: 'unpaid', date: '2026-06-25' }
    ];
  });

  const [renewalReminders, setRenewalReminders] = useState<{ id: string, title: string, clientName: string, expiryDate: string, alertDaysBefore: number, status: 'active' | 'expired' | 'renewed' }[]>(() => {
    const saved = localStorage.getItem('rba_renewals');
    return saved ? JSON.parse(saved) : [
      { id: 'rem-1', title: 'Lease Agreement Expiry', clientName: 'Aman Sharma', expiryDate: '2026-12-15', alertDaysBefore: 30, status: 'active' },
      { id: 'rem-2', title: 'Consultancy Retainer Renewal', clientName: 'Rohan Malhotra', expiryDate: '2026-08-31', alertDaysBefore: 15, status: 'active' }
    ];
  });

  const [aiChatHistory, setAiChatHistory] = useState<{ role: 'user' | 'model', text: string }[]>(() => {
    const saved = localStorage.getItem('rba_ai_chat');
    return saved ? JSON.parse(saved) : [
      { 
        role: 'model', 
        text: `राम राम! 🏛️ मैं हूँ **RBA Lawyer – Royal Bulls Advisory Legal AI**, और ये हैं मेरी खास विशेषताएं:\n\n---\n\n⚖️ **मेरी ताकत जो मुझे All-in-One Lawyer बनाती है:**\n\n1. **🌍 120+ भाषाएं** – हिंदी, अंग्रेज़ी, या कोई भी भाषा में बात करो, मैं समझूंगा\n\n2. **🗺️ 190+ देशों का कानून** – भारत हो, अमेरिका हो, या दुबई – हर जगह का कानून जानता हूँ\n\n3. **📄 Document Drafting** – Agreement, Contract, Notice – सब कुछ मैं draft कर सकता हूँ\n\n4. **🔍 अधिकारों की जानकारी** – आपके कानूनी हक़ क्या हैं, सरल भाषा में बताऊंगा\n\n5. **⏰ 24/7 उपलब्ध** – रात हो या दिन, मैं हमेशा हाज़िर हूँ\n\n6. **💰 बिल्कुल मुफ्त** – कोई फीस नहीं, कोई झंझट नहीं\n\n7. **🗣️ आम आदमी की भाषा** – कानूनी जटिल शब्दों को आसान भाषा में समझाता हूँ`
      }
    ];
  });
  const [aiChatQuery, setAiChatQuery] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [aiFocusMode, setAiFocusMode] = useState<string>('Auto-Detect');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedEntire, setCopiedEntire] = useState(false);
  const [sharedEntire, setSharedEntire] = useState(false);
  const [likedMessages, setLikedMessages] = useState<Record<number, 'like' | 'dislike'>>({});

  // Multi-Tenant SaaS Workspace, Subscription & Role States
  const [workspaces, setWorkspaces] = useState<TenantWorkspace[]>(INITIAL_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('workspace_rba');
  const [activeWorkspaceRole, setActiveWorkspaceRole] = useState<'Super Admin' | 'Workspace Owner' | 'Admin' | 'Manager' | 'Staff' | 'Client' | 'Guest'>('Workspace Owner');
  
  // Primary Operating System Module (switches between sub-OS views)
  const [activeOsModule, setActiveOsModule] = useState<'legal_os' | 'business_os' | 'publisher_os' | 'marketing_os' | 'finance_os' | 'loan_os' | 'automation_os' | 'marketplace_os' | 'saas_admin'>('legal_os');

  const currentWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  const handleUpdateBranding = (branding: { name: string; domain: string; emailTemplate: string; colors: { primary: string; accent: string; bg: string } }) => {
    setWorkspaces(prev => prev.map(w => w.id === activeWorkspaceId ? {
      ...w,
      name: branding.name,
      domain: branding.domain,
      emailTemplate: branding.emailTemplate,
      colors: branding.colors
    } : w));
  };

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('rba_kyc', JSON.stringify(kycRecords));
  }, [kycRecords]);

  useEffect(() => {
    localStorage.setItem('rba_esign', JSON.stringify(esignDocs));
  }, [esignDocs]);

  useEffect(() => {
    localStorage.setItem('rba_payments', JSON.stringify(paymentInvoices));
  }, [paymentInvoices]);

  useEffect(() => {
    localStorage.setItem('rba_renewals', JSON.stringify(renewalReminders));
  }, [renewalReminders]);

  useEffect(() => {
    localStorage.setItem('rba_ai_chat', JSON.stringify(aiChatHistory));
  }, [aiChatHistory]);

  // Load saved Agreement Generator draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('rba_agreement_draft');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.params && Object.keys(parsed.params).length > 0) {
          const hasData = Object.values(parsed.params).some(val => val !== undefined && val !== null && val !== '');
          if (hasData) {
            setSavedDraft(parsed);
            setShowRestoreBanner(true);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load saved draft from localStorage", err);
    }
  }, []);

  // Periodic auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (params && Object.keys(params).length > 0) {
        const hasData = Object.values(params).some(val => val !== undefined && val !== null && val !== '');
        if (hasData) {
          try {
            const draft = {
              params,
              selectedType,
              timestamp: Date.now()
            };
            localStorage.setItem('rba_agreement_draft', JSON.stringify(draft));
            setLastSavedTime(Date.now());
          } catch (err) {
            console.error("Failed to auto-save to localStorage", err);
          }
        }
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [params, selectedType]);

  // Legal OS UI parameters/form states
  const [kycProfileId, setKycProfileId] = useState('p1');
  const [kycPan, setKycPan] = useState('');
  const [kycAadhaar, setKycAadhaar] = useState('');
  const [kycGstin, setKycGstin] = useState('');
  const [isKycVerifying, setIsKycVerifying] = useState(false);
  const [selectedKycRecordKey, setSelectedKycRecordKey] = useState<string | null>('p1');

  const [esignDocId, setEsignDocId] = useState('');
  const [esignSigneeName, setEsignSigneeName] = useState('');
  const [esignSigneeEmail, setEsignSigneeEmail] = useState('');
  const [esignMethod, setEsignMethod] = useState<'draw' | 'type' | 'aadhaar'>('draw');
  const [esignTypedName, setEsignTypedName] = useState('');
  const [esignOtpSent, setEsignOtpSent] = useState(false);
  const [esignOtpValue, setEsignOtpValue] = useState('');
  const [esignVerifyingOtp, setEsignVerifyingOtp] = useState(false);
  const [selectedEsignDocId, setSelectedEsignDocId] = useState<string | null>('es-1');

  const [paymentClientName, setPaymentClientName] = useState('');
  const [paymentDesc, setPaymentDesc] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(5000);
  const [paymentStampDuty, setPaymentStampDuty] = useState(100);
  const [paymentStampState, setPaymentStampState] = useState('Delhi');
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>('inv-101');

  const [renewalDocTitle, setRenewalDocTitle] = useState('');
  const [renewalClientName, setRenewalClientName] = useState('');
  const [renewalExpiryDate, setRenewalExpiryDate] = useState('');
  const [renewalAlertDays, setRenewalAlertDays] = useState(30);
  const [isCreatingRenewal, setIsCreatingRenewal] = useState(false);
  const [isSyncingToGoogleCalendar, setIsSyncingToGoogleCalendar] = useState(false);
  
  // Firebase integrated states
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [dbDocuments, setDbDocuments] = useState<GeneratedDocument[]>([]);
  const [intakeForms, setIntakeForms] = useState<FormIntake[]>([]);
  const [activeIntakeResponses, setActiveIntakeResponses] = useState<FormResponseSubmission[]>([]);
  const [selectedFormForResponses, setSelectedFormForResponses] = useState<FormIntake | null>(null);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [isFetchingResponses, setIsFetchingResponses] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [showUploadGuide, setShowUploadGuide] = useState(true);

  // Authentication states
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      const msg = err?.message || String(err);
      setAuthError(msg);
      alert(`Google Authentication Note:\n\n${msg}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    // Check Firestore connection
    testConnection();

    // Listen to Auth stage
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await loadUserData(user.uid);
      } else {
        setCurrentUser(null);
        // Load offline guest profiles and documents immediately
        await loadUserData();

        // Optionally attempt anonymous sign-in if enabled, logging a peaceful warning if restricted
        try {
          await loginAnonymously();
        } catch (err) {
          console.info("Info: Firebase anonymous authentication is disabled on this environment. Operating in Local Guest Workspace mode.");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (uid?: string) => {
    try {
      const userProfiles = await fetchUserProfiles();
      setProfiles(userProfiles || []);
      const userDocs = await fetchUserDocuments();
      setDbDocuments(userDocs || []);
      const userForms = await fetchUserFormIntakes();
      setIntakeForms(userForms || []);
    } catch (err) {
      console.error("Error loading profiles and documents:", err);
    }
  };

  const handleLoadCalendar = async () => {
    const token = getCachedToken();
    if (!token) {
      setCalendarError("No Google Auth token detected. Please sign in with Google or reconnect to access your Calendar.");
      return;
    }
    setIsFetchingCalendar(true);
    setCalendarError(null);
    try {
      const events = await fetchUpcomingEvents(token);
      setCalendarEvents(events);
    } catch (err: any) {
      console.error(err);
      setCalendarError(err.message || "Failed to load Google Calendar events.");
    } finally {
      setIsFetchingCalendar(false);
    }
  };

  const handleBookEvent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const token = getCachedToken();
    if (!token) {
      setCalendarError("Please sign in with Google to book a meeting on Google Calendar.");
      return;
    }
    if (!bookingSummary.trim()) {
      setCalendarError("Meeting title is required.");
      return;
    }

    setIsBookingEvent(true);
    setCalendarError(null);
    setCalendarSuccess(null);

    try {
      // Calculate start and end ISO strings
      const startDateTimeStr = `${bookingStartDate}T${bookingStartTime}:00`;
      const startObj = new Date(startDateTimeStr);
      const endObj = new Date(startObj.getTime() + bookingDuration * 60 * 1000);

      const created = await createCalendarEvent(token, {
        summary: bookingSummary,
        description: bookingDescription,
        startDateTime: startObj.toISOString(),
        endDateTime: endObj.toISOString(),
        clientEmail: bookingClientEmail,
        clientName: bookingClientName,
        location: bookingLocation,
        enableMeet: bookingEnableMeet,
      });

      setCalendarSuccess(`Successfully scheduled "${created.summary}" on Google Calendar!`);
      // Reset form options
      setBookingSummary('');
      setBookingDescription('');
      setBookingClientEmail('');
      setBookingClientName('');
      setBookingLocation('');
      
      // Refresh calendar events
      await handleLoadCalendar();
    } catch (err: any) {
      console.error(err);
      setCalendarError(err?.message || "Failed to schedule Google Calendar event.");
    } finally {
      setIsBookingEvent(false);
    }
  };

  const handleCancelEvent = async (eventId: string, summary: string) => {
    // Explicit user confirmation before deleting/cancelling meeting as required!
    const confirmed = window.confirm(
      `Are you sure you want to cancel and delete the meeting "${summary}" from your Google Calendar? This will remove the event for all invited attendees.`
    );
    if (!confirmed) return;

    const token = getCachedToken();
    if (!token) {
      setCalendarError("Please sign in with Google to cancel events.");
      return;
    }

    setCalendarError(null);
    setCalendarSuccess(null);
    try {
      await deleteCalendarEvent(token, eventId);
      setCalendarSuccess(`Successfully cancelled "${summary}".`);
      await handleLoadCalendar();
    } catch (err: any) {
      console.error(err);
      setCalendarError(err?.message || "Failed to cancel Google Calendar event.");
    }
  };

  useEffect(() => {
    if (activeTab === 'calendar' && currentUser && !currentUser.isAnonymous) {
      handleLoadCalendar();
    }
  }, [activeTab, currentUser]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('rba_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const applyProfile = (profile: Profile, role: '1st' | '2nd') => {
    setParams(prev => {
      const updated = { ...prev };
      
      if (role === '1st') {
        // Map 1st party details
        if (selectedType === 'NDA') {
          updated.client_name = profile.name;
          if (profile.address) updated.address = profile.address;
          if (profile.jurisdiction) updated.jurisdiction = profile.jurisdiction;
        } else if (selectedType === 'Founder Agreement') {
          updated.founder_names = prev.founder_names 
            ? `${prev.founder_names}, ${profile.name}` 
            : profile.name;
        } else if (selectedType === 'Shareholder Agreement') {
          updated.business_name = profile.name;
        } else if (selectedType === 'Employment Agreement') {
          updated.business_name = profile.name;
          updated.location = profile.address || '';
        } else if (selectedType === 'Client Onboarding Form') {
          updated.business_name = profile.name;
          if (profile.authorizedSignatory) updated.client_name = profile.authorizedSignatory;
        } else if (selectedType === 'Client Service Agreement' || selectedType === 'Freelancer/Agent Agreement' || selectedType === 'Referral Partner Agreement' || selectedType === '500 Plus Agreement') {
          updated.client_name = profile.name;
        } else if (selectedType === 'Privacy Policy' || selectedType === 'Pitch Deck' || selectedType === 'Financial Model' || selectedType === 'Investor Pitch Legal Disclaimer' || selectedType === 'Digital Marketing Compliance Policy') {
          updated.business_name = profile.name;
        } else if (selectedType === 'Website Terms & Conditions') {
          updated.platform = profile.name;
        } else if (selectedType === 'Application Letter') {
          updated.client_name = profile.name;
        }
      } else {
        // Map 2nd party details
        if (selectedType === 'NDA') {
          updated.other_party = profile.name;
        } else if (selectedType === 'Employment Agreement') {
          updated.employee_name = profile.name;
        } else if (selectedType === 'Offer Letter') {
          updated.candidate_name = profile.name;
        } else if (selectedType === 'Client Service Agreement' || selectedType === 'Freelancer/Agent Agreement' || selectedType === 'Referral Partner Agreement' || selectedType === '500 Plus Agreement') {
          updated.other_party = profile.name;
        }
      }
      
      // Auto-fill address, jurisdiction, or regNumber if applicable
      if (profile.address) {
        updated.address = profile.address;
      }
      if (profile.jurisdiction) {
        updated.jurisdiction = profile.jurisdiction;
      }
      if (profile.authorizedSignatory) {
        updated.signatory_name = profile.authorizedSignatory;
        updated.authorized_signatory = profile.authorizedSignatory;
      }
      if (profile.regNumber) {
        updated.registration_number = profile.regNumber;
        updated.cin_or_reg = profile.regNumber;
      }
      
      return updated;
    });
  };

  const saveToHistory = (text: string, type: string, title: string) => {
    const newItem = {
      id: Date.now().toString(),
      type,
      title,
      date: new Date().toLocaleString(),
      text
    };
    const newHistory = [newItem, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('rba_history', JSON.stringify(newHistory));
  };


  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedText('');
    setValidation('');
    setSmartWarnings([]);
    setMultiOutput(null);
    try {
      const result = await generateDocument(selectedType, params);
      setGeneratedText(result);
      
      const title = params.business_name || params.client_name || params.employee_name || params.candidate_name || selectedType;
      saveToHistory(result, selectedType, title);
      
      // Parallel calls for extra features
      const [suggestResult, warningsResult, multiResult, validationResult] = await Promise.all([
        autoSuggest(selectedType, params),
        getSmartWarnings(selectedType, params),
        generateMultiOutput(result),
        validateDocument(selectedType, result)
      ]);
      
      setSuggestion(suggestResult);
      setSmartWarnings(warningsResult);
      setMultiOutput(multiResult);
      setValidation(validationResult);

      // Save document to Firestore database
      if (auth.currentUser) {
        const docId = 'doc_' + Date.now().toString(36);
        await saveGeneratedDocToFirebase({
          id: docId,
          type: selectedType,
          title: title,
          params: params,
          content: result,
          emailDraft: multiResult?.email_draft || '',
          whatsappSummary: multiResult?.whatsapp_summary || '',
        });
        // Reload docs list
        await loadUserData(auth.currentUser.uid);
      }
    } catch (error) {
      console.error(error);
      setGeneratedText('Error generating document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSmartBundle = async () => {
    if (!smartIntent) return;
    setIsGenerating(true);
    setGeneratedText('');
    try {
      const result = await smartBundle(smartIntent);
      setGeneratedText(result);
      
      const title = smartIntent.slice(0, 30) + '...';
      saveToHistory(result, 'Bundle', title);

      // Save generated bundle to Firestore
      if (auth.currentUser) {
        const docId = 'doc_' + Date.now().toString(36);
        await saveGeneratedDocToFirebase({
          id: docId,
          type: 'Bundle',
          title: title,
          params: { special_notes: smartIntent },
          content: result,
        });
        // Reload docs list
        await loadUserData(auth.currentUser.uid);
      }
    } catch (error) {
      console.error(error);
      setGeneratedText('Error generating bundle. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };


  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const handleGoogleDocsExport = async () => {
    if (!generatedText) return;
    setIsExportingToGoogle(true);
    try {
      let token = getCachedToken();
      if (!token) {
        // Prompt for Google account link/auth
        const confirmed = window.confirm("Exporting directly to Google Docs requires Google Workspace authorization. Would you like to connect and authorize your Google Account now?");
        if (!confirmed) {
          setIsExportingToGoogle(false);
          return;
        }
        await loginWithGoogle();
        token = getCachedToken();
        if (!token) {
          throw new Error("Could not acquire Google access token. Please try again.");
        }
      }

      const docTitle = `${selectedType} - ${params.business_name || params.client_name || 'Draft'}`;
      const result = await exportToGoogleDocs(docTitle, generatedText, token);
      
      const openIt = window.confirm(`Contract successfully exported to your Google Docs!\n\nDocument Title: "${docTitle}"\nWould you like to open it in a new tab to edit or format / download now?`);
      if (openIt) {
        window.open(result.alternateLink, '_blank');
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to export to Google Docs: " + (err?.message || String(err)));
    } finally {
      setIsExportingToGoogle(false);
    }
  };

  const exportAnyTextToGoogleDocs = async (title: string, text: string) => {
    if (!text) return;
    try {
      let token = getCachedToken();
      if (!token) {
        const confirmed = window.confirm("Exporting directly to Google Docs requires Google Workspace authorization. Would you like to connect and authorize your Google Account now?");
        if (!confirmed) {
          return;
        }
        await loginWithGoogle();
        token = getCachedToken();
        if (!token) {
          throw new Error("Could not acquire Google access token. Please try again.");
        }
      }

      const result = await exportToGoogleDocs(title, text, token);
      
      const openIt = window.confirm(`Draft successfully exported to your Google Docs!\n\nDocument Title: "${title}"\nWould you like to open it in a new tab now?`);
      if (openIt) {
        window.open(result.alternateLink, '_blank');
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to export to Google Docs: " + (err?.message || String(err)));
    }
  };

  const handleCreateIntakeForm = async () => {
    setIsCreatingForm(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      let token = getCachedToken();
      if (!token) {
        const confirmed = window.confirm("Creating Google Forms requires Google Workspace authorization. Would you like to connect and authorize your Google Account now?");
        if (!confirmed) {
          setIsCreatingForm(false);
          return;
        }
        await loginWithGoogle();
        token = getCachedToken();
        if (!token) {
          throw new Error("Could not acquire Google access token. Please try again.");
        }
      }

      const fields = DOCUMENT_FIELDS[selectedType] || [];
      if (fields.length === 0) {
        throw new Error(`The selected contract type (${selectedType}) does not have custom questionnaire fields.`);
      }

      // Determine brand header style image URL to inject as an item
      let headerImageUri = "";
      if (selectedFormThemeStyle === 'royal-platinum') {
        headerImageUri = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80";
      } else if (selectedFormThemeStyle === 'classic-gold') {
        headerImageUri = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80";
      } else if (selectedFormThemeStyle === 'corporate-indigo') {
        headerImageUri = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80";
      } else {
        headerImageUri = customFormHeaderUri.trim() || "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80";
      }

      const brandOption = {
        headerImageUri,
        headerTitle: customFormHeaderTitle.trim() || undefined,
        headerDescription: customFormHeaderDesc.trim() || undefined,
        themeStyle: selectedFormThemeStyle
      };

      const formIntakeObj = await createGoogleFormIntake(selectedType, fields, token, brandOption);
      await saveFormIntakeToFirebase(formIntakeObj);
      setIntakeForms(prev => [formIntakeObj, ...prev]);

      setFormSuccess(`Google Form successfully created: "${formIntakeObj.title}"`);
      const switchTab = window.confirm(
        `Intake Google Form created successfully!\n\n` +
        `Title: "${formIntakeObj.title}"\n` +
        `Public Responder Link: ${formIntakeObj.responderUri}\n\n` +
        `Would you like to head over to the 'Google Forms' tab to manage your active forms and process responses?`
      );
      if (switchTab) {
        setActiveTab('intake');
      }
    } catch (err: any) {
      console.error("Failed to create Google Form intake:", err);
      setFormError(err.message || "An error occurred while creating the Google Form.");
      alert(`Failed to create Google Form intake: ${err.message || String(err)}`);
    } finally {
      setIsCreatingForm(false);
    }
  };

  const handleCreateOnboardingIntakeForm = async () => {
    setIsCreatingForm(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      let token = getCachedToken();
      if (!token) {
        const confirmed = window.confirm("Creating Google Forms requires Google Workspace authorization. Would you like to connect and authorize your Google Account now?");
        if (!confirmed) {
          setIsCreatingForm(false);
          return;
        }
        await loginWithGoogle();
        token = getCachedToken();
        if (!token) {
          throw new Error("Could not acquire Google access token. Please try again.");
        }
      }

      const onboardingType: DocumentType = 'Client Onboarding Form';
      const fields = DOCUMENT_FIELDS[onboardingType] || [];
      if (fields.length === 0) {
        throw new Error(`The onboarding form template does not have custom fields configured.`);
      }

      let headerImageUri = "";
      if (selectedFormThemeStyle === 'royal-platinum') {
        headerImageUri = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80";
      } else if (selectedFormThemeStyle === 'classic-gold') {
        headerImageUri = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80";
      } else if (selectedFormThemeStyle === 'corporate-indigo') {
        headerImageUri = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80";
      } else {
        headerImageUri = customFormHeaderUri.trim() || "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80";
      }

      const brandOption = {
        headerImageUri,
        headerTitle: customFormHeaderTitle.trim() || "Client Onboarding & Intake Portal",
        headerDescription: customFormHeaderDesc.trim() || "Corporate legal intake & background standards check.",
        themeStyle: selectedFormThemeStyle
      };

      const formIntakeObj = await createGoogleFormIntake(onboardingType, fields, token, brandOption);
      await saveFormIntakeToFirebase(formIntakeObj);
      setIntakeForms(prev => [formIntakeObj, ...prev]);

      setFormSuccess(`Google Client Onboarding Form created successfully: "${formIntakeObj.title}"`);
    } catch (err: any) {
      console.error("Failed to create Client Onboarding Intake Form:", err);
      setFormError(err.message || "An error occurred while creating the onboarding form.");
    } finally {
      setIsCreatingForm(false);
    }
  };

  const handleFetchFormResponses = async (form: FormIntake) => {
    setIsFetchingResponses(true);
    setFormError(null);
    setFormSuccess(null);
    setSelectedFormForResponses(form);
    try {
      let token = getCachedToken();
      if (!token) {
        const confirmed = window.confirm("Fetching Google Form responses requires Google Workspace authorization. Would you like to connect and authorize your Google Account now?");
        if (!confirmed) {
          setIsFetchingResponses(false);
          return;
        }
        await loginWithGoogle();
        token = getCachedToken();
        if (!token) {
          throw new Error("Could not acquire Google access token. Please try again.");
        }
      }

      const responsesList = await getGoogleFormResponses(form.formId, form.fieldMappings, token);
      setActiveIntakeResponses(responsesList);
      
      if (responsesList.length === 0) {
        setFormSuccess("Form successfully checked! Currently, there are 0 submissions.");
      } else {
        setFormSuccess(`Fetched ${responsesList.length} response submission(s) successfully!`);
      }
    } catch (err: any) {
      console.error("Failed to fetch Google Form responses:", err);
      setFormError(err.message || "An error occurred while retrieving form responses.");
      alert(`Failed to fetch responses: ${err.message || String(err)}`);
    } finally {
      setIsFetchingResponses(false);
    }
  };

  const handleDeleteFormIntake = async (formId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this Google Form from your RBA AI Pro list? (Note: The actual Form in Google Drive will remain unaffected, only the app integration reference is deleted).");
    if (!confirmed) return;

    try {
      await deleteFormIntakeFromFirebase(formId);
      setIntakeForms(prev => prev.filter(f => f.formId !== formId));
      if (selectedFormForResponses?.formId === formId) {
        setSelectedFormForResponses(null);
        setActiveIntakeResponses([]);
      }
      setFormSuccess("Google Form deleted from your database successfully.");
    } catch (err: any) {
      console.error("Failed to delete Google Form reference:", err);
      alert("Failed to delete form: " + (err.message || String(err)));
    }
  };

  const handleApplyResponseAnswers = (formType: string, answers: { [key: string]: any }) => {
    const isConfirmed = window.confirm(
      `Apply this submission's responses?\n` +
      `This will auto-fill your parameters for the "${formType}" contract drafting section. Any existing parameter values will be overwritten.`
    );
    if (!isConfirmed) return;

    setSelectedType(formType as any);
    
    const updatedParams = { ...params } as any;
    Object.entries(answers).forEach(([k, v]) => {
      if (v !== undefined) {
        updatedParams[k] = v;
      }
    });

    setParams(updatedParams as DocumentParams);
    setActiveTab('generator');
    setMobileView('edit');

    setFormSuccess(`Responses applied successfully! You are now viewing the parameters for: ${formType}.`);
  };

  const downloadAsText = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${selectedType.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const clearForm = () => {
    setParams({});
    setGeneratedText('');
    setSuggestion('');
    setValidation('');
    localStorage.removeItem('rba_agreement_draft');
    setSavedDraft(null);
    setShowRestoreBanner(false);
  };

  const restoreDraft = () => {
    if (savedDraft) {
      setParams(savedDraft.params);
      setSelectedType(savedDraft.selectedType);
      setShowRestoreBanner(false);
      setSavedDraft(null);
    }
  };

  const dismissDraft = () => {
    localStorage.removeItem('rba_agreement_draft');
    setSavedDraft(null);
    setShowRestoreBanner(false);
  };

  const handleValidate = async () => {
    if (!generatedText) return;
    setIsGenerating(true);
    try {
      const result = await validateDocument(selectedType, generatedText);
      setValidation(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleParamChange = (key: keyof DocumentParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans overflow-hidden relative">
      {/* Sidebar Backdrop on Mobile */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black z-30"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isMobile ? 280 : (isSidebarOpen ? 280 : 0),
          x: isMobile ? (isSidebarOpen ? 0 : -280) : 0,
          opacity: isSidebarOpen ? 1 : 0 
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`${isMobile ? 'fixed inset-y-0 left-0 z-40 w-[280px] shadow-2xl' : 'relative border-r border-[#E5E5E5]'} bg-white flex flex-col h-full overflow-hidden`}
      >
        <div className="p-4 border-b border-[#E5E5E5] flex flex-col gap-2 bg-slate-50/50">
          <div className="flex items-center justify-between">
            {/* Workspace Switcher Dropdown */}
            <div className="relative flex-1 group">
              <select
                value={activeWorkspaceId}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__new__') {
                    const newName = prompt("Enter Name of New Corporate Workspace:");
                    if (newName) {
                      const newId = `ws_${Date.now()}`;
                      const newWs: TenantWorkspace = {
                        id: newId,
                        name: newName,
                        logo: "🏢 " + newName.substring(0, 3).toUpperCase(),
                        plan: 'Starter',
                        colors: { primary: '#0F172A', accent: '#06B6D4', bg: '#F8FAFC' },
                        domain: `${newName.toLowerCase().replace(/[^a-z0-9]/g, '')}.rba.ai`,
                        emailTemplate: 'Dear {client_name},\n\nBest regards,\n' + newName,
                        departments: ['Administration'],
                        teamMembers: [{ id: `tm_${Date.now()}`, name: 'New Owner', email: 'owner@' + newName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com', role: 'Workspace Owner', department: 'Administration', status: 'Active' }],
                        usage: { tokens: 0, tokensLimit: 10000, esign: 0, esignLimit: 5, invoices: 0, invoicesLimit: 5, bandwidth: '0 GB / 1 GB' },
                        apiKeys: [],
                        webhooks: []
                      };
                      setWorkspaces(prev => [...prev, newWs]);
                      setActiveWorkspaceId(newId);
                    }
                  } else {
                    setActiveWorkspaceId(val);
                  }
                }}
                className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs font-bold text-[#1A1A1A] pr-8 focus:outline-none focus:ring-1 focus:ring-gray-950 appearance-none cursor-pointer shadow-sm"
                style={{ borderLeftWidth: '4px', borderLeftColor: currentWorkspace.colors.accent }}
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.logo} {ws.name} ({ws.plan})
                  </option>
                ))}
                <option value="__new__">➕ Create New Workspace...</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-500">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden ml-2 shrink-0 p-1 bg-white rounded border">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick stats & White label domain indicator */}
          <div className="flex items-center justify-between text-[10px] text-gray-500 px-1">
            <span className="font-semibold flex items-center gap-1 overflow-hidden truncate max-w-[170px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="truncate">{currentWorkspace.domain}</span>
            </span>
            <span className="bg-gray-200 text-gray-800 font-extrabold px-1.5 py-0.2 rounded text-[8px] font-mono tracking-tight uppercase shrink-0">
              {currentWorkspace.plan}
            </span>
          </div>
        </div>

        {/* ACTIVE BUSINESS OS MODULE SELECTOR */}
        <div className="px-4 py-3.5 bg-gray-50/70 border-b border-[#E5E5E5] space-y-2 shrink-0">
          <label className="block text-[9px] font-extrabold text-[#9E9E9E] uppercase tracking-widest px-1">Active Business OS Module</label>
          <div className="relative">
            <select
              value={activeOsModule}
              onChange={(e) => {
                const val = e.target.value as any;
                setActiveOsModule(val);
                // Auto route default tab based on selection
                if (val === 'legal_os') {
                  setActiveTab('crm');
                }
              }}
              className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs font-bold text-[#1A1A1A] pr-8 focus:outline-none focus:ring-1 focus:ring-gray-950 appearance-none cursor-pointer shadow-sm"
              style={{ borderLeftWidth: '4px', borderLeftColor: currentWorkspace.colors.accent }}
            >
              <option value="legal_os">🏛️ Legal OS & AI Chat</option>
              <option value="business_os">💼 Business OS & Team</option>
              <option value="publisher_os">📚 Publisher OS</option>
              <option value="marketing_os">📣 Marketing OS (Ad Copy)</option>
              <option value="finance_os">💰 Finance OS (GST Ledgers)</option>
              <option value="loan_os">🏦 Loan OS (DSA CRM)</option>
              <option value="automation_os">⚙️ Automations & Google Sync</option>
              <option value="marketplace_os">🛒 Extensions Marketplace</option>
              <option value="saas_admin">🛠️ SaaS Workspace Settings</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-500">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {activeOsModule === 'legal_os' ? (
            <>
              {/* GROUP 1: Core OS Hub */}
              <div>
                <p className="text-[9px] font-extrabold text-[#9E9E9E] uppercase tracking-widest mb-2 px-2">Core OS Hub</p>
                <div className="space-y-0.5">
                  <button 
                    onClick={() => setActiveTab('crm')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'crm' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-[#5F5F5F] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Activity className={`w-4 h-4 ${activeTab === 'crm' ? 'text-rose-400 animate-pulse' : 'text-rose-500'}`} />
                      <span>CRM Dashboard</span>
                    </div>
                    <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.5 rounded font-mono font-bold scale-90">LIVE</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('generator')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'generator' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-[#5F5F5F] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]'}`}
                  >
                    <FileText className={`w-4 h-4 ${activeTab === 'generator' ? 'text-blue-400' : 'text-blue-500'}`} />
                    <span>Agreement Generator</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('bundle')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'bundle' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-[#5F5F5F] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]'}`}
                  >
                    <Search className={`w-4 h-4 ${activeTab === 'bundle' ? 'text-purple-400' : 'text-purple-500'}`} />
                    <span>Smart Bundle Suite</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-[#5F5F5F] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]'}`}
                  >
                    <Folder className={`w-4 h-4 ${activeTab === 'history' ? 'text-amber-400' : 'text-amber-500'}`} />
                    <span>Document Vault</span>
                  </button>
                </div>
              </div>

              {/* GROUP 2: Compliance & Operations */}
              <div>
                <p className="text-[9px] font-extrabold text-[#9E9E9E] uppercase tracking-widest mb-2 px-2">Compliance & Ops</p>
                <div className="space-y-0.5">
                  <button 
                    onClick={() => setActiveTab('kyc')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'kyc' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-[#5F5F5F] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className={`w-4 h-4 ${activeTab === 'kyc' ? 'text-emerald-400' : 'text-emerald-500'}`} />
                      <span>KYC Manager</span>
                    </div>
                    {Object.values(kycRecords).filter(r => r.status === 'pending').length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
                    )}
                  </button>
                  <button 
                    onClick={() => setActiveTab('esign')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'esign' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-[#5F5F5F] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheck className={`w-4 h-4 ${activeTab === 'esign' ? 'text-indigo-400' : 'text-indigo-500'}`} />
                      <span>E-Sign Portal</span>
                    </div>
                    {esignDocs.filter(d => d.status === 'pending').length > 0 && (
                      <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1 py-0.2 rounded font-mono font-bold scale-90">
                        {esignDocs.filter(d => d.status === 'pending').length}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={() => setActiveTab('payments')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'payments' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-[#5F5F5F] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <DollarSign className={`w-4 h-4 ${activeTab === 'payments' ? 'text-amber-400' : 'text-amber-500'}`} />
                      <span>Payment Tracker</span>
                    </div>
                    {paymentInvoices.filter(i => i.status === 'unpaid').length > 0 && (
                      <span className="text-[9px] bg-red-100 text-red-700 px-1 py-0.2 rounded font-mono font-bold scale-90">
                        INR
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={() => setActiveTab('renewals')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'renewals' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-[#5F5F5F] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Bell className={`w-4 h-4 ${activeTab === 'renewals' ? 'text-red-400' : 'text-red-500'}`} />
                      <span>Renewal Reminders</span>
                    </div>
                    <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-mono font-bold scale-90">
                      {renewalReminders.filter(r => r.status === 'active').length}
                    </span>
                  </button>
                </div>
              </div>

              {/* GROUP 3: Intelligence & Sync */}
              <div>
                <p className="text-[9px] font-extrabold text-[#9E9E9E] uppercase tracking-widest mb-2 px-2">Intelligence & Sync</p>
                <div className="space-y-0.5">
                  <button 
                    onClick={() => setActiveTab('ai_assistant')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'ai_assistant' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-[#5F5F5F] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]'}`}
                  >
                    <Bot className={`w-4 h-4 ${activeTab === 'ai_assistant' ? 'text-cyan-400 animate-bounce' : 'text-cyan-500'}`} />
                    <span>AI Legal Assistant</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('intake')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'intake' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-[#5F5F5F] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]'}`}
                  >
                    <ClipboardList className={`w-4 h-4 ${activeTab === 'intake' ? 'text-teal-400' : 'text-teal-500'}`} />
                    <span>Forms Intake Node</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('calendar')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'calendar' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-[#5F5F5F] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]'}`}
                  >
                    <Calendar className={`w-4 h-4 ${activeTab === 'calendar' ? 'text-emerald-400 animate-pulse' : 'text-emerald-500'}`} />
                    <span>Consultation Scheduler</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('profiles')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'profiles' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-[#5F5F5F] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]'}`}
                  >
                    <Users className={`w-4 h-4 ${activeTab === 'profiles' ? 'text-blue-400' : 'text-blue-500'}`} />
                    <span>Manage Profiles</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <p className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">Active Workspace</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{currentWorkspace.logo}</span>
                  <div>
                    <h4 className="font-bold text-xs text-gray-900">{currentWorkspace.name}</h4>
                    <p className="text-[9px] text-[#9E9E9E] font-mono">{currentWorkspace.domain}</p>
                  </div>
                </div>
                <div className="pt-2 border-t flex justify-between items-center text-[10px] text-gray-550 font-bold">
                  <span>Role: {activeWorkspaceRole}</span>
                  <span className="text-emerald-600 uppercase font-mono">{currentWorkspace.plan}</span>
                </div>
              </div>

              {/* Module Feature list */}
              <div className="space-y-2">
                <p className="text-[9px] font-extrabold text-[#9E9E9E] uppercase tracking-widest mb-1.5 px-2">Sub-OS Modules Included</p>
                
                {activeOsModule === 'business_os' && (
                  <div className="space-y-2 text-xs font-bold text-gray-700 px-2 font-mono">
                    <p className="flex items-center gap-2">🟢 Team Directory Hub</p>
                    <p className="flex items-center gap-2">🟢 Department Allocator</p>
                    <p className="flex items-center gap-2">🟢 Operational Kanban Tasks</p>
                  </div>
                )}
                {activeOsModule === 'publisher_os' && (
                  <div className="space-y-2 text-xs font-bold text-gray-700 px-2 font-mono">
                    <p className="flex items-center gap-2">📚 AI Book Drafting Studio</p>
                    <p className="flex items-center gap-2">🎙️ Podcast Episode Planner</p>
                    <p className="flex items-center gap-2">🎵 Sound & Music Registry</p>
                  </div>
                )}
                {activeOsModule === 'marketing_os' && (
                  <div className="space-y-2 text-xs font-bold text-gray-700 px-2 font-mono">
                    <p className="flex items-center gap-2">💬 Social Media Scheduler</p>
                    <p className="flex items-center gap-2">📝 AI Advertisement Copywriter</p>
                    <p className="flex items-center gap-2">🚀 Conversion Funnel Setup</p>
                  </div>
                )}
                {activeOsModule === 'finance_os' && (
                  <div className="space-y-2 text-xs font-bold text-gray-700 px-2 font-mono">
                    <p className="flex items-center gap-2">🧾 GST Invoice Generation</p>
                    <p className="flex items-center gap-2">📉 Professional Expenses Tracker</p>
                    <p className="flex items-center gap-2">📊 SaaS Revenue Insights</p>
                  </div>
                )}
                {activeOsModule === 'loan_os' && (
                  <div className="space-y-2 text-xs font-bold text-gray-700 px-2 font-mono">
                    <p className="flex items-center gap-2">💼 Borrower Pipeline CRM</p>
                    <p className="flex items-center gap-2">📊 Dynamic Eligibility Calculator</p>
                    <p className="flex items-center gap-2">🏦 National Bank Rate Comparison</p>
                  </div>
                )}
                {activeOsModule === 'automation_os' && (
                  <div className="space-y-2 text-xs font-bold text-gray-700 px-2 font-mono">
                    <p className="flex items-center gap-2">⚡ Visual Trigger-Action Builder</p>
                    <p className="flex items-center gap-2">📂 Google Forms Client Ingest</p>
                    <p className="flex items-center gap-2">🗓️ Google Calendar Synchronization</p>
                  </div>
                )}
                {activeOsModule === 'marketplace_os' && (
                  <div className="space-y-2 text-xs font-bold text-gray-700 px-2 font-mono">
                    <p className="flex items-center gap-2">🛒 Explore AI Copilots</p>
                    <p className="flex items-center gap-2">🔌 Connect Custom Extensions</p>
                  </div>
                )}
                {activeOsModule === 'saas_admin' && (
                  <div className="space-y-2 text-xs font-bold text-gray-700 px-2 font-mono">
                    <p className="flex items-center gap-2">🎨 Enterprise White-Label Customizer</p>
                    <p className="flex items-center gap-2">📈 Quota Allocation Logs</p>
                    <p className="flex items-center gap-2">🔑 REST API Gateway Keys</p>
                  </div>
                )}
              </div>

              {/* Back to Legal OS button */}
              <button
                onClick={() => {
                  setActiveOsModule('legal_os');
                  setActiveTab('crm');
                }}
                className="w-full mt-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm text-center flex items-center justify-center gap-1.5"
              >
                <span>🏛️ Return to Legal OS Hub</span>
              </button>
            </div>
          )}

          {activeTab === 'generator' && activeOsModule === 'legal_os' && (
            <div className="space-y-3 pb-6">
              <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-widest px-2 mb-2">Corporate Security Vault</p>
              <div className="space-y-2">
                {AGREEMENT_CATEGORIES.map((cat) => {
                  const isOpen = expandedCategories[cat.id];
                  return (
                    <div key={cat.id} className="border border-[#EBF0F5] rounded-xl overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                      <button
                        onClick={() => setExpandedCategories(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                        className="w-full flex items-center justify-between p-3 bg-gray-50/40 hover:bg-gray-50/90 transition-all text-left border-b border-[#F0F3F6]"
                      >
                        <div className="truncate pr-2">
                          <p className="font-bold text-[11px] text-[#1A1A1A] tracking-tight truncate uppercase">{cat.name}</p>
                          <p className="text-[9px] text-[#9E9E9E] truncate leading-tight mt-0.5">{cat.description}</p>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 text-[#9E9E9E] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-90 text-[#1D1D1F]' : ''}`} />
                      </button>
                      
                      {isOpen && (
                        <div className="p-1.5 bg-white space-y-0.5 max-h-[260px] overflow-y-auto custom-scrollbar">
                          {cat.types.map((type) => {
                            const isSelected = selectedType === type;
                            return (
                              <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                                  isSelected 
                                    ? 'bg-[#1A1A1A] text-white font-semibold' 
                                    : 'text-[#4A4A4A] hover:bg-gray-50 hover:text-[#1A1A1A]'
                                }`}
                              >
                                {DOCUMENT_ICONS[type] || <FileText className="w-3.5 h-3.5 opacity-60" />}
                                <span className="truncate">{type}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#E5E5E5] space-y-3">
          {currentUser ? (
            <div className="bg-[#F9F9F9] p-3 rounded-xl border border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <div className="w-7 h-7 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center text-xs uppercase font-bold shrink-0">
                  {currentUser.isAnonymous ? 'A' : (currentUser.email?.[0] || 'U')}
                </div>
                <div className="truncate">
                  <p className="text-[10px] font-bold text-gray-800 leading-tight truncate">
                    {currentUser.isAnonymous ? 'Anonymous Mode' : (currentUser.displayName || 'Synced Account')}
                  </p>
                  <p className="text-[9px] text-[#9E9E9E] truncate">{currentUser.email || 'Temp Local Workspace'}</p>
                </div>
              </div>
              <button 
                onClick={logOutUser}
                className="text-[9px] font-bold text-[#1A1A1A] hover:underline hover:text-red-600 transition-colors shrink-0 pl-1.5"
              >
                LOG OUT
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-white border border-[#E5E5E5] hover:bg-[#F5F5F5] rounded-xl text-[#1A1A1A] shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
          )}

          {currentUser?.isAnonymous && (
            <button 
              onClick={handleGoogleSignIn}
              disabled={isLoggingIn}
              className="w-full text-[10px] font-bold text-amber-600 border border-amber-200 bg-amber-50 rounded-xl py-1.5 hover:bg-amber-100 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? 'Connecting...' : '⚡ Link Google (Permanent Sync)'}
            </button>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-2 lg:gap-4 overflow-hidden mr-2">
            {(!isSidebarOpen || !isMobile) && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-[#F5F5F5] rounded-lg shrink-0">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h1 className="font-semibold text-sm lg:text-lg truncate text-gray-900 flex items-center gap-2">
              {activeOsModule === 'business_os' ? '💼 Business OS & Team Directory' :
               activeOsModule === 'publisher_os' ? '📚 Publisher OS & Creative Studio' :
               activeOsModule === 'marketing_os' ? '📣 Marketing OS & Funnel Copywriter' :
               activeOsModule === 'finance_os' ? '💰 Finance OS & GST Ledger' :
               activeOsModule === 'loan_os' ? '🏦 Loan OS & DSA Pipeline CRM' :
               activeOsModule === 'automation_os' ? '⚙️ Automations Builder & Workspace Sync' :
               activeOsModule === 'marketplace_os' ? '🛒 RBA SaaS Extensions Marketplace' :
               activeOsModule === 'saas_admin' ? '🛠️ SaaS Tenant Control Panel' :
               activeTab === 'crm' ? 'Legal OS Dashboard' :
               activeTab === 'generator' ? `Agreement Generator: ${selectedType}` : 
               activeTab === 'bundle' ? 'Smart Bundle Generator' :
               activeTab === 'profiles' ? 'Profile Management' : 
               activeTab === 'intake' ? 'Google Workspace Forms Intake' :
               activeTab === 'calendar' ? 'Consultation & Meeting Scheduler' :
               activeTab === 'kyc' ? 'KYC Verification Hub' :
               activeTab === 'esign' ? 'Aadhaar & OTP E-Sign Portal' :
               activeTab === 'payments' ? 'Stamp Duty & Payments Ledger' :
               activeTab === 'renewals' ? 'Contract Lifecycle & Renewals' :
               activeTab === 'ai_assistant' ? 'AI Legal Advisor (Indian Law Expert)' : 'Document Vault'}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 lg:gap-3 shrink-0">
            {generatedText && (
              <>
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-xs lg:text-sm font-medium border border-[#E5E5E5] rounded-lg hover:bg-[#F5F5F5] transition-colors bg-white shadow-sm shrink-0"
                  title="Print"
                >
                  <Printer className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Print</span>
                </button>
                <button 
                  onClick={handleGoogleDocsExport}
                  disabled={isExportingToGoogle}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-xs lg:text-sm font-medium border border-amber-200 text-amber-900 bg-amber-50/50 rounded-lg hover:bg-amber-50 hover:border-amber-300 transition-colors shadow-sm disabled:opacity-50 shrink-0"
                  title="Export to Google Docs"
                >
                  {isExportingToGoogle ? <Loader2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 animate-spin text-amber-500" /> : <FileText className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-600" />}
                  <span className="hidden sm:inline">{isExportingToGoogle ? 'Exporting...' : 'Google Doc'}</span>
                </button>
                <button 
                  onClick={downloadAsText}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-xs lg:text-sm font-medium border border-[#E5E5E5] rounded-lg hover:bg-[#F5F5F5] transition-colors bg-white shadow-sm shrink-0"
                  title="Export TXT"
                >
                  <Download className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-xs lg:text-sm font-medium border border-[#E5E5E5] rounded-lg hover:bg-[#F5F5F5] transition-colors bg-white shadow-sm shrink-0"
                  title="Copy to Clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-green-500" /> : <Copy className="w-3.5 h-3.5 lg:w-4 lg:h-4" />}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button 
                  onClick={handleValidate}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-xs lg:text-sm font-medium border border-[#E5E5E5] rounded-lg hover:bg-[#F5F5F5] transition-colors bg-white shadow-sm shrink-0"
                  title="Legal AI Validation"
                >
                  <AlertTriangle className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Validate</span>
                </button>
              </>
            )}
            <button 
              onClick={activeTab === 'generator' ? handleGenerate : handleSmartBundle}
              disabled={isGenerating}
              className="flex items-center gap-1 lg:gap-2 px-2.5 py-1.5 lg:px-4 bg-[#1A1A1A] text-white text-xs lg:text-sm font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-50 shrink-0"
            >
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4" />}
              <span>{isGenerating ? 'Drafting...' : 'Generate'}</span>
            </button>
          </div>
        </header>

        {/* Mobile View Switcher */}
        {isMobile && (
          <div className="flex bg-white border-b border-[#E5E5E5] shrink-0 z-10 shadow-sm">
            <button
              onClick={() => setMobileView('edit')}
              className={`flex-1 py-3 text-center text-xs font-semibold transition-all border-b-2 tracking-wider ${mobileView === 'edit' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#9E9E9E]'}`}
            >
              📝 PARAMETERS FORM
            </button>
            <button
              onClick={() => {
                setMobileView('preview');
                // Automatically close sidebar if they're switching to preview to maximize space
                setIsSidebarOpen(false);
              }}
              className={`flex-1 py-3 text-center text-xs font-semibold transition-all border-b-2 tracking-wider ${mobileView === 'preview' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#9E9E9E]'}`}
            >
              👁️ CONTRACT PREVIEW
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {activeOsModule !== 'legal_os' ? (
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              {activeOsModule === 'business_os' && (
                <BusinessOSModule 
                  activeWorkspace={currentWorkspace} 
                  onUpdateWorkspace={(updated) => {
                    setWorkspaces(prev => prev.map(w => w.id === updated.id ? updated : w));
                  }} 
                />
              )}
              {activeOsModule === 'publisher_os' && (
                <PublisherOSModule 
                  onAiPrompt={async (prompt, ctx) => {
                    return await askLegalAssistant(prompt, aiFocusMode);
                  }}
                  onExportToGoogleDocs={exportAnyTextToGoogleDocs}
                />
              )}
              {activeOsModule === 'marketing_os' && (
                <MarketingOSModule 
                  onAiPrompt={async (prompt, ctx) => {
                    return await askLegalAssistant(prompt, aiFocusMode);
                  }}
                  onExportToGoogleDocs={exportAnyTextToGoogleDocs}
                />
              )}
              {activeOsModule === 'finance_os' && (
                <FinanceOSModule initialInvoices={paymentInvoices} />
              )}
              {activeOsModule === 'loan_os' && (
                <LoanOSModule />
              )}
              {activeOsModule === 'automation_os' && (
                <div className="space-y-6">
                  {/* Visual Subtabs for Automation */}
                  <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
                    <h2 className="font-extrabold text-base text-gray-900 mb-1">Visual Automations & Google Workspace Sync</h2>
                    <p className="text-xs text-gray-500">Enable deep Zapier-style event triggers and synchronize real-time spreadsheets or calendars.</p>
                  </div>
                  <AutomationBuilderModule />
                  <GoogleWorkspaceModule 
                    currentUser={currentUser} 
                    onLogin={loginWithGoogle} 
                    onLogout={logOutUser} 
                  />
                </div>
              )}
              {activeOsModule === 'marketplace_os' && (
                <MarketplaceModule />
              )}
              {activeOsModule === 'saas_admin' && (
                <div className="space-y-6">
                  {/* Multi-Tenant White labeling */}
                  <WhiteLabelModule 
                    currentWorkspace={currentWorkspace} 
                    onSaveBranding={handleUpdateBranding} 
                  />

                  {/* Multi-tenant Workspace subscription limits panel */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="border-b border-gray-100 pb-3">
                      <h3 className="font-bold text-sm text-gray-900">SaaS Subscription Quota Allocator</h3>
                      <p className="text-xs text-gray-500">Manage tenant usage, limits, and configure API gateway credentials.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 border rounded-xl space-y-2">
                        <div className="flex justify-between text-xs font-bold text-gray-700">
                          <span>AI Tokens Ingested</span>
                          <span>{currentWorkspace.usage.tokens.toLocaleString()} / {currentWorkspace.usage.tokensLimit.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-cyan-500 h-full rounded-full transition-all" 
                            style={{ width: `${Math.min(100, (currentWorkspace.usage.tokens / currentWorkspace.usage.tokensLimit) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 border rounded-xl space-y-2">
                        <div className="flex justify-between text-xs font-bold text-gray-700">
                          <span>Aadhaar E-Signs Remaining</span>
                          <span>{currentWorkspace.usage.esign} / {currentWorkspace.usage.esignLimit}</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-purple-500 h-full rounded-full transition-all" 
                            style={{ width: `${Math.min(100, (currentWorkspace.usage.esign / currentWorkspace.usage.esignLimit) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 border rounded-xl space-y-2">
                        <div className="flex justify-between text-xs font-bold text-gray-700">
                          <span>Outward GST Invoices</span>
                          <span>{currentWorkspace.usage.invoices} / {currentWorkspace.usage.invoicesLimit}</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all" 
                            style={{ width: `${Math.min(100, (currentWorkspace.usage.invoices / currentWorkspace.usage.invoicesLimit) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Developer API & Webhooks key configuration */}
                    <div className="pt-3 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-xs text-gray-900">Developer API Integrations Gateway</h4>
                        <p className="text-[11px] text-gray-500">Provide secure programmatic endpoints for custom tenant systems.</p>
                      </div>
                      <button 
                        onClick={() => {
                          const newKey = `sk_live_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
                          alert(`Successfully generated Live REST API token:\n\n${newKey}\n\nKeep this token secure. Do not share in public repos.`);
                        }}
                        className="px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                      >
                        Generate API Token
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Form Side */}
              {(!isMobile || mobileView === 'edit') && (
                <div className={`${isMobile ? 'w-full' : 'w-[400px] border-r border-[#E5E5E5]'} bg-white overflow-y-auto p-6 shrink-0`}>
                {activeTab === 'generator' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-[#9E9E9E] uppercase tracking-widest">Document Details</h2>
                    {lastSavedTime && (
                      <span className="text-[9px] text-[#9E9E9E] font-mono animate-fade-in flex items-center gap-1 bg-gray-50 border border-gray-150 px-1.5 py-0.5 rounded">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                        Auto-saved
                      </span>
                    )}
                  </div>
                  <button onClick={clearForm} className="text-[10px] font-bold text-[#1A1A1A] hover:underline">CLEAR ALL</button>
                </div>

                {/* RESTORE DRAFT BANNER */}
                {showRestoreBanner && savedDraft && (
                  <AnimatePresence>
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 mb-4"
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <span className="text-amber-500">📝</span>
                          <span>Unsaved Draft Found</span>
                        </p>
                        <p className="text-[10px] text-amber-700 leading-normal">
                          We found an auto-saved draft of a <strong>{savedDraft.selectedType}</strong> from {new Date(savedDraft.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Would you like to restore it?
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={restoreDraft}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                        >
                          Restore Draft
                        </button>
                        <button
                          onClick={dismissDraft}
                          className="px-3 py-1 border border-amber-300 text-amber-700 hover:bg-amber-100 rounded-lg text-[10px] font-bold transition-all cursor-pointer bg-white"
                        >
                          Dismiss
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}

                {/* Google Forms Client Intake Callout */}
                <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-xl space-y-3 mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-950">
                    <ClipboardList className="w-4 h-4 text-purple-600" />
                    <span>GOOGLE FORMS INTAKE</span>
                  </div>
                  <p className="text-[10px] text-purple-700 leading-normal">
                    Generate a Google Forms intake link to share with clients or partners. We'll capture their responses and let you auto-fill this form instantly.
                  </p>

                  {/* Brand Theme Customizer */}
                  <div className="pt-2 border-t border-purple-100/50 space-y-2">
                    <span className="text-[9px] font-bold text-purple-900 uppercase tracking-wider block">
                      🎨 Custom Brand Theme Header
                    </span>

                    {/* Pre-set Styles */}
                    <div className="grid grid-cols-4 gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedFormThemeStyle('royal-platinum')}
                        className={`py-1 text-[8px] font-bold rounded-md border text-center transition-all ${
                          selectedFormThemeStyle === 'royal-platinum'
                            ? 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold shadow-sm'
                            : 'bg-white text-gray-500 border-gray-150 hover:bg-gray-50'
                        }`}
                        title="Executive Slate Premium (Offices / Workspace Theme)"
                      >
                        💼 Slate
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedFormThemeStyle('classic-gold')}
                        className={`py-1 text-[8px] font-bold rounded-md border text-center transition-all ${
                          selectedFormThemeStyle === 'classic-gold'
                            ? 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold shadow-sm'
                            : 'bg-white text-gray-500 border-gray-150 hover:bg-gray-50'
                        }`}
                        title="Judicial Crimson Gold (Courts / Lawyer Mahogany Theme)"
                      >
                        ⚖️ Gold
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedFormThemeStyle('corporate-indigo')}
                        className={`py-1 text-[8px] font-bold rounded-md border text-center transition-all ${
                          selectedFormThemeStyle === 'corporate-indigo'
                            ? 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold shadow-sm'
                            : 'bg-white text-gray-500 border-gray-150 hover:bg-gray-50'
                        }`}
                        title="Sleek Modern Corporate (Glass Facade / High-tech Theme)"
                      >
                        🏢 Indigo
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedFormThemeStyle('custom-image')}
                        className={`py-1 text-[8px] font-bold rounded-md border text-center transition-all ${
                          selectedFormThemeStyle === 'custom-image'
                            ? 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold shadow-sm'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                        title="Set Custom Emblem or Banner URL"
                      >
                        🔗 URL
                      </button>
                    </div>

                    {/* Description for style */}
                    <p className="text-[8px] text-[#555555] italic leading-normal">
                      {selectedFormThemeStyle === 'royal-platinum' && "💼 Slate theme: Adds a modern executive boardroom header image."}
                      {selectedFormThemeStyle === 'classic-gold' && "⚖️ Gold theme: Adds luxury traditional lawyer scales of justice."}
                      {selectedFormThemeStyle === 'corporate-indigo' && "🏢 Indigo theme: Adds premium glass skyscraper architecture."}
                      {selectedFormThemeStyle === 'custom-image' && "🔗 Custom URL theme: Provide any public image link below."}
                    </p>

                    {/* Conditional URL input */}
                    {selectedFormThemeStyle === 'custom-image' && (
                      <input
                        type="url"
                        value={customFormHeaderUri}
                        onChange={(e) => setCustomFormHeaderUri(e.target.value)}
                        placeholder="https://company.com/header-banner.jpg"
                        className="w-full px-2 py-1 bg-white border border-purple-100 rounded text-[9px] placeholder-gray-400 focus:outline-none focus:border-purple-600 transition-colors"
                      />
                    )}

                    {/* Override texts */}
                    <div className="grid grid-cols-1 gap-1 pt-1">
                      <input
                        type="text"
                        value={customFormHeaderTitle}
                        onChange={(e) => setCustomFormHeaderTitle(e.target.value)}
                        placeholder="Branded Header Title"
                        className="w-full px-2 py-1 bg-white/70 border border-purple-100 rounded text-[9px] placeholder-purple-400 font-semibold focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
                        title="Header Title Override"
                      />
                      <input
                        type="text"
                        value={customFormHeaderDesc}
                        onChange={(e) => setCustomFormHeaderDesc(e.target.value)}
                        placeholder="Branded Header Subtitle / Description"
                        className="w-full px-2 py-1 bg-white/70 border border-purple-100 rounded text-[9px] placeholder-purple-400 focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
                        title="Header Description Override"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateIntakeForm}
                    disabled={isCreatingForm}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    {isCreatingForm ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating Branded Google Form...</span>
                      </>
                    ) : (
                      <>
                        <ClipboardList className="w-3.5 h-3.5" />
                        <span>Create Client Intake Form</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Profile quick autofill drop down */}
                {profiles.length > 0 && (() => {
                  const defaultUser = profiles.find(p => p.isDefaultUser);
                  const defaultCompany = profiles.find(p => p.isDefaultCompany);
                  return (
                    <div className="p-4 bg-gray-50 border border-[#E5E5E5] rounded-xl space-y-3 mb-6">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                        <Users className="w-3.5 h-3.5 text-[#1A1A1A]" />
                        <span>QUICK PROFILE AUTO-FILL</span>
                      </div>

                      {(defaultUser || defaultCompany) && (
                        <div className="bg-purple-50/40 p-2.5 rounded-lg border border-purple-100 text-[10px] text-purple-900 space-y-1.5">
                          <span className="font-extrabold uppercase text-[8px] tracking-wider text-purple-950 block">Primary Defaults Detected</span>
                          <div className="flex flex-wrap gap-1.5 font-medium">
                            {defaultUser && <span className="bg-white border border-purple-100 px-1.5 py-0.5 rounded text-[9px]">👤 {defaultUser.name}</span>}
                            {defaultCompany && <span className="bg-white border border-purple-100 px-1.5 py-0.5 rounded text-[9px]">🏢 {defaultCompany.name}</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (defaultCompany) applyProfile(defaultCompany, '1st');
                              if (defaultUser) applyProfile(defaultUser, '1st');
                            }}
                            className="mt-1 w-full bg-purple-600 hover:bg-purple-700 text-white text-[9px] font-extrabold py-1 px-2 rounded transition-colors uppercase tracking-wider cursor-pointer shadow-sm text-center"
                          >
                            ⚡ Fill Primary Defaults
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">1st Party (Co/Ind)</label>
                          <select
                            className="w-full px-2 py-1.5 bg-white border border-[#E5E5E5] rounded-lg outline-none focus:border-black"
                            onChange={(e) => {
                              const found = profiles.find(p => p.id === e.target.value);
                              if (found) applyProfile(found, '1st');
                              e.target.value = "";
                            }}
                            defaultValue=""
                          >
                            <option value="" disabled>Select...</option>
                            {profiles.filter(p => p.partyType.startsWith('first')).map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">2nd Party</label>
                          <select
                            className="w-full px-2 py-1.5 bg-white border border-[#E5E5E5] rounded-lg outline-none focus:border-black"
                            onChange={(e) => {
                              const found = profiles.find(p => p.id === e.target.value);
                              if (found) applyProfile(found, '2nd');
                              e.target.value = "";
                            }}
                            defaultValue=""
                          >
                            <option value="" disabled>Select...</option>
                            {profiles.filter(p => p.partyType === 'second_party').map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Purpose Template Selector */}
                <div className="p-4 bg-amber-50/40 border border-[#E5E5E5] rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>PRESET PURPOSE TEMPLATES</span>
                  </div>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Target Industry Sector</label>
                      <select
                        value={selectedIndustry}
                        onChange={(e) => setSelectedIndustry(e.target.value as IndustryCategory)}
                        className="w-full px-2 py-1.5 bg-white border border-[#E5E5E5] rounded-lg outline-none focus:border-black text-[11px]"
                      >
                        {INDUSTRY_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {PURPOSE_TEMPLATES[selectedIndustry]?.[selectedType]?.length > 0 ? (
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase">Available Core Templates</label>
                        <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                          {PURPOSE_TEMPLATES[selectedIndustry][selectedType].map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                const updated = { ...params } as any;
                                Object.entries(preset.fields).forEach(([k, v]) => {
                                  if (v !== undefined) {
                                    updated[k] = v;
                                  }
                                });
                                setParams(updated as DocumentParams);
                              }}
                              className="w-full text-left p-2 bg-white rounded-lg border border-[#E5E5E5] hover:border-amber-500 hover:bg-amber-50/50 transition-all space-y-0.5 group"
                            >
                              <div className="flex justify-between items-center">
                                <p className="font-bold text-[10px] text-gray-800 group-hover:text-amber-900 truncate">{preset.title}</p>
                                <span className="text-[9px] font-bold text-amber-600 opacity-60 group-hover:opacity-100 transition-opacity">APPLY</span>
                              </div>
                              <p className="text-[9px] text-gray-500 line-clamp-2 leading-tight">{preset.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 bg-gray-50 border border-dashed border-[#E5E5E5] rounded-lg">
                        <p className="text-[9px] text-[#9E9E9E] italic text-center leading-tight">
                          No custom templates for "{selectedType}" under this segment. You can write your own description below or switch to other categories!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                    {DOCUMENT_FIELDS[selectedType].map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#4A4A4A]">{field.label}</label>
                        {field.type === 'textarea' ? (
                          <textarea
                            value={(params[field.key] as string) || ''}
                            onChange={(e) => handleParamChange(field.key, e.target.value)}
                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                            className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#1A1A1A] min-h-[100px] resize-none"
                          />
                        ) : (
                          <input
                            type={field.type || 'text'}
                            value={(params[field.key] as string) || ''}
                            onChange={(e) => handleParamChange(field.key, e.target.value)}
                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                            className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#1A1A1A]"
                          />
                        )}
                      </div>
                    ))}

                    {/* Clause Toggles */}
                    {DOCUMENT_TOGGLES[selectedType] && (
                      <div className="pt-4 border-t border-[#E5E5E5] space-y-4">
                        <h3 className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-widest">Clause Customization</h3>
                        <div className="space-y-3">
                          {DOCUMENT_TOGGLES[selectedType].map((toggle) => (
                            <div key={toggle.key} className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <label className="text-xs font-semibold text-[#4A4A4A]">{toggle.label}</label>
                                <p className="text-[10px] text-[#9E9E9E] leading-tight">{toggle.description}</p>
                              </div>
                              <button
                                onClick={() => handleParamChange(toggle.key, !params[toggle.key])}
                                className={`w-8 h-4 rounded-full transition-colors relative ${params[toggle.key] ? 'bg-[#1A1A1A]' : 'bg-[#E5E5E5]'}`}
                              >
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${params[toggle.key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#4A4A4A]">Special Notes (Optional)</label>
                      <textarea
                        value={params.special_notes || ''}
                        onChange={(e) => handleParamChange('special_notes', e.target.value)}
                        placeholder="Any specific clauses or conditions..."
                        className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#1A1A1A] min-h-[80px] resize-none"
                      />
                    </div>
                  </div>
                </div>
            ) : activeTab === 'bundle' ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-bold text-[#9E9E9E] uppercase tracking-widest mb-4">Bundle Intent</h2>
                  <p className="text-xs text-[#9E9E9E] mb-4">Describe your business situation and we'll generate all necessary documents.</p>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#4A4A4A]">What are you setting up?</label>
                      <textarea
                        value={smartIntent}
                        onChange={(e) => setSmartIntent(e.target.value)}
                        placeholder="e.g. Starting a new SaaS startup with 2 co-founders in Bangalore..."
                        className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#1A1A1A] min-h-[150px] resize-none"
                      />
                    </div>
                    <div className="p-4 bg-[#F5F5F5] rounded-xl border border-[#E5E5E5]">
                      <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-widest mb-2">Examples</p>
                      <ul className="text-xs space-y-2 text-[#4A4A4A]">
                        <li className="flex items-center gap-2 cursor-pointer hover:text-[#1A1A1A]" onClick={() => setSmartIntent('Startup setup with co-founders')}>
                          <ChevronRight className="w-3 h-3" />
                          Startup setup with co-founders
                        </li>
                        <li className="flex items-center gap-2 cursor-pointer hover:text-[#1A1A1A]" onClick={() => setSmartIntent('Hiring a new remote developer')}>
                          <ChevronRight className="w-3 h-3" />
                          Hiring a new remote developer
                        </li>
                        <li className="flex items-center gap-2 cursor-pointer hover:text-[#1A1A1A]" onClick={() => setSmartIntent('Raising seed funding')}>
                          <ChevronRight className="w-3 h-3" />
                          Raising seed funding
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'profiles' ? (
              <div className="space-y-6">
                <ProfileManager 
                  profiles={profiles} 
                  onProfilesChanged={() => loadUserData()} 
                  onBookMeeting={(profile) => {
                    setBookingClientEmail(profile.email || '');
                    setBookingClientName(profile.name || '');
                    setBookingSummary(`Consultation: ${profile.name || 'Client'}`);
                    setBookingDescription(`Draft review & legal strategy intake briefing with ${profile.name}.`);
                    setActiveTab('calendar');
                  }}
                />
              </div>
            ) : activeTab === 'calendar' ? (
              <div className="space-y-6">
                <div className="border-b border-emerald-100 pb-4">
                  <h2 className="text-xl font-bold text-[#1A1A1A]">Consultation Scheduler</h2>
                  <p className="text-xs text-[#9E9E9E] mt-1">
                    Book consultations, legal advisory briefings, and risk reviews directly on Google Calendar with automated Google Meet video meeting rooms.
                  </p>
                </div>

                {calendarError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>{calendarError}</span>
                  </div>
                )}
                
                {calendarSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{calendarSuccess}</span>
                  </div>
                )}

                {(!currentUser || currentUser.isAnonymous) ? (
                  <div className="p-6 bg-emerald-50/40 border border-dashed border-emerald-200 rounded-2xl text-center space-y-4">
                    <Calendar className="w-8 h-8 mx-auto text-emerald-600 stroke-[1.5]" />
                    <h3 className="text-sm font-bold text-emerald-950">Active Google Account Required</h3>
                    <p className="text-xs text-emerald-800 leading-normal max-w-xs mx-auto">
                      Google OAuth connection is required to fetch upcoming schedule lists and coordinate bookings. Please sign in with your Google account.
                    </p>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isLoggingIn}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-colors"
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <UserIcon className="w-3.5 h-3.5" />
                          <span>Link Google Workspace Account</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBookEvent} className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.02)] p-5 space-y-4">
                    <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/60 mb-2">
                       <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                         <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                         Syncing with {currentUser.email}
                       </span>
                    </div>

                    {/* Pre-fill from Saved Profiles Shortcut */}
                    {profiles.length > 0 && (
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Pre-fill from Saved Profiles
                        </label>
                        <select
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              const foundProfile = profiles.find(p => p.id === val);
                              if (foundProfile) {
                                setBookingClientEmail(foundProfile.email || '');
                                setBookingClientName(foundProfile.name || '');
                                setBookingSummary(`Consultation: ${foundProfile.name} - Royal Bulls Advisory`);
                                setBookingDescription(`Draft review & legal strategy intake briefing with ${foundProfile.name}.`);
                              }
                            }
                          }}
                          className="w-full p-2.5 border border-[#E5E5E5] hover:border-gray-400 focus:border-[#1A1A1A] rounded-xl text-xs bg-white font-medium"
                        >
                          <option value="">-- Choose target profile --</option>
                          {profiles.filter(p => p.email).map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.email})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Summary / Meeting Title */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Meeting Title / Topic *
                      </label>
                      <input
                        type="text"
                        required
                        value={bookingSummary}
                        onChange={(e) => setBookingSummary(e.target.value)}
                        placeholder="e.g. Founder Agreement Strategy Briefing"
                        className="w-full p-2.5 border border-[#E5E5E5] focus:border-[#1A1A1A] rounded-xl text-xs"
                      />
                    </div>

                    {/* Client Guest Email & Name Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Client Name
                        </label>
                        <input
                          type="text"
                          value={bookingClientName}
                          onChange={(e) => setBookingClientName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full p-2.5 border border-[#E5E5E5] focus:border-[#1A1A1A] rounded-xl text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Invite Guest Email
                        </label>
                        <input
                          type="email"
                          value={bookingClientEmail}
                          onChange={(e) => setBookingClientEmail(e.target.value)}
                          placeholder="e.g. client@example.com"
                          className="w-full p-2.5 border border-[#E5E5E5] focus:border-[#1A1A1A] rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    {/* Start Date & Time Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={bookingStartDate}
                          onChange={(e) => setBookingStartDate(e.target.value)}
                          className="w-full p-2.5 border border-[#E5E5E5] focus:border-[#1A1A1A] rounded-xl text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Start Time *
                        </label>
                        <input
                          type="time"
                          required
                          value={bookingStartTime}
                          onChange={(e) => setBookingStartTime(e.target.value)}
                          className="w-full p-2.5 border border-[#E5E5E5] focus:border-[#1A1A1A] rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Duration Selection Dropdown */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Meeting Duration *
                      </label>
                      <select
                        value={bookingDuration}
                        onChange={(e) => setBookingDuration(Number(e.target.value))}
                        className="w-full p-2.5 border border-[#E5E5E5] rounded-xl text-xs bg-white font-mono"
                      >
                        <option value={15}>15 Minutes</option>
                        <option value={30}>30 Minutes (Recommended)</option>
                        <option value={45}>45 Minutes</option>
                        <option value={60}>1 Hour</option>
                        <option value={90}>1.5 Hours</option>
                        <option value={120}>2 Hours</option>
                      </select>
                    </div>

                    {/* Location Field */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Location / Venue (Optional)
                      </label>
                      <input
                        type="text"
                        value={bookingLocation}
                        onChange={(e) => setBookingLocation(e.target.value)}
                        placeholder="e.g. Remote Video / Koramangala HQ Office"
                        className="w-full p-2.5 border border-[#E5E5E5] focus:border-[#1A1A1A] rounded-xl text-xs"
                      />
                    </div>

                    {/* Automated Google Meet Video Link Toggle Option */}
                    <div className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        id="enableMeetCheckbox"
                        checked={bookingEnableMeet}
                        onChange={(e) => setBookingEnableMeet(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-[#E5E5E5] cursor-pointer"
                      />
                      <label htmlFor="enableMeetCheckbox" className="text-xs font-semibold text-gray-700 cursor-pointer select-none">
                        📹 Generate automated Google Meet link
                      </label>
                    </div>

                    {/* Description textarea */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Agenda Notes
                      </label>
                      <textarea
                        value={bookingDescription}
                        onChange={(e) => setBookingDescription(e.target.value)}
                        placeholder="List of core parameters to review, compliance targets, etc."
                        rows={3}
                        className="w-full p-2.5 border border-[#E5E5E5] focus:border-[#1A1A1A] rounded-xl text-xs"
                      />
                    </div>

                    {/* Submit Schedule Booking Button */}
                    <button
                      type="submit"
                      disabled={isBookingEvent}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isBookingEvent ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Scheduling on Google Calendar...</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4 shrink-0" />
                          <span>📅 Schedule Consultation</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            ) : activeTab === 'intake' ? (
              <div className="space-y-6">
                <div className="border-b border-purple-100 pb-4">
                  <h2 className="text-xl font-bold text-[#1A1A1A]">Google Workspace Forms Intake</h2>
                  <p className="text-xs text-[#9E9E9E] mt-1">
                    Deploy secure Google Forms into your Workspace Drive, customize layout branding, share public client intake links, and pull their inputs automatically.
                  </p>
                </div>

                {/* Status Messages */}
                {formError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                {formSuccess && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-purple-950 text-xs flex items-center gap-3">
                    <Check className="w-5 h-5 text-purple-600 shrink-0" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                {/* Full Featured Form Builder and Dynamic Header Styling Console */}
                <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50/50 p-5 border-b border-[#E5E5E5]">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Deploy Custom Google Form (नया गूगल फॉर्म बनाएं)</span>
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Select any contract template from the dropdown and customize its header banner style, title, and description before deploying.
                    </p>
                  </div>

                  <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Panel: Select Template & Preview Questions */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#4A4A4A] flex items-center gap-1.5 uppercase tracking-wider">
                          📋 1. Select Contract Template
                        </label>
                        <select
                          value={selectedType}
                          onChange={(e) => {
                            const newType = e.target.value as DocumentType;
                            setSelectedType(newType);
                            // Auto-set matching default texts to streamline the user experience
                            setCustomFormHeaderTitle(`Client Intake: ${newType}`);
                            setCustomFormHeaderDesc(`Secure client intake portal managed via Royal Bulls Advisory Workspace.`);
                          }}
                          className="w-full px-3 py-2.5 bg-white border border-[#D5D5D5] rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-purple-600 transition-colors cursor-pointer"
                        >
                          {AGREEMENT_CATEGORIES.map((cat) => (
                            <optgroup key={cat.id} label={cat.name}>
                              {cat.types.map((t) => (
                                <option key={t} value={t}>
                                  📝 {t}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      {/* Display Schema Review */}
                      <div className="bg-[#F9F9F9] rounded-xl p-4 border border-[#E5E5E5] space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-200/50">
                          <span className="text-[10px] font-bold text-[#4A4A4A] uppercase tracking-wider">
                            🔍 Form Questions Schema Review
                          </span>
                          <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100/50 px-2.5 py-0.5 rounded-full">
                            {(DOCUMENT_FIELDS[selectedType] || []).length} Smart Fields
                          </span>
                        </div>

                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                          {(DOCUMENT_FIELDS[selectedType] || []).map((field, idx) => (
                            <div key={field.key} className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-gray-150 text-[11px]">
                              <span className="w-5 h-5 bg-gray-100 text-[#4A4A4A] font-extrabold flex items-center justify-center rounded-full shrink-0 text-[10px]">
                                {idx + 1}
                              </span>
                              <div className="space-y-0.5 min-w-0">
                                <p className="font-bold text-gray-800 truncate">{field.label}</p>
                                <p className="text-[9px] text-[#9E9E9E] font-mono truncate">
                                  Placeholder: {field.placeholder || "N/A"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Panel: Custom Branding & Style */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#4A4A4A] flex items-center gap-1.5 uppercase tracking-wider">
                          🎨 2. Custom Brand Theme & Banner Image
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { key: 'royal-platinum', label: '💼 Slate', desc: 'Modern Work' },
                            { key: 'classic-gold', label: '⚖️ Gold', desc: 'Legal Scales' },
                            { key: 'corporate-indigo', label: '🏢 Indigo', desc: 'Skyscraper' },
                            { key: 'custom-image', label: '🔗 URL', desc: 'Custom Link' }
                          ].map((theme) => (
                            <button
                              key={theme.key}
                              type="button"
                              onClick={() => setSelectedFormThemeStyle(theme.key as any)}
                              className={`py-1.5 text-[10px] font-extrabold rounded-lg border text-center transition-all cursor-pointer ${
                                selectedFormThemeStyle === theme.key
                                  ? 'bg-purple-600 border-purple-600 text-white shadow-sm font-black'
                                  : 'bg-white text-gray-600 border-[#E5E5E5] hover:bg-gray-50'
                              }`}
                            >
                              <div>{theme.label}</div>
                              <div className={`text-[8px] opacity-80 mt-0.5 ${selectedFormThemeStyle === theme.key ? 'text-purple-100' : 'text-gray-400'}`}>
                                {theme.desc}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {selectedFormThemeStyle === 'custom-image' && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#4A4A4A] uppercase tracking-wide">Banner Image URL</label>
                          <input
                            type="url"
                            value={customFormHeaderUri}
                            onChange={(e) => setCustomFormHeaderUri(e.target.value)}
                            placeholder="https://company.com/header-banner.jpg"
                            className="w-full px-3 py-1.5 bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:border-purple-600 transition-colors"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#4A4A4A] uppercase tracking-wide">Interactive Form Title</label>
                          <input
                            type="text"
                            value={customFormHeaderTitle}
                            onChange={(e) => setCustomFormHeaderTitle(e.target.value)}
                            placeholder="e.g. Pre-drafting checklist"
                            className="w-full px-3 py-1.5 bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:border-purple-600 transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#4A4A4A] uppercase tracking-wide">Description / Subtitle</label>
                          <input
                            type="text"
                            value={customFormHeaderDesc}
                            onChange={(e) => setCustomFormHeaderDesc(e.target.value)}
                            placeholder="e.g. Checklist managed securely..."
                            className="w-full px-3 py-1.5 bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:border-purple-600 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleCreateIntakeForm}
                          disabled={isCreatingForm}
                          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
                        >
                          {isCreatingForm ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                              <span>DEPLOYING FORM TO GOOGLE WORKSPACE...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                              <span>DEPLOY GOOGLE INTAKE FORM (गूगल फॉर्म बनाएं)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explainer Block: How Google Forms is used inside the app */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-5 text-xs text-purple-950 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 font-bold text-sm text-purple-900">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Google Forms का उपयोग कैसे करें? (How to use Google Forms Interface)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
                    <div className="bg-white/80 p-3 rounded-xl border border-purple-100/50 space-y-1">
                      <div className="font-bold text-purple-900 flex items-center gap-1.5">
                        <span className="w-4.5 h-4.5 text-[10px] bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-extrabold">1</span>
                        <span>Form Create करें</span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-normal">
                        ऊपर दिए गए कंसोल में किसी भी कॉन्ट्रैक्ट प्रकार को सेलेक्ट करके <strong>Deploy Google Intake Form</strong> बटन दबाएं।
                      </p>
                    </div>
                    <div className="bg-white/80 p-3 rounded-xl border border-purple-100/50 space-y-1">
                      <div className="font-bold text-purple-900 flex items-center gap-1.5">
                        <span className="w-4.5 h-4.5 text-[10px] bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-extrabold">2</span>
                        <span>Customise (बदलाव)</span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-normal">
                        नीचे लिस्ट में से <strong>Edit Form (Drive)</strong> पर क्लिक कर स्वयं Google Forms एडिटर में अपना लोगो, रंग, थीम अथवा अतिरिक्त प्रश्न भी सहेजें।
                      </p>
                    </div>
                    <div className="bg-white/80 p-3 rounded-xl border border-purple-100/50 space-y-1">
                      <div className="font-bold text-purple-900 flex items-center gap-1.5">
                        <span className="w-4.5 h-4.5 text-[10px] bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-extrabold">3</span>
                        <span>Link Share करें</span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-normal">
                        WhatsApp (ग्रीन बटन), ईमेल या कॉपी विकल्प द्वारा क्लाइंट को इनटेक फॉर्म लिंक साझा करें ताकि वे सुरक्षित ढंग से इनपुट भर सकें।
                      </p>
                    </div>
                    <div className="bg-white/80 p-3 rounded-xl border border-purple-100/50 space-y-1">
                      <div className="font-bold text-purple-900 flex items-center gap-1.5">
                        <span className="w-4.5 h-4.5 text-[10px] bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-extrabold">4</span>
                        <span>Auto-Fill Draft</span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-normal">
                        क्लाइंट द्वारा सबमिट करने पर, नीचे <strong>Check Entries</strong> दबाएँ और <strong>Fill Params</strong> कर एग्रीमेंट का ड्राफ्ट बनाएं!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Visual Guide: File Upload and Document Attachments instructions */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                      <Upload className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>📂 Clients से Files/Documents अपलोड कराएं (Enable Client File Uploads)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUploadGuide(!showUploadGuide)}
                      className="text-[10px] font-extrabold text-amber-700 bg-amber-100/60 hover:bg-amber-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer select-none"
                    >
                      {showUploadGuide ? 'Hide (छिपाएं)' : 'Show Guide (दिखाएं)'}
                    </button>
                  </div>

                  {showUploadGuide && (
                    <div className="space-y-3 text-xs text-amber-950">
                      <p className="leading-relaxed text-gray-600">
                        Google Forms API की सुरक्षा नीतियों (Security policies) के कारण <strong>'File Upload'</strong> प्रकार के प्रश्नों को सीधे API द्वारा जनरेट करना Google द्वारा प्रतिबंधित है, क्योंकि इसके लिए Google Drive फ़ोल्डर डेस्टिनेशन और क्लाइंट शेयरिंग रूल्स पर स्वयं आपके खाते की मैन्युअल सहमति मांगी जाती है।
                      </p>
                      
                      <div className="bg-white/90 p-4 rounded-xl border border-amber-200/50 space-y-2.5 shadow-sm">
                        <p className="font-bold text-amber-900 text-[11px] uppercase tracking-wide">
                          🛠️ केवल 4 त्वरित क्लिक (4 Quick Clicks) में फ़ाइल अपलोड चालू करें:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 text-gray-700 font-medium">
                          <li>
                            नीचे दी गई एक्टिव फॉर्म्स लिस्ट में अपने संबंधित इनटेक फॉर्म के <strong className="text-[#1A1A1A]">Edit Form (Drive)</strong> बटन को दबाएं।
                          </li>
                          <li>
                            Google Docs/Forms एडिटर खुलते ही दाईं ओर बने पैनल में गोल <strong className="text-[#1A1A1A]">(+) Add Question</strong> चिन्ह पर क्लिक करें।
                          </li>
                          <li>
                            सवाल का प्रकार (dropdown selection) बदलकर <strong className="text-purple-700">"File upload" (फ़ाइल अपलोड)</strong> चुनें।
                          </li>
                          <li>
                            पूछे जाने पर <strong className="text-[#1A1A1A]">"Continue" (आगे बढ़ें)</strong> पर क्लिक करें। आपके क्लाइंट अब KYC, PDF या अन्य दस्तावेज़ सीधे फॉर्म द्वारा अपलोड कर सकेंगे जो आपकी Google Drive में आ जाएंगे!
                          </li>
                        </ol>
                      </div>

                      <div className="flex items-start gap-2 text-[11px] text-amber-800 bg-amber-100/30 p-2.5 rounded-lg border border-amber-200/20 leading-relaxed">
                        <span className="font-extrabold shrink-0">💡 Alternative (वैकल्पिक विकल्प):</span>
                        <p>
                          क्लाइंट्स टेक्स्ट इनपुट सवालों में सीधे अपने डाक्यूमेंट्स की <strong>Google Drive / Dropbox / Box Link</strong> पेस्ट कर सकते हैं। हमारा ड्राफ्टिंग इंजन उस link को भी पैरामीटर मानकर सुरक्षित कैप्चर कर लेता है!
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Left block: Active Forms */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-[#9E9E9E] uppercase tracking-widest">Active Intake Forms ({intakeForms.length})</h3>
                    {intakeForms.length === 0 ? (
                      <div className="p-6 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center space-y-2">
                        <ClipboardList className="w-8 h-8 mx-auto text-gray-300" />
                        <p className="text-xs text-[#9E9E9E] font-medium">No Google Form intakes created yet.</p>
                        <p className="text-[10px] text-[#9E9E9E] max-w-xs mx-auto">
                          Use the deployment console above to select a template, customize headers, and click <strong>Deploy Google Intake Form</strong> to begin.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {intakeForms.map((form) => {
                          const isCurrent = selectedFormForResponses?.formId === form.formId;
                          return (
                            <div 
                              key={form.formId}
                              className={`p-5 rounded-xl border transition-all ${isCurrent ? 'bg-purple-50/40 border-purple-300' : 'bg-white border-[#E5E5E5] hover:border-purple-300'}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-purple-100 text-[9px] font-bold text-purple-700 rounded-full select-none uppercase tracking-wider">
                                    {form.contractType}
                                  </div>
                                  <h4 className="text-sm font-bold text-[#1A1A1A] leading-snug">{form.title}</h4>
                                  <p className="text-[10px] text-gray-400 font-mono">
                                    Created: {new Date(form.dateCreated).toLocaleDateString()}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFormIntake(form.formId)}
                                  className="text-[#9E9E9E] hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded"
                                  title="Delete Form Integration Check"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Action Items for customization, sharing and response syncing */}
                              <div className="mt-4 pt-4 border-t border-gray-100/80 space-y-3.5">
                                
                                {/* 1. Brand Customization Control */}
                                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex items-center justify-between gap-3 text-[11px]">
                                  <span className="text-gray-600 font-semibold">🎨 Customize style & questions:</span>
                                  <a
                                    href={form.editUri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1 border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 text-[10px] font-bold rounded-md transition-colors"
                                    title="Open Google Drive Forms Editor"
                                  >
                                    <span>Edit Form (Drive)</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </div>

                                {/* 2. Link Sharing Options Group */}
                                <div className="space-y-1.5">
                                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                                    Share intake link options (क्लाइंट के साथ लिंक शेयर करें)
                                  </label>
                                  <div className="grid grid-cols-3 gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(form.responderUri);
                                        setFormSuccess("Public form responder intake link copied to clipboard!");
                                        setTimeout(() => setFormSuccess(''), 4000);
                                      }}
                                      className="flex items-center justify-center gap-1 py-1.5 px-2 border border-gray-200 hover:border-gray-900 bg-white hover:bg-gray-50 rounded-lg text-[10px] font-bold text-gray-800 transition-all cursor-pointer"
                                      title="Copy public link to clipboard"
                                    >
                                      <Copy className="w-3 h-3 shrink-0" />
                                      <span>Copy Link</span>
                                    </button>

                                    <a
                                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                                        `नमस्ते! ड्राफ्ट के लिए इस संक्षिप्त Google Form को भरें: ${form.responderUri}`
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-center gap-1 py-1.5 px-2 border border-green-200 hover:border-green-600 bg-green-50 hover:bg-green-100 rounded-lg text-[10px] font-bold text-green-800 transition-all text-center"
                                      title="Share link via WhatsApp"
                                    >
                                      <span>WhatsApp</span>
                                    </a>

                                    <a
                                      href={`mailto:?subject=${encodeURIComponent(
                                        `Secure Client Intake Form: ${form.contractType}`
                                      )}&body=${encodeURIComponent(
                                        `Dear Client,\n\nPlease fill out this secure client intake form so we can collect the specific parameters and draft your ${form.contractType} agreement:\n\n${form.responderUri}\n\nBest Regards,\nRoyal Bulls Advisory Team`
                                      )}`}
                                      className="flex items-center justify-center gap-1 py-1.5 px-2 border border-sky-200 hover:border-sky-600 bg-sky-50 hover:bg-sky-100 rounded-lg text-[10px] font-bold text-sky-800 transition-all"
                                      title="Share link via email client"
                                    >
                                      <Mail className="w-3 h-3 shrink-0" />
                                      <span>Email Form</span>
                                    </a>
                                  </div>
                                </div>

                                {/* 3. Main Launch and Retrieve buttons */}
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                                  <a
                                    href={form.responderUri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-1.5 py-2 px-3 border border-purple-200 text-purple-900 rounded-xl text-xs font-bold hover:bg-purple-100/50 transition-colors"
                                  >
                                    <span>Preview Form (Public)</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleFetchFormResponses(form)}
                                    disabled={isFetchingResponses && isCurrent}
                                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-purple-600 hover:bg-purple-750 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                                  >
                                    {isFetchingResponses && isCurrent ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <RefreshCw className="w-3 h-3" />
                                    )}
                                    <span>Check Entries / Submissions</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right block: Form Submissions */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-[#9E9E9E] uppercase tracking-widest">
                      {selectedFormForResponses ? `Responses for "${selectedFormForResponses.contractType}"` : 'Client Submissions'}
                    </h3>

                    {!selectedFormForResponses ? (
                      <div className="p-6 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center space-y-2">
                        <ClipboardList className="w-8 h-8 mx-auto text-gray-300" />
                        <p className="text-xs text-[#9E9E9E]">No active form selected.</p>
                        <p className="text-[10px] text-[#9E9E9E] max-w-xs mx-auto">
                          Click <strong>Check Entries</strong> on an intake form to pull current client entries.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {isFetchingResponses && activeIntakeResponses.length === 0 ? (
                          <div className="flex flex-col items-center justify-center p-12 text-center text-xs text-[#9E9E9E] space-y-3">
                            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                            <p>Querying Google Forms API...</p>
                          </div>
                        ) : activeIntakeResponses.length === 0 ? (
                          <div className="p-6 bg-amber-50/40 border border-dashed border-amber-200 rounded-2xl text-center space-y-2">
                            <p className="text-xs text-amber-900 font-semibold">No response submissions detected yet.</p>
                            <p className="text-[10px] text-amber-700 max-w-xs mx-auto leading-normal">
                              Have your clients filled out the form? Share your public Intake Link with them and click <strong>Check Entries</strong> again!
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                            {activeIntakeResponses.map((item, index) => (
                              <div key={item.responseId || index} className="bg-white border border-[#E5E5E5] rounded-xl p-4 hover:border-purple-300 transition-colors">
                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                                  <div>
                                    <p className="text-xs font-bold text-gray-700">{item.email}</p>
                                    <p className="text-[9px] text-[#9E9E9E] font-mono">
                                      ID: {item.responseId}
                                    </p>
                                  </div>
                                  <span className="text-[9px] bg-gray-100 text-[#4A4A4A] px-2 py-0.5 rounded font-mono">
                                    {new Date(item.submittedAt).toLocaleTimeString()}
                                  </span>
                                </div>

                                <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                  {Object.keys(item.answers).length === 0 ? (
                                    <p className="text-[10px] text-gray-400 italic">No answered parameters mapped.</p>
                                  ) : (
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                                      {Object.entries(item.answers).map(([key, val]) => {
                                        const mappingLabel = Object.values(selectedFormForResponses.fieldMappings).find((m: any) => m.key === key)?.label || key;
                                        return (
                                          <div key={key} className="text-[10px]">
                                            <p className="font-semibold text-gray-400 uppercase tracking-tight text-[8px]">{mappingLabel}</p>
                                            <p className="text-gray-900 font-semibold truncate" title={String(val)}>
                                              {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                                            </p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleApplyResponseAnswers(selectedFormForResponses.contractType, item.answers)}
                                  className="w-full py-1.5 bg-[#1A1A1A] hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow"
                                >
                                  <ClipboardList className="w-3.5 h-3.5" />
                                  <span>Fill Params & Draft</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : activeTab === 'crm' ? (
              <div className="space-y-6">
                <div className="border-b border-rose-100 pb-4">
                  <h2 className="text-sm font-bold text-[#9E9E9E] uppercase tracking-widest">Pipeline Control</h2>
                  <p className="text-xs text-[#5F5F5F] mt-1">
                    Manage your commercial contracts, client KYC verify nodes, and payment ledgers from a single hub.
                  </p>
                </div>

                <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-4 space-y-4">
                  <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
                    <span>Real-Time Legal Workflow</span>
                  </h3>
                  
                  <div className="space-y-3 font-medium text-xs text-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-rose-500 text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center">1</div>
                      <div className="flex-1">
                        <p className="font-bold">Draft Contracts</p>
                        <p className="text-[10px] text-gray-500">Draft legal covenants in the Generator.</p>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold">READY</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-[#1A1A1A] text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center">2</div>
                      <div className="flex-1">
                        <p className="font-bold">KYC Identity Match</p>
                        <p className="text-[10px] text-gray-500">Verify client PAN/Aadhaar compliance.</p>
                      </div>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono font-bold">
                        {Object.values(kycRecords).filter(r => r.status === 'pending').length} PENDING
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-[#1A1A1A] text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center">3</div>
                      <div className="flex-1">
                        <p className="font-bold">Digital E-Signatures</p>
                        <p className="text-[10px] text-gray-500">Stamp contracts with Aadhaar OTP signs.</p>
                      </div>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-mono font-bold">
                        {esignDocs.filter(d => d.status === 'pending').length} PENDING
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-[#1A1A1A] text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center">4</div>
                      <div className="flex-1">
                        <p className="font-bold">Collect Professional Fees</p>
                        <p className="text-[10px] text-gray-500">Track advisory & stamp duty ledger.</p>
                      </div>
                      <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-mono font-bold">
                        {paymentInvoices.filter(i => i.status === 'unpaid').length} UNPAID
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-widest px-1">Quick Action Launchpad</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setActiveTab('generator')}
                      className="p-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-900 rounded-xl transition-all text-left group"
                    >
                      <Plus className="w-4 h-4 text-blue-500 mb-1.5 group-hover:scale-110 transition-transform" />
                      <p className="font-bold text-[10px] text-gray-900 uppercase">New Draft</p>
                      <p className="text-[9px] text-gray-500 leading-tight">Launch Generator</p>
                    </button>
                    <button 
                      onClick={() => setActiveTab('intake')}
                      className="p-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-900 rounded-xl transition-all text-left group"
                    >
                      <ClipboardList className="w-4 h-4 text-teal-500 mb-1.5 group-hover:scale-110 transition-transform" />
                      <p className="font-bold text-[10px] text-gray-900 uppercase">Forms Intake</p>
                      <p className="text-[9px] text-gray-500 leading-tight">Fetch client data</p>
                    </button>
                    <button 
                      onClick={() => setActiveTab('ai_assistant')}
                      className="p-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-900 rounded-xl transition-all text-left group"
                    >
                      <Bot className="w-4 h-4 text-cyan-500 mb-1.5 group-hover:scale-110 transition-transform" />
                      <p className="font-bold text-[10px] text-gray-900 uppercase">AI Advisor</p>
                      <p className="text-[9px] text-gray-500 leading-tight">Ask Indian Law</p>
                    </button>
                    <button 
                      onClick={() => setActiveTab('calendar')}
                      className="p-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-900 rounded-xl transition-all text-left group"
                    >
                      <Calendar className="w-4 h-4 text-emerald-500 mb-1.5 group-hover:scale-110 transition-transform" />
                      <p className="font-bold text-[10px] text-gray-900 uppercase">Schedule</p>
                      <p className="text-[9px] text-gray-500 leading-tight">Book client Meet</p>
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTab === 'kyc' ? (
              <div className="space-y-6">
                <div className="border-b border-emerald-100 pb-4">
                  <h2 className="text-sm font-bold text-[#9E9E9E] uppercase tracking-widest">Verify Client Identity</h2>
                  <p className="text-xs text-[#5F5F5F] mt-1">
                    Verify Indian KYC credentials (PAN, Aadhaar, GSTIN) against regulatory structure formats before executing final covenants.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A4A4A]">Select Client Profile</label>
                    <select
                      value={kycProfileId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setKycProfileId(val);
                        // Load mock data values for profile if exists
                        if (val === 'p1') {
                          setKycPan('AAACD1234F');
                          setKycAadhaar('321456987412');
                          setKycGstin('27AAACD1234F1Z1');
                        } else if (val === 'p2') {
                          setKycPan('BKZPK9876Q');
                          setKycAadhaar('895623124578');
                          setKycGstin('07BKZPK9876Q2Z4');
                        } else {
                          // Find profile in list
                          const prof = profiles.find(p => p.id === val);
                          if (prof) {
                            // Generate plausible values
                            setKycPan((prof.name ? prof.name.substring(0,3).toUpperCase() + 'CP' + '1234' + 'Z' : 'ABCDE1234F'));
                            setKycAadhaar('500012345678');
                            setKycGstin('27' + (prof.name ? prof.name.substring(0,3).toUpperCase() : 'ABC') + '1234F1Z5');
                          } else {
                            setKycPan('');
                            setKycAadhaar('');
                            setKycGstin('');
                          }
                        }
                      }}
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#1A1A1A]"
                    >
                      <option value="p1">Aman Sharma (Tech Founder)</option>
                      <option value="p2">Rohan Malhotra (Malhotra Law Corp)</option>
                      {profiles.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({(p as any).company || 'Client'})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A4A4A] flex justify-between items-center">
                      <span>PAN (Permanent Account Number)</span>
                      <span className="text-[9px] font-mono text-gray-450">Format: ABCDE1234F</span>
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={kycPan}
                      onChange={(e) => setKycPan(e.target.value.toUpperCase())}
                      placeholder="e.g. AAACD1234F"
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#1A1A1A] font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A4A4A] flex justify-between items-center">
                      <span>Aadhaar UID</span>
                      <span className="text-[9px] font-mono text-gray-450">Format: 12 Digits</span>
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      value={kycAadhaar}
                      onChange={(e) => setKycAadhaar(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 321456987412"
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#1A1A1A] font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A4A4A] flex justify-between items-center">
                      <span>GSTIN Registration Code</span>
                      <span className="text-[9px] font-mono text-gray-450">Format: 15 Characters</span>
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      value={kycGstin}
                      onChange={(e) => setKycGstin(e.target.value.toUpperCase())}
                      placeholder="e.g. 27AAACD1234F1Z1"
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#1A1A1A] font-mono"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!kycPan || !kycAadhaar) {
                        alert("Please fill PAN and Aadhaar number to perform KYC validation.");
                        return;
                      }
                      
                      // Format check validation
                      const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
                      if (!panRegex.test(kycPan)) {
                        alert("Invalid Indian PAN format! Must contain 5 letters, 4 digits, 1 letter. (e.g., AAACD1234F)");
                        return;
                      }

                      if (kycAadhaar.length !== 12) {
                        alert("Invalid Aadhaar format! Must be exactly 12 numeric digits.");
                        return;
                      }

                      setIsKycVerifying(true);
                      setTimeout(() => {
                        setIsKycVerifying(false);
                        const targetKey = kycProfileId;
                        setKycRecords(prev => ({
                          ...prev,
                          [targetKey]: {
                            pan: kycPan,
                            aadhaar: kycAadhaar,
                            gstin: kycGstin,
                            status: 'approved',
                            verifiedAt: new Date().toISOString().split('T')[0]
                          }
                        }));
                        setSelectedKycRecordKey(targetKey);
                        alert(`Verification Node Success! KYC matches successfully approved for profile ${kycProfileId === 'p1' ? 'Aman Sharma' : kycProfileId === 'p2' ? 'Rohan Malhotra' : 'Selected Client'}. Compliance Certificate generated.`);
                      }, 1800);
                    }}
                    disabled={isKycVerifying}
                    className="w-full py-2 bg-[#1A1A1A] hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow disabled:opacity-50"
                  >
                    {isKycVerifying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Querying Central Database Node...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verify and Certify KYC</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : activeTab === 'esign' ? (
              <div className="space-y-6">
                <div className="border-b border-indigo-100 pb-4">
                  <h2 className="text-sm font-bold text-[#9E9E9E] uppercase tracking-widest">Execute E-Signatures</h2>
                  <p className="text-xs text-[#5F5F5F] mt-1">
                    Execute binding digital signatures on drafted covenants with verifiable OTP triggers or signature pads.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A4A4A]">Select Document to Sign</label>
                    <select
                      value={esignDocId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEsignDocId(val);
                        // Suggest default signees based on profiles
                        setEsignSigneeName(params.other_party || 'Aman Sharma');
                        setEsignSigneeEmail((params as any).client_email || 'aman@betatech.in');
                      }}
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#1A1A1A]"
                    >
                      <option value="">-- Select Active Draft --</option>
                      {dbDocuments.map(d => (
                        <option key={d.id} value={d.id}>{d.title} (Cloud)</option>
                      ))}
                      {history.map(h => (
                        <option key={h.id} value={h.id}>{h.title} (Local)</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A4A4A]">Signee Legal Full Name</label>
                    <input
                      type="text"
                      value={esignSigneeName}
                      onChange={(e) => setEsignSigneeName(e.target.value)}
                      placeholder="e.g. Aman Sharma"
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#1A1A1A]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A4A4A]">Signee Email Address</label>
                    <input
                      type="email"
                      value={esignSigneeEmail}
                      onChange={(e) => setEsignSigneeEmail(e.target.value)}
                      placeholder="e.g. aman@betatech.in"
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#1A1A1A]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A4A4A]">Execution Protocol</label>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => { setEsignMethod('draw'); setEsignOtpSent(false); }}
                        className={`py-1.5 px-2 text-[10px] font-bold border rounded-lg transition-all ${esignMethod === 'draw' ? 'bg-[#1A1A1A] text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}
                      >
                        Draw Pad
                      </button>
                      <button
                        onClick={() => { setEsignMethod('type'); setEsignOtpSent(false); }}
                        className={`py-1.5 px-2 text-[10px] font-bold border rounded-lg transition-all ${esignMethod === 'type' ? 'bg-[#1A1A1A] text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}
                      >
                        Type Font
                      </button>
                      <button
                        onClick={() => { setEsignMethod('aadhaar'); }}
                        className={`py-1.5 px-2 text-[10px] font-bold border rounded-lg transition-all ${esignMethod === 'aadhaar' ? 'bg-[#1A1A1A] text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}
                      >
                        Aadhaar OTP
                      </button>
                    </div>
                  </div>

                  {esignMethod === 'draw' && (
                    <div className="space-y-1.5 bg-gray-50 border border-gray-200 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Draw Signature Area Below</p>
                      <div className="w-full h-32 bg-white border border-[#E5E5E5] rounded-lg relative overflow-hidden flex items-center justify-center cursor-crosshair">
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
                          <Plus className="w-5 h-5 text-gray-300" />
                          <span className="text-[9px] mt-0.5">Hold mouse to draw simulated signature</span>
                        </div>
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M 50 80 Q 120 20 180 90 T 290 40" fill="none" stroke="#1F2937" strokeWidth="2.5" />
                        </svg>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <button className="text-[#9E9E9E] hover:underline uppercase font-bold text-[9px]">Clear Pad</button>
                        <span className="text-gray-500 italic">Auto-Smoothing Active</span>
                      </div>
                    </div>
                  )}

                  {esignMethod === 'type' && (
                    <div className="space-y-1.5 bg-gray-50 border border-gray-200 p-3 rounded-xl">
                      <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wider block">Verify Initials Format</label>
                      <input
                        type="text"
                        value={esignTypedName || esignSigneeName}
                        onChange={(e) => setEsignTypedName(e.target.value)}
                        placeholder="Type Initials"
                        className="w-full px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-lg text-sm italic font-serif"
                      />
                      <p className="text-[10px] text-gray-400 leading-tight">Your name will be rendered in a secure digital signature script format.</p>
                    </div>
                  )}

                  {esignMethod === 'aadhaar' && (
                    <div className="space-y-3 bg-gray-50 border border-gray-200 p-3 rounded-xl">
                      {!esignOtpSent ? (
                        <div className="space-y-2">
                          <p className="text-[10px] text-gray-600 leading-relaxed">
                            Sends a simulated Aadhaar OTP verification code to the mobile number registered with their UIDAI profile.
                          </p>
                          <button
                            onClick={() => {
                              if (!esignSigneeName) {
                                alert("Please provide the legal name of the signee.");
                                return;
                              }
                              setEsignOtpSent(true);
                              alert(`Mock Aadhaar OTP sent! Simulated 6-digit code has been dispatched to signee's mobile endpoint.`);
                            }}
                            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow"
                          >
                            <Bell className="w-3.5 h-3.5" />
                            <span>Dispatch UIDAI OTP Code</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider block">Enter 6-Digit OTP</label>
                            <input
                              type="text"
                              maxLength={6}
                              value={esignOtpValue}
                              onChange={(e) => setEsignOtpValue(e.target.value.replace(/\D/g, ''))}
                              placeholder="e.g. 123456"
                              className="w-full px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-lg text-sm text-center font-mono tracking-widest text-lg font-bold"
                            />
                          </div>
                          <button
                            onClick={() => {
                              if (esignOtpValue.length !== 6) {
                                alert("Aadhaar OTP must be exactly 6 digits.");
                                return;
                              }
                              setEsignVerifyingOtp(true);
                              setTimeout(() => {
                                setEsignVerifyingOtp(false);
                                setEsignOtpSent(false);
                                setEsignOtpValue('');
                                
                                const newId = 'es-' + Date.now();
                                setEsignDocs(prev => [
                                  {
                                    id: newId,
                                    title: esignDocId ? (dbDocuments.find(d => d.id === esignDocId)?.title || history.find(h => h.id === esignDocId)?.title || 'Custom Agreement Clause') : 'Mutual Non-Disclosure Covenant',
                                    signeeName: esignSigneeName,
                                    signeeEmail: esignSigneeEmail,
                                    status: 'signed',
                                    signedAt: new Date().toISOString().split('T')[0],
                                    method: 'Aadhaar OTP Verification'
                                  },
                                  ...prev
                                ]);
                                setSelectedEsignDocId(newId);
                                alert("Document Successfully E-Signed! Aadhaar seal applied to PDF with secure compliance hash.");
                              }, 1500);
                            }}
                            disabled={esignVerifyingOtp}
                            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow"
                          >
                            {esignVerifyingOtp ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Verifying OTP Signature...</span>
                              </>
                            ) : (
                              <>
                                <FileCheck className="w-3.5 h-3.5" />
                                <span>Verify and Sign Contract</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {esignMethod !== 'aadhaar' && (
                    <button
                      onClick={() => {
                        if (!esignSigneeName) {
                          alert("Please specify the signee legal name.");
                          return;
                        }
                        const newId = 'es-' + Date.now();
                        setEsignDocs(prev => [
                          {
                            id: newId,
                            title: esignDocId ? (dbDocuments.find(d => d.id === esignDocId)?.title || history.find(h => h.id === esignDocId)?.title || 'Custom Agreement Clause') : 'Mutual Non-Disclosure Covenant',
                            signeeName: esignSigneeName,
                            signeeEmail: esignSigneeEmail,
                            status: 'signed',
                            signedAt: new Date().toISOString().split('T')[0],
                            method: esignMethod === 'draw' ? 'Draw Signature Pad' : 'Stylized Digital Script'
                          },
                          ...prev
                        ]);
                        setSelectedEsignDocId(newId);
                        alert("Signature matched and stamped onto document preview successfully!");
                      }}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Apply Signature & Stamp</span>
                    </button>
                  )}
                </div>
              </div>
            ) : activeTab === 'payments' ? (
              <div className="space-y-6">
                <div className="border-b border-amber-100 pb-4">
                  <h2 className="text-sm font-bold text-[#9E9E9E] uppercase tracking-widest">Log Professional Fees</h2>
                  <p className="text-xs text-[#5F5F5F] mt-1">
                    Log and collect Professional SLA fees and dynamic Non-Judicial Government Stamp Paper duty fees.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A4A4A]">Client Selection</label>
                    <select
                      value={paymentClientName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPaymentClientName(val);
                        // Suggest default details
                        setPaymentDesc(`Stamp Paper Duty + Dynamic Covenant Execution for ${val}`);
                      }}
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#1A1A1A]"
                    >
                      <option value="">-- Select client --</option>
                      <option value="Aman Sharma">Aman Sharma (Tech Founder)</option>
                      <option value="Rohan Malhotra">Rohan Malhotra (Malhotra Law Corp)</option>
                      {profiles.map(p => (
                        <option key={p.id} value={p.name}>{p.name} ({(p as any).company || 'Client'})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A4A4A]">SLA Advisory & Execution Fee (INR)</label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      placeholder="e.g. 15000"
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#1A1A1A] font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A4A4A]">Government Stamp Duty Value (INR)</label>
                    <select
                      value={paymentStampDuty}
                      onChange={(e) => setPaymentStampDuty(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#1A1A1A] font-mono"
                    >
                      <option value="100">₹100 (Affidavit / Standard NDA)</option>
                      <option value="500">₹500 (Standard Power of Attorney / SaaS Lease)</option>
                      <option value="1000">₹1,000 (Commercial Retainer SLAs)</option>
                      <option value="5000">₹5,000 (High-stakes Omnibus / Land Sale)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A4A4A]">Stamp Jurisdiction State</label>
                    <select
                      value={paymentStampState}
                      onChange={(e) => setPaymentStampState(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#1A1A1A]"
                    >
                      <option value="Delhi">Delhi NCT</option>
                      <option value="Karnataka">Karnataka (Bangalore)</option>
                      <option value="Maharashtra">Maharashtra (Mumbai)</option>
                      <option value="Tamil Nadu">Tamil Nadu (Chennai)</option>
                      <option value="Uttar Pradesh">Uttar Pradesh (Noida)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A4A4A]">Invoice Narrative</label>
                    <textarea
                      value={paymentDesc}
                      onChange={(e) => setPaymentDesc(e.target.value)}
                      placeholder="Describe professional services..."
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#1A1A1A] min-h-[60px] resize-none text-xs"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!paymentClientName) {
                        alert("Please select a client to log invoice.");
                        return;
                      }
                      setIsCreatingInvoice(true);
                      setTimeout(() => {
                        setIsCreatingInvoice(false);
                        const newId = 'inv-' + (100 + paymentInvoices.length + 1);
                        setPaymentInvoices(prev => [
                          {
                            id: newId,
                            clientName: paymentClientName,
                            description: paymentDesc || 'Stamp Duty Execution',
                            amount: paymentAmount,
                            stampDuty: paymentStampDuty,
                            status: 'unpaid',
                            date: new Date().toISOString().split('T')[0]
                          },
                          ...prev
                        ]);
                        setSelectedInvoiceId(newId);
                        alert(`Professional Invoice ${newId} drafted and synced to client account successfully.`);
                      }, 1200);
                    }}
                    disabled={isCreatingInvoice}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow disabled:opacity-50"
                  >
                    {isCreatingInvoice ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Invoice Node...</span>
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Issue SLA Invoice</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : activeTab === 'renewals' ? (
              <div className="space-y-6">
                <div className="border-b border-red-100 pb-4">
                  <h2 className="text-sm font-bold text-[#9E9E9E] uppercase tracking-widest">Schedule Expiry Alerts</h2>
                  <p className="text-xs text-[#5F5F5F] mt-1">
                    Configure milestones and automatic calendar renewal triggers for your executed contracts.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A4A4A]">Target Contract</label>
                    <select
                      value={renewalDocTitle}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRenewalDocTitle(val);
                        // Default client matching
                        setRenewalClientName(params.client_name || 'Aman Sharma');
                        setRenewalExpiryDate(new Date(Date.now() + 31536000000).toISOString().substring(0,10)); // +1 year
                      }}
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#1A1A1A]"
                    >
                      <option value="">-- Select Active Covenant --</option>
                      {dbDocuments.map(d => (
                        <option key={d.id} value={d.title}>{d.title}</option>
                      ))}
                      {history.map(h => (
                        <option key={h.id} value={h.title}>{h.title}</option>
                      ))}
                      <option value="SaaS Office Lease">SaaS Bangalore Office Lease SLA</option>
                      <option value="Co-founder Vesting Deed">Co-founder Vesting Deed</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A4A4A]">Signee/Client Profile</label>
                    <input
                      type="text"
                      value={renewalClientName}
                      onChange={(e) => setRenewalClientName(e.target.value)}
                      placeholder="e.g. Aman Sharma"
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#1A1A1A]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A4A4A]">Expiration / Renewal Date</label>
                    <input
                      type="date"
                      value={renewalExpiryDate}
                      onChange={(e) => setRenewalExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#1A1A1A] font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#4A4A4A]">Alert Offset Warning Threshold</label>
                    <select
                      value={renewalAlertDays}
                      onChange={(e) => setRenewalAlertDays(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#1A1A1A]"
                    >
                      <option value="15">15 Days Before</option>
                      <option value="30">30 Days Before (Standard)</option>
                      <option value="60">60 Days Before (High-stakes)</option>
                    </select>
                  </div>

                  <button
                    onClick={async () => {
                      if (!renewalDocTitle) {
                        alert("Please select a target contract.");
                        return;
                      }
                      setIsCreatingRenewal(true);
                      
                      try {
                        const newId = 'rem-' + Date.now();
                        setRenewalReminders(prev => [
                          {
                            id: newId,
                            title: renewalDocTitle,
                            clientName: renewalClientName,
                            expiryDate: renewalExpiryDate,
                            alertDaysBefore: renewalAlertDays,
                            status: 'active'
                          },
                          ...prev
                        ]);

                        // Automatically synchronise this milestone to Google Calendar!
                        if (currentUser && !currentUser.isAnonymous) {
                          setIsSyncingToGoogleCalendar(true);
                          const tokenObj = localStorage.getItem('google_oauth_token');
                          if (tokenObj) {
                            const { token } = JSON.parse(tokenObj);
                            
                            // Construct calendar slot details
                            const startDateTime = new Date(renewalExpiryDate);
                            startDateTime.setHours(10, 0, 0, 0); // 10:00 AM expiration review
                            
                            const endDateTime = new Date(startDateTime.getTime() + 1800000); // 30 mins
                            
                            await createCalendarEvent(token, {
                              summary: `⚠️ CONTRACT EXPIRATION ALERT: ${renewalDocTitle}`,
                              description: `Legal OS Automated Alert: The contract executed with ${renewalClientName} is set to expire on ${renewalExpiryDate}. Pre-renewal reviews triggered automatically. Offset: ${renewalAlertDays} Days.`,
                              startDateTime: startDateTime.toISOString(),
                              endDateTime: endDateTime.toISOString(),
                              enableMeet: false
                            });
                            
                            alert(`Milestone successfully synced! Google Calendar alert synced & issued on target date: ${renewalExpiryDate}.`);
                          }
                        }

                        alert(`Renewal milestone created! Automated notification daemon active.`);
                      } catch (err: any) {
                        console.error("Failed to sync calendar renewal:", err);
                        alert(`Milestone saved offline. Calendar sync missed: ${err.message || String(err)}`);
                      } finally {
                        setIsCreatingRenewal(false);
                        setIsSyncingToGoogleCalendar(false);
                      }
                    }}
                    disabled={isCreatingRenewal}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow disabled:opacity-50"
                  >
                    {isCreatingRenewal ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{isSyncingToGoogleCalendar ? 'Syncing Google Calendar...' : 'Saving Reminder Daemon...'}</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5" />
                        <span>Schedule Renewal Milestone</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : activeTab === 'ai_assistant' ? (
              <div className="space-y-6">
                <div className="border-b border-cyan-100 pb-4">
                  <h2 className="text-sm font-bold text-[#9E9E9E] uppercase tracking-widest">Expert Advisory Hub</h2>
                  <p className="text-xs text-[#5F5F5F] mt-1">
                    Ask questions about Indian Corporate, Contract, IT, or Financial laws. Analyze legal structures with Gemini.
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-widest px-1">Common Expert Queries</p>
                  
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    <button
                      onClick={async () => {
                        setAiChatQuery("Under the Indian Contract Act 1872, is an agreement without an official physical stamp paper legally binding? What are e-stamping rules?");
                        // Immediately submit
                        setIsAiResponding(true);
                        setAiChatHistory(prev => [...prev, { role: 'user', text: "Under the Indian Contract Act 1872, is an agreement without an official physical stamp paper legally binding? What are e-stamping rules?" }]);
                        try {
                          const res = await askLegalAssistant("Under the Indian Contract Act 1872, is an agreement without an official physical stamp paper legally binding? What are e-stamping rules?");
                          setAiChatHistory(prev => [...prev, { role: 'model', text: res }]);
                        } catch (err: any) {
                          setAiChatHistory(prev => [...prev, { role: 'model', text: `Failed to fetch AI reply: ${err.message || String(err)}` }]);
                        } finally {
                          setIsAiResponding(false);
                        }
                      }}
                      className="w-full p-2.5 bg-white hover:bg-cyan-50 border border-gray-200 hover:border-cyan-200 rounded-lg text-left text-xs text-gray-700 transition-all font-medium leading-normal animate-fade-in"
                    >
                      ⚖️ Validity of Unstamped Agreements in India
                    </button>

                    <button
                      onClick={async () => {
                        setAiChatQuery("Explain Section 138 of the Negotiable Instruments Act in relation to commercial professional service payments and client chequing.");
                        setIsAiResponding(true);
                        setAiChatHistory(prev => [...prev, { role: 'user', text: "Explain Section 138 of the Negotiable Instruments Act in relation to commercial professional service payments and client chequing." }]);
                        try {
                          const res = await askLegalAssistant("Explain Section 138 of the Negotiable Instruments Act in relation to commercial professional service payments and client chequing.");
                          setAiChatHistory(prev => [...prev, { role: 'model', text: res }]);
                        } catch (err: any) {
                          setAiChatHistory(prev => [...prev, { role: 'model', text: `Failed to fetch AI reply: ${err.message || String(err)}` }]);
                        } finally {
                          setIsAiResponding(false);
                        }
                      }}
                      className="w-full p-2.5 bg-white hover:bg-cyan-50 border border-gray-200 hover:border-cyan-200 rounded-lg text-left text-xs text-gray-700 transition-all font-medium leading-normal"
                    >
                      💰 Payment Protection: Sec 138 NI Act
                    </button>

                    <button
                      onClick={async () => {
                        setAiChatQuery("What is standard reverse vesting for startup co-founders in India? How do we structure IP assignment clauses before VC funding?");
                        setIsAiResponding(true);
                        setAiChatHistory(prev => [...prev, { role: 'user', text: "What is standard reverse vesting for startup co-founders in India? How do we structure IP assignment clauses before VC funding?" }]);
                        try {
                          const res = await askLegalAssistant("What is standard reverse vesting for startup co-founders in India? How do we structure IP assignment clauses before VC funding?");
                          setAiChatHistory(prev => [...prev, { role: 'model', text: res }]);
                        } catch (err: any) {
                          setAiChatHistory(prev => [...prev, { role: 'model', text: `Failed to fetch AI reply: ${err.message || String(err)}` }]);
                        } finally {
                          setIsAiResponding(false);
                        }
                      }}
                      className="w-full p-2.5 bg-white hover:bg-cyan-50 border border-gray-200 hover:border-cyan-200 rounded-lg text-left text-xs text-gray-700 transition-all font-medium leading-normal"
                    >
                      🚀 Startup Co-founder Vesting & IP assignment rules
                    </button>

                    <button
                      onClick={async () => {
                        if (!generatedText) {
                          alert("Please draft or generate an agreement first to summarize it.");
                          return;
                        }
                        const query = "Summarize the critical risks, liability caps, and termination obligations in my current drafted agreement text.";
                        setAiChatQuery(query);
                        setIsAiResponding(true);
                        setAiChatHistory(prev => [...prev, { role: 'user', text: query }]);
                        try {
                          const res = await askLegalAssistant(query, generatedText);
                          setAiChatHistory(prev => [...prev, { role: 'model', text: res }]);
                        } catch (err: any) {
                          setAiChatHistory(prev => [...prev, { role: 'model', text: `Failed to fetch AI reply: ${err.message || String(err)}` }]);
                        } finally {
                          setIsAiResponding(false);
                        }
                      }}
                      className="w-full p-2.5 bg-white hover:bg-cyan-50 border border-gray-200 hover:border-cyan-200 rounded-lg text-left text-xs text-gray-700 transition-all font-medium leading-normal flex items-center justify-between"
                    >
                      <span>🔍 Audit Current Draft Risk Summary</span>
                      {!generatedText && <span className="text-[8px] bg-gray-100 px-1 py-0.2 rounded">Draft empty</span>}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-[#9E9E9E] uppercase tracking-widest">Document Database</h2>
                    <button 
                      onClick={() => {
                        if (confirm("Reset local history cache?")) {
                          setHistory([]);
                          localStorage.removeItem('rba_history');
                        }
                      }}
                      className="text-[10px] font-bold text-[#1A1A1A] hover:underline"
                    >
                      CLEAR CACHE
                    </button>
                  </div>
                  {dbDocuments.length === 0 && history.length === 0 ? (
                    <p className="text-xs text-[#9E9E9E]">No history logged yet. Run a generator or create a profile to start!</p>
                  ) : (
                    <div className="space-y-3">
                      {/* Firebase database documents */}
                      {dbDocuments.map((docItem) => (
                        <div 
                          key={docItem.id} 
                          onClick={() => {
                            setGeneratedText(docItem.content);
                            setSelectedType(docItem.type as DocumentType);
                            setParams(docItem.params);
                            if (docItem.emailDraft || docItem.whatsappSummary) {
                              setMultiOutput({
                                email_draft: docItem.emailDraft || '',
                                whatsapp_summary: docItem.whatsappSummary || ''
                              });
                            } else {
                              setMultiOutput(null);
                            }
                          }}
                          className="p-3 bg-white border border-[#E5E5E5] rounded-xl cursor-pointer hover:border-[#1A1A1A] transition-colors group relative"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wider">{docItem.type}</span>
                            <span className="text-[9px] text-[#9E9E9E] font-medium">Cloud</span>
                          </div>
                          <p className="text-xs font-semibold text-[#1A1A1A] truncate group-hover:text-black">{docItem.title}</p>
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm("Are you sure you want to delete this document from Cloud storage?")) {
                                try {
                                  await deleteDocumentFromFirebase(docItem.id);
                                  await loadUserData();
                                } catch (err) {
                                  console.error("Failed to delete document:", err);
                                }
                              }
                            }}
                            className="absolute right-3.5 bottom-3 text-[#9E9E9E] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 bg-gray-50 rounded border border-gray-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Offline localStorage documents */}
                      {history.filter(h => !dbDocuments.some(d => d.title === h.title)).map((item) => (
                        <div 
                          key={item.id} 
                          onClick={() => setGeneratedText(item.text)}
                          className="p-3 bg-white border border-dashed border-[#E5E5E5] rounded-xl cursor-pointer hover:border-[#1A1A1A] transition-colors group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-bold text-[#9E9E9E] uppercase">{item.type} (Local)</span>
                            <span className="text-[9px] text-[#9E9E9E]">{item.date.split(',')[0]}</span>
                          </div>
                          <p className="text-xs font-semibold text-[#1A1A1A] truncate">{item.title}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          )}


          {/* Preview Side */}
          {(!isMobile || mobileView === 'preview') && (
            <div className="flex-1 bg-[#F5F5F5] overflow-y-auto p-4 lg:p-8">
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Smart Warnings */}
              <AnimatePresence>
                {smartWarnings.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3"
                  >
                    {smartWarnings.map((warning, idx) => (
                      <div key={idx} className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Smart Recommendation</p>
                          <p className="text-sm text-amber-900">{warning}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generated Document */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] min-h-[600px] p-6 lg:p-10 relative">
                {activeTab === 'crm' ? (
                  <div className="space-y-6 text-left">
                    <div className="border-b border-[#E5E5E5] pb-4 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-rose-500" />
                          <span>Legal OS Control Dashboard</span>
                        </h2>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">Commercial Pipeline Status & Client Posture Metrics</p>
                      </div>
                      <span className="text-[10px] bg-rose-50 border border-rose-100 text-rose-700 px-2 py-0.5 rounded font-mono font-bold">SYSTEM ACTIVE</span>
                    </div>

                    {/* Dashboard KPI Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-[#F9F9F9] border border-gray-100 rounded-xl p-3.5 text-center shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Covenants</p>
                        <p className="text-xl font-bold text-gray-950 mt-1">{dbDocuments.length + history.length}</p>
                        <p className="text-[9px] text-emerald-600 font-semibold mt-0.5">↑ Online Archive</p>
                      </div>

                      <div className="bg-[#F9F9F9] border border-gray-100 rounded-xl p-3.5 text-center shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">KYC Approval Rate</p>
                        <p className="text-xl font-bold text-gray-950 mt-1">
                          {Math.round((Object.values(kycRecords).filter(r => r.status === 'approved').length / Math.max(Object.keys(kycRecords).length, 1)) * 100)}%
                        </p>
                        <p className="text-[9px] text-[#9E9E9E] mt-0.5">UIDAI Integrated</p>
                      </div>

                      <div className="bg-[#F9F9F9] border border-gray-100 rounded-xl p-3.5 text-center shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">E-Sign Execution</p>
                        <p className="text-xl font-bold text-gray-950 mt-1">
                          {esignDocs.filter(d => d.status === 'signed').length} / {esignDocs.length}
                        </p>
                        <p className="text-[9px] text-indigo-600 font-semibold mt-0.5">Aadhaar Stamps</p>
                      </div>

                      <div className="bg-[#F9F9F9] border border-gray-100 rounded-xl p-3.5 text-center shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ledger Revenue</p>
                        <p className="text-xl font-bold text-gray-950 mt-1">
                          ₹{paymentInvoices.reduce((acc, curr) => acc + (curr.status === 'paid' ? curr.amount : 0), 0).toLocaleString()}
                        </p>
                        <p className="text-[9px] text-amber-600 font-semibold mt-0.5">Realized Professional Fees</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      {/* Interactive Client Compliances */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Real-Time Client Status Feed</h3>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          <div className="bg-white border border-gray-200 hover:border-gray-950 p-3 rounded-xl transition-all shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-bold text-xs text-gray-900">Aman Sharma</p>
                              <span className="text-[9px] bg-blue-100 text-blue-800 font-mono font-bold px-1.5 py-0.2 rounded">TECH FOUNDER</span>
                            </div>
                            <p className="text-[10px] text-gray-500 truncate mb-2">Beta-Tech Investments Inc.</p>
                            <div className="flex flex-wrap gap-1.5">
                              <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold">KYC: Verified</span>
                              <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-100 font-bold">E-Sign: Executed</span>
                              <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-100 font-bold">Fees: Unpaid</span>
                            </div>
                          </div>

                          <div className="bg-white border border-gray-200 hover:border-gray-950 p-3 rounded-xl transition-all shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-bold text-xs text-gray-900">Rohan Malhotra</p>
                              <span className="text-[9px] bg-purple-100 text-purple-800 font-mono font-bold px-1.5 py-0.2 rounded">LEGAL PARTNER</span>
                            </div>
                            <p className="text-[10px] text-gray-500 truncate mb-2">Malhotra Law Corporation</p>
                            <div className="flex flex-wrap gap-1.5">
                              <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-100 font-bold">KYC: Pending Match</span>
                              <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-100 font-bold">E-Sign: Pending</span>
                              <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold">Fees: Settled</span>
                            </div>
                          </div>

                          {profiles.map(p => {
                            const kycRec = kycRecords[p.id];
                            return (
                              <div key={p.id} className="bg-white border border-gray-200 hover:border-gray-900 p-3 rounded-xl transition-all shadow-sm">
                                <div className="flex justify-between items-center mb-1">
                                  <p className="font-bold text-xs text-gray-900">{p.name || 'Client'}</p>
                                  <span className="text-[8px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded">PROFILE</span>
                                </div>
                                <p className="text-[10px] text-gray-500 truncate mb-2">{(p as any).company || 'Private Entity'}</p>
                                <div className="flex flex-wrap gap-1.5">
                                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full font-bold border ${kycRec?.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-amber-50 text-amber-800 border-amber-100'}`}>
                                    KYC: {kycRec?.status === 'approved' ? 'Verified' : 'Pending'}
                                  </span>
                                  <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-100">
                                    No Active SLA
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Legal Posture Compliance Audit Warnings */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Compliance Risk Radar</h3>
                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 space-y-3.5">
                          <p className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
                            <span>Urgent Risk Detections</span>
                          </p>

                          <div className="space-y-2 text-[11px] text-rose-900 leading-normal">
                            <div className="flex gap-2 p-2 bg-white/60 border border-rose-150 rounded-lg">
                              <span className="text-rose-650 font-bold">⚠️</span>
                              <p><strong>Unstamped Covenants Alert:</strong> NDA drafted for Aman Sharma lacks legal non-judicial stamp allocation codes. Proceed to <strong>Payment Tracker</strong> to record duty value.</p>
                            </div>

                            <div className="flex gap-2 p-2 bg-white/60 border border-rose-150 rounded-lg">
                              <span className="text-rose-650 font-bold">⚠️</span>
                              <p><strong>Identity Validation Gap:</strong> Client Rohan Malhotra PAN database query is currently marked <strong>unverified/pending</strong>. Approved KYC check is mandatory prior to OTP signing protocols.</p>
                            </div>

                            <div className="flex gap-2 p-2 bg-white/60 border border-[#E5E5E5] rounded-lg text-gray-600">
                              <span className="text-emerald-600 font-bold">✓</span>
                              <p><strong>Active API Sync Status:</strong> Google Calendar API token verified. Client scheduling module authenticated successfully on secure port 3000.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeTab === 'kyc' ? (
                  <div className="space-y-6 text-left">
                    <div className="border-b border-[#E5E5E5] pb-4 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-600" />
                          <span>UIDAI Compliance Identity Vault</span>
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">Centralised Identity Match & PAN State Parsing Verification</p>
                      </div>
                      <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded font-mono font-bold">VERIFIED MATCH</span>
                    </div>

                    {selectedKycRecordKey && kycRecords[selectedKycRecordKey] ? (
                      <div className="space-y-6">
                        {/* Indian Govt Format Certificate */}
                        <div className="border-4 double border-emerald-600 p-6 rounded-2xl bg-white shadow relative overflow-hidden">
                          {/* Background watermark */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none rotate-12 text-gray-900 text-6xl font-bold font-serif leading-none">
                            GOVERNMENT OF INDIA COMPLIANCE
                          </div>

                          <div className="flex flex-col items-center text-center space-y-1 mb-6 border-b border-[#E5E5E5] pb-4">
                            <span className="text-xl">🇮🇳</span>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-serif">Kyc Compliance Audit Certificate</h3>
                            <p className="text-[9px] text-gray-400 font-mono">CENTRAL REGULATORY COMPLIANCE SYSTEM, NEW DELHI</p>
                          </div>

                          <div className="grid grid-cols-2 gap-y-4 text-xs">
                            <div>
                              <p className="text-[9px] text-gray-400 uppercase font-mono">Verified Legal Profile</p>
                              <p className="font-bold text-gray-900 text-sm mt-0.5">
                                {selectedKycRecordKey === 'p1' ? 'Aman Sharma' : selectedKycRecordKey === 'p2' ? 'Rohan Malhotra' : 'Registered Legal Client'}
                              </p>
                            </div>

                            <div>
                              <p className="text-[9px] text-gray-400 uppercase font-mono">Compliance Audit State</p>
                              <p className="font-bold text-emerald-700 text-sm mt-0.5 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                <span>APPROVED & SECURED</span>
                              </p>
                            </div>

                            <div>
                              <p className="text-[9px] text-gray-400 uppercase font-mono">PAN Verification Parse</p>
                              <p className="font-bold text-gray-900 font-mono mt-0.5 text-xs">
                                {kycRecords[selectedKycRecordKey].pan}
                              </p>
                              <p className="text-[8px] text-gray-500 italic leading-tight mt-0.5">
                                {kycRecords[selectedKycRecordKey].pan.substring(3,4) === 'P' ? 'Parsed Entity: [P] - INDIVIDUAL' : 'Parsed Entity: [C] - BUSINESS COMPANY'}
                              </p>
                            </div>

                            <div>
                              <p className="text-[9px] text-gray-400 uppercase font-mono">Aadhaar UID Reference Hash</p>
                              <p className="font-bold text-gray-900 font-mono mt-0.5 text-xs truncate" title="SHA-256 MATCH SECURE TOKEN">
                                SHA-256: 8f4e2c9a...1e2d
                              </p>
                              <p className="text-[8px] text-gray-500 italic mt-0.5">Verified via Registered OTP Mobile</p>
                            </div>

                            <div className="col-span-2 border-t border-dashed border-gray-200 pt-3">
                              <p className="text-[9px] text-gray-400 uppercase font-mono">Authenticated Hash Checksum Code</p>
                              <p className="font-mono text-[9px] text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 truncate mt-1">
                                SHA256: 4fbc39d891e2b3c4f92d8a5628b03fd928ecf75e92182ca9f1092e472a1bf3b4
                              </p>
                            </div>
                          </div>

                          {/* Stamp graphic overlay */}
                          <div className="absolute right-6 bottom-4 border-2 border-emerald-500 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded px-2 py-1 rotate-12 opacity-80 bg-white shadow-sm flex flex-col items-center select-none font-sans scale-90">
                            <span>KYC CERTIFIED</span>
                            <span className="text-[7px] font-mono mt-0.5">DATE: {kycRecords[selectedKycRecordKey].verifiedAt || '2026-06-30'}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs text-[#9E9E9E]">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            <span>Secure database validation connection is SSL active.</span>
                          </span>
                          <button
                            onClick={() => window.print()}
                            className="text-xs font-semibold text-gray-900 hover:underline flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Certificate</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-1">
                          <ShieldCheck className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm">Select verified client to inspect certificate</h3>
                        <p className="text-xs text-[#9E9E9E] max-w-sm">
                          Use the verify form in the left control pane to validate client credentials against standard government formats.
                        </p>
                      </div>
                    )}
                  </div>
                ) : activeTab === 'esign' ? (
                  <div className="space-y-6 text-left">
                    <div className="border-b border-[#E5E5E5] pb-4 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <FileCheck className="w-5 h-5 text-indigo-600" />
                          <span>E-Signature Registry Portal</span>
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">Aadhaar OTP Signature Logs & IP Checksum Security Ledger</p>
                      </div>
                      <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-mono font-bold">DIGITAL REGISTRY</span>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-[#F9F9F9] border border-gray-200 rounded-2xl p-4 lg:p-6 space-y-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Executed E-Signatures Log</h3>
                        
                        <div className="space-y-3">
                          {esignDocs.map((doc) => (
                            <div 
                              key={doc.id} 
                              onClick={() => setSelectedEsignDocId(doc.id)}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-sm ${selectedEsignDocId === doc.id ? 'bg-white border-indigo-500 ring-2 ring-indigo-50/50' : 'bg-white hover:bg-gray-50 border-gray-150'}`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold text-xs text-gray-900 truncate max-w-md">{doc.title}</h4>
                                  <p className="text-[10px] text-gray-400 mt-0.5">Signee: <strong className="text-gray-700">{doc.signeeName}</strong> ({doc.signeeEmail})</p>
                                </div>
                                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${doc.status === 'signed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' : 'bg-amber-50 text-amber-800 border border-amber-150'}`}>
                                  {doc.status.toUpperCase()}
                                </span>
                              </div>

                              {doc.status === 'signed' && (
                                <div className="mt-2 pt-2 border-t border-dashed border-gray-100 flex justify-between items-center text-[9px] text-[#9E9E9E] font-mono">
                                  <span>Protocol: <strong>{doc.method || 'Standard OTP'}</strong></span>
                                  <span>Signed on: {doc.signedAt}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedEsignDocId && esignDocs.find(d => d.id === selectedEsignDocId && d.status === 'signed') ? (
                        <div className="border border-gray-300 p-5 rounded-2xl bg-white shadow-sm space-y-3">
                          <p className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider">Digital Verification Stamp Seal</p>
                          
                          <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-xl space-y-2 text-xs">
                            <div className="flex justify-between font-mono text-[10px]">
                              <span className="text-gray-450">Document Registry Key</span>
                              <span className="text-gray-950 font-bold">{selectedEsignDocId}</span>
                            </div>

                            <div className="flex justify-between font-mono text-[10px]">
                              <span className="text-gray-450">Timestamp Signature Node</span>
                              <span className="text-gray-950 font-bold">
                                {esignDocs.find(d => d.id === selectedEsignDocId)?.signedAt} 10:48 AM UTC
                              </span>
                            </div>

                            <div className="flex justify-between font-mono text-[10px]">
                              <span className="text-gray-450">Authorised IP Address</span>
                              <span className="text-gray-950 font-bold">103.114.28.140 (Bangalore NCT)</span>
                            </div>

                            <div className="flex justify-between font-mono text-[10px] border-t border-dashed border-indigo-150 pt-2">
                              <span className="text-gray-450">Secure verification ID</span>
                              <span className="text-emerald-700 font-bold">UIDAI-OTP-CONFIRMED-987</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                              <FileCheck className="w-5 h-5 text-indigo-700" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-gray-900">Aadhaar Certified Sign-off Seal</p>
                              <p className="text-[10px] text-gray-500">This seal binds all terms on current draft safely under IT Act 2000 rules.</p>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : activeTab === 'payments' ? (
                  <div className="space-y-6 text-left">
                    <div className="border-b border-[#E5E5E5] pb-4 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-amber-600" />
                          <span>SLA Fees & Non-Judicial Stamp Paper Ledger</span>
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">Track professional execution invoices & stamp allocation fees</p>
                      </div>
                      <span className="text-[10px] bg-amber-50 border border-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">LEDGER ACTIVE</span>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-[#F9F9F9] border border-gray-200 rounded-2xl p-4 lg:p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Payment Covenants</h3>
                          <span className="text-[10px] text-amber-700 font-bold">₹{paymentInvoices.reduce((acc, curr) => acc + (curr.status === 'unpaid' ? curr.amount + curr.stampDuty : 0), 0).toLocaleString()} Dues Outstanding</span>
                        </div>

                        <div className="space-y-3">
                          {paymentInvoices.map((inv) => (
                            <div 
                              key={inv.id} 
                              onClick={() => setSelectedInvoiceId(inv.id)}
                              className={`p-4 rounded-xl border transition-all cursor-pointer shadow-sm ${selectedInvoiceId === inv.id ? 'bg-white border-amber-500 ring-2 ring-amber-50/50' : 'bg-white hover:bg-gray-50 border-gray-150'}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-xs text-gray-900">{inv.clientName}</h4>
                                    <span className="text-[8px] font-mono bg-gray-100 text-[#4A4A4A] px-1 rounded">{inv.id}</span>
                                  </div>
                                  <p className="text-[10px] text-gray-500 mt-0.5">{inv.description}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-bold text-gray-950">₹{(inv.amount + inv.stampDuty).toLocaleString()}</p>
                                  <p className="text-[8px] text-[#9E9E9E] font-mono">Advisory: ₹{inv.amount} | Stamp: ₹{inv.stampDuty}</p>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-dashed border-gray-100 flex justify-between items-center text-[10px]">
                                <span className={`font-mono font-bold px-2 py-0.5 rounded-full text-[9px] ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' : 'bg-red-50 text-red-800 border border-red-150'}`}>
                                  {inv.status.toUpperCase()}
                                </span>
                                
                                {inv.status === 'unpaid' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm(`Mark invoice ${inv.id} as fully settled?`)) {
                                        setPaymentInvoices(prev => prev.map(item => item.id === inv.id ? { ...item, status: 'paid' } : item));
                                      }
                                    }}
                                    className="px-2 py-1 bg-emerald-650 hover:bg-emerald-700 text-white text-[9px] font-bold rounded transition-colors shadow-sm"
                                  >
                                    Mark as Paid
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Professional Invoice Preview Print Sheet */}
                      {selectedInvoiceId && paymentInvoices.find(i => i.id === selectedInvoiceId) ? (
                        (() => {
                          const invoiceObj = paymentInvoices.find(i => i.id === selectedInvoiceId)!;
                          const cgst = Math.round(invoiceObj.amount * 0.09);
                          const sgst = Math.round(invoiceObj.amount * 0.09);
                          const totalSla = invoiceObj.amount + cgst + sgst;
                          const grandTotal = totalSla + invoiceObj.stampDuty;

                          return (
                            <div className="border border-dashed border-gray-300 p-6 rounded-2xl bg-white shadow-sm space-y-4">
                              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                                <div>
                                  <p className="text-xs font-black text-gray-900 uppercase tracking-widest font-serif">RBA AI PRO Tax Invoice</p>
                                  <p className="text-[9px] text-gray-400 font-mono mt-0.5">SAC Code: 998211 | Legal Consultants</p>
                                </div>
                                <div className="text-right text-[9px] font-mono text-gray-400">
                                  <p>Invoice #: {invoiceObj.id}</p>
                                  <p>Date: {invoiceObj.date}</p>
                                </div>
                              </div>

                              <div className="space-y-2 text-xs">
                                <div className="grid grid-cols-2">
                                  <div>
                                    <p className="text-[9px] text-gray-400 uppercase font-mono">Billed to client</p>
                                    <p className="font-bold text-gray-800">{invoiceObj.clientName}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[9px] text-gray-400 uppercase font-mono">Execution State</p>
                                    <p className="font-bold text-gray-800">Maharashtra NCT (MH-27)</p>
                                  </div>
                                </div>

                                <div className="border-t border-dashed border-gray-150 my-2 pt-2">
                                  <div className="flex justify-between py-1 text-[11px] font-semibold">
                                    <span>Advisory Professional Fees (SLA)</span>
                                    <span>₹{invoiceObj.amount.toLocaleString()}.00</span>
                                  </div>
                                  <div className="flex justify-between py-0.5 text-[10px] text-gray-500 italic pl-2">
                                    <span>CGST @ 9%</span>
                                    <span>₹{cgst.toLocaleString()}.00</span>
                                  </div>
                                  <div className="flex justify-between py-0.5 text-[10px] text-gray-500 italic pl-2">
                                    <span>SGST @ 9%</span>
                                    <span>₹{sgst.toLocaleString()}.00</span>
                                  </div>
                                  <div className="flex justify-between py-1 text-[11px] font-semibold border-t border-gray-100 my-1">
                                    <span>Total SLA Professional Portion</span>
                                    <span>₹{totalSla.toLocaleString()}.00</span>
                                  </div>
                                  <div className="flex justify-between py-1 text-[11px] font-semibold">
                                    <span>Government Non-Judicial Stamp Duty Paper</span>
                                    <span>₹{invoiceObj.stampDuty.toLocaleString()}.00</span>
                                  </div>
                                </div>

                                <div className="flex justify-between py-2 border-t border-double border-gray-900 font-bold text-sm bg-gray-50 px-2 rounded-lg">
                                  <span>GRAND TOTAL INVOICED (INR)</span>
                                  <span>₹{grandTotal.toLocaleString()}.00</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      ) : null}
                    </div>
                  </div>
                ) : activeTab === 'renewals' ? (
                  <div className="space-y-6 text-left">
                    <div className="border-b border-[#E5E5E5] pb-4 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Bell className="w-5 h-5 text-red-600" />
                          <span>Contract Expiry & Milestone Radar</span>
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">Contract lifecycles, warning countdown triggers, & Google Sync alerts</p>
                      </div>
                      <span className="text-[10px] bg-red-50 border border-red-100 text-red-800 px-2 py-0.5 rounded font-mono font-bold">ALERTS MONITOR</span>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-red-50/50 border border-red-100 rounded-xl p-3.5 shadow-sm">
                          <p className="text-[9px] font-bold text-red-850 uppercase tracking-wider">Critical Approaching Expirations</p>
                          <p className="text-lg font-black text-gray-950 mt-1">1 SLA</p>
                          <p className="text-[9px] text-red-700 font-semibold mt-0.5">SaaS Lease (Expires in -10 Days)</p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Active Monitoring Daemons</p>
                          <p className="text-lg font-black text-gray-950 mt-1">{renewalReminders.length} Active</p>
                          <p className="text-[9px] text-gray-500 mt-0.5">Polling and synchronization live</p>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-2xl p-4 lg:p-6 space-y-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lifecycle Reminders Database</h3>
                        
                        <div className="space-y-3">
                          {renewalReminders.map((rem) => {
                            const expDate = new Date(rem.expiryDate);
                            const daysDiff = Math.ceil((expDate.getTime() - Date.now()) / 86400000);
                            const isCritical = daysDiff <= rem.alertDaysBefore;

                            return (
                              <div key={rem.id} className="p-4 rounded-xl border bg-white border-gray-150 hover:border-gray-900 transition-all shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-bold text-xs text-gray-900">{rem.title}</h4>
                                    <p className="text-[10px] text-gray-500 mt-0.5">Partner client: <strong className="text-gray-700">{rem.clientName}</strong></p>
                                  </div>
                                  <div className="text-right">
                                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${daysDiff < 0 ? 'bg-red-100 text-red-800' : isCritical ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
                                      {daysDiff < 0 ? 'EXPIRED' : `${daysDiff} Days Left`}
                                    </span>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-dashed border-gray-100 flex justify-between items-center text-[10px]">
                                  <span className="text-gray-450">Alert Warning Offset: <strong>{rem.alertDaysBefore} Days Prior</strong></span>
                                  
                                  <button
                                    onClick={() => {
                                      alert(`[WHATSAPP DAEMON SIMULATION] Sent automated alert to ${rem.clientName} register mobile +91 ******9874: \n\n"Dear ${rem.clientName}, your signed contract '${rem.title}' is scheduled to expire on ${rem.expiryDate}. Please schedule a renewal draft review."`);
                                    }}
                                    className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 text-[9px] font-bold rounded border border-rose-100 transition-colors flex items-center gap-1"
                                  >
                                    <span>Simulate Ping</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeTab === 'ai_assistant' ? (
                  <div className="space-y-4 text-left flex flex-col h-[650px] relative">
                    <div className="border-b border-[#E5E5E5] pb-4 shrink-0 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Bot className="w-5 h-5 text-cyan-600 animate-pulse" />
                          <span>AI Legal Advisory Engine</span>
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">Expert Indian Corporate & Contract Law Advisor (Gemini Pro)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {showResetConfirm ? (
                          <div className="flex items-center gap-1 bg-red-50 border border-red-200 px-2 py-1 rounded-lg transition-all animate-fade-in shadow-sm">
                            <span className="text-[10px] text-red-700 font-bold font-mono">Confirm Reset?</span>
                            <button
                              type="button"
                              onClick={() => {
                                const initialMsg = [
                                  { 
                                    role: 'model' as const, 
                                    text: `राम राम! 🏛️ मैं हूँ **RBA Lawyer – Royal Bulls Advisory Legal AI**, और ये हैं मेरी खास विशेषताएं:\n\n---\n\n⚖️ **मेरी ताकत जो मुझे All-in-One Lawyer बनाती है:**\n\n1. **🌍 120+ भाषाएं** – हिंदी, अंग्रेज़ी, या कोई भी भाषा में बात करो, मैं समझूंगा\n\n2. **🗺️ 190+ देशों का कानून** – भारत हो, अमेरिका हो, या दुबई – हर जगह का कानून जानता हूँ\n\n3. **📄 Document Drafting** – Agreement, Contract, Notice – सब कुछ मैं draft कर सकता हूँ\n\n4. **🔍 अधिकारों की जानकारी** – आपके कानूनी हक़ क्या हैं, सरल भाषा में बताऊंगा\n\n5. **⏰ 24/7 उपलब्ध** – रात हो या दिन, मैं हमेशा हाज़िर हूँ\n\n6. **💰 बिल्कुल मुफ्त** – कोई फीस नहीं, कोई झंझट नहीं\n\n7. **🗣️ आम आदमी की भाषा** – कानूनी जटिल शब्दों को आसान भाषा में समझाता हूँ`
                                  }
                                ];
                                setAiChatHistory(initialMsg);
                                localStorage.setItem('rba_ai_chat', JSON.stringify(initialMsg));
                                setShowResetConfirm(false);
                              }}
                              className="text-[10px] bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded font-bold cursor-pointer transition-colors"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowResetConfirm(false)}
                              className="text-[10px] bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded font-bold cursor-pointer transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const formatted = aiChatHistory.map(msg => {
                                  const sender = msg.role === 'user' ? 'Client' : 'RBA AI Legal Advisor';
                                  return `### ${sender}\n\n${msg.text}\n\n---\n`;
                                }).join('\n');
                                navigator.clipboard.writeText(formatted);
                                setCopiedEntire(true);
                                setTimeout(() => setCopiedEntire(false), 2000);
                              }}
                              className={`text-[10px] border px-2.5 py-1 rounded-lg transition-all font-mono font-bold cursor-pointer shadow-sm flex items-center gap-1 ${
                                copiedEntire 
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                  : 'bg-white hover:bg-gray-150 border-gray-200 text-gray-500 hover:text-gray-950'
                              }`}
                            >
                              {copiedEntire ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600 animate-pulse" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Chat</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const formatted = aiChatHistory.map(msg => {
                                  const sender = msg.role === 'user' ? 'Client' : 'RBA AI Legal Advisor';
                                  return `### ${sender}\n\n${msg.text}\n\n---\n`;
                                }).join('\n');
                                if (navigator.share) {
                                  navigator.share({
                                    title: 'RBA Lawyer Consultation Chat',
                                    text: formatted,
                                  }).then(() => {
                                    setSharedEntire(true);
                                    setTimeout(() => setSharedEntire(false), 2000);
                                  }).catch(() => {});
                                } else {
                                  navigator.clipboard.writeText(formatted);
                                  setSharedEntire(true);
                                  setTimeout(() => setSharedEntire(false), 2000);
                                }
                              }}
                              className={`text-[10px] border px-2.5 py-1 rounded-lg transition-all font-mono font-bold cursor-pointer shadow-sm flex items-center gap-1 ${
                                sharedEntire
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                  : 'bg-white hover:bg-gray-150 border-gray-200 text-gray-500 hover:text-gray-950'
                              }`}
                            >
                              {sharedEntire ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600 animate-pulse" />
                                  <span>Shared!</span>
                                </>
                              ) : (
                                <>
                                  <Share2 className="w-3 h-3" />
                                  <span>Share</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setShowResetConfirm(true)}
                              className="text-[10px] bg-white hover:bg-gray-150 border border-gray-200 text-gray-500 hover:text-gray-950 px-2.5 py-1 rounded-lg transition-all font-mono font-bold cursor-pointer shadow-sm"
                            >
                              Reset Chat
                            </button>
                          </div>
                        )}
                        <span className="text-[10px] bg-cyan-50 border border-cyan-100 text-cyan-800 px-2.5 py-1 rounded-lg font-mono font-bold">ONLINE</span>
                      </div>
                    </div>

                    {/* Chat log box */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 rounded-2xl border border-gray-150 space-y-4 max-h-[450px]">
                      {aiChatHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                          <Bot className="w-8 h-8 text-cyan-600 stroke-[1.5]" />
                          <h4 className="text-sm font-bold text-gray-800">Ask Professional Indian Legal Advisory Questions</h4>
                          <p className="text-xs text-[#9E9E9E] max-w-sm">
                            Click one of the legal presets on the left control pane or type your custom query below to consult.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 text-xs">
                          {aiChatHistory.map((msg, index) => (
                            <div 
                              key={index} 
                              className={`flex flex-col space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                            >
                              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">
                                {msg.role === 'user' ? 'Client Query' : 'RBA AI Legal Advisor'}
                              </span>
                              
                              <div 
                                className={`p-3.5 rounded-2xl max-w-xl shadow-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#1A1A1A] text-white rounded-tr-none font-sans' : 'bg-white border border-[#E5E5E5] text-gray-800 rounded-tl-none font-serif text-sm'}`}
                              >
                                {msg.role === 'user' ? (
                                  <p>{msg.text}</p>
                                ) : (
                                  <div className="prose prose-sm prose-cyan max-w-none">
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                  </div>
                                )}

                                {/* Message actions */}
                                <div className={`flex items-center gap-1.5 mt-2.5 pt-2 border-t text-gray-400 border-dashed ${msg.role === 'user' ? 'border-gray-800 justify-end' : 'border-gray-100 justify-start'}`}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(msg.text);
                                      setCopiedIndex(index);
                                      setTimeout(() => setCopiedIndex(null), 2000);
                                    }}
                                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 text-[9px] font-bold ${copiedIndex === index ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-700'}`}
                                    title="Copy text"
                                  >
                                    {copiedIndex === index ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copy</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLikedMessages(prev => ({
                                        ...prev,
                                        [index]: prev[index] === 'like' ? undefined as any : 'like'
                                      }));
                                    }}
                                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 text-[9px] ${likedMessages[index] === 'like' ? 'text-emerald-600 font-bold' : 'text-gray-400 hover:text-gray-700'}`}
                                    title="Helpful"
                                  >
                                    <ThumbsUp className={`w-3.5 h-3.5 ${likedMessages[index] === 'like' ? 'fill-emerald-100 text-emerald-600' : ''}`} />
                                    {likedMessages[index] === 'like' && <span>Liked</span>}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLikedMessages(prev => ({
                                        ...prev,
                                        [index]: prev[index] === 'dislike' ? undefined as any : 'dislike'
                                      }));
                                    }}
                                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 text-[9px] ${likedMessages[index] === 'dislike' ? 'text-red-600 font-bold' : 'text-gray-400 hover:text-gray-700'}`}
                                    title="Not helpful"
                                  >
                                    <ThumbsDown className={`w-3.5 h-3.5 ${likedMessages[index] === 'dislike' ? 'fill-red-100 text-red-600' : ''}`} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}

                          {isAiResponding && (
                            <div className="flex flex-col items-start space-y-1">
                              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">AI Advisor is writing...</span>
                              <div className="p-3 bg-white border border-[#E5E5E5] rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
                                <span className="w-1.5 h-1.5 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Chat text box input */}
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!aiChatQuery.trim() || isAiResponding) return;
                        
                        const query = aiChatQuery;
                        setAiChatQuery('');
                        setIsAiResponding(true);
                        setAiChatHistory(prev => [...prev, { role: 'user', text: query }]);

                        try {
                          const res = await askLegalAssistant(query, generatedText, aiFocusMode);
                          setAiChatHistory(prev => [...prev, { role: 'model', text: res }]);
                        } catch (err: any) {
                          setAiChatHistory(prev => [...prev, { role: 'model', text: `Failed to fetch AI reply: ${err.message || String(err)}` }]);
                        } finally {
                          setIsAiResponding(false);
                        }
                      }}
                      className="absolute bottom-0 inset-x-0 flex gap-2 shrink-0 bg-white pt-2"
                    >
                      <input
                        type="text"
                        value={aiChatQuery}
                        onChange={(e) => setAiChatQuery(e.target.value)}
                        placeholder="Ask RBA Lawyer anything (e.g., Indian laws, contract review, draft agreements, RERA/GST)..."
                        className="flex-1 px-4 py-2 bg-gray-50 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:border-cyan-600"
                        disabled={isAiResponding}
                      />
                      <button
                        type="submit"
                        disabled={!aiChatQuery.trim() || isAiResponding}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-xl transition-colors shadow disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Bot className="w-4 h-4" />
                        <span>Consult</span>
                      </button>
                    </form>
                  </div>
                ) : activeTab === 'calendar' ? (
                  <div className="space-y-6 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5E5] pb-4">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>
                          <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span>Google Calendar Schedule Agenda</span>
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">Real-time Cloud Node Synchronization</p>
                      </div>
                      {currentUser && !currentUser.isAnonymous && (
                        <button
                          type="button"
                          onClick={handleLoadCalendar}
                          disabled={isFetchingCalendar}
                          className="px-3 py-1.5 border border-gray-200 hover:border-gray-900 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50"
                          title="Refresh upcoming events"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isFetchingCalendar ? 'animate-spin' : ''}`} />
                          <span>Sync Schedule</span>
                        </button>
                      )}
                    </div>

                    {(!currentUser || currentUser.isAnonymous) ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 max-w-md mx-auto">
                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
                          <Calendar className="w-6 h-6 text-emerald-600 stroke-[1.5]" />
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm">Secure OAuth Access Required</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Your current guest/anonymous session does not have a Google Calendar integration token linked. Connect with Google safely to pull your active calendar agenda.
                        </p>
                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={isLoggingIn}
                          className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow hover:shadow-md cursor-pointer"
                        >
                          Sign in with Google Account
                        </button>
                      </div>
                    ) : isFetchingCalendar && calendarEvents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 text-center text-xs text-[#9E9E9E] space-y-3">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                        <p>Querying Google Calendar API events list...</p>
                      </div>
                    ) : calendarEvents.length === 0 ? (
                      <div className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center space-y-2 max-w-md mx-auto my-6">
                        <Calendar className="w-8 h-8 mx-auto text-gray-300 stroke-[1.5]" />
                        <p className="text-xs font-bold text-gray-800">Your Agenda is completely clear!</p>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          No upcoming consultations or active briefing calls identified. Use the "Consultation Scheduler" panel on the left to schedule a new client session.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {calendarEvents.map((event) => {
                          const start = event.start.dateTime ? new Date(event.start.dateTime) : (event.start.date ? new Date(event.start.date) : null);
                          const end = event.end.dateTime ? new Date(event.end.dateTime) : (event.end.date ? new Date(event.end.date) : null);
                          const dateString = start ? start.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'All-day event';
                          const timeString = start && end && event.start.dateTime && event.end.dateTime
                            ? `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : 'All Day';

                          return (
                            <div key={event.id} className="bg-white border border-[#E5E5E5] rounded-xl p-4 hover:border-emerald-300 transition-colors shadow-sm relative group">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2 mb-3">
                                <div>
                                  <h4 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-emerald-700 transition-colors pr-8 sm:pr-0">
                                    {event.summary}
                                  </h4>
                                  <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    <span>{dateString} • {timeString}</span>
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                                  {event.hangoutLink && (
                                    <a
                                      href={event.hangoutLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-lg transition-all"
                                      title="Join Remote Video Meeting Room"
                                    >
                                      <Video className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>Join Meet</span>
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleCancelEvent(event.id, event.summary)}
                                    className="p-1 text-gray-400 hover:text-red-650 hover:bg-red-50 rounded transition-colors"
                                    title="Cancel and delete meeting"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {event.description && (
                                <p className="text-[11px] text-gray-600 leading-relaxed bg-gray-50/50 border border-gray-100 p-2.5 rounded-lg mb-3">
                                  {event.description}
                                </p>
                              )}

                              {event.location && (
                                <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-2">
                                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
                                    <path strokeWidth="2" strokeLinecap="round" d="M12 2v2M12 20v2M4 12H2M22 12h-2" />
                                  </svg>
                                  <span className="truncate">Location: {event.location}</span>
                                </div>
                              )}

                              {event.attendees && event.attendees.length > 0 && (
                                <div className="space-y-1">
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Attendees ({event.attendees.length})</span>
                                  <div className="flex flex-wrap gap-1">
                                    {event.attendees.map((attendee, index) => {
                                      const isOrganizer = attendee.organizer;
                                      const status = attendee.responseStatus;
                                      const statusColor = status === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' : status === 'tentative' ? 'bg-amber-100 text-amber-700 border-amber-200' : status === 'declined' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100 text-gray-500 border-gray-200';
                                      return (
                                        <span 
                                          key={index} 
                                          className={`py-0.5 px-2 text-[9px] font-medium rounded-full border truncate max-w-xs ${statusColor}`}
                                          title={`${attendee.email} (${status || 'invited'})`}
                                        >
                                          {attendee.email} {isOrganizer && '👑'} {status !== 'needsAction' && `(${status})`}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {!generatedText && !isGenerating && (
                      <div className="text-left py-2 space-y-6">
                        <div className="border-b border-[#E5E5E5] pb-4">
                          <h2 className="text-xl font-bold text-[#1A1A1A]">RBA AI Pro — Legal & Business Document Engine</h2>
                          <p className="text-xs text-gray-400 font-mono mt-1">Platform Guide & Operational FAQ</p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">📋 Platform Purpose (Yeh Platform Kiske Liye Hai?)</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              rba ai pro ek intelligent AI-powered legal & business drafting systems hai jahan aap professional, accurate Indian legal agreements, financial layouts, and business docs standard precisions ke sath generate kar sakte hain. Yeh platform:
                            </p>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mt-2 pl-2">
                              <li><strong>Freelancers & Consultants:</strong> Client contracts and dynamic NDAs generate karne ke liye.</li>
                              <li><strong>Startup Founders & Small Businesses:</strong> Founder Agreements, employment agreements, business declarations, and legal letters draft karne ke liye.</li>
                              <li><strong>Sales Professionals:</strong> Client sign-offs and proposals directly bundles build karne ke liye.</li>
                            </ul>
                          </div>

                          <div className="h-[1px] bg-[#E5E5E5]" />

                          <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">⚡ Daily Use & Workflow (Daily Use Kaun Aur Kaise Karega?)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                              <div className="bg-[#F9F9F9] p-3 rounded-xl border border-[#E5E5E5]">
                                <p className="text-xs font-bold text-[#1A1A1A]">Daily Users</p>
                                <p className="text-xs text-gray-500 mt-1">Founders, freelance professionals, operations heads, aur business development leads.</p>
                              </div>
                              <div className="bg-[#F9F9F9] p-3 rounded-xl border border-[#E5E5E5]">
                                <p className="text-xs font-bold text-[#1A1A1A]">Workflow Step-by-Step</p>
                                <ol className="list-decimal list-inside text-[11px] text-gray-500 mt-1 space-y-0.5">
                                  <li>Select a template layout in left sidebar.</li>
                                  <li>Pre-fill using Profiles or enter custom attributes.</li>
                                  <li>Click 'Generate' to draft AI-Powered Legal document.</li>
                                  <li>Click 'Validate' to analyze risk scores and missing clauses.</li>
                                </ol>
                              </div>
                            </div>
                          </div>

                          <div className="h-[1px] bg-[#E5E5E5]" />

                          <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">☁️ Google Docs & Drive Integration (Google Doc Kaise Transfer Hoga?)</h3>
                            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-sm text-amber-900 leading-relaxed space-y-2">
                              <p>
                                <strong>Aapka Draft One-Click me Google Docs me Transfer ho jata hai:</strong>
                              </p>
                              <ul className="list-disc list-inside text-xs text-amber-800 space-y-1 pl-2">
                                <li>Draft complete hone ke baad, header me right-side par <strong>Google Doc</strong> button activate ho jata hai.</li>
                                <li>Button click karne par app aapse secure access permission maangega. Accept karne par system aapki background Google Drive aur Google Docs API configure karega.</li>
                                <li>Aapki file automatic Google Docs format me compile hokar user's Google Drive me directly save ho jayegi.</li>
                                <li>Successful save hone par direct link generate hoti hai, jisse aap 1-click me unka standard editor launch karke customize kar sakte hain.</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 text-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-[10px] font-mono text-gray-500 animate-pulse">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            Cloud Services Connected & Ready
                          </div>
                        </div>
                      </div>
                    )}
                    {isGenerating && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                        <p className="text-sm font-medium">Drafting your document...</p>
                      </div>
                    )}
                    <div className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-[#1A1A1A] prose-p:text-[#4A4A4A] prose-li:text-[#4A4A4A]">
                      <ReactMarkdown>{generatedText}</ReactMarkdown>
                    </div>
                  </>
                )}
              </div>

              {/* Suggestions & Validation */}
              <AnimatePresence>
                {(suggestion || validation || multiOutput) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {suggestion && (
                        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-[#9E9E9E]">Advisor Suggestions</h3>
                          </div>
                          <div className="text-sm text-[#4A4A4A] prose prose-sm max-w-none">
                            <ReactMarkdown>{suggestion}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                      {validation && (
                        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-[#9E9E9E]">Legal Validation</h3>
                          </div>
                          <div className="text-sm text-[#4A4A4A] prose prose-sm max-w-none">
                            <ReactMarkdown>{validation}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>

                    {multiOutput && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-[#9E9E9E]">Email Draft</h3>
                          </div>
                          <div className="text-sm text-[#4A4A4A] whitespace-pre-wrap font-mono bg-[#F9F9F9] p-4 rounded-lg border border-[#E5E5E5]">
                            {multiOutput.email_draft}
                          </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-[#9E9E9E]">WhatsApp Summary</h3>
                          </div>
                          <div className="text-sm text-[#4A4A4A] whitespace-pre-wrap font-mono bg-[#F9F9F9] p-4 rounded-lg border border-[#E5E5E5]">
                            {multiOutput.whatsapp_summary}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          )}
          </>
          )}
        </div>
      </main>

      {/* Dedicated Print Preview Modal */}
      {isPrintModalOpen && (
        <div 
          id="print-preview-modal" 
          className="print-modal-container fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-start overflow-y-auto p-4 md:p-8 no-print"
        >
          {/* Modal Header controls dashboard panel - strictly hidden when printed */}
          <div className="no-print bg-[#1A1A1A] text-white w-full max-w-4xl rounded-2xl shadow-2xl p-4 md:p-6 mb-6 border border-zinc-800 shrink-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-purple-400" />
                  <h2 className="text-base md:text-lg font-bold tracking-tight font-sans">
                    Legal Print Preview Control Center
                  </h2>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Tailor legal typography, spacing, margins and preview options. All non-essential UI tools below auto-hide on paper.
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    const isIframe = window.self !== window.top;
                    if (isIframe) {
                      const confirmed = window.confirm(
                        "Iframe Guard: Direct browser printing can be restricted inside embedded frames.\n\n" +
                        "If the print dialog does not open, select 'New Tab' at the top-right of your main screen to download / print natively."
                      );
                      if (!confirmed) return;
                    }
                    window.print();
                  }}
                  className="flex items-center justify-center gap-1.5 px-4.5 py-2 bg-purple-600 hover:bg-purple-700 font-bold text-white text-xs rounded-xl shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Launch System Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 font-bold text-zinc-200 text-xs rounded-xl border border-zinc-700 transition-all cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>

            {/* Print Customization Controls Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-4 border-t border-zinc-800/80 text-xs text-zinc-300">
              {/* Typeface style */}
              <div>
                <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                  Typeface Font
                </label>
                <select
                  value={printFontFamily}
                  onChange={(e: any) => setPrintFontFamily(e.target.value)}
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg py-1.5 px-2.5 text-zinc-200 focus:outline-none focus:border-purple-500 text-[11px] cursor-pointer"
                >
                  <option value="font-serif">Elegant Serif (Official Draft)</option>
                  <option value="font-sans">Modern Sans-Serif (Standard)</option>
                  <option value="font-mono">Courier Monospace (Drafting Code)</option>
                </select>
              </div>

              {/* Line height spacing */}
              <div>
                <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                  Line Height / Spacing
                </label>
                <select
                  value={printLineHeight}
                  onChange={(e: any) => setPrintLineHeight(e.target.value)}
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg py-1.5 px-2.5 text-zinc-200 focus:outline-none focus:border-purple-500 text-[11px] cursor-pointer"
                >
                  <option value="leading-normal">Normal (1.15x Compact)</option>
                  <option value="leading-relaxed">Comfortable (1.5x Legal)</option>
                  <option value="leading-loose">Double-Spaced (2.0x Review)</option>
                </select>
              </div>

              {/* Pad/physical margins */}
              <div>
                <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                  Document Margins
                </label>
                <select
                  value={printPageMargins}
                  onChange={(e: any) => {
                    const val = e.target.value;
                    setPrintPageMargins(val);
                    if (val === 'Normal') {
                      setPrintPaddingSize('p-10 sm:p-16');
                    } else if (val === 'Narrow') {
                      setPrintPaddingSize('p-4 sm:p-8');
                    } else {
                      setPrintPaddingSize('p-6 sm:p-12');
                    }
                  }}
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg py-1.5 px-2.5 text-zinc-200 focus:outline-none focus:border-purple-500 text-[11px] cursor-pointer"
                >
                  <option value="Normal">Normal Margins (1.0")</option>
                  <option value="Narrow">Narrow Margins (0.5")</option>
                  <option value="Legal">Legal Margins (1.5")</option>
                </select>
              </div>

              {/* Draft Watermark toggle button */}
              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => setShowDraftWatermark(prev => !prev)}
                  className={`w-full text-center py-1.5 px-3 rounded-lg border font-semibold text-[11px] transition-all cursor-pointer ${showDraftWatermark ? 'bg-amber-950/40 border-amber-500 text-amber-200' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                >
                  Draft Watermark: {showDraftWatermark ? 'ON (Visible)' : 'OFF (Hidden)'}
                </button>
              </div>
            </div>
          </div>

          {/* Paper layout wrapper implementing the custom print CSS grid */}
          <div className="w-full max-w-4xl print-layout-grid flex-1 flex flex-col justify-start">
            <div 
              className={`print-paper-sheet bg-white text-gray-900 shadow-2xl rounded-2xl w-full mx-auto relative ${printPaddingSize} ${printFontFamily} ${printLineHeight} transition-all`}
              style={{ minHeight: '297mm' }}
            >
              {/* Absolute Watermark overlay */}
              {showDraftWatermark && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden select-none">
                  <div className="text-gray-100/60 font-bold font-sans text-7xl md:text-[9rem] tracking-widest rotate-[32deg] uppercase whitespace-nowrap">
                    DRAFT ONLY
                  </div>
                </div>
              )}

              {/* Micro diagnostic paper header - hidden when print formatting starts */}
              <div className="border-b-2 border-double border-zinc-200 pb-3 mb-8 flex items-center justify-between no-print text-[9px] text-zinc-400 tracking-wider uppercase font-mono">
                <span>RBA Active Print Preview Sheet</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">Preview Active</span>
              </div>

              {/* Formatted Text Content inside of Printable paper layout */}
              <div className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-[#111111] prose-h1:text-2xl prose-h2:text-xl prose-p:text-gray-800 prose-li:text-gray-800 print-document-body">
                <ReactMarkdown>{generatedText}</ReactMarkdown>
              </div>

              {/* Embedded sheet footer */}
              <div className="border-t border-zinc-100 mt-16 pt-3 flex flex-col sm:flex-row sm:items-center justify-between text-[9px] text-zinc-400 font-mono italic">
                <span>Printed with RBA AI Pro Legal & Business Drafting System</span>
                <span>Date: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
