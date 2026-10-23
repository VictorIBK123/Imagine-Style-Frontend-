import React, { createContext, useContext, useState, useCallback } from 'react';
import { ImageViewerModal } from '@/components/ui/image-viewer';

export interface ImageViewerOptions {
  uri: string;
  title?: string;
  subtitle?: string;
  caption?: string;
  creatorName?: string;
}

interface ImageViewerContextValue {
  openImageViewer: (options: ImageViewerOptions | string) => void;
  closeImageViewer: () => void;
  isViewerOpen: boolean;
}

const ImageViewerContext = createContext<ImageViewerContextValue | null>(null);

export function ImageViewerProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<ImageViewerOptions | null>(null);

  const openImageViewer = useCallback((options: ImageViewerOptions | string) => {
    if (typeof options === 'string') {
      setCurrentOptions({ uri: options });
    } else {
      setCurrentOptions(options);
    }
    setVisible(true);
  }, []);

  const closeImageViewer = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setCurrentOptions(null);
    }, 200);
  }, []);

  return (
    <ImageViewerContext.Provider
      value={{
        openImageViewer,
        closeImageViewer,
        isViewerOpen: visible,
      }}>
      {children}
      {currentOptions && (
        <ImageViewerModal
          visible={visible}
          onClose={closeImageViewer}
          uri={currentOptions.uri}
          title={currentOptions.title}
          subtitle={currentOptions.subtitle}
          caption={currentOptions.caption}
          creatorName={currentOptions.creatorName}
        />
      )}
    </ImageViewerContext.Provider>
  );
}

export function useImageViewer(): ImageViewerContextValue {
  const ctx = useContext(ImageViewerContext);
  if (!ctx) {
    throw new Error('useImageViewer must be used within an ImageViewerProvider');
  }
  return ctx;
}
