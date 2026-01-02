import React, { useState } from 'react';
import { X, User, Mail, Calendar, MapPin, LogOut, Save, Watch, Activity, Zap, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProfileModal = ({ user, authToken, onClose, onLogout, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'wearables'
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState(user.name || '');
  const [dob, setDob] = useState(user.dob || '');
  const [zipCode, setZipCode] = useState(user.zip_code || '');

  const [wearables, setWearables] = useState({
    apple_watch: user.connected_wearables?.apple_watch || { connected: false, last_sync: null },
    oura_ring: user.connected_wearables?.oura_ring || { connected: false, last_sync: null },
    whoop: { connected: false, coming_soon: true },
    garmin: { connected: false, coming_soon: true },
    fitbit: { connected: false, coming_soon: true }
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${API}/user/profile`,
        { name, dob, zip_code: zipCode },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      onUpdateProfile(response.data.user);
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWearable = async (wearableType) => {
    if (wearableType === 'apple_watch') {
      toast.info('Apple Watch integration requires iOS companion app. Coming soon!');
      return;
    }

    if (wearableType === 'oura_ring') {
      try {
        // Redirect to Oura OAuth flow using window.location.origin for deployment compatibility
        window.location.href = `${window.location.origin}/api/wearables/oura/authorize`;
      } catch (error) {
        console.error('Oura connection error:', error);
        toast.error('Failed to connect Oura Ring');
      }
      return;
    }

    toast.info(`${wearableType.replace('_', ' ')} integration coming soon!`);
  };

  const handleDisconnectWearable = async (wearableType) => {
    try {
      await axios.post(
        `${API}/wearables/disconnect`,
        { wearable_type: wearableType },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setWearables(prev => ({
        ...prev,
        [wearableType]: { connected: false, last_sync: null }
      }));

      toast.success('Wearable disconnected');
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect wearable');
    }
  };

  const WearableCard = ({ name, icon: Icon, type, data }) => (
    <div className="p-4 bg-background-subtle rounded-xl border border-secondary/20 hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            data.connected ? 'bg-primary/10' : 'bg-secondary/10'
          }`}>
            <Icon className={`w-6 h-6 ${data.connected ? 'text-primary' : 'text-secondary'}`} />
          </div>
          <div>
            <h4 className="font-body font-semibold text-text-primary">{name}</h4>
            {data.connected && data.last_sync && (
              <p className="font-body text-xs text-text-muted">
                Last sync: {new Date(data.last_sync).toLocaleDateString()}
              </p>
            )}
            {data.coming_soon && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-secondary/20 text-secondary text-xs font-semibold rounded-full">
                Coming Soon
              </span>
            )}
          </div>
        </div>
        
        {data.connected ? (
          <Wifi className="w-5 h-5 text-status-safe" />
        ) : (
          <WifiOff className="w-5 h-5 text-secondary" />
        )}
      </div>

      <div className="flex gap-2">
        {data.connected ? (
          <>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDisconnectWearable(type)}
              className="flex-1 py-2 px-3 bg-status-danger/10 hover:bg-status-danger/20 text-status-danger rounded-lg font-body text-sm font-semibold transition-all"
            >
              Disconnect
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-body text-sm font-semibold transition-all"
            >
              Sync Now
            </motion.button>
          </>
        ) : !data.coming_soon ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleConnectWearable(type)}
            className="flex-1 py-2 px-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-body text-sm font-semibold transition-all"
          >
            Connect
          </motion.button>
        ) : (
          <button
            disabled
            className="flex-1 py-2 px-3 bg-secondary/10 text-secondary rounded-lg font-body text-sm font-semibold cursor-not-allowed"
          >
            Coming Soon
          </button>
        )}
      </div>

      {/* Metrics Preview */}
      {data.connected && (
        <div className="mt-3 pt-3 border-t border-secondary/20 grid grid-cols-2 gap-2">
          <div className="text-center p-2 bg-primary/5 rounded-lg">
            <p className="font-body text-xs text-text-muted">HRV</p>
            <p className="font-mono text-sm font-bold text-text-primary">45ms</p>
          </div>
          <div className="text-center p-2 bg-primary/5 rounded-lg">
            <p className="font-body text-xs text-text-muted">Activity</p>
            <p className="font-mono text-sm font-bold text-text-primary">8.2k</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="font-sans text-2xl font-bold text-white">
                  {user.name}
                </h2>
                <p className="font-body text-sm text-white/80">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-secondary/20 bg-background-subtle">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 px-6 font-body font-semibold text-sm transition-all relative ${
                activeTab === 'profile'
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <User className="w-4 h-4 inline-block mr-2" />
              Profile
              {activeTab === 'profile' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('wearables')}
              className={`flex-1 py-4 px-6 font-body font-semibold text-sm transition-all relative ${
                activeTab === 'wearables'
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Watch className="w-4 h-4 inline-block mr-2" />
              Wearables
              {activeTab === 'wearables' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'profile' ? (
              <div className="space-y-4">
                {/* Profile Fields */}
                <div>
                  <label className="block font-body text-sm font-semibold text-text-primary mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isEditing}
                      className="w-full pl-11 pr-4 py-3 bg-background-subtle border border-secondary/30 rounded-xl text-text-primary font-body focus:outline-none focus:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-body text-sm font-semibold text-text-primary mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full pl-11 pr-4 py-3 bg-background-subtle border border-secondary/30 rounded-xl text-text-primary font-body opacity-60 cursor-not-allowed"
                    />
                  </div>
                  <p className="font-body text-xs text-text-muted mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block font-body text-sm font-semibold text-text-primary mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      disabled={!isEditing}
                      className="w-full pl-11 pr-4 py-3 bg-background-subtle border border-secondary/30 rounded-xl text-text-primary font-body focus:outline-none focus:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-body text-sm font-semibold text-text-primary mb-2">
                    Zip Code
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      disabled={!isEditing}
                      maxLength="10"
                      className="w-full pl-11 pr-4 py-3 bg-background-subtle border border-secondary/30 rounded-xl text-text-primary font-body focus:outline-none focus:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {isEditing ? (
                    <>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-body font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Save Changes
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setIsEditing(false);
                          setName(user.name);
                          setDob(user.dob);
                          setZipCode(user.zip_code);
                        }}
                        className="px-6 py-3 bg-secondary/10 hover:bg-secondary/20 text-text-primary rounded-xl font-body font-semibold transition-all"
                      >
                        Cancel
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(true)}
                      className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-body font-semibold transition-all"
                    >
                      Edit Profile
                    </motion.button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mb-6">
                  <p className="font-body text-sm text-text-primary">
                    <strong className="text-primary">Connect your wearables</strong> to track how water quality affects your health metrics like HRV, sleep, and activity levels.
                  </p>
                </div>

                <WearableCard
                  name="Apple Watch"
                  icon={Watch}
                  type="apple_watch"
                  data={wearables.apple_watch}
                />

                <WearableCard
                  name="Oura Ring"
                  icon={Activity}
                  type="oura_ring"
                  data={wearables.oura_ring}
                />

                <WearableCard
                  name="Whoop"
                  icon={Zap}
                  type="whoop"
                  data={wearables.whoop}
                />

                <WearableCard
                  name="Garmin"
                  icon={Watch}
                  type="garmin"
                  data={wearables.garmin}
                />

                <WearableCard
                  name="Fitbit"
                  icon={Activity}
                  type="fitbit"
                  data={wearables.fitbit}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-secondary/20 p-4 bg-background-subtle">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="w-full py-3 bg-status-danger/10 hover:bg-status-danger/20 text-status-danger rounded-xl font-body font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileModal;
