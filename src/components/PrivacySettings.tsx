import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  getUserLocationPreferences,
  updateLocationPreferences,
  type UserLocationPreferences,
} from '../services/locationService';
import '../styles/chat.css';

export function PrivacySettings() {
  const { user } = useAuthStore();
  const [preferences, setPreferences] = useState<UserLocationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadPreferences = async () => {
      try {
        const prefs = await getUserLocationPreferences(user.uid);
        setPreferences(prefs);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load preferences';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  const handleUpdate = async (newPrefs: Partial<UserLocationPreferences>) => {
    if (!user || !preferences) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);

      const updatedPrefs = { ...preferences, ...newPrefs };
      await updateLocationPreferences(user.uid, newPrefs);
      setPreferences(updatedPrefs);
      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="privacy-settings">
        <p>Please log in to manage location privacy settings.</p>
      </div>
    );
  }

  if (isLoading || !preferences) {
    return (
      <div className="privacy-settings">
        <p>Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="privacy-settings">
      <div className="privacy-section">
        <h3>📍 Location Privacy Settings</h3>

        {error && (
          <div className="privacy-error">
            <p>❌ {error}</p>
          </div>
        )}

        {success && (
          <div className="privacy-success">
            <p>✅ Settings saved successfully!</p>
          </div>
        )}

        {/* Location Privacy Level */}
        <div className="privacy-option">
          <h4>Location Visibility</h4>
          <p className="privacy-description">
            Control who can see your location when discovering nearby chat rooms.
          </p>

          <div className="privacy-radio-group">
            <label className="privacy-radio">
              <input
                type="radio"
                name="privacy"
                value="private"
                checked={preferences.locationPrivacy === 'private'}
                onChange={(e) =>
                  handleUpdate({ locationPrivacy: e.target.value as 'private' | 'nearby-only' | 'public' })
                }
                disabled={isSaving}
              />
              <span className="radio-label">
                <strong>🔒 Private</strong>
                <span className="radio-desc">Your location is never shared. You won't appear in nearby searches.</span>
              </span>
            </label>

            <label className="privacy-radio">
              <input
                type="radio"
                name="privacy"
                value="nearby-only"
                checked={preferences.locationPrivacy === 'nearby-only'}
                onChange={(e) =>
                  handleUpdate({ locationPrivacy: e.target.value as 'private' | 'nearby-only' | 'public' })
                }
                disabled={isSaving}
              />
              <span className="radio-label">
                <strong>📍 Nearby Only</strong>
                <span className="radio-desc">Your location is shared for discovery, but only with users searching nearby.</span>
              </span>
            </label>

            <label className="privacy-radio">
              <input
                type="radio"
                name="privacy"
                value="public"
                checked={preferences.locationPrivacy === 'public'}
                onChange={(e) =>
                  handleUpdate({ locationPrivacy: e.target.value as 'private' | 'nearby-only' | 'public' })
                }
                disabled={isSaving}
              />
              <span className="radio-label">
                <strong>🌍 Public</strong>
                <span className="radio-desc">Your location can be shared with room members and in searches.</span>
              </span>
            </label>
          </div>
        </div>

        {/* Location for Discovery */}
        <div className="privacy-option">
          <label className="privacy-checkbox">
            <input
              type="checkbox"
              checked={preferences.shareLocationForDiscovery}
              onChange={(e) => handleUpdate({ shareLocationForDiscovery: e.target.checked })}
              disabled={isSaving || preferences.locationPrivacy === 'private'}
            />
            <span className="checkbox-label">
              <strong>Use location for room discovery</strong>
              <span className="checkbox-desc">
                Allow the app to use your location to find nearby chat rooms (location privacy level applies).
              </span>
            </span>
          </label>
        </div>

        {/* Location Visible to Room Members */}
        <div className="privacy-option">
          <label className="privacy-checkbox">
            <input
              type="checkbox"
              checked={preferences.locationVisibleToRoomMembers}
              onChange={(e) => handleUpdate({ locationVisibleToRoomMembers: e.target.checked })}
              disabled={isSaving}
            />
            <span className="checkbox-label">
              <strong>Show location to room members</strong>
              <span className="checkbox-desc">
                Room members can see your approximate location if they request it (respects your privacy level).
              </span>
            </span>
          </label>
        </div>

        {/* Privacy Info */}
        <div className="privacy-info">
          <h4>ℹ️ How We Use Your Location</h4>
          <ul>
            <li>📍 Location data is only used for finding nearby rooms</li>
            <li>🔐 Your exact coordinates are never stored on servers</li>
            <li>🗺️ Only distance calculations happen server-side</li>
            <li>🚫 You can change privacy settings anytime</li>
            <li>💾 Location data is deleted when you log out</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
