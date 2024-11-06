'use client';

import {
  LiveKitRoom,
  useToken,
  setLogLevel,
  useConnectionState,
  Chat,
  useVoiceAssistant,
  BarVisualizer,
  VoiceAssistantControlBar,
  useRoomContext,
  RoomAudioRenderer,
} from '@livekit/components-react';

import type { NextPage } from 'next';
import { generateRandomUserId } from '../lib/helper';
import { useEffect, useMemo, useState } from 'react';
import { ConnectionState, Track, AgentState } from 'livekit-client';

function GptUi() {
  const connectionState = useConnectionState();
  const room = useRoomContext();

  const [audioMode, setAudioMode] = useState(false);
  const [isSwitchingModes, setIsSwitchingModes] = useState(false);

  const agent = useVoiceAssistant();

  const handleModeSwitch = async () => {
    setIsSwitchingModes(true);
    try {
      let nextMode = !audioMode;
      setAudioMode(nextMode);
      await room.localParticipant.setMicrophoneEnabled(nextMode);
    } finally {
      setIsSwitchingModes(false);
    }
  };

  return (
    <div style={{ height: '100vh' }}>
      {connectionState === ConnectionState.Connected && agent.state !== 'connecting' ? (
        <>
          <button
            disabled={isSwitchingModes}
            id="mode-toggle"
            className="lk-button"
            style={{
              fontSize: '3rem',
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              cursor: 'pointer',
            }}
            onClick={handleModeSwitch}
          >
            {audioMode ? '📝' : '🎙️'}
          </button>
          <div style={{ height: '100%' }}>
            <Chat style={{ display: !audioMode ? 'block' : 'none' }} />
            <div style={{ display: audioMode ? 'block' : 'none' }}>
              <RoomAudioRenderer muted={!audioMode} />

              <BarVisualizer
                trackRef={agent.audioTrack}
                style={{ width: '500px', height: '300px' }}
              />
              <VoiceAssistantControlBar
                controls={{ microphone: !isSwitchingModes }}
                style={{
                  bottom: 0,
                  position: 'absolute',
                  width: '99.9%',
                }}
              />
            </div>
          </div>
        </>
      ) : (
        <div style={{ display: 'grid', height: '100vh' }}>
          <div className="lds-ring" style={{ placeSelf: 'center' }}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      )}
    </div>
  );
}

const MinimalExample: NextPage = () => {
  const params = typeof window !== 'undefined' ? new URLSearchParams(location.search) : null;
  const roomName = useMemo(() => params?.get('room') ?? 'test-room' + generateRandomUserId(), []);
  setLogLevel('info', { liveKitClientLogLevel: 'debug' });

  const tokenOptions = useMemo(() => {
    const userId = params?.get('user') ?? generateRandomUserId();
    return {
      userInfo: {
        identity: userId,
        name: userId,
      },
    };
  }, []);

  const token = useToken(process.env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT, roomName, tokenOptions);

  return (
    <div data-lk-theme="gpt" style={{ height: '100vh' }}>
      <LiveKitRoom
        video={false}
        audio={false}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LK_SERVER_URL}
        onMediaDeviceFailure={(e) => {
          console.error(e);
          alert(
            'Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab',
          );
        }}
      >
        <GptUi />
      </LiveKitRoom>
    </div>
  );
};

export default MinimalExample;
