import React, { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, Film, X } from 'lucide-react';

interface MediaFile {
  file: File;
  preview: string;
}

interface OrderMediaUploaderProps {
  type: 'image' | 'video';
  files: MediaFile[];
  onChange: (files: MediaFile[]) => void;
  maxFiles: number;
  maxSizeMB?: number;
}

const ACCEPTED_IMAGES = '.jpg,.jpeg,.png,.webp';
const ACCEPTED_VIDEOS = '.mp4,.webm,.mov';

export const OrderMediaUploader = React.memo(function OrderMediaUploader({
  type,
  files,
  onChange,
  maxFiles,
  maxSizeMB,
}: OrderMediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const remaining = maxFiles - files.length;
      if (remaining <= 0) return;

      const valid: MediaFile[] = [];
      for (let i = 0; i < Math.min(incoming.length, remaining); i++) {
        const file = incoming[i];
        if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) continue;
        valid.push({ file, preview: URL.createObjectURL(file) });
      }
      if (valid.length > 0) onChange([...files, ...valid]);
    },
    [files, onChange, maxFiles, maxSizeMB]
  );

  const handleRemove = useCallback(
    (index: number) => {
      const updated = [...files];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      onChange(updated);
    },
    [files, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const isImage = type === 'image';
  const Icon = isImage ? ImagePlus : Film;
  const label = isImage ? 'Adicionar Fotos de Referência' : 'Adicionar Vídeos de Referência';
  const accept = isImage ? ACCEPTED_IMAGES : ACCEPTED_VIDEOS;
  const emoji = isImage ? '📷' : '🎥';
  const countLabel = isImage ? 'fotos' : 'vídeos';
  const isFull = files.length >= maxFiles;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground flex items-center gap-2">
          {emoji} {label}
        </span>
        <span
          className={`text-xs font-medium ${
            files.length >= maxFiles ? 'text-orange-400' : 'text-muted-foreground'
          }`}
        >
          {files.length} / {maxFiles} {countLabel}
        </span>
      </div>

      {/* Drop Zone */}
      {!isFull && (
        <motion.div
          className="relative rounded-xl border-2 border-dashed border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer flex flex-col items-center justify-center py-6 gap-2"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Icon className="w-7 h-7 text-white/30" />
          <span className="text-xs text-white/40">
            Clique ou arraste aqui
          </span>
          {maxSizeMB && (
            <span className="text-[10px] text-white/25">
              Máx. {maxSizeMB}MB por ficheiro
            </span>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </motion.div>
      )}

      {/* Previews Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          <AnimatePresence>
            {files.map((f, i) => (
              <motion.div
                key={f.preview}
                className="relative aspect-square rounded-lg overflow-hidden border border-white/10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {isImage ? (
                  <img
                    src={f.preview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-black/60 flex items-center justify-center">
                    <Film className="w-5 h-5 text-white/60" />
                  </div>
                )}
                <motion.button
                  type="button"
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(i);
                  }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-3 h-3 text-white" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
});
