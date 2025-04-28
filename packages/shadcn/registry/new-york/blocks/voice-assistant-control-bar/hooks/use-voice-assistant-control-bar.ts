import * as React from 'react';
import { Track } from 'livekit-client';
import {
  useLocalParticipant,
  useLocalParticipantPermissions,
  usePersistentUserChoices,
  useRoomContext,
} from '@livekit/components-react';

export interface UseVoiceAssistantControlBarProps {
  controls?: {
    microphone?: boolean;
    leave?: boolean;
  };
  saveUserChoices?: boolean;
  onDeviceError?: (error: { source: Track.Source; error: Error }) => void;
}

export function useVoiceAssistantControlBar({
  controls,
  saveUserChoices = true,
  onDeviceError,
}: UseVoiceAssistantControlBarProps) {
  const visibleControls = { leave: true, microphone: true, ...controls };

  const localPermissions = useLocalParticipantPermissions();
  const { microphoneTrack, localParticipant } = useLocalParticipant();
  const room = useRoomContext();

  const micTrackRef = React.useMemo(() => {
    return {
      participant: localParticipant,
      source: Track.Source.Microphone,
      publication: microphoneTrack,
    };
  }, [localParticipant, microphoneTrack]);

  if (!localPermissions) {
    visibleControls.microphone = false;
  } else {
    visibleControls.microphone ??= localPermissions.canPublish;
  }

  const { saveAudioInputEnabled, saveAudioInputDeviceId } = usePersistentUserChoices({
    preventSave: !saveUserChoices,
  });

  const microphoneOnChange = React.useCallback(
    (enabled: boolean, isUserInitiated: boolean) => {
      if (isUserInitiated) {
        saveAudioInputEnabled(enabled);
      }
    },
    [saveAudioInputEnabled],
  );

  const handleDisconnect = React.useCallback(() => {
    if (room) {
      room.disconnect();
    }
  }, [room]);

  const handleDeviceChange = React.useCallback(
    (deviceId: string) => {
      saveAudioInputDeviceId(deviceId ?? 'default');
    },
    [saveAudioInputDeviceId],
  );

  const handleError = React.useCallback(
    (error: Error) => {
      onDeviceError?.({ source: Track.Source.Microphone, error });
    },
    [onDeviceError],
  );

  return {
    visibleControls,
    micTrackRef,
    microphoneOnChange,
    handleDisconnect,
    handleDeviceChange,
    handleError,
  };
}
