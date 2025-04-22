'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { useMediaDeviceSelect, useMaybeRoomContext } from '@livekit/components-react';
import { cva } from 'class-variance-authority';
import { LocalAudioTrack, LocalVideoTrack } from 'livekit-client';
type DeviceSelectProps = React.ComponentProps<typeof SelectTrigger> & {
  kind: MediaDeviceKind;
  track?: LocalAudioTrack | LocalVideoTrack | undefined;
  requestPermissions?: boolean;
  onError?: (error: Error) => void;
  initialSelection?: string;
  onActiveDeviceChange?: (deviceId: string) => void;
  onDeviceListChange?: (devices: MediaDeviceInfo[]) => void;
  variant?: 'default' | 'small';
};

const selectVariants = cva('w-full rounded-md border px-3 py-2 text-sm', {
  variants: {
    variant: {
      default: 'w-[180px]',
      small: 'w-auto',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export function DeviceSelect({
  kind,
  track,
  requestPermissions,
  onError,
  initialSelection,
  onActiveDeviceChange,
  onDeviceListChange,
  ...props
}: DeviceSelectProps) {
  const variant = props.variant || 'default';

  const room = useMaybeRoomContext();
  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({
    kind,
    room,
    track,
    requestPermissions,
    onError,
  });
  return (
    <Select value={activeDeviceId} onValueChange={setActiveMediaDevice}>
      <SelectTrigger className={cn(selectVariants({ variant }), props.className)}>
        {variant !== 'small' && <SelectValue placeholder={`Select a ${kind}`} />}
      </SelectTrigger>
      <SelectContent>
        {devices.map((device) => (
          <SelectItem key={device.deviceId} value={device.deviceId}>
            {device.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
