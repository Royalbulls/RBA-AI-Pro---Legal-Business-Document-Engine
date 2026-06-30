import React, { useState } from 'react';
import { 
  Briefcase, 
  User, 
  Trash2, 
  Plus, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Scale, 
  Hash, 
  Signature,
  Edit2,
  X,
  Check,
  Save,
  Loader2,
  Users,
  UserCheck,
  HelpCircle
} from 'lucide-react';
import { Profile } from '../types';
import { saveProfile, deleteProfile } from '../services/firebase';

interface ProfileManagerProps {
  profiles: Profile[];
  onProfilesChanged: () => void;
  onBookMeeting?: (profile: Profile) => void;
}

export default function ProfileManager({ profiles, onProfilesChanged, onBookMeeting }: ProfileManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Tab filters to easily organize self-business vs client management
  const [filterTab, setFilterTab] = useState<'all' | 'business' | 'client'>('all');

  // Form states
  const [partyType, setPartyType] = useState<'first_party_company' | 'first_party_individual' | 'second_party'>('first_party_company');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [authorizedSignatory, setAuthorizedSignatory] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const resetForm = () => {
    setPartyType('first_party_company');
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setJurisdiction('');
    setRegNumber('');
    setAuthorizedSignatory('');
    setIsDefault(false);
    setIsAdding(false);
    setEditingProfile(null);
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setPartyType(profile.partyType);
    setName(profile.name);
    setEmail(profile.email || '');
    setPhone(profile.phone || '');
    setAddress(profile.address || '');
    setJurisdiction(profile.jurisdiction || '');
    setRegNumber(profile.regNumber || '');
    setAuthorizedSignatory(profile.authorizedSignatory || '');
    setIsDefault(!!profile.isDefaultUser || !!profile.isDefaultCompany);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const id = editingProfile ? editingProfile.id : 'prof_' + Date.now().toString(36);
      await saveProfile({
        id,
        partyType,
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        jurisdiction: jurisdiction.trim() || undefined,
        regNumber: regNumber.trim() || undefined,
        authorizedSignatory: authorizedSignatory.trim() || undefined,
        isDefaultUser: partyType === 'first_party_individual' ? isDefault : undefined,
        isDefaultCompany: partyType === 'first_party_company' ? isDefault : undefined,
      });
      resetForm();
      onProfilesChanged();
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (profileId: string) => {
    if (!window.confirm("क्या आप वाकई इस प्रोफ़ाइल को मिटाना चाहते हैं?\nAre you sure you want to delete this profile?")) return;
    try {
      await deleteProfile(profileId);
      onProfilesChanged();
    } catch (err) {
      console.error("Error deleting profile:", err);
    }
  };

  const businessProfiles = profiles.filter(p => p.partyType.startsWith('first'));
  const clientProfiles = profiles.filter(p => p.partyType === 'second_party');
  
  const displayedProfiles = profiles.filter(p => {
    if (filterTab === 'business') return p.partyType.startsWith('first');
    if (filterTab === 'client') return p.partyType === 'second_party';
    return true;
  });

  const defaultUserProfile = profiles.find(p => p.isDefaultUser);
  const defaultCompanyProfile = profiles.find(p => p.isDefaultCompany);

  return (
    <div className="space-y-6">
      {/* Client Management Explainer Callout */}
      <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 text-xs text-purple-900 leading-relaxed grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-8 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-purple-950">
            <Users className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Client & Business Management (क्लाइंट और बिजनेस मैनेजमेंट)</span>
          </div>
          <p className="text-[#555555] text-[11px]">
            अपनी कंपनी का प्रोफ़ाइल (Business Profile) और अपने ग्राहकों या कर्मचारियों का प्रोफ़ाइल (Client Management) यहाँ सहेजें। दस्तावेज़ ड्राफ्ट करते समय ये विवरण केवल एक क्लिक में ऑटो-फिल हो जाएंगे!
          </p>
        </div>
        <div className="md:col-span-4 flex md:justify-end shrink-0 select-none">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-[10px] font-bold text-purple-800 rounded-full border border-purple-200">
            <Check className="w-3 h-3 text-purple-700" />
            Active Sync
          </span>
        </div>
      </div>

      {/* Primary Default Profiles Bento Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User Profile Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
          <div className="absolute top-0 right-0 h-1 w-full bg-[#1A1A1A]"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                <User className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Primary User Profile</h3>
                <p className="text-[10px] text-[#9E9E9E]">Individual creator / Legal signatory</p>
              </div>
            </div>
            {defaultUserProfile ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-[9px] font-bold text-green-700 rounded-full border border-green-100">
                <Check className="w-2.5 h-2.5" />
                Default Active
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                Not Defined
              </span>
            )}
          </div>
          
          {defaultUserProfile ? (
            <div className="space-y-2 text-xs">
              <div className="font-extrabold text-[#1A1A1A] text-sm">{defaultUserProfile.name}</div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-[#9E9E9E] pt-2 border-t border-gray-100">
                <div className="truncate">📬 {defaultUserProfile.email || 'No email'}</div>
                <div className="truncate">📞 {defaultUserProfile.phone || 'No phone'}</div>
                <div className="col-span-2 truncate">📍 {defaultUserProfile.address || 'No address'}</div>
                <div className="col-span-2 truncate">⚖️ Juris: {defaultUserProfile.jurisdiction || 'No jurisdiction'}</div>
              </div>
              <button
                type="button"
                onClick={() => handleEdit(defaultUserProfile)}
                className="mt-3 w-full py-1.5 border border-gray-200 hover:bg-gray-50 text-[10px] font-bold text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" /> Edit User Profile
              </button>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-[11px] text-[#9E9E9E] max-w-xs mx-auto">Set a default personal profile details to sign and draft documents instantly.</p>
              <button
                type="button"
                onClick={() => {
                  setPartyType('first_party_individual');
                  setName('');
                  setEmail('');
                  setPhone('');
                  setAddress('');
                  setJurisdiction('');
                  setIsDefault(true);
                  setIsAdding(true);
                  if (editingProfile) setEditingProfile(null);
                }}
                className="mt-3 px-3 py-1.5 bg-gray-50 border border-dashed border-gray-300 hover:border-gray-900 text-[10px] font-semibold text-gray-700 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Define User Profile
              </button>
            </div>
          )}
        </div>

        {/* Company Profile Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
          <div className="absolute top-0 right-0 h-1 w-full bg-purple-600"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                <Building2 className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Primary Company Profile</h3>
                <p className="text-[10px] text-[#9E9E9E]">Your legal corporate organization</p>
              </div>
            </div>
            {defaultCompanyProfile ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-[9px] font-bold text-purple-700 rounded-full border border-purple-100">
                <Check className="w-2.5 h-2.5 text-purple-600" />
                Default Active
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                Not Defined
              </span>
            )}
          </div>

          {defaultCompanyProfile ? (
            <div className="space-y-2 text-xs">
              <div className="font-extrabold text-[#1A1A1A] text-sm">{defaultCompanyProfile.name}</div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-[#9E9E9E] pt-2 border-t border-gray-100">
                <div className="truncate">👔 Signatory: {defaultCompanyProfile.authorizedSignatory || 'No signatory'}</div>
                <div className="truncate">🔢 CIN: {defaultCompanyProfile.regNumber || 'No reg number'}</div>
                <div className="col-span-2 truncate font-mono">📬 {defaultCompanyProfile.email || 'No email'}</div>
                <div className="col-span-2 truncate">📍 {defaultCompanyProfile.address || 'No registered office'}</div>
              </div>
              <button
                type="button"
                onClick={() => handleEdit(defaultCompanyProfile)}
                className="mt-3 w-full py-1.5 border border-purple-100 hover:bg-purple-50 text-[10px] font-bold text-purple-800 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3 text-purple-600" /> Edit Company Profile
              </button>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-[11px] text-[#9E9E9E] max-w-xs mx-auto">Save corporate entity, registration, and default signatory for bulk use.</p>
              <button
                type="button"
                onClick={() => {
                  setPartyType('first_party_company');
                  setName('');
                  setEmail('');
                  setPhone('');
                  setAddress('');
                  setJurisdiction('');
                  setAuthorizedSignatory('');
                  setRegNumber('');
                  setIsDefault(true);
                  setIsAdding(true);
                  if (editingProfile) setEditingProfile(null);
                }}
                className="mt-3 px-3 py-1.5 bg-purple-50/50 border border-dashed border-purple-200 hover:border-purple-600 text-[10px] font-semibold text-purple-800 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-purple-700" /> Define Company Profile
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
        {/* Toggle tabs to filter profiles */}
        <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-200 self-start">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            All ({profiles.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('business')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterTab === 'business' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            My Businesses ({businessProfiles.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('client')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterTab === 'client' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            My Clients ({clientProfiles.length})
          </button>
        </div>

        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Profile</span>
          </button>
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-600" />
              {editingProfile ? 'Edit Profile' : 'New Client or Business Profile'}
            </span>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-900 p-1 rounded-lg hover:bg-gray-50">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Choose entity role */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Profile Category / Role (प्रोफ़ाइल वर्ग)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPartyType('first_party_company')}
                  className={`py-2 px-2.5 text-[10px] font-bold uppercase tracking-wider border rounded-xl text-center transition-all ${
                    partyType === 'first_party_company' 
                      ? 'border-purple-600 bg-purple-50 text-purple-900 font-extrabold shadow-sm' 
                      : 'border-gray-200 bg-gray-50/50 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  🏢 Self Business Co.
                </button>
                <button
                  type="button"
                  onClick={() => setPartyType('first_party_individual')}
                  className={`py-2 px-2.5 text-[10px] font-bold uppercase tracking-wider border rounded-xl text-center transition-all ${
                    partyType === 'first_party_individual' 
                      ? 'border-purple-600 bg-purple-50 text-purple-900 font-extrabold shadow-sm' 
                      : 'border-gray-200 bg-gray-50/50 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  ✍️ Self Individual
                </button>
                <button
                  type="button"
                  onClick={() => setPartyType('second_party')}
                  className={`py-2 px-2.5 text-[10px] font-bold uppercase tracking-wider border rounded-xl text-center transition-all ${
                    partyType === 'second_party' 
                      ? 'border-purple-600 bg-purple-50 text-purple-900 font-extrabold shadow-sm' 
                      : 'border-gray-200 bg-gray-50/50 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  👤 Client / 2nd Party
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                {partyType.startsWith('first') 
                  ? "Self Profile: These serve as your company or personal parameters (First Party details)."
                  : "Client Profile: These represent your customers, counter-parties, vendors, or partner companies (Second Party details)."}
              </p>
            </div>

            {/* Profile field: name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                {partyType === 'first_party_company' ? "Pvt Ltd / LLP / Company Name" : "Full Name of Client / Person (पूरा नाम)"}
              </label>
              <div className="relative">
                {partyType === 'first_party_company' ? (
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                ) : (
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                )}
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={partyType === 'first_party_company' ? "e.g. Royal Bulls Advisory Pvt Ltd" : "e.g. Rajesh Kumar (or Client Corporation)"}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {partyType === 'first_party_company' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Authorized Signatory</label>
                  <div className="relative">
                    <Signature className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={authorizedSignatory}
                      onChange={(e) => setAuthorizedSignatory(e.target.value)}
                      placeholder="e.g. Amit Sharma (Director)"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">CIN / Registration No</label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      placeholder="e.g. U74999KA2026..."
                      className="w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address (ईमेल)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. company@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Contact Phone (फोन नंबर)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 91234 56789"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Address (स्थायी पता)</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Ground Floor, Royal Bulls Office, MG Road, Bengaluru, 560001..."
                  className="w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-600 focus:bg-white resize-none h-16 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Default Legal Jurisdiction / State (अधिकार क्षेत्र)</label>
              <div className="relative">
                <Scale className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  placeholder="e.g. Courts of Karnataka, Bengaluru"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {partyType !== 'second_party' && (
              <div className="pt-2 border-t border-gray-50 pb-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer accent-purple-600"
                  />
                  <span className="text-xs font-bold text-gray-700">
                    {partyType === 'first_party_company' 
                      ? 'Set as Primary Company Profile (प्राथमिक कंपनी प्रोफ़ाइल)' 
                      : 'Set as Primary User Profile (प्राथमिक उपयोगकर्ता प्रोफ़ाइल)'}
                  </span>
                </label>
                <p className="text-[10px] text-gray-400 ml-6 mt-0.5">
                  यह प्रोफ़ाइल नए दस्तावेज़ ड्राफ्ट करते समय आपके विवरणों को स्वतः भर देगी।
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 py-2 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {editingProfile ? 'Save Changes' : 'Save Profile'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          {displayedProfiles.length === 0 ? (
            <div className="text-center py-10 px-4 bg-white border border-gray-200 rounded-xl">
              <User className="w-8 h-8 mx-auto text-gray-300 opacity-60 mb-2" />
              <p className="text-xs text-gray-500 font-semibold">
                {filterTab === 'all' && 'No saved profiles yet.'}
                {filterTab === 'business' && 'No self business profiles saved.'}
                {filterTab === 'client' && 'No client/counterparty profiles saved.'}
              </p>
              <p className="text-[10px] text-gray-400 mt-1 max-w-sm mx-auto leading-normal">
                {filterTab === 'all' && 'अपनी कंपनी (1st Party) या ग्राहकों (2nd Party Clients) के लिए प्रोफाइल बनाएं ताकि प्रपत्र भरते समय स्वतः डेटा ट्रांसफर हो सके।'}
                {filterTab === 'business' && 'Add your first-party corporate profiles or single individual firm details.'}
                {filterTab === 'client' && 'Add details for clients, employees, contractors or tenants you write agreements for regularly.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (filterTab === 'business') setPartyType('first_party_company');
                  else if (filterTab === 'client') setPartyType('second_party');
                  setIsAdding(true);
                }}
                className="mt-4 inline-flex items-center gap-1 py-1 px-3 border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg text-xs font-bold"
              >
                + Create One Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-10">
              {displayedProfiles.map((profile) => (
                <div 
                  key={profile.id}
                  className="p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-600 transition-all group relative shadow-sm hover:shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                          profile.partyType === 'first_party_company' 
                            ? 'bg-blue-50 text-blue-700 border-blue-100' 
                            : profile.partyType === 'first_party_individual'
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : 'bg-purple-50 text-purple-700 border-purple-100'
                        }`}>
                          {profile.partyType === 'first_party_company' && '🏢 My Business Co.'}
                          {profile.partyType === 'first_party_individual' && '✍️ My Self Ind.'}
                          {profile.partyType === 'second_party' && '👤 Client / Counterparty'}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-[#1A1A1A] mt-2.5 leading-snug">{profile.name}</h4>
                      {profile.authorizedSignatory && (
                        <p className="text-[9px] text-[#9E9E9E] font-medium mt-0.5">Signatory: <strong>{profile.authorizedSignatory}</strong></p>
                      )}
                      {profile.regNumber && (
                        <p className="text-[9px] text-[#9E9E9E] font-mono">RegNo: {profile.regNumber}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(profile)}
                        className="p-1 text-[#9E9E9E] hover:text-black hover:bg-gray-100 rounded transition-colors cursor-pointer"
                        title="Edit profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(profile.id)}
                        className="p-1 text-[#9E9E9E] hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Delete profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gray-50 grid grid-cols-2 gap-y-1.5 gap-x-2 text-[10px] text-[#9E9E9E]">
                    {profile.email && (
                      <div className="flex items-center gap-1 truncate" title={profile.email}>
                        <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">{profile.email}</span>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center gap-1 truncate" title={profile.phone}>
                        <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">{profile.phone}</span>
                      </div>
                    )}
                    {profile.jurisdiction && (
                      <div className="flex items-center gap-1 col-span-2 truncate" title={profile.jurisdiction}>
                        <Scale className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">Jurisdiction: {profile.jurisdiction}</span>
                      </div>
                    )}
                    {profile.address && (
                      <div className="flex items-center gap-1 col-span-2 truncate" title={profile.address}>
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">{profile.address}</span>
                      </div>
                    )}
                    {onBookMeeting && profile.email && (
                      <div className="col-span-2 pt-2 mt-2 border-t border-gray-100 flex justify-end">
                        <button
                          type="button"
                          onClick={() => onBookMeeting(profile)}
                          className="px-2.5 py-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300 rounded-md transition-all flex items-center gap-1 cursor-pointer"
                          title="Schedule meeting with this client on Google Calendar"
                        >
                          <svg className="w-3 h-3 text-emerald-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Schedule Consultation</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
