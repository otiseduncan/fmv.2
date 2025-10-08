import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

type Props = {
  onAdd: (file: { name: string; url: string }) => void;
  folder?: string; // optional remote folder
};

const ImageCapture: React.FC<Props> = ({ onAdd, folder = 'job-images' }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const onSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    onAdd({ name: file.name, url: localUrl });

    try {
      setUploading(true);
      const filePath = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from(folder).upload(filePath, file, {
        upsert: true,
      });
      if (error) {
        // Non-fatal in prototype; keep local preview only
        // eslint-disable-next-line no-console
        console.warn('Supabase upload skipped/failed:', error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onSelect}
      />
      <Button
        type="button"
        variant="secondary"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Uploading…' : 'Capture / Upload Photo'}
      </Button>
    </div>
  );
};

export default ImageCapture;

